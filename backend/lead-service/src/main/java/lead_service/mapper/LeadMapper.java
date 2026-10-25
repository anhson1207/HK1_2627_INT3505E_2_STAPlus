package lead_service.mapper;

import lead_service.dto.LeadRequest;
import lead_service.dto.LeadResponse;
import lead_service.entity.Lead;
import org.springframework.stereotype.Component;

@Component
public class LeadMapper {
    public Lead toEntity(LeadRequest request) {
        return Lead.builder()
                .fullName(clean(request.fullName()))
                .email(clean(request.email()))
                .phone(clean(request.phone()))
                .company(clean(request.company()))
                .source(request.source())
                .status(request.status())
                .notes(clean(request.notes()))
                .assignedUserId(request.assignedUserId())
                .build();
    }

    public void replace(Lead lead, LeadRequest request) {
        lead.setFullName(clean(request.fullName()));
        lead.setEmail(clean(request.email()));
        lead.setPhone(clean(request.phone()));
        lead.setCompany(clean(request.company()));
        lead.setSource(request.source() == null ? lead_service.entity.LeadSource.OTHER : request.source());
        lead.setStatus(request.status() == null ? lead_service.entity.LeadStatus.NEW : request.status());
        lead.setNotes(clean(request.notes()));
        lead.setAssignedUserId(request.assignedUserId());
    }

    public LeadResponse toResponse(Lead lead) {
        return new LeadResponse(
                lead.getId(), lead.getFullName(), lead.getEmail(), lead.getPhone(),
                lead.getCompany(), lead.getSource(), lead.getStatus(), lead.getNotes(),
                lead.getAssignedUserId(), lead.getCreatedAt(), lead.getUpdatedAt()
        );
    }

    public String clean(String value) {
        return value == null ? null : value.trim();
    }
}
