package sales_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import sales_service.util.PaginationCheck;
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
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import sales_service.repository.DiscountApprovalRepository;

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

    public Deal getDealByIdAndSalesId(Long dealId, Long salesId) {
        return dealRepository.findByIdAndSalesId(dealId, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
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

    public Deal createDeal(DealRequest request, Long salesId) {
        Deal deal = new Deal();
        deal.setDealName(request.getDealName());
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount() != null ? request.getAmount() : 0.0);
        deal.setStage(request.getStage() != null ? request.getStage() : "NEW");
        deal.setSalesId(salesId != null ? salesId : 1L);
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
        Deal d = (salesId != null)
                ? dealRepository.findByIdAndSalesId(id, salesId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"))
                : dealRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
        dealRepository.delete(d);
    }

    public Deal updateDeal(Long id, DealRequest request, Long salesId) {
        Deal deal = (salesId != null)
                ? dealRepository.findByIdAndSalesId(id, salesId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"))
                : dealRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        if (request.getOwner() == null || request.getAmount() == null || request.getStage() == null) {
            throw new IllegalArgumentException("All deal fields are required");
        }

        String oldStage = deal.getStage();
        String newStage = request.getStage();

        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(newStage);
        deal.setUpdatedAt(LocalDateTime.now());

        Deal updated = dealRepository.save(deal);
        handleStageChangeEvents(updated, oldStage, newStage);

        return updated;
    }

    public Deal patchDeal(Long id, DealRequest request, Long salesId) {
        Deal deal = (salesId != null)
                ? dealRepository.findByIdAndSalesId(id, salesId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"))
                : dealRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        String oldStage = deal.getStage();

        if (request.getOwner() != null) deal.setOwner(request.getOwner());
        if (request.getAmount() != null) deal.setAmount(request.getAmount());
        if (request.getStage() != null) deal.setStage(request.getStage());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal updated = dealRepository.save(deal);

        if (request.getStage() != null && !request.getStage().equalsIgnoreCase(oldStage)) {
            handleStageChangeEvents(updated, oldStage, request.getStage());
        }

        return updated;
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
        wonEvent.setCustomerId(deal.getId());
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

    public void requestDiscount(Long dealId, Long salesId, Long managerId, DiscountApprovalRequestDTO request) {
        Deal deal = dealRepository.findByIdAndSalesId(dealId, salesId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));
        if (request.getDiscountPercent() <= 0 || request.getDiscountPercent() >= 100) {
            throw new IllegalArgumentException("Discount percent must be above 0 and below 100");
        }

        DiscountApproval discountApproval = new DiscountApproval();
        discountApproval.setDealId(dealId);
        discountApproval.setRequestedByUserId(salesId);
        discountApproval.setManagerId(managerId != null ? managerId : 1000L);
        discountApproval.setDiscountPercent(request.getDiscountPercent());
        discountApproval.setReason(request.getReason());
        discountApproval.setStatus("PENDING");
        discountApproval.setCreatedAt(LocalDateTime.now());
        DiscountApproval savedDiscountApproval = discountApprovalRepository.save(discountApproval);

        DiscountApprovalRequestedEvent event = new DiscountApprovalRequestedEvent();
        event.setEventId(UUID.randomUUID());
        event.setApprovalId(savedDiscountApproval.getId());
        event.setDealId(savedDiscountApproval.getDealId());
        event.setDealName(deal.getDealName());
        event.setRequestedByUserId(savedDiscountApproval.getRequestedByUserId());
        event.setManagerId(savedDiscountApproval.getManagerId());
        event.setDiscountPercent(savedDiscountApproval.getDiscountPercent());
        event.setReason(savedDiscountApproval.getReason());
        event.setCreatedAt(savedDiscountApproval.getCreatedAt());

        dealEventPublisher.publishDiscountRequest(event);
    }

    public void decideDiscountByDealId(Long dealId, Long managerId, String status) {
        List<DiscountApproval> approvals = discountApprovalRepository.findByDealIdOrderByCreatedAtDesc(dealId);
        if (approvals.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Discount request not found for deal " + dealId);
        }
        approveDiscount(approvals.get(0).getId(), managerId, status);
    }

    public void approveDiscount(Long discountId, Long managerId, String status) {
        String decision;
        if ("APPROVED".equalsIgnoreCase(status)) {
            decision = "APPROVED";
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            decision = "REJECTED";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
        }

        DiscountApproval discountApproval = (managerId != null)
                ? discountApprovalRepository.findByIdAndManagerId(discountId, managerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discount Request not found"))
                : discountApprovalRepository.findById(discountId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Discount Request not found"));

        Deal deal = dealRepository.findById(discountApproval.getDealId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deal not found"));

        discountApproval.setStatus(decision);
        discountApproval.setDecidedAt(LocalDateTime.now());
        DiscountApproval savedApproval = discountApprovalRepository.save(discountApproval);

        if ("APPROVED".equals(decision)) {
            double discountedAmount = deal.getAmount() * (1 - savedApproval.getDiscountPercent() / 100.0);
            deal.setAmount(discountedAmount);
            deal.setUpdatedAt(LocalDateTime.now());
            dealRepository.save(deal);
        }

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
