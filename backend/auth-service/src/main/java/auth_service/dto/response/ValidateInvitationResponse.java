package auth_service.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateInvitationResponse {

    private boolean valid;
    private String message;
    private String companyName;
    private String companyLogo;
    private String industry;
    private String code;
}
