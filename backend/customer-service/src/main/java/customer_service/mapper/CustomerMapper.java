package customer_service.mapper;

import customer_service.dto.CustomerRequest;
import customer_service.dto.CustomerResponse;
import customer_service.entity.Customer;
import customer_service.entity.CustomerStatus;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toEntity(CustomerRequest request) {
        return Customer.builder()
                .fullName(clean(request.fullName()))
                .email(clean(request.email()))
                .phone(clean(request.phone()))
                .company(clean(request.company()))
                .status(
                        request.status() == null
                                ? CustomerStatus.ACTIVE
                                : request.status()
                )
                .notes(clean(request.notes()))
                .assignedUserId(request.assignedUserId())
                .build();
    }

    public CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getCompany(),
                customer.getStatus(),
                customer.getNotes(),
                customer.getAssignedUserId(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }

    public void replace(Customer customer, CustomerRequest request) {
        customer.setFullName(clean(request.fullName()));
        customer.setEmail(clean(request.email()));
        customer.setPhone(clean(request.phone()));
        customer.setCompany(clean(request.company()));
        customer.setStatus(
                request.status() == null
                        ? CustomerStatus.ACTIVE
                        : request.status()
        );
        customer.setNotes(clean(request.notes()));
        customer.setAssignedUserId(request.assignedUserId());
    }

    public String clean(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
}