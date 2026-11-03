package lead_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lead_service.entity.LeadSource;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LeadWebhookRequest(
        String fullName,
        String name,
        String email,
        String phone,
        String phoneNumber,
        String company,
        String notes,
        String message,
        LeadSource source,
        Map<String, Object> data
) {
    public String resolveFullName() {
        if (fullName != null && !fullName.isBlank()) return fullName.trim();
        if (name != null && !name.isBlank()) return name.trim();
        return "Lead chưa đặt tên";
    }

    public String resolvePhone() {
        if (phone != null && !phone.isBlank()) return phone.trim();
        if (phoneNumber != null && !phoneNumber.isBlank()) return phoneNumber.trim();
        return null;
    }

    public String resolveNotes() {
        StringBuilder sb = new StringBuilder();
        if (notes != null && !notes.isBlank()) sb.append(notes.trim());
        if (message != null && !message.isBlank()) {
            if (!sb.isEmpty()) sb.append(" | Tin nhắn: ");
            sb.append(message.trim());
        }
        return sb.isEmpty() ? null : sb.toString();
    }
}
