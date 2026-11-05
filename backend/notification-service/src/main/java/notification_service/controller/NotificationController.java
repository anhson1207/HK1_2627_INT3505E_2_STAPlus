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

    public NotificationController( NotificationService notificationService){
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(){
        Long userId = 1L;
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadNotificationsCount(){
        Long userId = 1L;
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markOneAsRead(@PathVariable Long id){
        Long userId = 1L;
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(){
        Long userId = 1L;
        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }
}
