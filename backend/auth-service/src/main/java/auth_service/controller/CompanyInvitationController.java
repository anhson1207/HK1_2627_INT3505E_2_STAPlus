package auth_service.controller;

import auth_service.dto.request.CompanyInvitationRequest;
import auth_service.dto.response.CompanyInvitationResponse;
import auth_service.dto.response.ValidateInvitationResponse;
import auth_service.entity.User;
import auth_service.service.CompanyInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CompanyInvitationController {

    private final CompanyInvitationService invitationService;

    /**
     * Public endpoint to validate an invite code before employee registration.
     */
    @GetMapping("/api/v1/invitations/validate")
    public ResponseEntity<ValidateInvitationResponse> validateInvitation(
            @RequestParam("code") String code
    ) {
        return ResponseEntity.ok(invitationService.validateCode(code));
    }

    /**
     * Admin endpoints to manage invitations.
     */
    @GetMapping("/api/v1/admin/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompanyInvitationResponse>> listInvitations() {
        return ResponseEntity.ok(invitationService.listInvitations());
    }

    @PostMapping("/api/v1/admin/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyInvitationResponse> createInvitation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CompanyInvitationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.createInvitation(request, currentUser));
    }

    @PostMapping("/api/v1/admin/invitations/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyInvitationResponse> revokeInvitation(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(invitationService.revokeInvitation(id, currentUser));
    }
}
