package chat_service.dto;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadSummaryResponse {
    private long totalUnreadCount;
    private Map<Long, Long> conversationUnreadMap;
}

