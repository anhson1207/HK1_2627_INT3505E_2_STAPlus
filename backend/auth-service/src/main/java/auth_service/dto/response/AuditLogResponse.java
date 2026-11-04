package auth_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {
    private Long id;
    private LocalDateTime timestamp;
    private Long userId;
    private String userEmail;
    private String userName;
    private String userRole;
    private String action;
    private String module;
    private String entityType;
    private String entityId;
    private String description;
    private String ipAddress;
    private String status;
    private String details;
}

