package api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.filter.AfterFilterFunctions.DedupeStrategy;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.AfterFilterFunctions.dedupeResponseHeader;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@Configuration
public class GatewayConfig {

    @Value("${services.auth.url}")
    private String authServiceUrl;

    @Value("${services.lead.url}")
    private String leadServiceUrl;

    @Value("${services.customer.url}")
    private String customerServiceUrl;

    @Value("${services.sales.url}")
    private String salesServiceUrl;

    @Value("${services.support.url}")
    private String supportServiceUrl;

    @Value("${services.chat.url:http://localhost:8086}")
    private String chatServiceUrl;

    @Value("${services.notification.url:http://localhost:8087}")
    private String notificationServiceUrl;

    @Value("${services.analytics.url:http://localhost:8088}")
    private String analyticsServiceUrl;

    @Bean
    public RouterFunction<ServerResponse> authRoute() {
        return GatewayRouterFunctions.route("auth-service")
                .route(request ->
                                request.path().startsWith("/api/v1/auth/")
                                        || request.path().startsWith("/api/v1/users")
                                        || request.path().startsWith("/api/v1/audit-logs"),
                        http())
                .before(uri(authServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> chatRoute() {
        return GatewayRouterFunctions.route("chat-service")
                .route(request -> request.path().startsWith("/api/v1/chat"), http())
                .before(uri(chatServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> leadRoute() {
        return GatewayRouterFunctions.route("lead-service")
                .route(request ->
                                request.path().startsWith("/api/v1/leads"),
                        http())
                .before(uri(leadServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> customerRoute() {
        return GatewayRouterFunctions.route("customer-service")
                .route(request ->
                                request.path().startsWith("/api/v1/customers"),
                        http())
                .before(uri(customerServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> salesRoute() {
        return GatewayRouterFunctions.route("sales-service")
                .route(request ->
                                request.path().startsWith("/deals")
                                        || request.path().startsWith("/api/v1/deals"),
                        http())
                .before(uri(salesServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> supportRoute() {
        return GatewayRouterFunctions.route("support-service")
                .route(request ->
                                request.path().startsWith("/tickets")
                                        || request.path().startsWith("/api/v1/tickets"),
                        http())
                .before(uri(supportServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> notificationRoute() {
        return GatewayRouterFunctions.route("notification-service")
                .route(request -> request.path().startsWith("/api/v1/notifications"), http())
                .before(uri(notificationServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> analyticsRoute() {
        return GatewayRouterFunctions.route("analytics-service")
                .route(request -> request.path().startsWith("/api/v1/analytics"), http())
                .before(uri(analyticsServiceUrl))
                .after(dedupeResponseHeader("Access-Control-Allow-Origin", DedupeStrategy.RETAIN_UNIQUE))
                .after(dedupeResponseHeader("Access-Control-Allow-Credentials", DedupeStrategy.RETAIN_UNIQUE))
                .build();
    }
}
