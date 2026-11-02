package customer_service.repository;

import customer_service.entity.Customer;
import customer_service.entity.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("""
            select c from Customer c
            where (:status is null or c.status = :status)
              and (:assignedUserId is null or c.assignedUserId = :assignedUserId)
              and (
                   lower(c.fullName) like lower(concat('%', :q, '%'))
                   or lower(coalesce(c.email, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(c.phone, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(c.company, '')) like lower(concat('%', :q, '%'))
              )
            """)
    Page<Customer> search(
            @Param("q") String q,
            @Param("status") CustomerStatus status,
            @Param("assignedUserId") Long assignedUserId,
            Pageable pageable
    );
}