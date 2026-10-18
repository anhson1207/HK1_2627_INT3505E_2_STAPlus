package support_service.controller;

import org.springframework.data.domain.Page;
import support_service.dto.request.TicketFilterRequest;
import support_service.filter.Filter;
import support_service.model.Ticket;
import support_service.dto.request.TicketRequest;
import support_service.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService){
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<Page<Ticket>> getTickets(
            @ModelAttribute TicketFilterRequest filterRequest){
        //handle role here
        Long supportId = 1L;
        //return ResponseEntity.ok(ticketService.getTicketsBySupportId(supportId));
        filterRequest.setSupportId(supportId);
        //return ResponseEntity.ok(ticketService.getTicketsBySupportId(supportId));

        //change the name already
        return ResponseEntity.ok(ticketService.getTicketsBySupportId(filterRequest));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long ticketId){
        //handle roles in here

        Long supportId = 1L;
        return ResponseEntity.ok(ticketService.getTicketByIdAndSupportId(ticketId, supportId));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketRequest request){
        Long salesId = 1L;
        Ticket t = ticketService.createTicket(request, salesId);
        return ResponseEntity.status(HttpStatus.CREATED).body(t);
    }

    //who gets to do this again?
    @PutMapping("/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long ticketId
            , @RequestBody TicketRequest request){
        Long supportId = 1L;
        return ResponseEntity.ok(ticketService.updateTicket(ticketId, request, supportId));
    }

    //admin or manager only
    @PatchMapping("/{ticketId}")
    public ResponseEntity<Ticket> patchTicket(@PathVariable Long ticketId
            , @RequestBody TicketRequest request){
        //Long supportId = 1L;
        return ResponseEntity.ok(ticketService.patchTicket(ticketId,request));
    }

    /*@DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long ticketId
    , @RequestBody TicketRequest request){

    }*/


}
