package chat_service.dto;

import chat_service.entity.enums.ConversationType;
import chat_service.entity.enums.ParticipantRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationResponse {
    private Long id;
    private ConversationType type;
    private String directKey;
    private String name;
    private String avatarUrl;
    private Long creatorId;
    private Long lastMessageId;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private String lastMessageSenderName;
    private long unreadCount;
    private ParticipantRole myRole;
    private List<ChatParticipantResponse> participants;
    private ChatUserResponse otherParticipant;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

