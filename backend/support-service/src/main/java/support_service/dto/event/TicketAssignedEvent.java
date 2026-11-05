package support_service.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class TicketAssignedEvent {
    private UUID eventId;
    private Long ticketId;
    private String ticketTitle;
    private Long supportId;
    private Long assignedByUserId;
    private LocalDateTime createdAt;

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketTitle() {
        return ticketTitle;
    }

    public void setTicketTitle(String ticketTitle) {
        this.ticketTitle = ticketTitle;
    }

    public Long getSupportId() {
        return supportId;
    }

    public void setSupportId(Long supportId) {
        this.supportId = supportId;
    }

    public Long getAssignedByUserId() {
        return assignedByUserId;
    }

    public void setAssignedByUserId(Long assignedByUserId) {
        this.assignedByUserId = assignedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
