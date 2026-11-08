package auth_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {

    private Long id;
    private String name;
    private String industry;
    private String companySize;
    private String logoUrl;
    private String phone;
    private String email;
    private String website;
    private String address;
    private String timezone;
    private Long ownerUserId;
    private String ownerName;
    private String ownerEmail;
    private Boolean setupCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
