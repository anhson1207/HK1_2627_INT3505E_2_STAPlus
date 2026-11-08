package auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrganizationRequest {

    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    private String name;

    private String industry;
    private String companySize;
    private String logoUrl;
    private String phone;
    private String email;
    private String website;
    private String address;
    private String timezone;
}
