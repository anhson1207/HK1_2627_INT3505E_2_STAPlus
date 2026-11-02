package api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

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

    @Bean
    public RouterFunction<ServerResponse> authRoute() {
        return GatewayRouterFunctions.route("auth-service")
                .route(request ->
                                request.path().startsWith("/api/v1/auth/")
                                        || request.path().startsWith("/api/v1/users"),
                        http())
                .before(uri(authServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> leadRoute() {
        return GatewayRouterFunctions.route("lead-service")
                .route(request ->
                                request.path().startsWith("/api/v1/leads"),
                        http())
                .before(uri(leadServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> customerRoute() {
        return GatewayRouterFunctions.route("customer-service")
                .route(request ->
                                request.path().startsWith("/api/v1/customers"),
                        http())
                .before(uri(customerServiceUrl))
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
                .build();
    }
}