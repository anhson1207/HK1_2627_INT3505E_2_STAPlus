package chat_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferOwnerRequest {

    @NotNull(message = "ID của chủ nhóm mới không được để trống")
    private Long newOwnerUserId;
}

