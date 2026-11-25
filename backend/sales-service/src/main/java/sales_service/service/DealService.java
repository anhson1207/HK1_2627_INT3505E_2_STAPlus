package sales_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import sales_service.dto.event.DealCreatedEvent;
import sales_service.dto.event.DealStageChangedEvent;
import sales_service.dto.event.DealWonEvent;
import sales_service.dto.event.DiscountApprovalRequestedEvent;
import sales_service.dto.event.DiscountDecisionEvent;
import sales_service.dto.request.DealFilterRequest;
import sales_service.dto.request.DealRequest;
import sales_service.dto.request.DiscountApprovalRequestDTO;
import sales_service.dto.response.DealForecastResponse;
import sales_service.dto.response.PipelineStageSummary;
import sales_service.filter.Filter;
import sales_service.model.Deal;
import sales_service.model.DiscountApproval;
import sales_service.publisher.DealEventPublisher;
import sales_service.repository.DealRepository;
import sales_service.repository.DiscountApprovalRepository;
import sales_service.util.PaginationCheck;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DealService {
    private final DealRepository dealRepository;
    private final DealEventPublisher dealEventPublisher;
    private final DiscountApprovalRepository discountApprovalRepository;

    public DealService(DealRepository dealRepository,
                       DealEventPublisher dealEventPublisher,
                       DiscountApprovalRepository discountApprovalRepository) {
        this.dealRepository = dealRepository;
        this.dealEventPublisher = dealEventPublisher;
        this.discountApprovalRepository = discountApprovalRepository;
    }

    public List<Deal> getDealsBySalesId(Long salesId) {
        return dealRepository.findBySalesId(salesId);
    }

    public List<Deal> getDealsByCustomerId(Long customerId) {
        return dealRepository.findByCustomerIdOrLegacySalesId(customerId);
    }

    public Deal getDealByIdAndSalesId(Long dealId, Long salesId) {
        if (salesId == null) {
            return dealRepository.findById(dealId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
        }
        return dealRepository.findByIdAndSalesId(dealId, salesId)
                .or(() -> dealRepository.findById(dealId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
    }

    public Page<Deal> getDealsBySalesId(DealFilterRequest filterRequest) {
        int[] pgNumAndSize = PaginationCheck.check(filterRequest.getPgNum(), filterRequest.getPgSize());
        int page = pgNumAndSize[0];
        int size = pgNumAndSize[1];

        Sort sort = "asc".equalsIgnoreCase(filterRequest.getOrder())
                ? Sort.by(filterRequest.getSortedBy() != null ? filterRequest.getSortedBy() : "createdAt").ascending()
                : Sort.by(filterRequest.getSortedBy() != null ? filterRequest.getSortedBy() : "createdAt").descending();

        return dealRepository.findAll(Filter.filter(
                        filterRequest.getSalesId(),
                        filterRequest.getOwner(),
                        filterRequest.getMinAmount(),
                        filterRequest.getMaxAmount(),
                        filterRequest.getStage(),
                        filterRequest.getCreatedAfter(),
                        filterRequest.getCreatedBefore()),
                PageRequest.of(page, size, sort)
        );
    }

    public Deal createDeal(DealRequest request, Long actorUserId) {
        Deal deal = new Deal();
        Long resolvedCustomerId = request.getCustomerId() != null
                ? request.getCustomerId()
                : (request.getSalesId() != null ? request.getSalesId() : 1L);

        deal.setDealName(request.getDealName());
        deal.setOwner(request.getOwner() != null ? request.getOwner() : "");
        deal.setAmount(request.getAmount() != null ? request.getAmount() : 0.0);
        deal.setStage(request.getStage() != null ? request.getStage() : "NEW");
        deal.setCustomerId(resolvedCustomerId);
        deal.setSalesId(actorUserId != null ? actorUserId : 1L);
        deal.setProbability(request.getProbability() != null ? request.getProbability() : defaultProbabilityForStage(deal.getStage()));
        deal.setExpectedClosingDate(request.getExpectedClosingDate());
        deal.setDescription(request.getDescription());

        double discountPct = request.getDiscountPercent() != null ? request.getDiscountPercent() : 0.0;
        deal.setDiscountPercent(discountPct);
        deal.setDiscountReason(request.getDiscountReason());
        deal.setApprovalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus() : "NOT_REQUIRED");

        deal.setCreatedAt(LocalDateTime.now());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal savedDeal = dealRepository.save(deal);

        DealCreatedEvent event = new DealCreatedEvent();
        event.setEventId(UUID.randomUUID());
        event.setDealId(savedDeal.getId());
        event.setDealName(savedDeal.getDealName());
        event.setCreatedByUserId(deal.getSalesId());
        event.setRecipientUserId(2L);
        event.setCreatedAt(savedDeal.getCreatedAt());

        dealEventPublisher.publishDealCreated(event);

        if ("WON".equalsIgnoreCase(savedDeal.getStage())) {
            publishWonEvent(savedDeal);
        }

        return savedDeal;
    }

    public void deleteDeal(Long id, Long salesId) {
        Deal d = getDealByIdAndSalesId(id, salesId);
        dealRepository.delete(d);
    }

    public Deal updateDeal(Long id, DealRequest request, Long salesId) {
        Deal deal = getDealByIdAndSalesId(id, salesId);

        if (request.getOwner() == null || request.getAmount() == null || request.getStage() == null) {
            throw new IllegalArgumentException("All deal fields are required");
        }

        String oldStage = deal.getStage();
        String newStage = request.getStage();

        if (request.getDealName() != null) deal.setDealName(request.getDealName());
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(newStage);
        if (request.getCustomerId() != null) {
            deal.setCustomerId(request.getCustomerId());
        } else if (request.getSalesId() != null) {
            deal.setCustomerId(request.getSalesId());
        }
        if (request.getProbability() != null) deal.setProbability(request.getProbability());
        if (request.getExpectedClosingDate() != null) deal.setExpectedClosingDate(request.getExpectedClosingDate());
        if (request.getDescription() != null) deal.setDescription(request.getDescription());
        if (request.getDiscountPercent() != null) {
            double oldPct = deal.getDiscountPercent();
            deal.setDiscountPercent(request.getDiscountPercent());
            if (request.getDiscountPercent() <= 0) {
                deal.setApprovalStatus("NOT_REQUIRED");
            } else if (Double.compare(oldPct, request.getDiscountPercent()) != 0 && "APPROVED".equalsIgnoreCase(deal.getApprovalStatus())) {
                deal.setApprovalStatus("NOT_REQUIRED");
            }
        }
        if (request.getDiscountReason() != null) deal.setDiscountReason(request.getDiscountReason());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal updated = dealRepository.save(deal);
        if (!newStage.equalsIgnoreCase(oldStage)) {
            handleStageChangeEvents(updated, oldStage, newStage);
        }

        return updated;
    }

    public Deal patchDeal(Long id, DealRequest request, Long salesId) {
        Deal deal = getDealByIdAndSalesId(id, salesId);
        String oldStage = deal.getStage();

        if (request.getDealName() != null) deal.setDealName(request.getDealName());
        if (request.getOwner() != null) deal.setOwner(request.getOwner());
        if (request.getAmount() != null) deal.setAmount(request.getAmount());
        if (request.getStage() != null) {
            deal.setStage(request.getStage());
            if (request.getProbability() == null) {
                if ("WON".equalsIgnoreCase(request.getStage())) deal.setProbability(100);
                else if ("LOST".equalsIgnoreCase(request.getStage())) deal.setProbability(0);
            }
        }
        if (request.getCustomerId() != null) deal.setCustomerId(request.getCustomerId());
        if (request.getProbability() != null) deal.setProbability(request.getProbability());
        if (request.getExpectedClosingDate() != null) deal.setExpectedClosingDate(request.getExpectedClosingDate());
        if (request.getDescription() != null) deal.setDescription(request.getDescription());
        if (request.getDiscountPercent() != null) deal.setDiscountPercent(request.getDiscountPercent());
        if (request.getDiscountReason() != null) deal.setDiscountReason(request.getDiscountReason());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal updated = dealRepository.save(deal);

        if (request.getStage() != null && !request.getStage().equalsIgnoreCase(oldStage)) {
            handleStageChangeEvents(updated, oldStage, request.getStage());
        }

        return updated;
    }

    private int defaultProbabilityForStage(String stage) {
        if (stage == null) return 10;
        return switch (stage.toUpperCase()) {
            case "QUALIFIED" -> 30;
            case "PROPOSAL" -> 50;
            case "NEGOTIATION" -> 75;
            case "WON" -> 100;
            case "LOST" -> 0;
            default -> 10;
        };
    }

    private void handleStageChangeEvents(Deal deal, String oldStage, String newStage) {
        DealStageChangedEvent stageEvent = new DealStageChangedEvent();
        stageEvent.setDealId(deal.getId());
        stageEvent.setDealName(deal.getDealName());
        stageEvent.setPreviousStage(oldStage);
        stageEvent.setNewStage(newStage);
        stageEvent.setSalesId(deal.getSalesId());
        stageEvent.setValue(deal.getAmount());
        dealEventPublisher.publishDealStageChanged(stageEvent);

        if ("WON".equalsIgnoreCase(newStage) && !"WON".equalsIgnoreCase(oldStage)) {
            publishWonEvent(deal);
        }
    }

    private void publishWonEvent(Deal deal) {
        DealWonEvent wonEvent = new DealWonEvent();
        wonEvent.setDealId(deal.getId());
        wonEvent.setDealName(deal.getDealName());
        wonEvent.setValue(deal.getAmount());
        wonEvent.setCustomerId(deal.getCustomerId() != null ? deal.getCustomerId() : deal.getId());
        wonEvent.setSalesId(deal.getSalesId());
        dealEventPublisher.publishDealWon(wonEvent);
    }

    public List<PipelineStageSummary> getPipelineSummary(Long salesId) {
        List<Deal> deals = (salesId != null && salesId > 0)
                ? dealRepository.findBySalesId(salesId)
                : dealRepository.findAll();

        String[] stages = {"NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"};
        List<PipelineStageSummary> result = new ArrayList<>();

        for (String s : stages) {
            long count = deals.stream().filter(d -> s.equalsIgnoreCase(d.getStage())).count();
            double totalVal = deals.stream().filter(d -> s.equalsIgnoreCase(d.getStage())).mapToDouble(Deal::getAmount).sum();
            result.add(new PipelineStageSummary(s, count, totalVal));
        }
        return result;
    }

    public DealForecastResponse getForecast(Long salesId) {
        List<Deal> deals = (salesId != null && salesId > 0)
                ? dealRepository.findBySalesId(salesId)
                : dealRepository.findAll();

        Map<String, Double> weights = Map.of(
                "NEW", 0.10,
                "QUALIFIED", 0.25,
                "PROPOSAL", 0.50,
                "NEGOTIATION", 0.75,
                "WON", 1.00,
                "LOST", 0.00
        );

        double totalPipeline = 0.0;
        double weightedForecast = 0.0;

        for (Deal d : deals) {
            double amount = d.getAmount();
            totalPipeline += amount;
            double weight = weights.getOrDefault(d.getStage() != null ? d.getStage().toUpperCase() : "NEW", 0.10);
            weightedForecast += amount * weight;
        }

        List<PipelineStageSummary> stages = getPipelineSummary(salesId);
        return new DealForecastResponse(totalPipeline, Math.round(weightedForecast * 100.0) / 100.0, deals.size(), stages);
    }

    public Deal requestDiscount(Long dealId, Long salesId, Long managerId, DiscountApprovalRequestDTO request) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        double pct = (request != null && request.getDiscountPercent() > 0)
                ? request.getDiscountPercent()
                : (deal.getDiscountPercent() != null ? deal.getDiscountPercent() : 0.0);

        if (pct <= 0 || pct >= 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần trăm chiết khấu phải lớn hơn 0 và nhỏ hơn 100");
        }

        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim()
                : deal.getDiscountReason();

        deal.setDiscountPercent(pct);
        if (reason != null) deal.setDiscountReason(reason);
        deal.setApprovalStatus("PENDING");
        deal.setDiscountApprovedBy(null);
        deal.setDiscountApprovedAt(null);
        deal.setUpdatedAt(LocalDateTime.now());
        Deal savedDeal = dealRepository.save(deal);

        DiscountApproval discountApproval = new DiscountApproval();
        discountApproval.setDealId(dealId);
        discountApproval.setRequestedByUserId(salesId != null ? salesId : 1L);
        discountApproval.setManagerId(managerId != null ? managerId : 1L);
        discountApproval.setDiscountPercent(pct);
        discountApproval.setReason(reason);
        discountApproval.setStatus("PENDING");
        discountApproval.setCreatedAt(LocalDateTime.now());
        DiscountApproval savedDiscountApproval = discountApprovalRepository.save(discountApproval);

        DiscountApprovalRequestedEvent event = new DiscountApprovalRequestedEvent();
        event.setEventId(UUID.randomUUID());
        event.setApprovalId(savedDiscountApproval.getId());
        event.setDealId(savedDiscountApproval.getDealId());
        event.setDealName(savedDeal.getDealName());
        event.setRequestedByUserId(savedDiscountApproval.getRequestedByUserId());
        event.setManagerId(savedDiscountApproval.getManagerId());
        event.setDiscountPercent(savedDiscountApproval.getDiscountPercent());
        event.setReason(savedDiscountApproval.getReason());
        event.setCreatedAt(savedDiscountApproval.getCreatedAt());

        dealEventPublisher.publishDiscountRequest(event);
        return savedDeal;
    }

    public Deal decideDiscountByDealId(Long dealId, Long managerId, String approverName, String status, String reason) {
        String decision = normalizeDecision(status);

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        List<DiscountApproval> approvals = discountApprovalRepository.findByDealIdOrderByCreatedAtDesc(dealId);
        DiscountApproval approval;
        if (approvals.isEmpty()) {
            approval = new DiscountApproval();
            approval.setDealId(dealId);
            approval.setRequestedByUserId(deal.getSalesId());
            approval.setManagerId(managerId != null ? managerId : 1L);
            approval.setDiscountPercent(deal.getDiscountPercent() > 0 ? deal.getDiscountPercent() : 10.0);
            approval.setReason(deal.getDiscountReason());
            approval.setCreatedAt(LocalDateTime.now());
        } else {
            approval = approvals.get(0);
        }

        approval.setStatus(decision);
        approval.setManagerId(managerId != null ? managerId : 1L);
        approval.setDecidedAt(LocalDateTime.now());
        DiscountApproval savedApproval = discountApprovalRepository.save(approval);

        deal.setApprovalStatus(decision);
        deal.setDiscountApprovedBy(approverName != null && !approverName.isBlank() ? approverName : "Quản trị viên");
        deal.setDiscountApprovedAt(LocalDateTime.now());
        if ("REJECTED".equals(decision) && reason != null && !reason.isBlank()) {
            deal.setDiscountReason(reason.trim());
        }
        deal.setUpdatedAt(LocalDateTime.now());
        Deal savedDeal = dealRepository.save(deal);

        publishDecisionEvent(savedApproval, savedDeal, decision);
        return savedDeal;
    }

    public void approveDiscount(Long discountId, Long managerId, String status) {
        String decision = normalizeDecision(status);

        DiscountApproval discountApproval = discountApprovalRepository.findById(discountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discount Request not found"));

        Deal deal = dealRepository.findById(discountApproval.getDealId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        discountApproval.setStatus(decision);
        discountApproval.setDecidedAt(LocalDateTime.now());
        DiscountApproval savedApproval = discountApprovalRepository.save(discountApproval);

        deal.setApprovalStatus(decision);
        deal.setDiscountApprovedBy("Quản trị viên");
        deal.setDiscountApprovedAt(LocalDateTime.now());
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);

        publishDecisionEvent(savedApproval, deal, decision);
    }

    private String normalizeDecision(String status) {
        if ("APPROVED".equalsIgnoreCase(status)) return "APPROVED";
        if ("REJECTED".equalsIgnoreCase(status)) return "REJECTED";
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
    }

    private void publishDecisionEvent(DiscountApproval savedApproval, Deal deal, String decision) {
        DiscountDecisionEvent event = new DiscountDecisionEvent();
        event.setEventId(UUID.randomUUID());
        event.setApprovalId(savedApproval.getId());
        event.setDealId(savedApproval.getDealId());
        event.setDealName(deal.getDealName());
        event.setRequestedByUserId(savedApproval.getRequestedByUserId());
        event.setManagerId(savedApproval.getManagerId());
        event.setDiscountPercent(savedApproval.getDiscountPercent());
        event.setDecision(decision);
        event.setCreatedAt(savedApproval.getCreatedAt());
        event.setDecidedAt(savedApproval.getDecidedAt());

        dealEventPublisher.publishDiscountDecision(event);
    }
}
