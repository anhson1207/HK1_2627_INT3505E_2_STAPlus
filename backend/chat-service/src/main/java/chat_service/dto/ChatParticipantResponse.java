package chat_service.dto;

import chat_service.entity.enums.ParticipantRole;
import chat_service.entity.enums.ParticipantStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipantResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private ParticipantRole role;
    private ParticipantStatus status;
    private Long lastReadMessageId;
    private LocalDateTime lastReadAt;
    private Long visibleFromMessageId;
    private LocalDateTime joinedAt;
}

