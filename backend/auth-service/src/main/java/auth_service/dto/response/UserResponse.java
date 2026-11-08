package auth_service.dto.response;

import auth_service.entity.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;
    private UserStatus status;
    private String fullName;
    private String phone;
    private String department;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private Boolean isOwner;
}
