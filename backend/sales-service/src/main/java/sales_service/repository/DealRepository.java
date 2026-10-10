package sales_service.repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import sales_service.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Long>,
        JpaSpecificationExecutor<Deal> {
    Optional<Deal> findByIdAndSalesId(Long id, Long salesId);
    List<Deal> findBySalesId(Long salesId);
}
