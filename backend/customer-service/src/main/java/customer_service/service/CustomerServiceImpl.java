package customer_service.service;

import customer_service.dto.CustomerActivityRequest;
import customer_service.dto.CustomerActivityResponse;
import customer_service.dto.CustomerPatch;
import customer_service.dto.CustomerRequest;
import customer_service.dto.CustomerResponse;
import customer_service.entity.Customer;
import customer_service.entity.CustomerActivity;
import customer_service.entity.CustomerStatus;
import customer_service.exception.BadRequestException;
import customer_service.exception.ResourceNotFoundException;
import customer_service.mapper.CustomerMapper;
import customer_service.repository.CustomerActivityRepository;
import customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private static final Set<String> ALLOWED_ACTIVITY_TYPES = Set.of("CALL", "EMAIL", "MEETING", "NOTE");

    private final CustomerRepository repository;
    private final CustomerActivityRepository activityRepository;
    private final CustomerMapper mapper;

    @Override
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = mapper.toEntity(request);
        validateContact(customer);

        return mapper.toResponse(repository.save(customer));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return mapper.toResponse(find(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(
            String q,
            CustomerStatus status,
            Long assignedUserId,
            Pageable pageable
    ) {
        return repository
                .search(
                        q == null ? "" : q.trim(),
                        status,
                        assignedUserId,
                        pageable
                )
                .map(mapper::toResponse);
    }

    @Override
    public CustomerResponse replace(Long id, CustomerRequest request) {
        Customer customer = find(id);

        mapper.replace(customer, request);
        validateContact(customer);

        return mapper.toResponse(repository.save(customer));
    }

    @Override
    public CustomerResponse patch(Long id, CustomerPatch request) {
        Customer customer = find(id);

        if (request.fullName() != null) {
            if (request.fullName().isBlank()) {
                throw new BadRequestException("fullName must not be blank");
            }

            customer.setFullName(mapper.clean(request.fullName()));
        }

        if (request.email() != null) {
            customer.setEmail(mapper.clean(request.email()));
        }

        if (request.phone() != null) {
            customer.setPhone(mapper.clean(request.phone()));
        }

        if (request.company() != null) {
            customer.setCompany(mapper.clean(request.company()));
        }

        if (request.status() != null) {
            customer.setStatus(request.status());
        }

        if (request.notes() != null) {
            customer.setNotes(mapper.clean(request.notes()));
        }

        if (request.assignedUserId() != null) {
            customer.setAssignedUserId(request.assignedUserId());
        }

        validateContact(customer);

        return mapper.toResponse(repository.save(customer));
    }

    @Override
    public void delete(Long id) {
        repository.delete(find(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerActivityResponse> getActivities(Long customerId) {
        find(customerId);
        return activityRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(a -> new CustomerActivityResponse(
                        a.getId(),
                        a.getCustomerId(),
                        a.getType(),
                        a.getTitle(),
                        a.getDescription(),
                        a.getCreatedBy(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public CustomerActivityResponse createActivity(Long customerId, CustomerActivityRequest request, String createdBy) {
        find(customerId);
        String normalizedType = request.type() != null ? request.type().trim().toUpperCase() : "NOTE";
        if (!ALLOWED_ACTIVITY_TYPES.contains(normalizedType)) {
            normalizedType = "NOTE";
        }
        CustomerActivity activity = new CustomerActivity();
        activity.setCustomerId(customerId);
        activity.setType(normalizedType);
        activity.setTitle(request.title().trim());
        activity.setDescription(request.description() != null ? request.description().trim() : "");
        activity.setCreatedBy(createdBy != null && !createdBy.isBlank() ? createdBy : "Nhân viên CRM");

        CustomerActivity saved = activityRepository.save(activity);
        return new CustomerActivityResponse(
                saved.getId(),
                saved.getCustomerId(),
                saved.getType(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getCreatedBy(),
                saved.getCreatedAt()
        );
    }

    @Override
    public void deleteActivity(Long customerId, Long activityId) {
        CustomerActivity activity = activityRepository.findByIdAndCustomerId(activityId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found: " + activityId));
        activityRepository.delete(activity);
    }

    private Customer find(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found: " + id
                        )
                );
    }

    private void validateContact(Customer customer) {
        if (!hasText(customer.getEmail()) && !hasText(customer.getPhone())) {
            throw new BadRequestException(
                    "Either email or phone must be provided"
            );
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}