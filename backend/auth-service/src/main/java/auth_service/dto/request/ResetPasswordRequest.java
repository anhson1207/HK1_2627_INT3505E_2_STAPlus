
package auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Vui lòng nhập địa chỉ email")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã OTP")
    @Pattern(
            regexp = "^[0-9]{6}$",
            message = "Mã OTP phải bao gồm đúng 6 chữ số"
    )
    private String token;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới")
    @Pattern(regexp = PasswordValidationConstants.PASSWORD_PATTERN, message = PasswordValidationConstants.PASSWORD_MESSAGE)
    private String newPassword;
}
