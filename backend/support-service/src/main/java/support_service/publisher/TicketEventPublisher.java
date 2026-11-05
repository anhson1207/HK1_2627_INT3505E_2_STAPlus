package support_service.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import support_service.dto.event.TicketAssignedEvent;
import support_service.dto.event.TicketCreatedEvent;
import support_service.dto.event.TicketUpdatedEvent;

@Component
public class TicketEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(TicketEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public TicketEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    private void safePublish(String routingKey, Object event) {
        try {
            rabbitTemplate.convertAndSend("crm.events", routingKey, event);
            log.info("Published event to crm.events with key: {}", routingKey);
        } catch (Exception e) {
            log.warn("Failed to publish ticket event to RabbitMQ (key: {}): {}. Service will continue.", routingKey, e.getMessage());
        }
    }

    public void publishTicketAssigned(TicketAssignedEvent event) {
        safePublish("ticket.assigned", event);
    }

    public void publishTicketCreated(TicketCreatedEvent event) {
        safePublish("ticket.created", event);
    }

    public void publishTicketUpdated(TicketUpdatedEvent event) {
        safePublish("ticket.updated", event);
    }
}
