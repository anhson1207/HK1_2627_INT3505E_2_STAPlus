package customer_service.config;

import customer_service.constant.ApiPaths;
import customer_service.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.GET,
                                ApiPaths.CUSTOMERS,
                                ApiPaths.CUSTOMERS + "/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES",
                                "SUPPORT"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                ApiPaths.CUSTOMERS,
                                ApiPaths.CUSTOMERS + "/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                ApiPaths.CUSTOMERS,
                                ApiPaths.CUSTOMERS + "/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )

                        .requestMatchers(
                                HttpMethod.PATCH,
                                ApiPaths.CUSTOMERS,
                                ApiPaths.CUSTOMERS + "/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )

                        .requestMatchers(
                                HttpMethod.DELETE,
                                ApiPaths.CUSTOMERS,
                                ApiPaths.CUSTOMERS + "/**"
                        )
                        .hasRole("ADMIN")

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}