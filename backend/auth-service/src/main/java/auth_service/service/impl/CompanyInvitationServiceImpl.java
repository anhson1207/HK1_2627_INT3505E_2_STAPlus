package auth_service.service.impl;

import auth_service.dto.request.CompanyInvitationRequest;
import auth_service.dto.response.CompanyInvitationResponse;
import auth_service.dto.response.ValidateInvitationResponse;
import auth_service.entity.CompanyInvitation;
import auth_service.entity.InvitationStatus;
import auth_service.entity.Organization;
import auth_service.entity.User;
import auth_service.repository.CompanyInvitationRepository;
import auth_service.repository.OrganizationRepository;
import auth_service.repository.UserRepository;
import auth_service.service.AuditLogService;
import auth_service.service.CompanyInvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyInvitationServiceImpl implements CompanyInvitationService {

    private final CompanyInvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private String generateSecureCode() {
        StringBuilder sb = new StringBuilder("STAPLUS-");
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
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
    @Transactional
    public CompanyInvitationResponse createInvitation(CompanyInvitationRequest request, User currentUser) {
        String code = generateSecureCode();
        while (invitationRepository.findByCode(code).isPresent()) {
            code = generateSecureCode();
        }

        String hash = sha256(code);

        LocalDateTime expiresAt = null;
        if (request.getExpiresInDays() != null && request.getExpiresInDays() > 0) {
            expiresAt = LocalDateTime.now().plusDays(request.getExpiresInDays());
        }

        CompanyInvitation invitation = CompanyInvitation.builder()
                .code(code)
                .tokenHash(hash)
                .status(InvitationStatus.ACTIVE)
                .expiresAt(expiresAt)
                .maxUses(request.getMaxUses() != null && request.getMaxUses() > 0 ? request.getMaxUses() : null)
                .useCount(0)
                .createdBy(currentUser.getId())
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();

        CompanyInvitation saved = invitationRepository.save(invitation);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                "CREATE",
                "AUTH",
                "CompanyInvitation",
                saved.getId().toString(),
                "Tạo mã mời nhân viên mới: " + saved.getCode(),
                "127.0.0.1",
                "SUCCESS",
                null
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyInvitationResponse> listInvitations() {
        return invitationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CompanyInvitationResponse revokeInvitation(Long id, User currentUser) {
        CompanyInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mã mời."));

        if (invitation.getStatus() == InvitationStatus.REVOKED) {
            return toResponse(invitation);
        }

        invitation.setStatus(InvitationStatus.REVOKED);
        invitation.setRevokedAt(LocalDateTime.now());
        CompanyInvitation saved = invitationRepository.save(invitation);

        auditLogService.log(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getUsername(),
                currentUser.getRole().name(),
                "UPDATE",
                "AUTH",
                "CompanyInvitation",
                saved.getId().toString(),
                "Thu hồi mã mời nhân viên: " + saved.getCode(),
                "127.0.0.1",
                "SUCCESS",
                null
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ValidateInvitationResponse validateCode(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .message("Vui lòng cung cấp mã mời tham gia.")
                    .build();
        }

        String code = rawCode.trim().toUpperCase();
        Optional<CompanyInvitation> opt = invitationRepository.findByCode(code);

        if (opt.isEmpty()) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .message("Mã mời không tồn tại trên hệ thống.")
                    .code(code)
                    .build();
        }

        CompanyInvitation invitation = opt.get();
        if (!invitation.isUsable()) {
            String msg = invitation.getStatus() == InvitationStatus.REVOKED
                    ? "Mã mời này đã bị thu hồi bởi Quản trị viên."
                    : (invitation.getExpiresAt() != null && LocalDateTime.now().isAfter(invitation.getExpiresAt()))
                    ? "Mã mời này đã hết hạn sử dụng."
                    : "Mã mời này đã đạt giới hạn số lần sử dụng.";

            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .message(msg)
                    .code(code)
                    .build();
        }

        Optional<Organization> orgOpt = organizationRepository.findFirstByOrderByIdAsc();
        String companyName = orgOpt.map(Organization::getName).orElse("CRM STAPlus");
        String companyLogo = orgOpt.map(Organization::getLogoUrl).orElse(null);
        String industry = orgOpt.map(Organization::getIndustry).orElse(null);

        return ValidateInvitationResponse.builder()
                .valid(true)
                .message("Mã mời hợp lệ!")
                .companyName(companyName)
                .companyLogo(companyLogo)
                .industry(industry)
                .code(code)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyInvitation getValidInvitationByCode(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã mời tham gia không được để trống.");
        }

        String code = rawCode.trim().toUpperCase();
        CompanyInvitation invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mã mời không tồn tại trên hệ thống."));

        if (!invitation.isUsable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã mời đã hết hạn hoặc không còn khả dụng.");
        }

        return invitation;
    }

    private CompanyInvitationResponse toResponse(CompanyInvitation invitation) {
        String createdByName = null;
        if (invitation.getCreatedBy() != null) {
            createdByName = userRepository.findById(invitation.getCreatedBy())
                    .map(User::getFullName)
                    .orElse("Quản trị viên");
        }

        return CompanyInvitationResponse.builder()
                .id(invitation.getId())
                .code(invitation.getCode())
                .status(invitation.getStatus())
                .expiresAt(invitation.getExpiresAt())
                .maxUses(invitation.getMaxUses())
                .useCount(invitation.getUseCount())
                .createdBy(invitation.getCreatedBy())
                .createdByName(createdByName)
                .createdAt(invitation.getCreatedAt())
                .revokedAt(invitation.getRevokedAt())
                .notes(invitation.getNotes())
                .usable(invitation.isUsable())
                .build();
    }
}
