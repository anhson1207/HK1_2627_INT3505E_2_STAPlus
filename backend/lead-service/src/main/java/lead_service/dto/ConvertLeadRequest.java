package lead_service.dto;

public record ConvertLeadRequest(
        String dealName,
        Double dealAmount,
        String dealStage,
        String customerNotes,
        Long assignedUserId
) {
}
