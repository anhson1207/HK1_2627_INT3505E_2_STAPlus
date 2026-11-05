package api_gateway.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsDeduplicationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(response) {
            @Override
            public void addHeader(String name, String value) {
                if (isCorsHeader(name) && containsHeader(name)) {
                    return;
                }
                super.addHeader(name, value);
            }

            private boolean isCorsHeader(String name) {
                return "Access-Control-Allow-Origin".equalsIgnoreCase(name)
                        || "Access-Control-Allow-Credentials".equalsIgnoreCase(name);
            }
        };

        filterChain.doFilter(request, responseWrapper);
    }
}

