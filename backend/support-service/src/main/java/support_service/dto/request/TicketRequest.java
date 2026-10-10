package support_service.dto.request;

import lombok.Getter;
import lombok.Setter;
import support_service.model.enums.Priority;

@Getter
@Setter
public class TicketRequest {

    //private Long customerId;
    private String subject;
    private String description;
    //private String priority;
    private Priority priority;
    private String status;

    private Long salesId;
    private Long supportId;

    public Long getSalesId() {
        return salesId;
    }

    public void setSalesId(Long salesId) {
        this.salesId = salesId;
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

    public Long getSupportId() {
        return supportId;
    }

    public void setSupportId(Long supportId) {
        this.supportId = supportId;
    }
}
