package chat_service.dto;

import chat_service.entity.enums.MessageType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatAttachmentResponse {
    private Long id;
    private Long conversationId;
    private Long uploaderId;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String fileUrl;
    private MessageType messageType;
    private LocalDateTime createdAt;
}

