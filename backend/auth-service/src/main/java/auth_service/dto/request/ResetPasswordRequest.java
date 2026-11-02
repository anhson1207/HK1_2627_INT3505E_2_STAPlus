
package auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Size(min = 8, max = 100, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
    private String newPassword;
}
