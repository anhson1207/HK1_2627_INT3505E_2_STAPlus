package lead_service.controller;

import jakarta.validation.Valid;
import lead_service.constant.ApiPaths;
import lead_service.dto.LeadPatch;
import lead_service.dto.LeadRequest;
import lead_service.dto.LeadResponse;
import lead_service.dto.PageResponse;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;
import lead_service.exception.BadRequestException;
import lead_service.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Set;

@RestController
@RequestMapping(ApiPaths.LEADS)
@RequiredArgsConstructor
public class LeadController {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "fullName", "email", "company", "status", "source",
            "assignedUserId", "createdAt", "updatedAt"
    );

    private final LeadService service;

    @PostMapping
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody LeadRequest request) {
        LeadResponse created = service.create(request);
        return ResponseEntity.created(URI.create(ApiPaths.LEADS + "/" + created.id())).body(created);
    }

    @GetMapping("/{id}")
    public LeadResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public PageResponse<LeadResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) Long assignedUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (page < 0) throw new BadRequestException("page must be >= 0");
        if (size < 1 || size > 100) throw new BadRequestException("size must be between 1 and 100");
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) throw new BadRequestException("Unsupported sortBy: " + sortBy);

        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("direction must be asc or desc");
        }

        var pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return PageResponse.from(service.list(q, status, source, assignedUserId, pageable));
    }

    @PutMapping("/{id}")
    public LeadResponse replace(@PathVariable Long id, @Valid @RequestBody LeadRequest request) {
        return service.replace(id, request);
    }

    @PatchMapping("/{id}")
    public LeadResponse patch(@PathVariable Long id, @Valid @RequestBody LeadPatch request) {
        return service.patch(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
