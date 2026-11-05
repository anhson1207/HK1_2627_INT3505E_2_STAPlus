package support_service.controller;

import org.springframework.data.domain.Page;
import support_service.dto.request.TicketFilterRequest;
import support_service.model.Ticket;
import support_service.dto.request.TicketRequest;
import support_service.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService){
        this.ticketService = ticketService;
    }

    private Long resolveUserId(Long headerId) {
        return (headerId != null && headerId > 0) ? headerId : 1L;
    }

    private boolean isManagerOrAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
    }

    @GetMapping
    public ResponseEntity<Page<Ticket>> getTickets(
            @ModelAttribute TicketFilterRequest filterRequest,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole){

        if (filterRequest.getSupportId() == null && !isManagerOrAdmin(currentUserRole)) {
            filterRequest.setSupportId(resolveUserId(currentUserId));
        }

        return ResponseEntity.ok(ticketService.getTicketsBySupportId(filterRequest));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(
            @PathVariable Long ticketId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole){

        Long supportId = isManagerOrAdmin(currentUserRole) ? null : resolveUserId(currentUserId);
        return ResponseEntity.ok(ticketService.getTicketByIdAndSupportId(ticketId, supportId));
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<Ticket>> getUnassignedTickets() {
        return ResponseEntity.ok(ticketService.getUnassignedTickets());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Ticket>> getTicketsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ticketService.getTicketsByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){

        Long customerOrSalesId = resolveUserId(currentUserId);
        Ticket t = ticketService.createTicket(request, customerOrSalesId);
        return ResponseEntity.status(HttpStatus.CREATED).body(t);
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long ticketId,
            @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole){

        Long supportId = isManagerOrAdmin(currentUserRole) ? null : resolveUserId(currentUserId);
        return ResponseEntity.ok(ticketService.updateTicket(ticketId, request, supportId));
    }

    @PatchMapping("/{ticketId}")
    public ResponseEntity<Ticket> patchTicket(
            @PathVariable Long ticketId,
            @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId){

        Long managerId = (currentUserId != null && currentUserId > 0) ? currentUserId : 1000L;
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, request, managerId));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        String newStatus = (body != null && body.containsKey("status")) ? body.get("status") : status;
        TicketRequest req = new TicketRequest();
        req.setStatus(newStatus);
        Long managerId = (currentUserId != null && currentUserId > 0) ? currentUserId : 1000L;
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, req, managerId));
    }

    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long ticketId,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            @RequestParam(required = false) Long supportId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        Long assignedSupportId = supportId;
        if (body != null) {
            Object raw = body.get("supportId");
            if (raw == null) raw = body.get("assignedTo");
            if (raw instanceof Number) {
                assignedSupportId = ((Number) raw).longValue();
            } else if (raw instanceof String) {
                try {
                    assignedSupportId = Long.parseLong((String) raw);
                } catch (NumberFormatException ignored) {}
            }
        }
        TicketRequest req = new TicketRequest();
        req.setSupportId(assignedSupportId);
        Long managerId = (currentUserId != null && currentUserId > 0) ? currentUserId : 1000L;
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, req, managerId));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long ticketId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole){

        Long supportId = isManagerOrAdmin(currentUserRole) ? null : resolveUserId(currentUserId);
        ticketService.deleteTicket(ticketId, supportId);
        return ResponseEntity.noContent().build();
    }
}
