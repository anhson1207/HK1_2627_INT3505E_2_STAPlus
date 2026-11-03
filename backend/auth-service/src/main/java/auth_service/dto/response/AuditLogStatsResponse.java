package auth_service.dto.response;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogStatsResponse {
    private long totalLogs;
    private long todayLogs;
    private long successCount;
    private long failedCount;
    private Map<String, Long> actionCounts;
    private Map<String, Long> moduleCounts;
}
