package sales_service.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class DealWonEvent {
    private UUID eventId;
    private Long dealId;
    private String dealName;
    private Double value;
    private Long customerId;
    private Long salesId;
    private LocalDateTime wonAt;

    public DealWonEvent() {
        this.eventId = UUID.randomUUID();
        this.wonAt = LocalDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }

    public Long getDealId() { return dealId; }
    public void setDealId(Long dealId) { this.dealId = dealId; }

    public String getDealName() { return dealName; }
    public void setDealName(String dealName) { this.dealName = dealName; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getSalesId() { return salesId; }
    public void setSalesId(Long salesId) { this.salesId = salesId; }

    public LocalDateTime getWonAt() { return wonAt; }
    public void setWonAt(LocalDateTime wonAt) { this.wonAt = wonAt; }
}

