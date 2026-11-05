package sales_service.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import Utilities.PaginationCheck;
import sales_service.dto.event.DealCreatedEvent;
import sales_service.dto.event.DiscountApprovalRequestedEvent;
import sales_service.dto.event.DiscountDecisionEvent;
import sales_service.dto.request.DealFilterRequest;
import sales_service.dto.request.DealRequest;
import sales_service.dto.request.DiscountApprovalRequestDTO;
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
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class DealService {
    private final DealRepository dealRepository;
    private final DiscountApprovalRepository discountApprovalRepository;

    private final DealEventPublisher dealEventPublisher;
    public DealService(DealRepository dealRepository,
                       DiscountApprovalRepository discountApprovalRepository,
                       DealEventPublisher dealEventPublisher) {
        this.dealRepository = dealRepository;
        this.discountApprovalRepository = discountApprovalRepository;
        this.dealEventPublisher = dealEventPublisher;
    }

    public Deal getDealByIdAndSalesId(Long id, Long salesId){
        return dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
    }

    //add filtering and pagination here
    public Page<Deal> getDealsBySalesId(DealFilterRequest filterRequest){
        //return dealRepository.findBySalesId(salesId);
        int[] pgNumAndSize = PaginationCheck.check(filterRequest.getPgNum(),
                filterRequest.getPgSize());
        int page = pgNumAndSize[0];
        int size = pgNumAndSize[1];

        Sort sort = filterRequest.getOrder().equals("asc")
                ? Sort.by(filterRequest.getSortedBy()).ascending()
                : Sort.by(filterRequest.getSortedBy()).descending();

        return dealRepository.findAll(Filter.filter(
                filterRequest.getSalesId(),
                filterRequest.getOwner(),
                filterRequest.getMinAmount(),
                filterRequest.getMaxAmount(),
                filterRequest.getStage(),
                filterRequest.getCreatedAfter(),
                filterRequest.getCreatedBefore()),
                PageRequest.of(page,size,sort)
        );
    }

    public Deal createDeal(DealRequest request, Long salesId){
        Deal deal = new Deal();
        deal.setDealName(request.getDealName());
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(request.getStage());
        deal.setSalesId(salesId);
        deal.setCreatedAt(LocalDateTime.now());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal savedDeal = dealRepository.save(deal);

        DealCreatedEvent event = new DealCreatedEvent();
        event.setEventId(UUID.randomUUID());
        event.setDealId(savedDeal.getId());
        event.setDealName(savedDeal.getDealName());
        event.setCreatedByUserId(salesId);
        event.setRecipientUserId(2L);
        event.setCreatedAt(savedDeal.getCreatedAt());

        dealEventPublisher.publishDealCreated(event);
        return savedDeal;
    }

    public void deleteDeal(Long id, Long salesId){
        Deal d = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
        dealRepository.delete(d);
    }

    public Deal updateDeal(Long id, DealRequest request, Long salesId){
        Deal deal = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));

        if (request.getOwner() == null ||
                request.getAmount() == null ||
                request.getStage() == null) {

            throw new IllegalArgumentException("All deal fields are required");
        }
        deal.setOwner(request.getOwner());
        deal.setAmount(request.getAmount());
        deal.setStage(request.getStage());
        deal.setUpdatedAt(LocalDateTime.now());

        return dealRepository.save(deal);

    }

    public Deal patchDeal(Long id, DealRequest request, Long salesId){
        Deal deal = dealRepository.findByIdAndSalesId(id, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));

        if(request.getOwner() != null){
            deal.setOwner(request.getOwner());
        }

        if(request.getAmount() != null){
            deal.setAmount(request.getAmount());
        }

        if(request.getStage()!= null){
            deal.setStage(request.getStage());
        }

        return dealRepository.save(deal);
    }

    public void requestDiscount(Long dealId, Long salesId,
                                Long managerId,
                                DiscountApprovalRequestDTO request){
        Deal deal = dealRepository.findByIdAndSalesId(dealId, salesId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));
        if(request.getDiscountPercent() <= 0 || request.getDiscountPercent() >= 100){
            throw new IllegalArgumentException("Discount percent must be above 0 and below 100");
        }

        DiscountApproval discountApproval = new DiscountApproval();
        discountApproval.setDealId(dealId);
        //discountApproval.setDealName(deal.getDealName());
        discountApproval.setRequestedByUserId(salesId);
        discountApproval.setManagerId(managerId);
        discountApproval.setDiscountPercent(request.getDiscountPercent());
        discountApproval.setReason(request.getReason());
        discountApproval.setStatus("PENDING");
        discountApproval.setCreatedAt(LocalDateTime.now());
        DiscountApproval savedDiscountApproval =
                discountApprovalRepository.save(discountApproval);

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

    //fix this add status to input
    public void approveDiscount(Long discountId, Long managerId, String status) {

        // Validate decision
        String decision;

        if ("APPROVED".equalsIgnoreCase(status)) {
            decision = "APPROVED";
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            decision = "REJECTED";
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be APPROVED or REJECTED"
            );
        }

        // Find discount request
        DiscountApproval discountApproval =
                discountApprovalRepository.findByIdAndManagerId(discountId, managerId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Discount Request not found"
                        ));

        // Find associated deal
        Deal deal = dealRepository.findById(discountApproval.getDealId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Deal not found"
                ));

        // Update approval status
        discountApproval.setStatus(decision);
        discountApproval.setDecidedAt(LocalDateTime.now());

        DiscountApproval savedApproval =
                discountApprovalRepository.save(discountApproval);

        // Only apply discount if approved
        if ("APPROVED".equals(decision)) {
            double discountedAmount =
                    deal.getAmount() *
                            (1 - savedApproval.getDiscountPercent() / 100.0);

            deal.setAmount(discountedAmount);
            deal.setUpdatedAt(LocalDateTime.now());

            dealRepository.save(deal);
        }

        // Create decision event
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

        // Publish event
        dealEventPublisher.publishDiscountDecision(event);
    }
}
