package lead_service.dto;

import java.util.Map;

public record AutoAssignResultDTO(
        int assignedCount,
        int totalUnassignedBefore,
        String strategyUsed,
        Map<Long, Integer> assignmentSummary
) {}
