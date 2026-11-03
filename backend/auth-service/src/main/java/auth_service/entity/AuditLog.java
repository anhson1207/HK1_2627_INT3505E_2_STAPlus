package auth_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_logs_timestamp", columnList = "timestamp"),
        @Index(name = "idx_audit_logs_module", columnList = "module"),
        @Index(name = "idx_audit_logs_action", columnList = "action"),
        @Index(name = "idx_audit_logs_user_id", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Long userId;

    @Column(length = 100)
    private String userEmail;

    @Column(length = 100)
    private String userName;

    @Column(length = 50)
    private String userRole;

    @Column(nullable = false, length = 50)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ASSIGN, IMPORT, EXPORT, STATUS_CHANGE, ROLE_CHANGE

    @Column(nullable = false, length = 50)
    private String module; // LEAD, CUSTOMER, DEAL, USER, AUTH, SYSTEM

    @Column(length = 50)
    private String entityType; // Lead, Customer, User, Deal

    @Column(length = 100)
    private String entityId;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED, WARNING

    @Column(columnDefinition = "TEXT")
    private String details;
}
