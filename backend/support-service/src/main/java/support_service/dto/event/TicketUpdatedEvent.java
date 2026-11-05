package support_service.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class TicketUpdatedEvent {
    private UUID eventId;
    private Long ticketId;
    private String title;
    private String status;
    private String priority;
    private Long supportId;
    private LocalDateTime updatedAt;

    public TicketUpdatedEvent() {
        this.eventId = UUID.randomUUID();
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getSupportId() { return supportId; }
    public void setSupportId(Long supportId) { this.supportId = supportId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
