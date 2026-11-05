package chat_service.ws.service.impl;

import chat_service.ws.service.ChatPresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatPresenceServiceImpl implements ChatPresenceService {

    private final ConcurrentHashMap<Long, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> sessionToUser = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, LocalDateTime> lastSeenMap = new ConcurrentHashMap<>();

    @Override
    public boolean registerSession(String sessionId, Long userId) {
        if (sessionId == null || userId == null) return false;

        sessionToUser.put(sessionId, userId);
        Set<String> sessions = userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        boolean wasEmpty = sessions.isEmpty();
        sessions.add(sessionId);

        if (wasEmpty) {
            log.info("User {} connected first session -> ONLINE", userId);
            return true;
        }
        return false;
    }

    @Override
    public Optional<Long> unregisterSession(String sessionId) {
        if (sessionId == null) return Optional.empty();

        Long userId = sessionToUser.remove(sessionId);
        if (userId == null) return Optional.empty();

        Set<String> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
                LocalDateTime now = LocalDateTime.now();
                lastSeenMap.put(userId, now);
                log.info("User {} disconnected last session -> OFFLINE at {}", userId, now);
                return Optional.of(userId);
            }
        }
        return Optional.empty();
    }

    @Override
    public boolean isOnline(Long userId) {
        if (userId == null) return false;
        Set<String> sessions = userSessions.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    @Override
    public LocalDateTime getLastSeen(Long userId) {
        return lastSeenMap.get(userId);
    }

    @Override
    public Set<Long> getOnlineUserIds() {
        return Collections.unmodifiableSet(userSessions.keySet());
    }
}

