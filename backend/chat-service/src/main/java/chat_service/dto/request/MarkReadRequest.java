package chat_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkReadRequest {

    @NotNull(message = "messageId không được để trống")
    private Long messageId;
}

