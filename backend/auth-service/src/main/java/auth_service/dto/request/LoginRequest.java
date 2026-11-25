package auth_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Vui lòng nhập email hoặc tên đăng nhập")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}