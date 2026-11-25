package analytics_service.controller;

import analytics_service.dto.response.*;
import analytics_service.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(defaultValue = "30d") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getDashboardStats(range, authHeader));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<MonthlyRevenueResponse>> getRevenue(
            @RequestParam(defaultValue = "1y") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getRevenueByMonth(range, authHeader));
    }

    @GetMapping("/lead-sources")
    public ResponseEntity<List<LeadSourceStatResponse>> getLeadSources(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getLeadSourceStats(authHeader));
    }

    @GetMapping("/deal-stages")
    public ResponseEntity<List<DealStageStatResponse>> getDealStages(
            @RequestParam(defaultValue = "30d") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getDealStageStats(range, authHeader));
    }

    @GetMapping("/ticket-status")
    public ResponseEntity<TicketStatusOverviewResponse> getTicketStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getTicketStatusStats(authHeader));
    }

    @GetMapping("/top-customers")
    public ResponseEntity<List<TopCustomerResponse>> getTopCustomers(
            @RequestParam(defaultValue = "30d") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getTopCustomers(range, authHeader));
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivities(
            @RequestParam(defaultValue = "30d") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getRecentActivities(range, authHeader));
    }

    @GetMapping("/sales-performance")
    public ResponseEntity<List<SalesPerformanceResponse>> getSalesPerformance(
            @RequestParam(defaultValue = "30d") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getSalesPerformance(range, authHeader));
    }

    @GetMapping("/customer-growth")
    public ResponseEntity<List<CustomerGrowthResponse>> getCustomerGrowth(
            @RequestParam(defaultValue = "1y") String range,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getCustomerGrowth(range, authHeader));
    }

    @GetMapping("/conversion-funnel")
    public ResponseEntity<List<ConversionFunnelResponse>> getConversionFunnel(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(analyticsService.getConversionFunnel(authHeader));
    }
}
