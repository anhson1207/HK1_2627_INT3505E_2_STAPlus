package chat_service.ws.event;

import chat_service.dto.ChatParticipantResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMemberJoinedPayload {

    private Long conversationId;
    private String operatorUsername;
    private List<ChatParticipantResponse> newMembers;
}

