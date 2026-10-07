package support_service.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import support_service.dto.request.TicketRequest;
import support_service.model.Ticket;
import support_service.repository.TicketRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository){
        this.ticketRepository = ticketRepository;
    }

    public Ticket getTicketByIdAndSupportId(Long id, Long supportId){
        return ticketRepository.findByIdAndSupportId(id, supportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));
    }

    public List<Ticket> getTicketsBySupportId(Long supportId){
        return ticketRepository.findBySupportId(supportId);
    }

    public Ticket createTicket(TicketRequest request, Long customerId){
        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(request.getStatus());
        ticket.setSalesId(customerId);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id, Long supportId){
        Ticket d = ticketRepository.findByIdAndSupportId(id, supportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));
        ticketRepository.delete(d);
    }

    public Ticket updateTicket(Long id, TicketRequest request, Long supportId){
        Ticket ticket = ticketRepository.findByIdAndSupportId(id, supportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        if (request.getSubject() == null ||
                request.getDescription() == null ||
                request.getPriority() == null ||
                request.getStatus() == null) {

            throw new IllegalArgumentException("All ticket fields are required");
        }
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(request.getStatus());

        return ticketRepository.save(ticket);

    }

    public Ticket patchTicket(Long id, TicketRequest request){
        /*Ticket ticket = ticketRepository.findByIdAndSupportId(id, supportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));*/
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Ticket not found"
        ));
        if(request.getSubject() != null){
            ticket.setSubject(request.getSubject());
        }

        if(request.getDescription() != null){
            ticket.setDescription(request.getDescription());
        }

        if(request.getPriority()!= null){
            ticket.setPriority(request.getPriority());
        }

        if(request.getStatus()!= null){
            ticket.setStatus(request.getStatus());
        }

        if(request.getSupportId() != null){
            ticket.setSupportId(request.getSupportId());
        }

        return ticketRepository.save(ticket);
    }

    //how do I only allow admin to do this
    public Ticket assignTicket(Long id, TicketRequest request, Long supportId){
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));
        if(request.getSupportId() == null){
            throw new IllegalArgumentException("Support ID is required");
        }

        ticket.setSupportId(supportId);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUnassignedTickets(){
        return ticketRepository.findBySupportIdIsNull();
    }


}
