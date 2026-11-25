package chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPresenceSnapshotResponse {
    private Set<Long> onlineUserIds;
    private Map<Long, LocalDateTime> lastSeenByUserId;
}
