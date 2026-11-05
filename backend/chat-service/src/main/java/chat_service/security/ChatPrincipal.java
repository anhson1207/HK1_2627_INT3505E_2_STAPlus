package chat_service.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPrincipal implements Principal {
    private Long userId;
    private String username;
    private String email;
    private String role;

    @Override
    public String getName() {
        return userId != null ? String.valueOf(userId) : email;
    }
}

