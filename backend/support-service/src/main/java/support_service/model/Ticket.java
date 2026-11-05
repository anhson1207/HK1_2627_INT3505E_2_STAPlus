package support_service.model;

import jakarta.persistence.*;
import support_service.model.enums.Priority;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority; //what's an enum ?

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "sales_id", nullable = false)
    private Long salesId;

    @Column(name="support_id")
    private Long supportId;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    public LocalDateTime getSlaDeadline() {
        return slaDeadline;
    }

    public void setSlaDeadline(LocalDateTime slaDeadline) {
        this.slaDeadline = slaDeadline;
    }

    public static LocalDateTime calculateSlaDeadline(Priority priority, LocalDateTime created) {
        LocalDateTime base = created != null ? created : LocalDateTime.now();
        Priority p = priority != null ? priority : Priority.MEDIUM;
        return switch (p) {
            case URGENT -> base.plusHours(24);
            case HIGH -> base.plusHours(48);
            case MEDIUM -> base.plusHours(72);
            case LOW -> base.plusHours(120);
        };
    }

    @Transient
    public boolean isSlaBreached() {
        if (slaDeadline == null) return false;
        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) return false;
        return LocalDateTime.now().isAfter(slaDeadline);
    }


    public Long getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSalesId() {
        return salesId;
    }

    public void setSalesId(Long salesId) {
        this.salesId = salesId;
    }

    public Long getSupportId() {
        return supportId;
    }

    public void setSupportId(Long supportId) {
        this.supportId = supportId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
