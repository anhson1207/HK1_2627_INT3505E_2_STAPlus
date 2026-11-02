package customer_service.service;

import customer_service.dto.CustomerPatch;
import customer_service.dto.CustomerRequest;
import customer_service.dto.CustomerResponse;
import customer_service.entity.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    CustomerResponse create(CustomerRequest request);

    CustomerResponse getById(Long id);

    Page<CustomerResponse> list(
            String q,
            CustomerStatus status,
            Long assignedUserId,
            Pageable pageable
    );

    CustomerResponse replace(Long id, CustomerRequest request);

    CustomerResponse patch(Long id, CustomerPatch request);

    void delete(Long id);
}