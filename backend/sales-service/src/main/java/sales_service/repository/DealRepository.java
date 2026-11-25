package sales_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sales_service.model.Deal;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Long>,
        JpaSpecificationExecutor<Deal> {
    Optional<Deal> findByIdAndSalesId(Long id, Long salesId);
    List<Deal> findBySalesId(Long salesId);

    @Query("SELECT d FROM Deal d WHERE d.customerId = :customerId OR (d.customerId IS NULL AND d.salesId = :customerId) ORDER BY d.createdAt DESC")
    List<Deal> findByCustomerIdOrLegacySalesId(@Param("customerId") Long customerId);
}
