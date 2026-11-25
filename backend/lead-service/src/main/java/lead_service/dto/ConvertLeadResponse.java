package lead_service.dto;

public record ConvertLeadResponse(
        Long leadId,
        Long customerId,
        String customerName,
        Long dealId,
        String dealName,
        String message
) {
}
