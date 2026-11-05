package chat_service.security;

import chat_service.client.AuthServiceClient;
import chat_service.dto.ChatUserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class UserStatusService {

    private final AuthServiceClient authServiceClient;
    private final long cacheTtlMs;

    private static class CachedStatus {
        final boolean active;
        final long timestamp;

        CachedStatus(boolean active, long timestamp) {
            this.active = active;
            this.timestamp = timestamp;
        }
    }

    private final Map<Long, CachedStatus> statusCache = new ConcurrentHashMap<>();

    public UserStatusService(
            AuthServiceClient authServiceClient,
            @Value("${app.chat.user-status-cache-ttl-ms:15000}") long cacheTtlMs
    ) {
        this.authServiceClient = authServiceClient;
        this.cacheTtlMs = cacheTtlMs;
    }

    public boolean isUserActive(Long userId) {
        if (userId == null) {
            return false;
        }

        long now = System.currentTimeMillis();
        CachedStatus cached = statusCache.get(userId);

        if (cached != null && (now - cached.timestamp) < cacheTtlMs) {
            return cached.active;
        }

        try {
            Optional<ChatUserResponse> userOpt = authServiceClient.getUserById(userId);
            boolean active = userOpt.isPresent() && "ACTIVE".equalsIgnoreCase(userOpt.get().getStatus());
            statusCache.put(userId, new CachedStatus(active, now));
            return active;
        } catch (Exception e) {
            log.warn("Failed to check user status from auth-service for userId {}: {}", userId, e.getMessage());
            // If cache had previous status, return it; otherwise reject for security
            if (cached != null) {
                return cached.active;
            }
            return false;
        }
    }

    public void markDisabled(Long userId) {
        if (userId != null) {
            statusCache.put(userId, new CachedStatus(false, System.currentTimeMillis()));
            log.info("User {} explicitly marked as DISABLED in Chat status cache", userId);
        }
    }

    public void invalidate(Long userId) {
        if (userId != null) {
            statusCache.remove(userId);
            log.info("User {} status cache invalidated", userId);
        }
    }

    public void clearAll() {
        statusCache.clear();
    }
}

