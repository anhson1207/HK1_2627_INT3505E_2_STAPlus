package customer_service.dto;

import java.time.LocalDateTime;

public record CustomerActivityResponse(
        Long id,
        Long customerId,
        String type,
        String title,
        String description,
        String createdBy,
        LocalDateTime createdAt
) {
}
