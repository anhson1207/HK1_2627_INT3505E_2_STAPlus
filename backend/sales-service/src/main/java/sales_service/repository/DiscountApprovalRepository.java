package sales_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sales_service.model.DiscountApproval;

import java.util.List;
import java.util.Optional;

public interface DiscountApprovalRepository extends JpaRepository<DiscountApproval, Long> {
    Optional<DiscountApproval> findByIdAndManagerId(Long id, Long managerId);
    List<DiscountApproval> findByDealIdOrderByCreatedAtDesc(Long dealId);
}
