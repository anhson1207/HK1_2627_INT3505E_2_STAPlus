package customer_service.dto;

import customer_service.entity.CustomerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(

        @NotBlank(message = "fullName must not be blank")
        @Size(max = 150, message = "fullName must not exceed 150 characters")
        String fullName,

        @Email(message = "email must be valid")
        @Size(max = 255, message = "email must not exceed 255 characters")
        String email,

        @Size(max = 30, message = "phone must not exceed 30 characters")
        String phone,

        @Size(max = 255, message = "company must not exceed 255 characters")
        String company,

        CustomerStatus status,

        @Size(max = 2000, message = "notes must not exceed 2000 characters")
        String notes,

        Long assignedUserId
) {
}