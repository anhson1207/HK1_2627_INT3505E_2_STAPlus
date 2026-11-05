package chat_service.ws.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

public interface ChatPresenceService {

    boolean registerSession(String sessionId, Long userId);

    Optional<Long> unregisterSession(String sessionId);

    boolean isOnline(Long userId);

    LocalDateTime getLastSeen(Long userId);

    Set<Long> getOnlineUserIds();
}

