package auth_service.dto.response;

import auth_service.entity.Role;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

 private String accessToken;
 private String refreshToken;
 private String tokenType;
 private String username;
 private Role role;
 private String message;
}