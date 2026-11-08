package auth_service.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInvitationRequest {

    private Integer expiresInDays;
    private Integer maxUses;
    private String notes;
}
