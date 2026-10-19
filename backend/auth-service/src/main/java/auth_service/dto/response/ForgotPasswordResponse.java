package auth_service.dto.response;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ForgotPasswordResponse { private String message; private String resetToken; }
