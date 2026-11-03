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
    private final LeadAssignmentService assignmentService;

    @Override
    public LeadResponse create(LeadRequest request) {
        Lead entity = mapper.toEntity(request);
        if (entity.getAssignedUserId() == null) {
            entity.setAssignedUserId(assignmentService.determineNextSalesId());
        }
        return mapper.toResponse(
                repository.save(entity)
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

    @Override
    public LeadResponse captureWebhook(String channel, lead_service.dto.LeadWebhookRequest request) {
        LeadSource source = LeadSource.WEBSITE;
        if (request.source() != null) {
            source = request.source();
        } else if (channel != null) {
            String ch = channel.trim().toLowerCase();
            if (ch.contains("facebook") || ch.contains("fb")) {
                source = LeadSource.FACEBOOK;
            } else if (ch.contains("zalo")) {
                source = LeadSource.ZALO;
            } else if (ch.contains("google")) {
                source = LeadSource.GOOGLE_ADS;
            } else if (ch.contains("phone") || ch.contains("call")) {
                source = LeadSource.PHONE;
            } else {
                source = LeadSource.WEBSITE;
            }
        }

        Long assignedUserId = request.data() != null && request.data().get("assignedUserId") != null
                ? Long.valueOf(request.data().get("assignedUserId").toString())
                : assignmentService.determineNextSalesId();

        Lead lead = Lead.builder()
                .fullName(request.resolveFullName())
                .email(blankToNull(request.email()))
                .phone(blankToNull(request.resolvePhone()))
                .company(blankToNull(request.company()))
                .source(source)
                .status(LeadStatus.NEW)
                .assignedUserId(assignedUserId)
                .notes(blankToNull(request.resolveNotes()))
                .build();

        return mapper.toResponse(repository.save(lead));
    }

    @Override
    public lead_service.dto.BatchLeadResponse importBatch(java.util.List<LeadRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return lead_service.dto.BatchLeadResponse.success(0);
        }

        java.util.List<String> errors = new java.util.ArrayList<>();
        int success = 0;

        for (int i = 0; i < requests.size(); i++) {
            LeadRequest req = requests.get(i);
            try {
                if (!hasText(req.email()) && !hasText(req.phone())) {
                    errors.add("Dòng " + (i + 1) + ": Phải có email hoặc số điện thoại");
                    continue;
                }
                Lead entity = mapper.toEntity(req);
                if (entity.getAssignedUserId() == null) {
                    entity.setAssignedUserId(assignmentService.determineNextSalesId());
                }
                repository.save(entity);
                success++;
            } catch (Exception ex) {
                errors.add("Dòng " + (i + 1) + ": " + ex.getMessage());
            }
        }

        return lead_service.dto.BatchLeadResponse.partial(requests.size(), success, errors);
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