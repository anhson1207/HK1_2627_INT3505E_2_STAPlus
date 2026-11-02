package customer_service.controller;

import customer_service.constant.ApiPaths;
import customer_service.dto.CustomerPatch;
import customer_service.dto.CustomerRequest;
import customer_service.dto.CustomerResponse;
import customer_service.dto.PageResponse;
import customer_service.entity.CustomerStatus;
import customer_service.exception.BadRequestException;
import customer_service.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Set;

@RestController
@RequestMapping(ApiPaths.CUSTOMERS)
@RequiredArgsConstructor
public class CustomerController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "fullName",
            "email",
            "company",
            "status",
            "assignedUserId",
            "createdAt",
            "updatedAt"
    );

    private final CustomerService service;

    @PostMapping
    public ResponseEntity<CustomerResponse> create(
            @Valid @RequestBody CustomerRequest request
    ) {
        CustomerResponse created = service.create(request);

        return ResponseEntity
                .created(
                        URI.create(
                                ApiPaths.CUSTOMERS + "/" + created.id()
                        )
                )
                .body(created);
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public PageResponse<CustomerResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) CustomerStatus status,
            @RequestParam(required = false) Long assignedUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        if (page < 0) {
            throw new BadRequestException("page must be >= 0");
        }

        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "size must be between 1 and 100"
            );
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException(
                    "Unsupported sortBy: " + sortBy
            );
        }

        Sort.Direction sortDirection;

        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "direction must be asc or desc"
            );
        }

        var pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        return PageResponse.from(
                service.list(
                        q,
                        status,
                        assignedUserId,
                        pageable
                )
        );
    }

    @PutMapping("/{id}")
    public CustomerResponse replace(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request
    ) {
        return service.replace(id, request);
    }

    @PatchMapping("/{id}")
    public CustomerResponse patch(
            @PathVariable Long id,
            @Valid @RequestBody CustomerPatch request
    ) {
        return service.patch(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}