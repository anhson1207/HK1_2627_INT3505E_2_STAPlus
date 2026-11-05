package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatGroupUpdatedPayload {

    private Long conversationId;
    private String name;
    private String avatarUrl;
    private String operatorUsername;
}

