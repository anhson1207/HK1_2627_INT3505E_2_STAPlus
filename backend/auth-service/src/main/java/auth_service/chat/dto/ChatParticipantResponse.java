package auth_service.chat.dto;

import auth_service.chat.entity.enums.ParticipantRole;
import auth_service.chat.entity.enums.ParticipantStatus;
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
    private LocalDateTime joinedAt;
}
