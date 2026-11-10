package auth_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

 @NotBlank
 @Size(min = 3, max = 50)
 private String username;

 @Email
 @NotBlank
 private String email;

 @NotBlank
 @Pattern(regexp = PasswordValidationConstants.PASSWORD_PATTERN, message = PasswordValidationConstants.PASSWORD_MESSAGE)
 private String password;
}