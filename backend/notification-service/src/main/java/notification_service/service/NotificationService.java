package notification_service.service;

import notification_service.dto.event.DealCreatedEvent;
import notification_service.dto.event.DiscountApprovalRequestedEvent;
import notification_service.dto.event.DiscountDecisionEvent;
import notification_service.model.Notification;
import notification_service.model.NotificationType;
import notification_service.repo.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        List<Notification>notifications =
                notificationRepository.findByUserIdAndIsReadFalse(userId);

        for(Notification n:notifications){
            n.setRead(true);

        }

        notificationRepository.saveAll(notifications);
    }

    public Notification createDealNotification(DealCreatedEvent event){
        Notification n = new Notification();
        n.setUserId(event.getRecipientUserId());
        n.setType(NotificationType.DEAL);
        n.setCreatedAt(event.getCreatedAt());
        n.setRead(false);
        n.setTitle("New Deal Created");
        n.setMessage("IDK LOL LMAO");
        n.setTargetUrl("/deals/"+event.getDealId());

        return notificationRepository.save(n);
    }





    public Notification createDiscountRequest(DiscountApprovalRequestedEvent event){
        Notification n = new Notification();
        n.setUserId(event.getManagerId());
        n.setType(NotificationType.DEAL);
        n.setTitle("Discount Approval Requested");

        n.setMessage(
                "Salesperson " + event.getRequestedByUserId()
                        + " requested a " + event.getDiscountPercent()
                        + "% discount for " + event.getDealName()
                        + ". Reason: " + event.getReason()
        );

        n.setTargetUrl(
                "/deals/" + event.getDealId()
                        + "/discount-requests/" + event.getApprovalId()
        );

        n.setRead(false);
        n.setCreatedAt(event.getCreatedAt());

        return notificationRepository.save(n);
    }

    public Notification createDiscountApprovedNotification(DiscountDecisionEvent event){
        Notification n = new Notification();

        n.setUserId(event.getRequestedByUserId());
        n.setType(NotificationType.DEAL);
        n.setTitle("Discount Approved");

        n.setMessage(
                "Your " + event.getDiscountPercent()
                        + "% discount request for " + event.getDealName()
                        + " has been approved!"
        );

        n.setTargetUrl(
                "/deals/" + event.getDealId()
                        + "/discount-requests/" + event.getApprovalId()
        );

        n.setRead(false);
        n.setCreatedAt(event.getDecidedAt());

        return notificationRepository.save(n);
    }





}
