package sales_service.controller;

import org.springframework.data.domain.Page;
import sales_service.dto.request.DealFilterRequest;
import sales_service.dto.request.DiscountApprovalRequestDTO;
import sales_service.dto.response.DealForecastResponse;
import sales_service.dto.response.PipelineStageSummary;
import sales_service.model.Deal;
import sales_service.dto.request.DealRequest;
import sales_service.service.DealService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deals")
public class DealController {

    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    private Long resolveSalesId(Long headerId) {
        return (headerId != null && headerId > 0) ? headerId : 1L;
    }

    private boolean isManagerOrAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role);
    }

    @GetMapping
    public ResponseEntity<Page<Deal>> getDeals(
            @ModelAttribute DealFilterRequest filterRequest,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        if (filterRequest.getSalesId() == null && !isManagerOrAdmin(currentUserRole)) {
            filterRequest.setSalesId(resolveSalesId(currentUserId));
        }
        return ResponseEntity.ok(dealService.getDealsBySalesId(filterRequest));
    }

    @GetMapping("/{dealId}")
    public ResponseEntity<Deal> getDeal(
            @PathVariable Long dealId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        return ResponseEntity.ok(dealService.getDealByIdAndSalesId(dealId, salesId != null ? salesId : 1L));
    }

    @GetMapping("/pipeline/summary")
    public ResponseEntity<List<PipelineStageSummary>> getPipelineSummary(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        return ResponseEntity.ok(dealService.getPipelineSummary(salesId));
    }

    @GetMapping("/forecast")
    public ResponseEntity<DealForecastResponse> getForecast(
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        return ResponseEntity.ok(dealService.getForecast(salesId));
    }

    @PostMapping
    public ResponseEntity<Deal> createDeal(
            @RequestBody DealRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        Long salesId = resolveSalesId(currentUserId);
        Deal d = dealService.createDeal(request, salesId);
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @PostMapping("/{dealId}/discount-requests")
    public ResponseEntity<Void> requestDiscount(
            @PathVariable Long dealId,
            @RequestBody DiscountApprovalRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {

        Long salesId = resolveSalesId(currentUserId);
        Long managerId = 1000L;
        dealService.requestDiscount(dealId, salesId, managerId, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/discount-requests/{discountId}")
    public ResponseEntity<Void> updateDiscountDecision(
            @PathVariable Long discountId,
            @RequestParam String status,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long managerId = (currentUserId != null && currentUserId > 0) ? currentUserId : 1000L;
        dealService.approveDiscount(discountId, managerId, status);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{dealId}")
    public ResponseEntity<Deal> updateDeal(
            @PathVariable Long dealId,
            @RequestBody DealRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        return ResponseEntity.ok(dealService.updateDeal(dealId, request, salesId != null ? salesId : 1L));
    }

    @PatchMapping("/{dealId}")
    public ResponseEntity<Deal> patchDeal(
            @PathVariable Long dealId,
            @RequestBody DealRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        return ResponseEntity.ok(dealService.patchDeal(dealId, request, salesId != null ? salesId : 1L));
    }

    @DeleteMapping("/{dealId}")
    public ResponseEntity<Void> deleteDeal(
            @PathVariable Long dealId,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId,
            @RequestHeader(value = "X-User-Role", required = false) String currentUserRole) {

        Long salesId = isManagerOrAdmin(currentUserRole) ? null : resolveSalesId(currentUserId);
        dealService.deleteDeal(dealId, salesId != null ? salesId : 1L);
        return ResponseEntity.noContent().build();
    }
}
