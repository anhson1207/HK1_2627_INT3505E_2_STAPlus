package lead_service.service;

import lead_service.dto.LeadPatch;
import lead_service.dto.LeadRequest;
import lead_service.dto.LeadResponse;
import lead_service.entity.Lead;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;
import lead_service.exception.BadRequestException;
import lead_service.exception.ResourceNotFoundException;
import lead_service.mapper.LeadMapper;
import lead_service.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadServiceImpl implements LeadService {

    private final LeadRepository repository;
    private final LeadMapper mapper;

    @Override
    public LeadResponse create(LeadRequest request) {
        return mapper.toResponse(
                repository.save(mapper.toEntity(request))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public LeadResponse getById(Long id) {
        return mapper.toResponse(find(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeadResponse> list(
            String q,
            LeadStatus status,
            LeadSource source,
            Long assignedUserId,
            Pageable pageable
    ) {
        return repository
                .search(
                        q == null ? "" : q.trim(),
                        status,
                        source,
                        assignedUserId,
                        pageable
                )
                .map(mapper::toResponse);
    }

    @Override
    public LeadResponse replace(Long id, LeadRequest request) {
        Lead lead = find(id);

        mapper.replace(lead, request);

        return mapper.toResponse(
                repository.save(lead)
        );
    }

    @Override
    public LeadResponse patch(Long id, LeadPatch request) {
        Lead lead = find(id);

        if (request.fullName() != null) {
            if (request.fullName().isBlank()) {
                throw new BadRequestException(
                        "fullName must not be blank"
                );
            }

            lead.setFullName(
                    mapper.clean(request.fullName())
            );
        }

        if (request.email() != null) {
            lead.setEmail(mapper.clean(request.email()));
        }

        if (request.phone() != null) {
            lead.setPhone(mapper.clean(request.phone()));
        }

        if (request.company() != null) {
            lead.setCompany(mapper.clean(request.company()));
        }

        if (request.source() != null) {
            lead.setSource(request.source());
        }

        if (request.status() != null) {
            lead.setStatus(request.status());
        }

        if (request.notes() != null) {
            lead.setNotes(mapper.clean(request.notes()));
        }

        if (request.assignedUserId() != null) {
            lead.setAssignedUserId(request.assignedUserId());
        }

        if (!hasText(lead.getEmail())
                && !hasText(lead.getPhone())) {
            throw new BadRequestException(
                    "Either email or phone must be provided"
            );
        }

        return mapper.toResponse(
                repository.save(lead)
        );
    }

    @Override
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Lead find(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lead not found: " + id
                        )
                );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}