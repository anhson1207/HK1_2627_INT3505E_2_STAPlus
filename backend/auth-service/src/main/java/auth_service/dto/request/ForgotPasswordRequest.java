package auth_service.dto.request;
import jakarta.validation.constraints.*; import lombok.Data;
@Data public class ForgotPasswordRequest { @Email @NotBlank private String email; }
