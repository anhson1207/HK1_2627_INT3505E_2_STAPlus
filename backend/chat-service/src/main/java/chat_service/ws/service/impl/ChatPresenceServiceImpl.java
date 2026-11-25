package chat_service.ws.service.impl;

import chat_service.dto.ChatPresenceSnapshotResponse;
import chat_service.entity.ChatUserPresence;
import chat_service.repository.ChatUserPresenceRepository;
import chat_service.ws.event.ChatDomainEvent;
import chat_service.ws.event.ChatEvent;
import chat_service.ws.event.ChatUserPresencePayload;
import chat_service.ws.service.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatPresenceServiceImpl implements ChatPresenceService {

    private static final long TOUCH_DB_INTERVAL_MS = 20_000L;

    private final ChatUserPresenceRepository presenceRepository;
    private final ApplicationEventPublisher eventPublisher;

    private final ConcurrentHashMap<Long, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> sessionToUser = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, LocalDateTime> lastSeenMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Long> lastDbWriteMsMap = new ConcurrentHashMap<>();
    private final AtomicBoolean dbHydrated = new AtomicBoolean(false);

    @Override
    public boolean registerSession(String sessionId, Long userId) {
        return registerSession(sessionId, userId, null);
    }

    @Override
    public boolean registerSession(String sessionId, Long userId, String username) {
        if (sessionId == null || userId == null) return false;
        ensureHydrated();

        sessionToUser.put(sessionId, userId);
        Set<String> sessions = userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        boolean wasEmpty = sessions.isEmpty();
        sessions.add(sessionId);

        LocalDateTime now = LocalDateTime.now();
        persistLastSeen(userId, now, false);

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
                userSessions.remove(userId, sessions);
                LocalDateTime now = LocalDateTime.now();
                persistLastSeen(userId, now, true);
                log.info("User {} disconnected last session -> OFFLINE at {}", userId, now);
                return Optional.of(userId);
            }
        }
        return Optional.empty();
    }

    @Override
    public void forceOffline(Long userId, String username) {
        if (userId == null) return;
        ensureHydrated();

        Set<String> sessions = userSessions.remove(userId);
        if (sessions != null) {
            for (String sid : sessions) {
                sessionToUser.remove(sid);
            }
        }

        LocalDateTime now = LocalDateTime.now();
        persistLastSeen(userId, now, true);
        log.info("User {} explicitly signed out -> OFFLINE at {}", userId, now);
        broadcastPresence(userId, username != null ? username : ("User#" + userId), "OFFLINE", now);
    }

    @Override
    public void touchLastSeen(Long userId) {
        if (userId == null) return;
        ensureHydrated();
        persistLastSeen(userId, LocalDateTime.now(), false);
    }

    @Override
    public void broadcastPresence(Long userId, String username, String status, LocalDateTime timestamp) {
        if (userId == null) return;
        LocalDateTime effectiveTime = timestamp != null ? timestamp : LocalDateTime.now();
        ChatUserPresencePayload payload = ChatUserPresencePayload.builder()
                .userId(userId)
                .username(username != null ? username : ("User#" + userId))
                .status(status)
                .timestamp(effectiveTime.toString())
                .build();

        ChatEvent<ChatUserPresencePayload> chatEvent = ChatEvent.of(
                "chat:user:presence",
                null,
                payload
        );

        Set<Long> recipientIds = getOnlineUserIds().stream()
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());

        if (!recipientIds.isEmpty()) {
            eventPublisher.publishEvent(ChatDomainEvent.builder()
                    .recipientUserIds(recipientIds)
                    .payload(chatEvent)
                    .build());
        }
    }

    @Override
    public boolean isOnline(Long userId) {
        if (userId == null) return false;
        Set<String> sessions = userSessions.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    @Override
    public LocalDateTime getLastSeen(Long userId) {
        ensureHydrated();
        return lastSeenMap.get(userId);
    }

    @Override
    public Set<Long> getOnlineUserIds() {
        return Collections.unmodifiableSet(userSessions.keySet());
    }

    @Override
    public ChatPresenceSnapshotResponse getSnapshot() {
        ensureHydrated();
        Map<Long, LocalDateTime> lastSeenCopy = new HashMap<>(lastSeenMap);
        return ChatPresenceSnapshotResponse.builder()
                .onlineUserIds(Set.copyOf(userSessions.keySet()))
                .lastSeenByUserId(lastSeenCopy)
                .build();
    }

    private void ensureHydrated() {
        if (dbHydrated.compareAndSet(false, true)) {
            try {
                for (ChatUserPresence entry : presenceRepository.findAll()) {
                    if (entry.getUserId() != null && entry.getLastSeenAt() != null) {
                        lastSeenMap.putIfAbsent(entry.getUserId(), entry.getLastSeenAt());
                    }
                }
            } catch (Exception ex) {
                log.debug("Could not hydrate presence from DB on startup: {}", ex.getMessage());
            }
        }
    }

    private void persistLastSeen(Long userId, LocalDateTime timestamp, boolean immediate) {
        lastSeenMap.put(userId, timestamp);
        long nowMs = System.currentTimeMillis();
        Long lastWrite = lastDbWriteMsMap.get(userId);
        if (!immediate && lastWrite != null && (nowMs - lastWrite) < TOUCH_DB_INTERVAL_MS) {
            return;
        }
        lastDbWriteMsMap.put(userId, nowMs);
        try {
            presenceRepository.save(
                    ChatUserPresence.builder()
                            .userId(userId)
                            .lastSeenAt(timestamp)
                            .updatedAt(timestamp)
                            .build()
            );
        } catch (Exception ex) {
            log.debug("Failed to persist presence lastSeen for user {}: {}", userId, ex.getMessage());
        }
    }
}
