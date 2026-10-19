package auth_service.dto.request;
import auth_service.entity.UserStatus; import jakarta.validation.constraints.NotNull; import lombok.Data;
@Data public class UpdateUserStatusRequest { @NotNull private UserStatus status; }
