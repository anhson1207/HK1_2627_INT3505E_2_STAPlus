package auth_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "industry")
    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "address")
    private String address;

    @Column(name = "timezone")
    @Builder.Default
    private String timezone = "Asia/Ho_Chi_Minh";

    @Column(name = "crm_name")
    @Builder.Default
    private String crmName = "STAplus CRM";

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "vi";

    @Column(name = "date_format", length = 20)
    @Builder.Default
    private String dateFormat = "dd/MM/yyyy";

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Column(name = "setup_completed", nullable = false)
    @Builder.Default
    private Boolean setupCompleted = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (setupCompleted == null) {
            setupCompleted = true;
        }
        if (timezone == null || timezone.isBlank()) {
            timezone = "Asia/Ho_Chi_Minh";
        }
        if (crmName == null || crmName.isBlank()) {
            crmName = "STAplus CRM";
        }
        if (currency == null || currency.isBlank()) {
            currency = "VND";
        }
        if (language == null || language.isBlank()) {
            language = "vi";
        }
        if (dateFormat == null || dateFormat.isBlank()) {
            dateFormat = "dd/MM/yyyy";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
