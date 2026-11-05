package chat_service.ws.event;

import chat_service.entity.enums.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMemberRoleUpdatedPayload {

    private Long conversationId;
    private Long userId;
    private String username;
    private ParticipantRole oldRole;
    private ParticipantRole newRole;
    private String operatorUsername;
}

