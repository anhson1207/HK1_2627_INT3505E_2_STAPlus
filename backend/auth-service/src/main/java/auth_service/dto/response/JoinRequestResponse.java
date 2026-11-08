package auth_service.dto.response;

import auth_service.entity.JoinRequestStatus;
import auth_service.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String username;
    private String phone;
    private String department;
    private Long invitationId;
    private String invitationCode;
    private JoinRequestStatus status;
    private LocalDateTime requestedAt;
    private Long reviewedBy;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private Role assignedRole;
    private String rejectionReason;
    private String notes;

    public String getUserEmail() {
        return email;
    }

    public String getUserName() {
        return fullName != null && !fullName.isBlank() ? fullName : username;
    }
}
