package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
@Builder
public class ChatDomainEvent {

    private final Set<Long> recipientUserIds;
    private final ChatEvent<?> payload;
}

