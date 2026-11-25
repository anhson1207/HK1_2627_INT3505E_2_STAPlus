package notification_service.controller;

import notification_service.dto.request.FollowUpReminderRequest;
import notification_service.model.FollowUpReminder;
import notification_service.service.FollowUpReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reminders")
public class FollowUpReminderController {

    private final FollowUpReminderService reminderService;

    public FollowUpReminderController(FollowUpReminderService reminderService) {
        this.reminderService = reminderService;
    }

    private Long resolveUserId(Long headerId) {
        return (headerId != null && headerId > 0) ? headerId : 1L;
    }

    private boolean isManagerOrAdmin(String role) {
        return role == null || role.isBlank() || "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
    }

    @GetMapping
    public ResponseEntity<List<FollowUpReminder>> getReminders(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) Long userId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {
        if ("SALES".equalsIgnoreCase(currentUserRole) && currentUserId != null) {
            return ResponseEntity.ok(reminderService.getRemindersByUser(currentUserId));
        }
        if (entityType != null && entityId != null) {
            return ResponseEntity.ok(reminderService.getRemindersByEntity(entityType, entityId));
        }
        if (userId != null) {
            return ResponseEntity.ok(reminderService.getRemindersByUser(userId));
        }
        if (!isManagerOrAdmin(currentUserRole) && currentUserId != null) {
            return ResponseEntity.ok(reminderService.getRemindersByUser(currentUserId));
        }
        return ResponseEntity.ok(reminderService.getAllReminders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUpReminder> getReminderById(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.getReminderById(id));
    }

    @PostMapping
    public ResponseEntity<FollowUpReminder> createReminder(
            @RequestBody FollowUpReminderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        FollowUpReminder created = reminderService.createReminder(resolveUserId(currentUserId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUpReminder> updateReminder(
            @PathVariable Long id,
            @RequestBody FollowUpReminderRequest request) {
        return ResponseEntity.ok(reminderService.updateReminder(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<FollowUpReminder> completeReminder(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.completeReminder(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}
