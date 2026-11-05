package support_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import support_service.dto.event.TicketAssignedEvent;
import support_service.dto.event.TicketCreatedEvent;
import support_service.dto.event.TicketUpdatedEvent;
import support_service.dto.request.TicketFilterRequest;
import support_service.dto.request.TicketRequest;
import support_service.filter.Filter;
import support_service.model.Ticket;
import support_service.model.enums.Priority;
import support_service.publisher.TicketEventPublisher;
import support_service.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import support_service.util.PaginationCheck;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketEventPublisher ticketEventPublisher;

    public TicketService(TicketRepository ticketRepository, TicketEventPublisher ticketEventPublisher){
        this.ticketRepository = ticketRepository;
        this.ticketEventPublisher = ticketEventPublisher;
    }

    public List<Ticket> getTicketsBySupportId(Long supportId){
        return (supportId != null && supportId > 0)
                ? ticketRepository.findBySupportId(supportId)
                : ticketRepository.findAll();
    }

    public Ticket getTicketByIdAndSupportId(Long ticketId, Long supportId){
        return (supportId != null && supportId > 0)
                ? ticketRepository.findByIdAndSupportId(ticketId, supportId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"))
                : ticketRepository.findById(ticketId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    public Page<Ticket> getTicketsBySupportId(TicketFilterRequest request){
        int[] pgNumAndSize = PaginationCheck.check(request.getPgNum(), request.getPgSize());
        int page = pgNumAndSize[0];
        int size = pgNumAndSize[1];
        Sort sort;
        if (!Objects.equals(request.getSortedBy(), "priority")) {
            sort = "asc".equalsIgnoreCase(request.getOrder())
                    ? Sort.by(request.getSortedBy() != null ? request.getSortedBy() : "createdAt").ascending()
                    : Sort.by(request.getSortedBy() != null ? request.getSortedBy() : "createdAt").descending();
        } else {
            sort = Sort.unsorted();
        }

        return ticketRepository.findAll(
                Filter.filter(
                        request.getPriority(),
                        request.getStatus(),
                        request.getSalesId(),
                        request.getSupportId(),
                        request.getCreatedAfter(),
                        request.getCreatedBefore(),
                        request.getSortedBy(),
                        request.getOrder()
                ),
                PageRequest.of(page, size, sort)
        );
    }

    public Ticket createTicket(TicketRequest request, Long customerId){
        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        ticket.setStatus(request.getStatus() != null ? request.getStatus() : "OPEN");
        ticket.setSalesId(customerId != null ? customerId : 1L);
        ticket.setSupportId(request.getSupportId());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        TicketCreatedEvent event = new TicketCreatedEvent();
        event.setTicketId(saved.getId());
        event.setTitle(saved.getSubject());
        event.setPriority(saved.getPriority() != null ? saved.getPriority().name() : "MEDIUM");
        event.setSupportId(saved.getSupportId());
        event.setCustomerId(saved.getSalesId());
        ticketEventPublisher.publishTicketCreated(event);

        if (saved.getSupportId() != null) {
            TicketAssignedEvent assignedEvent = new TicketAssignedEvent();
            assignedEvent.setEventId(UUID.randomUUID());
            assignedEvent.setTicketId(saved.getId());
            assignedEvent.setTicketTitle(saved.getSubject());
            assignedEvent.setSupportId(saved.getSupportId());
            assignedEvent.setAssignedByUserId(customerId != null ? customerId : 1L);
            assignedEvent.setCreatedAt(saved.getCreatedAt());
            ticketEventPublisher.publishTicketAssigned(assignedEvent);
        }

        return saved;
    }

    public void deleteTicket(Long id, Long supportId){
        Ticket d = (supportId != null && supportId > 0)
                ? ticketRepository.findByIdAndSupportId(id, supportId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"))
                : ticketRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        ticketRepository.delete(d);
    }

    public Ticket updateTicket(Long id, TicketRequest request, Long supportId){
        Ticket ticket = (supportId != null && supportId > 0)
                ? ticketRepository.findByIdAndSupportId(id, supportId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"))
                : ticketRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

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
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        TicketUpdatedEvent updatedEvent = new TicketUpdatedEvent();
        updatedEvent.setTicketId(saved.getId());
        updatedEvent.setTitle(saved.getSubject());
        updatedEvent.setStatus(saved.getStatus());
        updatedEvent.setPriority(saved.getPriority() != null ? saved.getPriority().name() : "MEDIUM");
        updatedEvent.setSupportId(saved.getSupportId());
        ticketEventPublisher.publishTicketUpdated(updatedEvent);

        return saved;
    }

    public Ticket patchTicket(Long id, TicketRequest request, Long assignedByUserId){
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        Long previousSupportId = ticket.getSupportId();

        if (request.getSubject() != null) ticket.setSubject(request.getSubject());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getSupportId() != null) ticket.setSupportId(request.getSupportId());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        if (request.getSupportId() != null && !Objects.equals(previousSupportId, savedTicket.getSupportId())) {
            TicketAssignedEvent event = new TicketAssignedEvent();
            event.setEventId(UUID.randomUUID());
            event.setTicketId(savedTicket.getId());
            event.setTicketTitle(savedTicket.getSubject());
            event.setSupportId(savedTicket.getSupportId());
            event.setAssignedByUserId(assignedByUserId != null ? assignedByUserId : 1000L);
            event.setCreatedAt(LocalDateTime.now());
            ticketEventPublisher.publishTicketAssigned(event);
        }

        TicketUpdatedEvent updatedEvent = new TicketUpdatedEvent();
        updatedEvent.setTicketId(savedTicket.getId());
        updatedEvent.setTitle(savedTicket.getSubject());
        updatedEvent.setStatus(savedTicket.getStatus());
        updatedEvent.setPriority(savedTicket.getPriority() != null ? savedTicket.getPriority().name() : "MEDIUM");
        updatedEvent.setSupportId(savedTicket.getSupportId());
        ticketEventPublisher.publishTicketUpdated(updatedEvent);

        return savedTicket;
    }

    public Ticket assignTicket(Long id, TicketRequest request, Long supportId){
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        if (request.getSupportId() == null) {
            throw new IllegalArgumentException("Support ID is required");
        }
        ticket.setSupportId(supportId);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUnassignedTickets(){
        return ticketRepository.findBySupportIdIsNull();
    }
}
