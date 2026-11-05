package analytics_service.consumer;

import analytics_service.config.RabbitMQConfig;
import analytics_service.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AnalyticsEventConsumer {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventConsumer.class);
    private final AnalyticsService analyticsService;

    public AnalyticsEventConsumer(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @RabbitListener(queues = RabbitMQConfig.DEAL_CREATED_QUEUE)
    public void onDealCreated(Map<String, Object> payload) {
        try {
            String name = (String) payload.getOrDefault("dealName", "Cơ hội mới");
            Number id = (Number) payload.getOrDefault("dealId", 0);
            analyticsService.recordDealCreated(name, id != null ? id.longValue() : 0L);
            log.info("Analytics processed DealCreated: {}", name);
        } catch (Exception e) {
            log.warn("Error processing deal created event in analytics: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.DEAL_WON_QUEUE)
    public void onDealWon(Map<String, Object> payload) {
        try {
            String name = (String) payload.getOrDefault("dealName", "Cơ hội thắng");
            Number val = (Number) payload.getOrDefault("value", 0.0);
            analyticsService.recordDealWon(name, val != null ? val.doubleValue() : 0.0);
            log.info("Analytics processed DealWon: {} with value {}", name, val);
        } catch (Exception e) {
            log.warn("Error processing deal won event in analytics: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.DEAL_STAGE_CHANGED_QUEUE)
    public void onDealStageChanged(Map<String, Object> payload) {
        try {
            String name = (String) payload.getOrDefault("dealName", "Cơ hội");
            String newStage = (String) payload.getOrDefault("newStage", "UPDATED");
            analyticsService.recordDealStageChanged(name, newStage);
            log.info("Analytics processed DealStageChanged: {} -> {}", name, newStage);
        } catch (Exception e) {
            log.warn("Error processing deal stage changed event in analytics: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.TICKET_CREATED_QUEUE)
    public void onTicketCreated(Map<String, Object> payload) {
        try {
            String title = (String) payload.getOrDefault("title", "Ticket hỗ trợ");
            Number id = (Number) payload.getOrDefault("ticketId", 0);
            analyticsService.recordTicketCreated(title, id != null ? id.longValue() : 0L);
            log.info("Analytics processed TicketCreated: #{}", id);
        } catch (Exception e) {
            log.warn("Error processing ticket created event in analytics: {}", e.getMessage());
        }
    }
}
