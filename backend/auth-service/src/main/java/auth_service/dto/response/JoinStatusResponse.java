package auth_service.dto.response;

import auth_service.entity.JoinRequestStatus;
import auth_service.entity.Role;
import auth_service.entity.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinStatusResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String username;
    private UserStatus accountStatus;
    private JoinRequestStatus requestStatus;
    private Role role;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private String companyName;
    private String companyLogo;

    public JoinRequestStatus getStatus() {
        return requestStatus;
    }

    public UserStatus getUserStatus() {
        return accountStatus;
    }

    public Role getAssignedRole() {
        return role;
    }
}
