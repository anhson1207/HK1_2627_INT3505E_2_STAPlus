package chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatLinkItemResponse {
    private Long messageId;
    private String url;
    private String domain;
    private String snippet;
    private Long senderId;
    private String senderUsername;
    private LocalDateTime createdAt;
}
