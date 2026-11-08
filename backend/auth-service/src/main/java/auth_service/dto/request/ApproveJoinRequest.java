package auth_service.dto.request;

import auth_service.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveJoinRequest {

    @NotNull(message = "Vui lòng chọn vai trò (SALES hoặc SUPPORT)")
    private Role role;

    private String department;
}
