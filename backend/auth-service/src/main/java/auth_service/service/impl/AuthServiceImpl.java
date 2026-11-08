package auth_service.service.impl;

import auth_service.dto.request.*;
import auth_service.dto.response.*;
import auth_service.entity.*;
import auth_service.exception.*;
import auth_service.jwt.JwtService;
import auth_service.mapper.UserMapper;
import auth_service.repository.*;
import auth_service.service.AuthService;
import auth_service.service.AuditLogService;
import auth_service.service.EmailService;
import auth_service.service.OtpResetService;
import auth_service.service.OrganizationService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom OTP_RANDOM =
            new SecureRandom();

    private static final int OTP_COOLDOWN_SECONDS = 60;
    private static final java.util.regex.Pattern PASSWORD_PATTERN =
            java.util.regex.Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!_~.-]).{8,100}$");

    private final java.util.concurrent.ConcurrentHashMap<Long, int[]> passwordAttempts =
            new java.util.concurrent.ConcurrentHashMap<>();

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final UserPreferenceRepository preferences;
    private final CompanyInvitationRepository invitationRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationService organizationService;

    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final UserMapper mapper;
    private final EmailService emailService;
    private final OtpResetService otpResetService;
    private final AuditLogService auditLogService;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Override
    public UserResponse register(RegisterRequest r) {

        if (users.existsByEmail(r.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "Email already exists"
            );
        }

        if (users.existsByUsername(r.getUsername())) {
            throw new UsernameAlreadyExistsException(
                    "Username already exists"
            );
        }

        User u = User.builder()
                .username(r.getUsername())
                .email(r.getEmail())
                .password(encoder.encode(r.getPassword()))
                .role(null)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = users.save(u);
        auditLogService.log(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername(),
                "UNASSIGNED",
                "CREATE",
                "AUTH",
                "User",
                saved.getId().toString(),
                "Đăng ký tài khoản người dùng mới: " + saved.getUsername(),
                "127.0.0.1",
                "SUCCESS",
                null
        );
        UserResponse response = mapper.toResponse(saved);
        response.setIsOwner(organizationService.isOwner(saved.getId()));
        return response;
    }

    @Override
    public UserResponse registerEmployee(EmployeeRegisterRequest r) {
        if (users.existsByEmail(r.getEmail())) {
            throw new EmailAlreadyExistsException("Email này đã được sử dụng trên hệ thống.");
        }

        String code = r.getInvitationCode() != null ? r.getInvitationCode().trim().toUpperCase() : "";
        CompanyInvitation invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mã mời không tồn tại trên hệ thống."));

        if (!invitation.isUsable()) {
            String msg = invitation.getStatus() == InvitationStatus.REVOKED
                    ? "Mã mời này đã bị thu hồi bởi Quản trị viên."
                    : (invitation.getExpiresAt() != null && LocalDateTime.now().isAfter(invitation.getExpiresAt()))
                    ? "Mã mời này đã hết hạn sử dụng."
                    : "Mã mời này đã đạt giới hạn số lần sử dụng.";
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
        }

        String baseUsername = r.getEmail().split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (baseUsername.isBlank()) {
            baseUsername = "user";
        }
        String username = baseUsername;
        int counter = 1;
        while (users.existsByUsername(username)) {
            username = baseUsername + (counter++);
        }

        User u = User.builder()
                .username(username)
                .email(r.getEmail())
                .password(encoder.encode(r.getPassword()))
                .fullName(r.getFullName())
                .role(null)
                .status(UserStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = users.save(u);

        invitation.setUseCount(invitation.getUseCount() + 1);
        invitationRepository.save(invitation);

        JoinRequest jr = JoinRequest.builder()
                .user(saved)
                .invitation(invitation)
                .status(JoinRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .notes("Đăng ký tham gia qua mã mời " + invitation.getCode())
                .build();
        joinRequestRepository.save(jr);

        auditLogService.log(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername(),
                "UNASSIGNED",
                "REGISTER",
                "AUTH",
                "User",
                saved.getId().toString(),
                "Đăng ký tham gia công ty qua mã mời " + invitation.getCode(),
                "127.0.0.1",
                "SUCCESS",
                "{\"invitationCode\":\"" + invitation.getCode() + "\"}"
        );

        UserResponse res = mapper.toResponse(saved);
        res.setIsOwner(false);
        return res;
    }

    @Override
    public AuthResponse login(LoginRequest r) {

        User u = users.findByEmail(r.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (!encoder.matches(r.getPassword(), u.getPassword())) {
            throw new InvalidPasswordException(
                    "Invalid credentials"
            );
        }

        if (u.getStatus() == UserStatus.DISABLED) {
            throw new ForbiddenException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.");
        }

        if (u.getStatus() == UserStatus.REJECTED) {
            throw new ForbiddenException("Tài khoản của bạn đã bị từ chối phê duyệt tham gia hệ thống.");
        }

        String companyName = organizationRepository.findFirstByOrderByIdAsc()
                .map(Organization::getName)
                .orElse("STAplus CRM");

        if (u.getStatus() == UserStatus.PENDING) {
            String rt = UUID.randomUUID().toString();
            refreshTokens.save(
                    RefreshToken.builder()
                            .token(rt)
                            .user(u)
                            .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)))
                            .revoked(false)
                            .build()
            );

            return AuthResponse.builder()
                    .accessToken(jwt.generateAccessToken(u))
                    .refreshToken(rt)
                    .tokenType("Bearer")
                    .userId(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .fullName(u.getFullName())
                    .role(null)
                    .status(UserStatus.PENDING)
                    .isOwner(false)
                    .companyName(companyName)
                    .message("Tài khoản đang chờ Quản trị viên phê duyệt")
                    .build();
        }

        if (u.getRole() == null) {
            throw new RoleNotAssignedException(
                    "Role has not been assigned by ADMIN"
            );
        }

        String rt = UUID.randomUUID().toString();

        refreshTokens.save(
                RefreshToken.builder()
                        .token(rt)
                        .user(u)
                        .expiresAt(
                                LocalDateTime.now()
                                        .plus(Duration.ofMillis(
                                                refreshExpirationMs
                                        ))
                        )
                        .revoked(false)
                        .build()
        );

        auditLogService.log(
                u.getId(),
                u.getEmail(),
                u.getUsername(),
                u.getRole().name(),
                "LOGIN",
                "AUTH",
                "User",
                u.getId().toString(),
                "Đăng nhập hệ thống thành công với vai trò " + u.getRole().name(),
                "127.0.0.1",
                "SUCCESS",
                "{\"method\": \"PASSWORD\"}"
        );

        boolean isOwner = organizationService.isOwner(u.getId());

        return AuthResponse.builder()
                .accessToken(jwt.generateAccessToken(u))
                .refreshToken(rt)
                .tokenType("Bearer")
                .userId(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole())
                .status(u.getStatus())
                .isOwner(isOwner)
                .companyName(companyName)
                .message("Login successful")
                .build();
    }

    public AccessTokenResponse refresh(RefreshTokenRequest r) {

        RefreshToken t = refreshTokens
                .findByToken(r.getRefreshToken())
                .orElseThrow(() ->
                        new InvalidTokenException(
                                "Invalid refresh token"
                        ));

        if (t.isRevoked()
                || t.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException(
                    "Refresh token expired or revoked"
            );
        }

        User u = users.findById(t.getUser().getId())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (u.getStatus() != UserStatus.ACTIVE
                || u.getRole() == null) {
            throw new ForbiddenException(
                    "User cannot receive a new access token"
            );
        }

        return AccessTokenResponse.builder()
                .accessToken(jwt.generateAccessToken(u))
                .tokenType("Bearer")
                .build();
    }

    public void logout(LogoutRequest r) {

        RefreshToken t = refreshTokens
                .findByToken(r.getRefreshToken())
                .orElseThrow(() ->
                        new InvalidTokenException(
                                "Invalid refresh token"
                        ));

        t.setRevoked(true);
        refreshTokens.save(t);
    }

    public ForgotPasswordResponse forgotPassword(
            ForgotPasswordRequest r
    ) {

        String message =
                "Mã OTP đặt lại mật khẩu đã được gửi về email của bạn.";

        User u = users.findByEmailForUpdate(r.getEmail())
                .orElse(null);

        if (u == null) {
            throw new UserNotFoundException("Email này chưa được đăng ký trong hệ thống.");
        }

        List<PasswordResetToken> tokens =
                resetTokens.findByUserIdOrderByIdDesc(u.getId());

        LocalDateTime now = LocalDateTime.now();

        // Cooldown: 60 seconds
        if (!tokens.isEmpty()) {
            PasswordResetToken latest = tokens.get(0);

            if (latest.getCreatedAt() != null
                    && latest.getCreatedAt()
                    .plusSeconds(OTP_COOLDOWN_SECONDS)
                    .isAfter(now)) {

                return ForgotPasswordResponse.builder()
                        .message(message)
                        .build();
            }
        }

        // Invalidate previous OTPs
        for (PasswordResetToken oldToken : tokens) {
            if (!oldToken.isUsed()) {
                oldToken.setUsed(true);
            }
        }

        // Generate 6-digit OTP
        String otp = String.format(
                "%06d",
                OTP_RANDOM.nextInt(1_000_000)
        );

        // Store BCrypt hash
        resetTokens.save(
                PasswordResetToken.builder()
                        .token(encoder.encode(otp))
                        .user(u)
                        .createdAt(now)
                        .expiresAt(now.plusMinutes(15))
                        .used(false)
                        .attemptCount(0)
                        .build()
        );

        // Send OTP via email
        emailService.sendPasswordResetEmail(
                u.getEmail(),
                otp
        );

        return ForgotPasswordResponse.builder()
                .message(message)
                .build();
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void resetPassword(ResetPasswordRequest r) {

        String error = otpResetService.validateAndReset(r);

        if (error != null) {
            throw new InvalidTokenException(error);
        }
    }

    public void changePassword(
            User u,
            ChangePasswordRequest r
    ) {
        long userId = u.getId();
        int[] attempt = passwordAttempts.get(userId);
        long nowSeconds = System.currentTimeMillis() / 1000;

        if (attempt != null && attempt[0] >= 5) {
            long lockRemaining = 900 - (nowSeconds - attempt[1]);
            if (lockRemaining > 0) {
                throw new InvalidPasswordException(
                        "Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau " + (lockRemaining / 60 + 1) + " phút."
                );
            } else {
                passwordAttempts.remove(userId);
            }
        }

        // Verify current password
        if (!encoder.matches(r.getCurrentPassword(), u.getPassword())) {
            passwordAttempts.compute(userId, (k, v) -> {
                if (v == null) return new int[]{1, (int) nowSeconds};
                return new int[]{v[0] + 1, (int) nowSeconds};
            });

            auditLogService.log(
                    u.getId(),
                    u.getEmail(),
                    u.getUsername(),
                    u.getRole() != null ? u.getRole().name() : "UNASSIGNED",
                    "UPDATE",
                    "AUTH",
                    "User",
                    u.getId().toString(),
                    "Đổi mật khẩu thất bại: Mật khẩu hiện tại không chính xác",
                    "127.0.0.1",
                    "FAILED",
                    null
            );

            throw new InvalidPasswordException("Mật khẩu hiện tại không chính xác");
        }

        // Verify new password is not the same as current password
        if (encoder.matches(r.getNewPassword(), u.getPassword())) {
            throw new InvalidPasswordException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        // Validate password complexity
        if (r.getNewPassword() == null || !PASSWORD_PATTERN.matcher(r.getNewPassword()).matches()) {
            throw new InvalidPasswordException(
                    "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
            );
        }

        User managed = users.findById(u.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        managed.setPassword(encoder.encode(r.getNewPassword()));
        users.save(managed);

        // Reset failed counter
        passwordAttempts.remove(userId);

        // Revoke all existing refresh tokens
        refreshTokens.revokeAllByUserId(u.getId());

        // Audit log
        auditLogService.log(
                managed.getId(),
                managed.getEmail(),
                managed.getUsername(),
                managed.getRole() != null ? managed.getRole().name() : "UNASSIGNED",
                "UPDATE",
                "AUTH",
                "User",
                managed.getId().toString(),
                "Đổi mật khẩu tài khoản thành công",
                "127.0.0.1",
                "SUCCESS",
                null
        );
    }

    @Override
    public UserResponse me(User u) {
        User managed = users.findById(u.getId())
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));
        UserResponse response = mapper.toResponse(managed);
        response.setIsOwner(organizationService.isOwner(managed.getId()));
        return response;
    }

    @Override
    public UserResponse updateProfile(User u, UpdateProfileRequest r) {
        User managed = users.findById(u.getId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        managed.setFullName(r.getFullName());
        if (r.getPhone() != null) {
            managed.setPhone(r.getPhone());
        }
        if (r.getDepartment() != null) {
            managed.setDepartment(r.getDepartment());
        }
        if (r.getAvatarUrl() != null) {
            managed.setAvatarUrl(r.getAvatarUrl());
        }

        User saved = users.save(managed);

        auditLogService.log(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername(),
                saved.getRole() != null ? saved.getRole().name() : "UNASSIGNED",
                "UPDATE",
                "USER",
                "User",
                saved.getId().toString(),
                "Cập nhật thông tin hồ sơ cá nhân",
                "127.0.0.1",
                "SUCCESS",
                "{\"fullName\": \"" + saved.getFullName() + "\"}"
        );

        UserResponse response = mapper.toResponse(saved);
        response.setIsOwner(organizationService.isOwner(saved.getId()));
        return response;
    }

    public UserPreferenceResponse getPreferences(User u) {
        UserPreference pref = preferences.findByUserId(u.getId())
                .orElseGet(() -> preferences.save(
                        UserPreference.builder()
                                .userId(u.getId())
                                .build()
                ));
        return toPreferenceResponse(pref);
    }

    public UserPreferenceResponse updatePreferences(User u, UserPreferenceRequest r) {
        UserPreference pref = preferences.findByUserId(u.getId())
                .orElseGet(() -> UserPreference.builder().userId(u.getId()).build());

        if (r.getChatToast() != null) pref.setChatToast(r.getChatToast());
        if (r.getChatSound() != null) pref.setChatSound(r.getChatSound());
        if (r.getChatBrowser() != null) pref.setChatBrowser(r.getChatBrowser());
        if (r.getChatGroupEvents() != null) pref.setChatGroupEvents(r.getChatGroupEvents());
        if (r.getNotifyLeadAssigned() != null) pref.setNotifyLeadAssigned(r.getNotifyLeadAssigned());
        if (r.getNotifyDealStage() != null) pref.setNotifyDealStage(r.getNotifyDealStage());
        if (r.getNotifyTicket() != null) pref.setNotifyTicket(r.getNotifyTicket());
        if (r.getNotifySystem() != null) pref.setNotifySystem(r.getNotifySystem());
        if (r.getReminderBefore() != null) pref.setReminderBefore(r.getReminderBefore());
        if (r.getThemeMode() != null) pref.setThemeMode(r.getThemeMode());
        if (r.getTableDensity() != null) pref.setTableDensity(r.getTableDensity());
        if (r.getSidebarCollapsed() != null) pref.setSidebarCollapsed(r.getSidebarCollapsed());
        if (r.getDateFormat() != null) pref.setDateFormat(r.getDateFormat());

        UserPreference saved = preferences.save(pref);
        return toPreferenceResponse(saved);
    }

    private UserPreferenceResponse toPreferenceResponse(UserPreference p) {
        return UserPreferenceResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .chatToast(p.getChatToast())
                .chatSound(p.getChatSound())
                .chatBrowser(p.getChatBrowser())
                .chatGroupEvents(p.getChatGroupEvents())
                .notifyLeadAssigned(p.getNotifyLeadAssigned())
                .notifyDealStage(p.getNotifyDealStage())
                .notifyTicket(p.getNotifyTicket())
                .notifySystem(p.getNotifySystem())
                .reminderBefore(p.getReminderBefore())
                .themeMode(p.getThemeMode())
                .tableDensity(p.getTableDensity())
                .sidebarCollapsed(p.getSidebarCollapsed())
                .dateFormat(p.getDateFormat())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}