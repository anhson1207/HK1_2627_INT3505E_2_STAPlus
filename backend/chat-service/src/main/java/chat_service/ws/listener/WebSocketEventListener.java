package chat_service.ws.listener;

import chat_service.ws.event.ChatDomainEvent;
import chat_service.ws.event.ChatEvent;
import chat_service.ws.event.ChatUserPresencePayload;
import chat_service.ws.model.WsPrincipal;
import chat_service.ws.service.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final ChatPresenceService presenceService;
    private final ApplicationEventPublisher eventPublisher;

    private final Map<Long, String> usernameCache = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        String sessionId = accessor.getSessionId();

        if (principal instanceof WsPrincipal wsPrincipal && sessionId != null) {
            Long userId = wsPrincipal.getUserId();
            usernameCache.put(userId, wsPrincipal.getUsername());
            boolean becameOnline = presenceService.registerSession(sessionId, userId);
            if (becameOnline) {
                broadcastPresence(userId, wsPrincipal.getUsername(), "ONLINE", null);
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

                broadcastPresence(userId, username, "OFFLINE", lastSeen);
            }
        }
    }

    private void broadcastPresence(Long userId, String username, String status, LocalDateTime lastSeen) {
        ChatUserPresencePayload payload = ChatUserPresencePayload.builder()
                .userId(userId)
                .username(username)
                .status(status)
                .timestamp(lastSeen != null ? lastSeen.toString() : LocalDateTime.now().toString())
                .build();

        ChatEvent<ChatUserPresencePayload> chatEvent = ChatEvent.of(
                "chat:user:presence",
                null,
                payload
        );

        // Notify all online users
        Set<Long> recipientIds = presenceService.getOnlineUserIds().stream()
                .filter(id -> !id.equals(userId))
                .collect(Collectors.toSet());

        if (!recipientIds.isEmpty()) {
            eventPublisher.publishEvent(ChatDomainEvent.builder()
                    .recipientUserIds(recipientIds)
                    .payload(chatEvent)
                    .build());
        }
    }
}

