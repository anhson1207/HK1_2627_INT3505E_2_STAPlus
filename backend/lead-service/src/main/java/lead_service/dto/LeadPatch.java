package lead_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;

public record LeadPatch(
        @Size(max = 120) String fullName,
        @Email @Size(max = 160) String email,
        @Size(max = 30) String phone,
        @Size(max = 160) String company,
        LeadSource source,
        LeadStatus status,
        @Size(max = 2000) String notes,
        Long assignedUserId
) {}
