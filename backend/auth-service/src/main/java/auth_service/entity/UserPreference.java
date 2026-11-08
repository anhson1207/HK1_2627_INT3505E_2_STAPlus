package auth_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "chat_toast", nullable = false)
    private Boolean chatToast = true;

    @Builder.Default
    @Column(name = "chat_sound", nullable = false)
    private Boolean chatSound = true;

    @Builder.Default
    @Column(name = "chat_browser", nullable = false)
    private Boolean chatBrowser = false;

    @Builder.Default
    @Column(name = "chat_group_events", nullable = false)
    private Boolean chatGroupEvents = true;

    @Builder.Default
    @Column(name = "notify_lead_assigned", nullable = false)
    private Boolean notifyLeadAssigned = true;

    @Builder.Default
    @Column(name = "notify_deal_stage", nullable = false)
    private Boolean notifyDealStage = true;

    @Builder.Default
    @Column(name = "notify_ticket", nullable = false)
    private Boolean notifyTicket = true;

    @Builder.Default
    @Column(name = "notify_system", nullable = false)
    private Boolean notifySystem = true;

    @Builder.Default
    @Column(name = "reminder_before", length = 20)
    private String reminderBefore = "15m";

    @Builder.Default
    @Column(name = "theme_mode", length = 20)
    private String themeMode = "dark";

    @Builder.Default
    @Column(name = "table_density", length = 20)
    private String tableDensity = "comfortable";

    @Builder.Default
    @Column(name = "sidebar_collapsed", nullable = false)
    private Boolean sidebarCollapsed = false;

    @Builder.Default
    @Column(name = "date_format", length = 30)
    private String dateFormat = "dd/MM/yyyy";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
