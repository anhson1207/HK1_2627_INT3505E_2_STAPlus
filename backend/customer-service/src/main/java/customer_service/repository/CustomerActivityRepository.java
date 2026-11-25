package customer_service.repository;

import customer_service.entity.CustomerActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerActivityRepository extends JpaRepository<CustomerActivity, Long> {
    List<CustomerActivity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<CustomerActivity> findByIdAndCustomerId(Long id, Long customerId);
}
