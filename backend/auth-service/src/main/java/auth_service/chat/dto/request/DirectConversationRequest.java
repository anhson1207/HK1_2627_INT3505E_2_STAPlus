package auth_service.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectConversationRequest {

    @NotNull(message = "ID người nhận không được để trống")
    private Long recipientUserId;
}
