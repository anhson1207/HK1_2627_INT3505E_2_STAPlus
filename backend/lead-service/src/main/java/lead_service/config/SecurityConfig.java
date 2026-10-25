package lead_service.config;

import lead_service.security.JwtFilter;
import lead_service.constant.ApiPaths;
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
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/health").permitAll()
                        .requestMatchers(HttpMethod.GET, ApiPaths.LEADS, ApiPaths.LEADS + "/**").hasAnyRole("ADMIN", "SALES", "SUPPORT")
                        .requestMatchers(HttpMethod.POST, ApiPaths.LEADS, ApiPaths.LEADS + "/**").hasAnyRole("ADMIN", "SALES")
                        .requestMatchers(HttpMethod.PUT, ApiPaths.LEADS, ApiPaths.LEADS + "/**").hasAnyRole("ADMIN", "SALES")
                        .requestMatchers(HttpMethod.PATCH, ApiPaths.LEADS, ApiPaths.LEADS + "/**").hasAnyRole("ADMIN", "SALES")
                        .requestMatchers(HttpMethod.DELETE, ApiPaths.LEADS, ApiPaths.LEADS + "/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
