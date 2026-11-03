package lead_service.dto;

import java.util.List;

public record BatchLeadResponse(
        int total,
        int successCount,
        int failureCount,
        List<String> errors
) {
    public static BatchLeadResponse success(int count) {
        return new BatchLeadResponse(count, count, 0, List.of());
    }

    public static BatchLeadResponse partial(int total, int success, List<String> errors) {
        return new BatchLeadResponse(total, success, total - success, errors);
    }
}

