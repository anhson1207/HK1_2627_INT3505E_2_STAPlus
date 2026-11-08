package auth_service.controller;

import auth_service.dto.request.ApproveJoinRequest;
import auth_service.dto.request.RejectJoinRequest;
import auth_service.dto.response.JoinRequestResponse;
import auth_service.dto.response.JoinStatusResponse;
import auth_service.entity.JoinRequestStatus;
import auth_service.entity.User;
import auth_service.service.JoinRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    /**
     * Endpoint for the authenticated user (including PENDING status) to poll their join request status.
     */
    @GetMapping("/api/v1/me/join-status")
    public ResponseEntity<JoinStatusResponse> getMyJoinStatus(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(joinRequestService.getCurrentUserJoinStatus(currentUser));
    }

    /**
     * Admin endpoints to review employee join requests.
     */
    @GetMapping("/api/v1/admin/join-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JoinRequestResponse>> getJoinRequests(
            @RequestParam(value = "status", required = false) JoinRequestStatus status
    ) {
        return ResponseEntity.ok(joinRequestService.getJoinRequests(status));
    }

    @GetMapping("/api/v1/admin/join-requests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JoinRequestResponse> getJoinRequest(
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(joinRequestService.getJoinRequest(id));
    }

    @PostMapping("/api/v1/admin/join-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JoinRequestResponse> approveJoinRequest(
            @PathVariable("id") Long id,
            @Valid @RequestBody ApproveJoinRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(joinRequestService.approveJoinRequest(id, request, currentUser));
    }

    @PostMapping("/api/v1/admin/join-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JoinRequestResponse> rejectJoinRequest(
            @PathVariable("id") Long id,
            @Valid @RequestBody RejectJoinRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(joinRequestService.rejectJoinRequest(id, request, currentUser));
    }
}
