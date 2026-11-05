package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMemberLeftPayload {

    private Long conversationId;
    private Long userId;
    private String username;
    private String reason; // "LEFT" or "REMOVED"
    private String operatorUsername;
}

