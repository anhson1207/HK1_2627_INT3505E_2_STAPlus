package customer_service.dto;

import customer_service.entity.CustomerStatus;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String company,
        CustomerStatus status,
        String notes,
        Long assignedUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}