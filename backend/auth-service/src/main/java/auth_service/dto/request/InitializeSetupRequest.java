package auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitializeSetupRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu tối thiểu 8 ký tự")
    private String password;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;

    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    private String companyName;

    @NotBlank(message = "Lĩnh vực kinh doanh không được để trống")
    private String industry;

    @NotBlank(message = "Quy mô nhân sự không được để trống")
    private String companySize;

    private String phone;
    private String companyEmail;
    private String website;
    private String address;
    private String timezone;
    private String logoUrl;

    private String bootstrapToken;
}
