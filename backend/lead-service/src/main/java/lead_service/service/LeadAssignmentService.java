package lead_service.service;

import lead_service.dto.AssignmentRuleDTO;
import lead_service.dto.AutoAssignResultDTO;
import lead_service.entity.AssignmentStrategy;
import lead_service.entity.Lead;
import lead_service.entity.LeadStatus;
import lead_service.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeadAssignmentService {

    private final LeadRepository leadRepository;

    private volatile boolean enabled = true;
    private volatile AssignmentStrategy strategy = AssignmentStrategy.ROUND_ROBIN;
    private final List<Long> activeSalesIds = Collections.synchronizedList(
            new ArrayList<>(List.of(2L, 4L, 5L)) // Default active sales reps: 2 (Trần Minh), 4 (Bảo Trúc), 5 (Hải Anh)
    );
    private final AtomicInteger roundRobinCounter = new AtomicInteger(0);

    public AssignmentRuleDTO getRules() {
        int unassigned = leadRepository.findByAssignedUserIdIsNull().size();
        return new AssignmentRuleDTO(enabled, strategy, new ArrayList<>(activeSalesIds), unassigned);
    }

    public synchronized AssignmentRuleDTO updateRules(AssignmentRuleDTO dto) {
        this.enabled = dto.enabled();
        if (dto.strategy() != null) {
            this.strategy = dto.strategy();
        }
        if (dto.activeSalesIds() != null && !dto.activeSalesIds().isEmpty()) {
            this.activeSalesIds.clear();
            this.activeSalesIds.addAll(dto.activeSalesIds());
        }
        return getRules();
    }

    public Long determineNextSalesId() {
        if (!enabled || activeSalesIds.isEmpty() || strategy == AssignmentStrategy.MANUAL) {
            return null;
        }

        if (strategy == AssignmentStrategy.LOAD_BALANCED) {
            Long leastLoadedId = activeSalesIds.get(0);
            long minLoad = Long.MAX_VALUE;

            for (Long salesId : activeSalesIds) {
                long load = leadRepository.countByAssignedUserIdAndStatusIn(
                        salesId,
                        List.of(LeadStatus.NEW, LeadStatus.CONTACTED)
                );
                if (load < minLoad) {
                    minLoad = load;
                    leastLoadedId = salesId;
                }
            }
            return leastLoadedId;
        }

        // ROUND_ROBIN
        int index = Math.abs(roundRobinCounter.getAndIncrement() % activeSalesIds.size());
        return activeSalesIds.get(index);
    }

    @Transactional
    public AutoAssignResultDTO autoAssignPendingLeads() {
        List<Lead> unassigned = leadRepository.findByAssignedUserIdIsNull();
        int totalBefore = unassigned.size();
        if (unassigned.isEmpty() || activeSalesIds.isEmpty()) {
            return new AutoAssignResultDTO(0, totalBefore, strategy.name(), Map.of());
        }

        Map<Long, Integer> counts = new HashMap<>();
        for (Lead lead : unassigned) {
            Long salesId = determineNextSalesId();
            if (salesId != null) {
                lead.setAssignedUserId(salesId);
                counts.put(salesId, counts.getOrDefault(salesId, 0) + 1);
            }
        }
        leadRepository.saveAll(unassigned);

        return new AutoAssignResultDTO(unassigned.size(), totalBefore, strategy.name(), counts);
    }
}

