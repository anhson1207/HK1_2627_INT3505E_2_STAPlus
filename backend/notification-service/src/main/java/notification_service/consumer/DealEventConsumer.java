package notification_service.consumer;

import notification_service.dto.event.DealCreatedEvent;
import notification_service.dto.event.DiscountDecisionEvent;
import notification_service.dto.event.DiscountApprovalRequestedEvent;
import notification_service.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class DealEventConsumer {

    private final NotificationService notificationService;

    public DealEventConsumer(NotificationService notificationService){
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.deal-created.queue")
    public void processDealCreated(DealCreatedEvent event){
        notificationService.createDealNotification(event);
    }





    @RabbitListener(queues = "notification.discount-approval-requested.queue")
    public void processDiscountRequest(DiscountApprovalRequestedEvent event){
        notificationService.createDiscountRequest(event);
    }

    @RabbitListener(queues = "notification.discount-approval-approved.queue")
    public void processDiscountRequest(DiscountDecisionEvent event){
        notificationService.createDiscountApprovedNotification(event);
    }

}
