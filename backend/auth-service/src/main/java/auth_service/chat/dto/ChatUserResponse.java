package auth_service.chat.dto;

import auth_service.entity.Role;
import auth_service.entity.UserStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private UserStatus status;
}
