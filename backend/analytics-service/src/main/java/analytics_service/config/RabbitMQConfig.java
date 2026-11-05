package analytics_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    private static final String TOPIC_EXCHANGE = "crm.events";

    public static final String DEAL_WON_QUEUE = "analytics.deal-won.queue";
    public static final String DEAL_CREATED_QUEUE = "analytics.deal-created.queue";
    public static final String DEAL_STAGE_CHANGED_QUEUE = "analytics.deal-stage-changed.queue";
    public static final String TICKET_CREATED_QUEUE = "analytics.ticket-created.queue";

    @Bean
    public TopicExchange crmEventsExchange() {
        return new TopicExchange(TOPIC_EXCHANGE);
    }

    @Bean
    public Queue dealWonQueue() {
        return new Queue(DEAL_WON_QUEUE, true);
    }

    @Bean
    public Queue dealCreatedQueue() {
        return new Queue(DEAL_CREATED_QUEUE, true);
    }

    @Bean
    public Queue dealStageChangedQueue() {
        return new Queue(DEAL_STAGE_CHANGED_QUEUE, true);
    }

    @Bean
    public Queue ticketCreatedQueue() {
        return new Queue(TICKET_CREATED_QUEUE, true);
    }

    @Bean
    public Binding dealWonBinding(@Qualifier("dealWonQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("deal.won");
    }

    @Bean
    public Binding dealCreatedBinding(@Qualifier("dealCreatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("deal.created");
    }

    @Bean
    public Binding dealStageChangedBinding(@Qualifier("dealStageChangedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("deal.stage-changed");
    }

    @Bean
    public Binding ticketCreatedBinding(@Qualifier("ticketCreatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("ticket.created");
    }

    @Bean
    public JacksonJsonMessageConverter jsonConverter() {
        return new JacksonJsonMessageConverter();
    }
}
