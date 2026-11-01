package auth_service.service.impl;

import auth_service.dto.request.*;
import auth_service.dto.response.*;
import auth_service.entity.*;
import auth_service.exception.*;
import auth_service.jwt.JwtService;
import auth_service.mapper.UserMapper;
import auth_service.repository.*;
import auth_service.service.AuthService;
import auth_service.service.EmailService;
import auth_service.service.OtpResetService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;

    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final UserMapper mapper;
    private final EmailService emailService;
    private final OtpResetService otpResetService;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

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

        return mapper.toResponse(users.save(u));
    }

    public AuthResponse login(LoginRequest r) {

        User u = users.findByEmail(r.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (u.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException(
                    "User account is disabled"
            );
        }

        if (!encoder.matches(r.getPassword(), u.getPassword())) {
            throw new InvalidPasswordException(
                    "Invalid credentials"
            );
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

        return AuthResponse.builder()
                .accessToken(jwt.generateAccessToken(u))
                .refreshToken(rt)
                .tokenType("Bearer")
                .username(u.getUsername())
                .role(u.getRole())
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
                "If the email exists, password reset instructions have been sent";

        User u = users.findByEmailForUpdate(r.getEmail())
                .orElse(null);

        if (u == null) {
            return ForgotPasswordResponse.builder()
                    .message(message)
                    .build();
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

        boolean success = otpResetService.resetPassword(r);

        if (!success) {
            throw new InvalidTokenException(
                    "Invalid or expired OTP"
            );
        }
    }

    public void changePassword(
            User u,
            ChangePasswordRequest r
    ) {

        if (!encoder.matches(
                r.getCurrentPassword(),
                u.getPassword()
        )) {
            throw new InvalidPasswordException(
                    "Current password is incorrect"
            );
        }

        u.setPassword(
                encoder.encode(r.getNewPassword())
        );

        users.save(u);

        refreshTokens.revokeAllByUserId(u.getId());
    }

    public UserResponse me(User u) {

        return mapper.toResponse(
                users.findById(u.getId())
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"
                                ))
        );
    }
}