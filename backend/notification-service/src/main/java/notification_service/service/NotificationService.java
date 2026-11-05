package notification_service.service;

import notification_service.dto.event.DealCreatedEvent;
import notification_service.dto.event.DiscountApprovalRequestedEvent;
import notification_service.dto.event.DiscountDecisionEvent;
import notification_service.dto.event.TicketAssignedEvent;
import notification_service.model.Notification;
import notification_service.model.NotificationType;
import notification_service.repo.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository){
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(Long userId){
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId){
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(Long id, Long userId){
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow( () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId){
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for(Notification n : notifications){
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public Notification createDealNotification(DealCreatedEvent event){
        Notification n = new Notification();
        n.setUserId(event.getRecipientUserId() != null ? event.getRecipientUserId() : 1L);
        n.setType(NotificationType.DEAL);
        n.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now());
        n.setRead(false);
        n.setTitle("Cơ hội mới được tạo");
        n.setMessage("Cơ hội \"" + event.getDealName() + "\" đã được tạo bởi người dùng #" + event.getCreatedByUserId());
        n.setTargetUrl("/deals/" + event.getDealId());

        return notificationRepository.save(n);
    }

    public Notification createDiscountRequest(DiscountApprovalRequestedEvent event){
        Notification n = new Notification();
        n.setUserId(event.getManagerId() != null ? event.getManagerId() : 1000L);
        n.setType(NotificationType.DEAL);
        n.setTitle("Yêu cầu phê duyệt chiết khấu");

        n.setMessage(
                "Nhân viên #" + event.getRequestedByUserId()
                        + " yêu cầu chiết khấu " + event.getDiscountPercent()
                        + "% cho cơ hội \"" + event.getDealName()
                        + "\". Lý do: " + event.getReason()
        );

        n.setTargetUrl(
                "/deals/" + event.getDealId()
                        + "/discount-requests/" + event.getApprovalId()
        );

        n.setRead(false);
        n.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now());

        return notificationRepository.save(n);
    }

    public Notification createDiscountApprovedNotification(DiscountDecisionEvent event){
        Notification n = new Notification();
        n.setUserId(event.getRequestedByUserId() != null ? event.getRequestedByUserId() : 1L);
        n.setType(NotificationType.DEAL);
        n.setTitle("Yêu cầu chiết khấu đã được phê duyệt");

        n.setMessage(
                "Yêu cầu chiết khấu " + event.getDiscountPercent()
                        + "% cho cơ hội \"" + event.getDealName()
                        + "\" đã được chấp thuận!"
        );

        n.setTargetUrl(
                "/deals/" + event.getDealId()
                        + "/discount-requests/" + event.getApprovalId()
        );

        n.setRead(false);
        n.setCreatedAt(event.getDecidedAt() != null ? event.getDecidedAt() : LocalDateTime.now());

        return notificationRepository.save(n);
    }

    public Notification createTicketAssignedNotification(TicketAssignedEvent event) {
        Notification n = new Notification();
        n.setUserId(event.getSupportId() != null ? event.getSupportId() : 1L);
        n.setType(NotificationType.TICKET);
        n.setTitle("Ticket mới được phân công");
        n.setMessage("Bạn được phân công xử lý Ticket #" + event.getTicketId() + ": \"" + event.getTicketTitle() + "\"");
        n.setTargetUrl("/tickets/" + event.getTicketId());
        n.setRead(false);
        n.setCreatedAt(event.getCreatedAt() != null ? event.getCreatedAt() : LocalDateTime.now());

        return notificationRepository.save(n);
    }
}
