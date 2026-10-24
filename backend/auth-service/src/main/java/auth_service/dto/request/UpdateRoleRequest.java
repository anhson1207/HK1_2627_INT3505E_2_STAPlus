package auth_service.dto.request;

import auth_service.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotNull
    private Role role;
}