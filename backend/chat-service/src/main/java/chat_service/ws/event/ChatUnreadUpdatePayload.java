package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatUnreadUpdatePayload {

    private Long conversationId;
    private long unreadCount;
    private long totalUnreadCount;
}

