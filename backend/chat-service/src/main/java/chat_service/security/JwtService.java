package chat_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @PostConstruct
    public void validateSecret() {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException("FATAL: JWT_SECRET must be configured and at least 32 characters long!");
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public ChatPrincipal parsePrincipal(String token) {
        Claims claims = parseClaims(token);
        Long userId = null;
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number num) {
            userId = num.longValue();
        } else if (userIdObj instanceof String str) {
            userId = Long.parseLong(str);
        }

        String username = claims.get("username", String.class);
        String role = claims.get("role", String.class);
        String email = claims.getSubject();

        if (username == null || username.isBlank()) {
            username = email != null ? email.split("@")[0] : "user_" + userId;
        }

        return ChatPrincipal.builder()
                .userId(userId)
                .username(username)
                .email(email)
                .role(role)
                .build();
    }

    public String generateAccessToken(ChatPrincipal principal) {
        return Jwts.builder()
                .subject(principal.getEmail() != null ? principal.getEmail() : "user_" + principal.getUserId() + "@crm.local")
                .claim("role", principal.getRole() != null ? principal.getRole() : "SALES")
                .claim("userId", principal.getUserId())
                .claim("username", principal.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 900000))
                .signWith(key())
                .compact();
    }
}
