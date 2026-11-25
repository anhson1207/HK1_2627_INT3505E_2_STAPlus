package chat_service.ws.service;

import chat_service.dto.ChatPresenceSnapshotResponse;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

public interface ChatPresenceService {

    boolean registerSession(String sessionId, Long userId);

    boolean registerSession(String sessionId, Long userId, String username);

    Optional<Long> unregisterSession(String sessionId);

    void forceOffline(Long userId, String username);

    void touchLastSeen(Long userId);

    void broadcastPresence(Long userId, String username, String status, LocalDateTime timestamp);

    boolean isOnline(Long userId);

    LocalDateTime getLastSeen(Long userId);

    Set<Long> getOnlineUserIds();

    ChatPresenceSnapshotResponse getSnapshot();
}

