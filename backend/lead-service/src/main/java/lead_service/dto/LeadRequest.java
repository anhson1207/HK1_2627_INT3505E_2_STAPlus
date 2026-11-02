package lead_service.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;

public record LeadRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Email @Size(max = 160) String email,
        @Size(max = 30) String phone,
        @Size(max = 160) String company,
        LeadSource source,
        LeadStatus status,
        @Size(max = 2000) String notes,
        Long assignedUserId
) {
    @AssertTrue(message = "Either email or phone must be provided")
    public boolean isContactProvided() {
        return hasText(email) || hasText(phone);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
