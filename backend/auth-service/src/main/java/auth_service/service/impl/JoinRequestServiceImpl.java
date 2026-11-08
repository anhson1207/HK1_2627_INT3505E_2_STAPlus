package auth_service.service.impl;

import auth_service.dto.request.ApproveJoinRequest;
import auth_service.dto.request.RejectJoinRequest;
import auth_service.dto.response.JoinRequestResponse;
import auth_service.dto.response.JoinStatusResponse;
import auth_service.entity.*;
import auth_service.repository.JoinRequestRepository;
import auth_service.repository.OrganizationRepository;
import auth_service.repository.UserRepository;
import auth_service.service.AuditLogService;
import auth_service.service.JoinRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JoinRequestServiceImpl implements JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getJoinRequests(JoinRequestStatus status) {
        List<JoinRequest> list = status != null
                ? joinRequestRepository.findByStatusOrderByRequestedAtDesc(status)
                : joinRequestRepository.findAllByOrderByRequestedAtDesc();

        return list.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JoinRequestResponse getJoinRequest(Long id) {
        JoinRequest request = joinRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu tham gia."));

        return toResponse(request);
    }

    @Override
    @Transactional
    public synchronized JoinRequestResponse approveJoinRequest(Long id, ApproveJoinRequest request, User admin) {
        JoinRequest joinRequest = joinRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu tham gia."));

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Yêu cầu này đã được xử lý trước đó (" + joinRequest.getStatus() + ").");
        }

        User user = joinRequest.getUser();
        if (user.getId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thể tự phê duyệt tài khoản của chính mình.");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.SALES;

        // 1. Update user
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(assignedRole);
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            user.setDepartment(request.getDepartment().trim());
        }
        userRepository.save(user);

        // 2. Update join request
        joinRequest.setStatus(JoinRequestStatus.APPROVED);
        joinRequest.setReviewedBy(admin.getId());
        joinRequest.setReviewedAt(LocalDateTime.now());
        joinRequest.setAssignedRole(assignedRole);
        JoinRequest saved = joinRequestRepository.save(joinRequest);

        // 3. Audit log
        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                admin.getUsername(),
                admin.getRole().name(),
                "UPDATE",
                "AUTH",
                "JoinRequest",
                saved.getId().toString(),
                "Phê duyệt nhân viên " + user.getEmail() + " gia nhập công ty với vai trò " + assignedRole.name(),
                "127.0.0.1",
                "SUCCESS",
                null
        );

        log.info("Admin {} approved join request #{} for user {} with role {}",
                admin.getEmail(), id, user.getEmail(), assignedRole);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public synchronized JoinRequestResponse rejectJoinRequest(Long id, RejectJoinRequest request, User admin) {
        JoinRequest joinRequest = joinRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu tham gia."));

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Yêu cầu này đã được xử lý trước đó (" + joinRequest.getStatus() + ").");
        }

        User user = joinRequest.getUser();
        if (user.getId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thể tự từ chối yêu cầu của chính mình.");
        }

        // 1. Update user status
        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);

        // 2. Update join request
        joinRequest.setStatus(JoinRequestStatus.REJECTED);
        joinRequest.setReviewedBy(admin.getId());
        joinRequest.setReviewedAt(LocalDateTime.now());
        joinRequest.setRejectionReason(request != null && request.getReason() != null ? request.getReason().trim() : null);
        JoinRequest saved = joinRequestRepository.save(joinRequest);

        // 3. Audit log
        auditLogService.log(
                admin.getId(),
                admin.getEmail(),
                admin.getUsername(),
                admin.getRole().name(),
                "UPDATE",
                "AUTH",
                "JoinRequest",
                saved.getId().toString(),
                "Từ chối yêu cầu tham gia công ty của " + user.getEmail()
                        + (joinRequest.getRejectionReason() != null ? " (Lý do: " + joinRequest.getRejectionReason() + ")" : ""),
                "127.0.0.1",
                "SUCCESS",
                null
        );

        log.info("Admin {} rejected join request #{} for user {}", admin.getEmail(), id, user.getEmail());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JoinStatusResponse getCurrentUserJoinStatus(User user) {
        Optional<JoinRequest> opt = joinRequestRepository.findFirstByUserIdOrderByRequestedAtDesc(user.getId());
        Optional<Organization> orgOpt = organizationRepository.findFirstByOrderByIdAsc();

        String companyName = orgOpt.map(Organization::getName).orElse("CRM STAPlus");
        String companyLogo = orgOpt.map(Organization::getLogoUrl).orElse(null);

        if (opt.isEmpty()) {
            return JoinStatusResponse.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .accountStatus(user.getStatus())
                    .requestStatus(user.getStatus() == UserStatus.ACTIVE ? JoinRequestStatus.APPROVED : JoinRequestStatus.PENDING)
                    .role(user.getRole())
                    .requestedAt(user.getCreatedAt())
                    .companyName(companyName)
                    .companyLogo(companyLogo)
                    .build();
        }

        JoinRequest req = opt.get();
        return JoinStatusResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .accountStatus(user.getStatus())
                .requestStatus(req.getStatus())
                .role(user.getRole())
                .requestedAt(req.getRequestedAt())
                .reviewedAt(req.getReviewedAt())
                .rejectionReason(req.getRejectionReason())
                .companyName(companyName)
                .companyLogo(companyLogo)
                .build();
    }

    private JoinRequestResponse toResponse(JoinRequest req) {
        String reviewedByName = null;
        if (req.getReviewedBy() != null) {
            reviewedByName = userRepository.findById(req.getReviewedBy())
                    .map(User::getFullName)
                    .orElse("Quản trị viên");
        }

        User u = req.getUser();
        CompanyInvitation inv = req.getInvitation();

        return JoinRequestResponse.builder()
                .id(req.getId())
                .userId(u != null ? u.getId() : null)
                .fullName(u != null ? u.getFullName() : null)
                .email(u != null ? u.getEmail() : null)
                .username(u != null ? u.getUsername() : null)
                .phone(u != null ? u.getPhone() : null)
                .department(u != null ? u.getDepartment() : null)
                .invitationId(inv != null ? inv.getId() : null)
                .invitationCode(inv != null ? inv.getCode() : null)
                .status(req.getStatus())
                .requestedAt(req.getRequestedAt())
                .reviewedBy(req.getReviewedBy())
                .reviewedByName(reviewedByName)
                .reviewedAt(req.getReviewedAt())
                .assignedRole(req.getAssignedRole())
                .rejectionReason(req.getRejectionReason())
                .notes(req.getNotes())
                .build();
    }
}
