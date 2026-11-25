package customer_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerActivityRequest(
        @NotBlank(message = "Loại hoạt động không được để trống")
        String type,
        @NotBlank(message = "Tiêu đề hoạt động không được để trống")
        String title,
        String description
) {
}
