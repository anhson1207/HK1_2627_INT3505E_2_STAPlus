package notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;

@Configuration
public class RabbitMQConfig {
    private static final String topicExchangeName = "crm.events";
    private static final String queueName = "notification.deal-created.queue";
    private static final String routingKey = "deal.created";

    private static final String dealStageChangedQueueName = "notification.deal-stage-changed.queue";
    private static final String dealStageChangedRoutingKey = "deal.stage-changed";

    private static final String dealWonQueueName = "notification.deal-won.queue";
    private static final String dealWonRoutingKey = "deal.won";

    private static final String discountRequestedQueueName = "notification.discount-approval-requested.queue";
    private static final String discountRequestedRoutingKey = "discount.approval-requested";

    private static final String discountApprovedQueueName = "notification.discount-approval-approved.queue";
    private static final String discountApprovedRoutingKey = "discount.approval-approved";

    @Bean
    TopicExchange exchange(){
        return new TopicExchange(topicExchangeName);
    }

    @Bean
    Queue dealCreatedQueue(){
        return new Queue(queueName, true);
    }

    @Bean
    Queue dealStageChangedQueue() {
        return new Queue(dealStageChangedQueueName , true);
    }

    @Bean
    Queue dealWonQueue(){
        return new Queue(dealWonQueueName, true);
    }

    @Bean
    Queue discountRequestedQueue(){
        return new Queue(discountRequestedQueueName, true);
    }

    @Bean
    Queue discountApprovedQueue(){
        return new Queue(discountApprovedQueueName, true);
    }

    @Bean
    Binding binding(@Qualifier("dealCreatedQueue")Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }

    @Bean
    Binding binding2(@Qualifier("dealStageChangedQueue")Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(dealStageChangedRoutingKey);
    }

    @Bean
    Binding binding3(@Qualifier("dealWonQueue")Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(dealWonRoutingKey);
    }

    @Bean
    Binding discountRequestedBinding(@Qualifier("discountRequestedQueue")Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(discountRequestedRoutingKey);
    }

    @Bean
    Binding discountApprovedBinding(@Qualifier("discountApprovedQueue")Queue queue, TopicExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(discountApprovedRoutingKey);
    }

    @Bean
    JacksonJsonMessageConverter jsonConverter(){
        JacksonJsonMessageConverter converter = new JacksonJsonMessageConverter();
        return converter;
    }

}
