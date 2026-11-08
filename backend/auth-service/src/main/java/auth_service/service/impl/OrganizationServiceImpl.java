package auth_service.service.impl;

import auth_service.dto.request.InitializeSetupRequest;
import auth_service.dto.request.UpdateOrganizationRequest;
import auth_service.dto.response.OrganizationResponse;
import auth_service.dto.response.SetupStatusResponse;
import auth_service.entity.CompanyInvitation;
import auth_service.entity.InvitationStatus;
import auth_service.entity.Organization;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.repository.CompanyInvitationRepository;
import auth_service.repository.OrganizationRepository;
import auth_service.repository.UserRepository;
import auth_service.service.AuditLogService;
import auth_service.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final CompanyInvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${app.bootstrap.token:staplus-bootstrap-secret-2026}")
    private String configuredBootstrapToken;

    @Value("${app.admin.email:admin@crm.local}")
    private String adminEmail;

    /**
     * Auto-migration for existing systems:
     * If organization does not exist but existing users (e.g. admin@crm.local) exist,
     * seed default organization linking to the primary ADMIN.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void autoMigrateExistingSystem() {
        if (organizationRepository.count() == 0) {
            Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                Organization org = Organization.builder()
                        .name("CRM STAPlus")
                        .industry("Công nghệ / Phần mềm")
                        .companySize("11–50 nhân viên")
                        .timezone("Asia/Ho_Chi_Minh")
                        .ownerUserId(admin.getId())
                        .setupCompleted(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                Organization saved = organizationRepository.save(org);
                log.info("Auto-migrated existing system with default Organization: {} (Owner ID: {})",
                        saved.getName(), saved.getOwnerUserId());

                // Seed default active invitation code
                createInitialInvitationIfNone(admin.getId());
            }
        }
    }

    private void createInitialInvitationIfNone(Long createdBy) {
        if (invitationRepository.count() == 0) {
            String code = "STAPLUS-JOIN-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            String hash = sha256(code);

            CompanyInvitation invitation = CompanyInvitation.builder()
                    .code(code)
                    .tokenHash(hash)
                    .status(InvitationStatus.ACTIVE)
                    .expiresAt(LocalDateTime.now().plusDays(90))
                    .maxUses(null)
                    .useCount(0)
                    .createdBy(createdBy)
                    .notes("Mã mời mặc định hệ thống khởi tạo")
                    .build();

            invitationRepository.save(invitation);
            log.info("Created default company invitation code: {}", code);
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return UUID.nameUUIDFromBytes(input.getBytes()).toString();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SetupStatusResponse getSetupStatus() {
        Optional<Organization> orgOpt = organizationRepository.findFirstByOrderByIdAsc();
        long userCount = userRepository.count();

        if (orgOpt.isPresent()) {
            Organization org = orgOpt.get();
            String ownerName = null;
            if (org.getOwnerUserId() != null) {
                ownerName = userRepository.findById(org.getOwnerUserId())
                        .map(User::getFullName)
                        .orElse(null);
            }
            return SetupStatusResponse.builder()
                    .setupCompleted(Boolean.TRUE.equals(org.getSetupCompleted()))
                    .hasOrganization(true)
                    .organizationName(org.getName())
                    .organizationLogo(org.getLogoUrl())
                    .ownerName(ownerName)
                    .allowPublicSetup(false)
                    .userCount(userCount)
                    .build();
        }

        // If no organization exists
        boolean allowSetup = userCount == 0;
        return SetupStatusResponse.builder()
                .setupCompleted(false)
                .hasOrganization(false)
                .organizationName(null)
                .organizationLogo(null)
                .allowPublicSetup(allowSetup)
                .userCount(userCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization() {
        Organization org = organizationRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa có thông tin doanh nghiệp."));

        return toResponse(org);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Organization> getRawOrganization() {
        return organizationRepository.findFirstByOrderByIdAsc();
    }

    @Override
    @Transactional
    public synchronized OrganizationResponse initializeSetup(InitializeSetupRequest request) {
        // 1. Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp.");
        }

        // 2. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
        }

        // 3. Generate username from email prefix
        String baseUsername = request.getEmail().trim().toLowerCase().split("@")[0];
        String username = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + suffix++;
        }

        // 4. Create Owner User (Role ADMIN, Status ACTIVE)
        User owner = User.builder()
                .fullName(request.getFullName().trim())
                .username(username)
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .department("Ban Giám đốc")
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(owner);

        // 5. Create or Update Organization
        Organization org = organizationRepository.findFirstByOrderByIdAsc().orElseGet(Organization::new);
        org.setName(request.getCompanyName().trim());
        org.setIndustry(request.getIndustry() != null ? request.getIndustry().trim() : "Công nghệ / Phần mềm");
        org.setCompanySize(request.getCompanySize() != null ? request.getCompanySize().trim() : "11–50 nhân viên");
        org.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        org.setEmail(request.getCompanyEmail() != null ? request.getCompanyEmail().trim() : request.getEmail().trim().toLowerCase());
        org.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        org.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        org.setTimezone(request.getTimezone() != null && !request.getTimezone().isBlank() ? request.getTimezone().trim() : "Asia/Ho_Chi_Minh");
        org.setLogoUrl(request.getLogoUrl() != null ? request.getLogoUrl().trim() : null);
        org.setOwnerUserId(savedUser.getId());
        org.setSetupCompleted(true);
        if (org.getCreatedAt() == null) {
            org.setCreatedAt(LocalDateTime.now());
        }
        org.setUpdatedAt(LocalDateTime.now());

        Organization savedOrg = organizationRepository.save(org);

        // 6. Create initial active Invitation Code
        createInitialInvitationIfNone(savedUser.getId());

        // 7. Audit log
        auditLogService.log(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getUsername(),
                "ADMIN",
                "CREATE",
                "SYSTEM",
                "Organization",
                savedOrg.getId().toString(),
                "Khởi tạo CRM doanh nghiệp mới: " + savedOrg.getName() + " (Chủ sở hữu: " + savedUser.getEmail() + ")",
                "127.0.0.1",
                "SUCCESS",
                null
        );

        log.info("Organization setup completed successfully: {} (Owner: {})", savedOrg.getName(), savedUser.getEmail());
        return toResponse(savedOrg);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(UpdateOrganizationRequest request, User currentUser) {
        Organization org = organizationRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa có thông tin doanh nghiệp."));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Quản trị viên mới có quyền cập nhật thông tin công ty.");
        }

        org.setName(request.getName().trim());
        if (request.getIndustry() != null) org.setIndustry(request.getIndustry().trim());
        if (request.getCompanySize() != null) org.setCompanySize(request.getCompanySize().trim());
        if (request.getLogoUrl() != null) org.setLogoUrl(request.getLogoUrl().trim());
        if (request.getPhone() != null) org.setPhone(request.getPhone().trim());
        if (request.getEmail() != null) org.setEmail(request.getEmail().trim());
        if (request.getWebsite() != null) org.setWebsite(request.getWebsite().trim());
        if (request.getAddress() != null) org.setAddress(request.getAddress().trim());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone().trim());

        Organization saved = organizationRepository.save(org);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                "UPDATE",
                "SYSTEM",
                "Organization",
                saved.getId().toString(),
                "Cập nhật thông tin doanh nghiệp: " + saved.getName(),
                "127.0.0.1",
                "SUCCESS",
                null
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOwner(Long userId) {
        if (userId == null) return false;
        return organizationRepository.findFirstByOrderByIdAsc()
                .map(org -> userId.equals(org.getOwnerUserId()))
                .orElse(false);
    }

    private OrganizationResponse toResponse(Organization org) {
        String ownerName = null;
        String ownerEmail = null;

        if (org.getOwnerUserId() != null) {
            Optional<User> ownerOpt = userRepository.findById(org.getOwnerUserId());
            if (ownerOpt.isPresent()) {
                ownerName = ownerOpt.get().getFullName();
                ownerEmail = ownerOpt.get().getEmail();
            }
        }

        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .industry(org.getIndustry())
                .companySize(org.getCompanySize())
                .logoUrl(org.getLogoUrl())
                .phone(org.getPhone())
                .email(org.getEmail())
                .website(org.getWebsite())
                .address(org.getAddress())
                .timezone(org.getTimezone())
                .ownerUserId(org.getOwnerUserId())
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .setupCompleted(org.getSetupCompleted())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .build();
    }
}
