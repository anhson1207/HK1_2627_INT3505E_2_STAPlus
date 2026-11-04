package auth_service.chat.dto;

import auth_service.chat.entity.enums.ConversationType;
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
    private List<ChatParticipantResponse> participants;
    private ChatUserResponse otherParticipant; // Tiện ích cho chat 1-1
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
