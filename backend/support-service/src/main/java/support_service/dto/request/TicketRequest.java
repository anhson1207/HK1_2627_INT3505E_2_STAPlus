package support_service.dto.request;

import lombok.Getter;
import lombok.Setter;
import support_service.model.enums.Priority;

@Getter
@Setter
public class TicketRequest {

    private String subject;
    private String description;
    private Priority priority;
    private String status;
    private Long salesId;
    private Long customerId;
    private Long supportId;
    private String assignedTo;
}
