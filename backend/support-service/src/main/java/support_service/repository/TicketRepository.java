package support_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import support_service.model.Ticket;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long>
        , JpaSpecificationExecutor<Ticket> {
    Optional<Ticket>findByIdAndSupportId(Long id, Long supportId);
    List<Ticket>findBySupportId(Long supportId);



    //write findUnassignedTickets here
    List<Ticket>findBySupportIdIsNull();

    //Page<Ticket> findAll(Pageable pageable);
}
