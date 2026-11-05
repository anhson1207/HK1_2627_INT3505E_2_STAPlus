package support_service.publisher;


import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import support_service.dto.event.TicketAssignedEvent;


@Component
public class TicketEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    public TicketEventPublisher(RabbitTemplate rabbitTemplate){
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishTicketAssigned(TicketAssignedEvent event){
        rabbitTemplate.convertAndSend(
                "crm.events",
                "ticket.assigned",
                event
        );

    }
}
