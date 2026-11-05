package sales_service.config;

import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    JacksonJsonMessageConverter jsonConverter(){
        JacksonJsonMessageConverter converter = new JacksonJsonMessageConverter();

        return converter;
    }
}
