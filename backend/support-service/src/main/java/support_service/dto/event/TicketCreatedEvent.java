package support_service.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class TicketCreatedEvent {
    private UUID eventId;
    private Long ticketId;
    private String title;
    private String priority;
    private Long supportId;
    private Long customerId;
    private LocalDateTime createdAt;

    public TicketCreatedEvent() {
        this.eventId = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getSupportId() { return supportId; }
    public void setSupportId(Long supportId) { this.supportId = supportId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
