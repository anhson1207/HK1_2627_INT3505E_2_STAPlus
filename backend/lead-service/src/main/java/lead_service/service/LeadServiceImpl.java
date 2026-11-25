package lead_service.service;

import lead_service.dto.ConvertLeadRequest;
import lead_service.dto.ConvertLeadResponse;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadServiceImpl implements LeadService {

    @Value("${services.customer.url:http://localhost:8083}")
    private String customerServiceUrl;

    @Value("${services.sales.url:http://localhost:8084}")
    private String salesServiceUrl;

    private final RestClient restClient = RestClient.create();

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

    @Override
    public ConvertLeadResponse convert(Long id, ConvertLeadRequest request, String authHeader) {
        Lead lead = find(id);
        if (lead.getStatus() == LeadStatus.CONVERTED) {
            throw new BadRequestException("Lead này đã được chuyển đổi thành khách hàng rồi.");
        }

        // 1. Create Customer in customer-service
        Long targetUserId = (request != null && request.assignedUserId() != null)
                ? request.assignedUserId()
                : lead.getAssignedUserId();

        Map<String, Object> customerPayload = new HashMap<>();
        customerPayload.put("fullName", lead.getFullName());
        customerPayload.put("email", lead.getEmail());
        customerPayload.put("phone", lead.getPhone());
        customerPayload.put("company", lead.getCompany());
        customerPayload.put("status", "ACTIVE");
        customerPayload.put("notes", (request != null && hasText(request.customerNotes()))
                ? request.customerNotes()
                : lead.getNotes());
        customerPayload.put("assignedUserId", targetUserId);

        Long customerId = null;
        String customerName = lead.getFullName();
        try {
            RestClient.RequestBodySpec spec = restClient.post()
                    .uri(customerServiceUrl + "/api/v1/customers")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(customerPayload);
            if (authHeader != null && !authHeader.isBlank()) {
                spec = spec.header("Authorization", authHeader);
            }
            Map<String, Object> customerRes = spec.retrieve().body(new ParameterizedTypeReference<Map<String, Object>>() {});
            if (customerRes != null && customerRes.get("id") != null) {
                customerId = Long.valueOf(customerRes.get("id").toString());
                if (customerRes.get("fullName") != null) {
                    customerName = customerRes.get("fullName").toString();
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Không thể tạo khách hàng từ Lead: " + e.getMessage());
        }

        // 2. Optionally create Deal in sales-service if dealName is present
        Long dealId = null;
        String dealName = null;
        if (request != null && hasText(request.dealName())) {
            dealName = request.dealName().trim();
            Map<String, Object> dealPayload = new HashMap<>();
            dealPayload.put("dealName", dealName);
            dealPayload.put("amount", request.dealAmount() != null ? request.dealAmount() : 0.0);
            dealPayload.put("stage", hasText(request.dealStage()) ? request.dealStage() : "PROSPECT");
            dealPayload.put("customerId", customerId);
            dealPayload.put("salesId", targetUserId != null ? targetUserId : 1L);
            dealPayload.put("description", "Chuyển đổi từ Lead #" + lead.getId() + " - " + lead.getFullName());

            try {
                RestClient.RequestBodySpec dealSpec = restClient.post()
                        .uri(salesServiceUrl + "/deals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(dealPayload);
                if (authHeader != null && !authHeader.isBlank()) {
                    dealSpec = dealSpec.header("Authorization", authHeader);
                }
                if (targetUserId != null) {
                    dealSpec = dealSpec.header("X-User-Id", targetUserId.toString());
                }
                Map<String, Object> dealRes = dealSpec.retrieve().body(new ParameterizedTypeReference<Map<String, Object>>() {});
                if (dealRes != null && dealRes.get("id") != null) {
                    dealId = Long.valueOf(dealRes.get("id").toString());
                    if (dealRes.get("dealName") != null) {
                        dealName = dealRes.get("dealName").toString();
                    }
                }
            } catch (Exception e) {
                // Log and continue
            }
        }

        // 3. Update Lead status to CONVERTED
        lead.setStatus(LeadStatus.CONVERTED);
        repository.save(lead);

        return new ConvertLeadResponse(
                lead.getId(),
                customerId,
                customerName,
                dealId,
                dealName,
                "Chuyển đổi Lead thành Khách hàng thành công!"
        );
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