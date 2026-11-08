package auth_service.dto.response;

import auth_service.entity.Role;
import auth_service.entity.UserStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private UserStatus status;
    private Boolean isOwner;
    private String companyName;
    private String message;
}
