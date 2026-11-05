package chat_service.dto.request;

import chat_service.entity.enums.ParticipantRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMemberRoleRequest {

    @NotNull(message = "Vai trò không được để trống")
    private ParticipantRole role;
}

