package notification_service.controller;

import notification_service.model.Notification;
import notification_service.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService){
        this.notificationService = notificationService;
    }

    private Long resolveUserId(Long headerId) {
        return (headerId != null && headerId > 0) ? headerId : 1L;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadNotificationsCount(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markOneAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){
        Long userId = resolveUserId(currentUserId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        Long userId = resolveUserId(currentUserId);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/follow-up")
    public ResponseEntity<Notification> createFollowUp(
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        Long userId = resolveUserId(currentUserId);
        String title = body != null ? body.get("title") : null;
        String message = body != null ? body.get("message") : null;
        String targetUrl = body != null ? body.get("targetUrl") : null;
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(notificationService.createFollowUpNotification(userId, title, message, targetUrl));
    }
}
