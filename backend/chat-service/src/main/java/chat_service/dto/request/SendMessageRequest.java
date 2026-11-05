package chat_service.dto.request;

import chat_service.entity.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    @NotBlank(message = "clientMessageId không được để trống")
    private String clientMessageId;

    private MessageType type;
    private String attachmentUrl;
    private String attachmentName;
    private Long attachmentSize;
}

