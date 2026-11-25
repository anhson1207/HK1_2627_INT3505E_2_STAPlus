package support_service.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import support_service.dto.request.TicketFilterRequest;
import support_service.dto.request.TicketRequest;
import support_service.model.Ticket;
import support_service.service.TicketService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    private Long resolveUserId(Long headerId) {
        return (headerId != null && headerId > 0) ? headerId : 1L;
    }

    @GetMapping
    public ResponseEntity<Page<Ticket>> getTickets(@ModelAttribute TicketFilterRequest filterRequest) {
        return ResponseEntity.ok(ticketService.getTicketsBySupportId(filterRequest));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicketByIdAndSupportId(ticketId, null));
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
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        Long actorId = resolveUserId(currentUserId);
        Ticket t = ticketService.createTicket(request, actorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(t);
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long ticketId,
            @RequestBody TicketRequest request) {

        return ResponseEntity.ok(ticketService.updateTicket(ticketId, request, null));
    }

    @PatchMapping("/{ticketId}")
    public ResponseEntity<Ticket> patchTicket(
            @PathVariable Long ticketId,
            @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        Long actorId = resolveUserId(currentUserId);
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, request, actorId));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        String newStatus = (body != null && body.containsKey("status")) ? body.get("status") : status;
        TicketRequest request = new TicketRequest();
        request.setStatus(newStatus);
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, request, resolveUserId(currentUserId)));
    }

    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<Ticket> assignTicketAlias(
            @PathVariable Long ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        TicketRequest request = new TicketRequest();
        if (body != null) {
            Object supportIdObj = body.get("supportId");
            if (supportIdObj instanceof Number n) {
                request.setSupportId(n.longValue());
            } else if (supportIdObj instanceof String s && !s.isBlank()) {
                try {
                    request.setSupportId(Long.parseLong(s));
                } catch (NumberFormatException ignored) {
                }
            }
            if (body.get("assignedTo") instanceof String assignedStr) {
                request.setAssignedTo(assignedStr);
            }
        }
        return ResponseEntity.ok(ticketService.patchTicket(ticketId, request, resolveUserId(currentUserId)));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long ticketId) {
        ticketService.deleteTicket(ticketId, null);
        return ResponseEntity.noContent().build();
    }
}
