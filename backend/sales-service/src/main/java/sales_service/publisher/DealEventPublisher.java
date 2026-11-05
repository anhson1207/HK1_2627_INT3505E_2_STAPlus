package sales_service.publisher;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import sales_service.dto.event.DealCreatedEvent;
import sales_service.dto.event.DiscountDecisionEvent;
import sales_service.dto.event.DiscountApprovalRequestedEvent;

@Component
public class DealEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public DealEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishDealCreated(DealCreatedEvent event){
        rabbitTemplate.convertAndSend(
            "crm.events",
                "deal.created",
                event
        );
    }



    public void publishDiscountRequest(DiscountApprovalRequestedEvent event){
        rabbitTemplate.convertAndSend(
                "crm.events",
                "discount.approval-requested",
                event
        );
    }

    public void publishDiscountDecision(DiscountDecisionEvent event){
        rabbitTemplate.convertAndSend(
                "crm.events",
                "discount.approval-approved",
                event
        );
    }


}
