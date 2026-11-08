package auth_service.dto.response;

import auth_service.entity.InvitationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInvitationResponse {

    private Long id;
    private String code;
    private InvitationStatus status;
    private LocalDateTime expiresAt;
    private Integer maxUses;
    private Integer useCount;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime revokedAt;
    private String notes;
    private boolean usable;
}
