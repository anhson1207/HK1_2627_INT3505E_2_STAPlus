package chat_service.ws.listener;

import chat_service.ws.model.WsPrincipal;
import chat_service.ws.service.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final ChatPresenceService presenceService;

    private final Map<Long, String> usernameCache = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        String sessionId = accessor.getSessionId();

        if (principal instanceof WsPrincipal wsPrincipal && sessionId != null) {
            Long userId = wsPrincipal.getUserId();
            usernameCache.put(userId, wsPrincipal.getUsername());
            boolean becameOnline = presenceService.registerSession(sessionId, userId, wsPrincipal.getUsername());
            if (becameOnline) {
                presenceService.broadcastPresence(userId, wsPrincipal.getUsername(), "ONLINE", LocalDateTime.now());
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if (sessionId != null) {
            Optional<Long> offlineUserIdOpt = presenceService.unregisterSession(sessionId);
            if (offlineUserIdOpt.isPresent()) {
                Long userId = offlineUserIdOpt.get();
                LocalDateTime lastSeen = presenceService.getLastSeen(userId);
                String username = usernameCache.getOrDefault(userId, "User#" + userId);

                presenceService.broadcastPresence(userId, username, "OFFLINE", lastSeen);
            }
        }
    }
}

