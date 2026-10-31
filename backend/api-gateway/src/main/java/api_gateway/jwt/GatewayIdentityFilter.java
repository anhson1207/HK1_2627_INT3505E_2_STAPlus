
package api_gateway.jwt;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class GatewayIdentityFilter extends OncePerRequestFilter {

    private final GatewayJwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        // Xóa các header định danh do client tự gửi.
        HttpServletRequest cleanRequest =
                new jakarta.servlet.http.HttpServletRequestWrapper(request) {
                    @Override
                    public String getHeader(String name) {
                        if (isIdentityHeader(name)) return null;
                        return super.getHeader(name);
                    }

                    @Override
                    public java.util.Enumeration<String> getHeaders(String name) {
                        if (isIdentityHeader(name)) {
                            return java.util.Collections.emptyEnumeration();
                        }
                        return super.getHeaders(name);
                    }

                    @Override
                    public java.util.Enumeration<String> getHeaderNames() {
                        return java.util.Collections.enumeration(
                                java.util.Collections.list(super.getHeaderNames())
                                        .stream()
                                        .filter(h -> !isIdentityHeader(h))
                                        .toList()
                        );
                    }
                };

        String authorization = request.getHeader("Authorization");

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            chain.doFilter(cleanRequest, response);
            return;
        }

        try {
            Claims claims = jwtService.validateAndExtractClaims(
                    authorization.substring(7)
            );

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Number userId = claims.get("userId", Number.class);

            if (email == null || email.isBlank()
                    || role == null || role.isBlank()
                    || userId == null) {
                response.sendError(401, "Invalid token claims");
                return;
            }

            HttpServletRequest authenticatedRequest =
                    new jakarta.servlet.http.HttpServletRequestWrapper(cleanRequest) {

                        @Override
                        public String getHeader(String name) {
                            if (name.equalsIgnoreCase("X-User-Id"))
                                return userId.toString();
                            if (name.equalsIgnoreCase("X-User-Role"))
                                return role;
                            if (name.equalsIgnoreCase("X-User-Email"))
                                return email;

                            return super.getHeader(name);
                        }

                        @Override
                        public java.util.Enumeration<String> getHeaders(String name) {
                            String value = getHeader(name);
                            if (isIdentityHeader(name)) {
                                return java.util.Collections.enumeration(
                                        java.util.List.of(value)
                                );
                            }
                            return super.getHeaders(name);
                        }

                        @Override
                        public java.util.Enumeration<String> getHeaderNames() {
                            java.util.List<String> names =
                                    new java.util.ArrayList<>(
                                            java.util.Collections.list(super.getHeaderNames())
                                    );
                            names.addAll(java.util.List.of(
                                    "X-User-Id", "X-User-Role", "X-User-Email"
                            ));
                            return java.util.Collections.enumeration(names);
                        }
                    };

            chain.doFilter(authenticatedRequest, response);

        } catch (IllegalArgumentException e) {
            response.sendError(401, "Invalid or expired access token");
        }
    }

    private boolean isIdentityHeader(String name) {
        return name.equalsIgnoreCase("X-User-Id")
                || name.equalsIgnoreCase("X-User-Role")
                || name.equalsIgnoreCase("X-User-Email");
    }
}
