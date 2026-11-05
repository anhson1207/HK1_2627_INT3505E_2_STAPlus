package sales_service.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import sales_service.dto.event.DealCreatedEvent;
import sales_service.dto.event.DealStageChangedEvent;
import sales_service.dto.event.DealWonEvent;
import sales_service.dto.event.DiscountApprovalRequestedEvent;
import sales_service.dto.event.DiscountDecisionEvent;

@Component
public class DealEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(DealEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public DealEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    private void safePublish(String routingKey, Object event) {
        try {
            rabbitTemplate.convertAndSend("crm.events", routingKey, event);
            log.info("Published event to crm.events with key: {}", routingKey);
        } catch (Exception e) {
            log.warn("Failed to publish event to RabbitMQ (key: {}): {}. Service will continue.", routingKey, e.getMessage());
        }
    }

    public void publishDealCreated(DealCreatedEvent event) {
        safePublish("deal.created", event);
    }

    public void publishDealStageChanged(DealStageChangedEvent event) {
        safePublish("deal.stage-changed", event);
    }

    public void publishDealWon(DealWonEvent event) {
        safePublish("deal.won", event);
    }

    public void publishDiscountRequest(DiscountApprovalRequestedEvent event) {
        safePublish("discount.approval-requested", event);
    }

    public void publishDiscountDecision(DiscountDecisionEvent event) {
        safePublish("discount.approval-approved", event);
    }
}
