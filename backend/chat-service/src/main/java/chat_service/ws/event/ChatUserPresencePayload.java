package chat_service.ws.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatUserPresencePayload {

    private Long userId;
    private String username;
    private String status; // "ONLINE" or "OFFLINE"
    private String timestamp;
}

