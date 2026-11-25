package auth_service.dto.request;

import auth_service.entity.Role;
import auth_service.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    private String phone;
    private String department;
    private String avatar;

    private Role role;
    private UserStatus status;

    @Pattern(regexp = PasswordValidationConstants.PASSWORD_PATTERN, message = PasswordValidationConstants.PASSWORD_MESSAGE)
    private String password;
}
