package lead_service.dto;

import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;

import java.time.LocalDateTime;

public record LeadResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String company,
        LeadSource source,
        LeadStatus status,
        String notes,
        Long assignedUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
