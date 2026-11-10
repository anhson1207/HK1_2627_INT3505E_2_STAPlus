package auth_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Pattern(regexp = PasswordValidationConstants.PASSWORD_PATTERN, message = PasswordValidationConstants.PASSWORD_MESSAGE)
    private String newPassword;
}