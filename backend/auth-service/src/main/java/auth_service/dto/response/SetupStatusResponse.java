package auth_service.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetupStatusResponse {
    private boolean setupCompleted;
    private boolean hasOrganization;
    private String organizationName;
    private String organizationLogo;
    private String ownerName;
    private boolean allowPublicSetup;
    private long userCount;
}
