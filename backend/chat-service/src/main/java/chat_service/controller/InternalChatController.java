package chat_service.controller;

import chat_service.security.UserStatusService;
import chat_service.ws.service.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/chat")
@RequiredArgsConstructor
@Slf4j
public class InternalChatController {

    private final UserStatusService userStatusService;
    private final ChatPresenceService presenceService;

    @Value("${app.internal-key}")
    private String internalKey;

    private void validateInternalKey(String headerKey) {
        if (headerKey == null || !headerKey.equals(internalKey)) {
            log.warn("Unauthorized internal request to chat-service: invalid X-Internal-Key");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid internal service key");
        }
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateUser(
            @RequestHeader(value = "X-Internal-Key", required = false) String headerKey,
            @PathVariable("id") Long userId) {
        validateInternalKey(headerKey);

        userStatusService.markDisabled(userId);
        log.info("Internal notification received: User ID {} deactivated. Invalidated status cache.", userId);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "User status invalidated and marked DISABLED",
                "userId", userId
        ));
    }
}

