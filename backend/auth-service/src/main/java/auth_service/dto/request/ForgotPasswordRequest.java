package auth_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Vui lòng nhập địa chỉ email")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;
}