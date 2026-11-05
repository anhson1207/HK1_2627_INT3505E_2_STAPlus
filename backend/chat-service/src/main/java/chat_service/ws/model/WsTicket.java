package chat_service.ws.model;

import chat_service.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WsTicket {

    private String ticket;
    private Long userId;
    private String username;
    private Role role;
    private Instant createdAt;
    private Instant expiresAt;
}

