package auth_service.dto.response;
import auth_service.entity.*; import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse { private Long id; private String username; private String email; private Role role; private UserStatus status; }
