package chat_service.dto;

import chat_service.entity.enums.MessageType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private MessageType type;
    private String content;
    private String attachmentUrl;
    private String attachmentName;
    private Long attachmentSize;
    private String clientMessageId;
    private LocalDateTime createdAt;
    private Boolean isMine;
}

