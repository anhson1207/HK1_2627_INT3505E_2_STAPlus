package chat_service.ws.listener;

import chat_service.security.UserStatusService;
import chat_service.ws.event.ChatDomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserStatusService userStatusService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onChatDomainEvent(ChatDomainEvent domainEvent) {
        if (domainEvent == null || domainEvent.getRecipientUserIds() == null || domainEvent.getPayload() == null) {
            return;
        }

        for (Long recipientUserId : domainEvent.getRecipientUserIds()) {
            if (recipientUserId == null) continue;

            // Check if user is active; skip delivery to DISABLED users
            if (!userStatusService.isUserActive(recipientUserId)) {
                log.debug("Skipping event delivery to DISABLED user ID: {}", recipientUserId);
                continue;
            }

            try {
                messagingTemplate.convertAndSendToUser(
                        recipientUserId.toString(),
                        "/queue/events",
                        domainEvent.getPayload()
                );
            } catch (Exception ex) {
                log.error("Failed to push WS event {} to user {}: {}",
                        domainEvent.getPayload().getEvent(), recipientUserId, ex.getMessage());
            }
        }
    }
}

