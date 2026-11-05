package sales_service.controller;

import org.springframework.data.domain.Page;
import sales_service.dto.request.DealFilterRequest;
import sales_service.dto.request.DiscountApprovalRequestDTO;
import sales_service.model.Deal;
import sales_service.dto.request.DealRequest;
import sales_service.service.DealService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/deals")
public class DealController {

    private final DealService dealService;
    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping
    public ResponseEntity<Page<Deal>> getDeals(
            @ModelAttribute DealFilterRequest filterRequest){
        Long salesId = 1L; // put auth here idk lol lmao
        filterRequest.setSalesId(salesId);
        //return ResponseEntity.ok(dealService.getDealsBySalesId(salesId));
        return ResponseEntity.ok(dealService.getDealsBySalesId(filterRequest));
    }

    @GetMapping("/{dealId}")
    public ResponseEntity<Deal> getDeal(@PathVariable Long dealId){
        Long salesId = 1L;
        return ResponseEntity.ok(dealService.getDealByIdAndSalesId(dealId, salesId));
    }

    @PostMapping
    public ResponseEntity<Deal> createDeal(@RequestBody DealRequest request){
        Long salesId = 1L; // put auth here idk lol lmao
        Deal d = dealService.createDeal(request, salesId);
        return ResponseEntity.status(HttpStatus.CREATED).body(d);
    }

    @PostMapping("/{dealId}/discount-requests")
    public ResponseEntity<Void>requestDiscount(@PathVariable Long dealId,
                                               @RequestBody DiscountApprovalRequestDTO request){
        Long salesId = 1L;
        Long managerId = 1000L; //I don't know how to get manager ID, I don't work on that part
        dealService.requestDiscount(dealId, salesId, managerId,request);
        return ResponseEntity.noContent().build();

    }

    @PatchMapping("/discount-requests/{discountId}")
    public ResponseEntity<Void>updateDiscountDecision(@PathVariable Long discountId,
                                                      @RequestParam String status){
        Long managerId= 1000L;
        dealService.approveDiscount(discountId, managerId, status);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{dealId}")
    public ResponseEntity<Deal> updateDeal(@PathVariable Long dealId
            ,@RequestBody DealRequest request){
        Long salesId = 1L;
        return ResponseEntity.ok(dealService.updateDeal(dealId, request, salesId));
    }

    @PatchMapping("/{dealId}")
    public ResponseEntity<Deal> patchDeal(@PathVariable Long dealId
            ,@RequestBody DealRequest request){
        Long salesId = 1L;
        return ResponseEntity.ok(dealService.patchDeal(dealId, request, salesId));
    }

    @DeleteMapping("/{dealId}")
    public ResponseEntity<Void> deleteDeal(@PathVariable Long dealId){
        Long salesId = 1L;
        dealService.deleteDeal(dealId, salesId);
        return ResponseEntity.noContent().build();
    }

}
