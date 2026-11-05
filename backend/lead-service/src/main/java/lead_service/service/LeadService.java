package lead_service.service;

import lead_service.dto.BatchLeadResponse;
import lead_service.dto.LeadPatch;
import lead_service.dto.LeadRequest;
import lead_service.dto.LeadResponse;
import lead_service.dto.LeadWebhookRequest;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LeadService {

    LeadResponse create(LeadRequest request);

    LeadResponse getById(Long id);

    Page<LeadResponse> list(
            String q,
            LeadStatus status,
            LeadSource source,
            Long assignedUserId,
            Pageable pageable
    );

    LeadResponse replace(Long id, LeadRequest request);

    LeadResponse patch(Long id, LeadPatch request);

    void delete(Long id);

    LeadResponse captureWebhook(String channel, LeadWebhookRequest request);

    BatchLeadResponse importBatch(List<LeadRequest> requests);
}