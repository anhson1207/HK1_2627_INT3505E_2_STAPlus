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
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getDashboardStats(range));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<MonthlyRevenueResponse>> getRevenue(
            @RequestParam(defaultValue = "1y") String range) {
        return ResponseEntity.ok(analyticsService.getRevenueByMonth(range));
    }

    @GetMapping("/lead-sources")
    public ResponseEntity<List<LeadSourceStatResponse>> getLeadSources() {
        return ResponseEntity.ok(analyticsService.getLeadSourceStats());
    }

    @GetMapping("/deal-stages")
    public ResponseEntity<List<DealStageStatResponse>> getDealStages(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getDealStageStats(range));
    }

    @GetMapping("/ticket-status")
    public ResponseEntity<TicketStatusOverviewResponse> getTicketStatus() {
        return ResponseEntity.ok(analyticsService.getTicketStatusStats());
    }

    @GetMapping("/top-customers")
    public ResponseEntity<List<TopCustomerResponse>> getTopCustomers(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getTopCustomers(range));
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivities(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getRecentActivities(range));
    }

    @GetMapping("/sales-performance")
    public ResponseEntity<List<SalesPerformanceResponse>> getSalesPerformance(
            @RequestParam(defaultValue = "30d") String range) {
        return ResponseEntity.ok(analyticsService.getSalesPerformance(range));
    }

    @GetMapping("/customer-growth")
    public ResponseEntity<List<CustomerGrowthResponse>> getCustomerGrowth(
            @RequestParam(defaultValue = "1y") String range) {
        return ResponseEntity.ok(analyticsService.getCustomerGrowth(range));
    }

    @GetMapping("/conversion-funnel")
    public ResponseEntity<List<ConversionFunnelResponse>> getConversionFunnel() {
        return ResponseEntity.ok(analyticsService.getConversionFunnel());
    }
}
