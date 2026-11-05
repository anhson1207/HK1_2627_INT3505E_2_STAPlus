package lead_service.dto;

import lead_service.entity.AssignmentStrategy;
import java.util.List;

public record AssignmentRuleDTO(
        boolean enabled,
        AssignmentStrategy strategy,
        List<Long> activeSalesIds,
        int unassignedCount
) {}

