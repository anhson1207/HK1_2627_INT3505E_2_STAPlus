package analytics_service.service;

import analytics_service.dto.response.*;
import analytics_service.model.AnalyticsActivity;
import analytics_service.model.DailyMetricSnapshot;
import analytics_service.repository.AnalyticsActivityRepository;
import analytics_service.repository.DailyMetricSnapshotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    private final AnalyticsActivityRepository activityRepository;
    private final DailyMetricSnapshotRepository snapshotRepository;

    public AnalyticsService(AnalyticsActivityRepository activityRepository,
                            DailyMetricSnapshotRepository snapshotRepository) {
        this.activityRepository = activityRepository;
        this.snapshotRepository = snapshotRepository;
    }

    @PostConstruct
    public void initBaselineData() {
        if (snapshotRepository.count() == 0) {
            LocalDate today = LocalDate.now();
            double[] revs = {95000000.0, 120000000.0, 165000000.0, 120000000.0, 150000000.0, 138000000.0, 190000000.0, 210000000.0, 205000000.0, 245000000.0, 270000000.0, 335000000.0};
            int[] custs = {18, 22, 27, 31, 35, 42, 49, 56, 63, 72, 84, 96};

            for (int i = 11; i >= 0; i--) {
                LocalDate date = today.minusMonths(i).withDayOfMonth(1);
                int idx = 11 - i;
                DailyMetricSnapshot snap = new DailyMetricSnapshot(
                        date,
                        revs[idx],
                        (idx + 1) * 3,
                        (idx + 1) * 5,
                        (idx + 1) * 8 + 20,
                        custs[idx],
                        (idx % 4) + 2
                );
                snapshotRepository.save(snap);
            }
        }

        if (activityRepository.count() == 0) {
            activityRepository.save(new AnalyticsActivity("DEAL", "Cơ hội “CRM Implementation” chuyển sang WON"));
            activityRepository.save(new AnalyticsActivity("TICKET", "Ticket #101 được giải quyết thành công"));
            activityRepository.save(new AnalyticsActivity("CUSTOMER", "Khách hàng Nguyễn Minh Anh được cập nhật"));
            activityRepository.save(new AnalyticsActivity("LEAD", "Lead mới được tạo từ Website Form"));
            activityRepository.save(new AnalyticsActivity("DEAL", "Cơ hội “Website Upgrade” chuyển sang Proposal"));
        }
    }

    public synchronized void recordDealCreated(String dealName, Long dealId) {
        activityRepository.save(new AnalyticsActivity("DEAL", "Cơ hội mới \"" + dealName + "\" được tạo"));
        updateTodaySnapshot(snap -> snap.setTotalDeals(snap.getTotalDeals() + 1));
    }

    public synchronized void recordDealWon(String dealName, Double value) {
        activityRepository.save(new AnalyticsActivity("DEAL", "Cơ hội \"" + dealName + "\" đã chốt thành công (WON)"));
        updateTodaySnapshot(snap -> {
            snap.setWonDeals(snap.getWonDeals() + 1);
            snap.setRevenue(snap.getRevenue() + (value != null ? value : 0.0));
        });
    }

    public synchronized void recordDealStageChanged(String dealName, String newStage) {
        activityRepository.save(new AnalyticsActivity("DEAL", "Cơ hội \"" + dealName + "\" chuyển trạng thái sang " + newStage));
    }

    public synchronized void recordTicketCreated(String title, Long ticketId) {
        activityRepository.save(new AnalyticsActivity("TICKET", "Ticket mới #" + ticketId + " (\"" + title + "\") đã được tạo"));
        updateTodaySnapshot(snap -> snap.setOpenTickets(snap.getOpenTickets() + 1));
    }

    private void updateTodaySnapshot(java.util.function.Consumer<DailyMetricSnapshot> updater) {
        LocalDate today = LocalDate.now().withDayOfMonth(1);
        DailyMetricSnapshot snap = snapshotRepository.findByMetricDate(today).orElseGet(() -> {
            DailyMetricSnapshot s = new DailyMetricSnapshot();
            s.setMetricDate(today);
            return s;
        });
        updater.accept(snap);
        snapshotRepository.save(snap);
    }

    public DashboardStatsResponse getDashboardStats(String range) {
        List<DailyMetricSnapshot> all = snapshotRepository.findAll();
        double totalRev = all.stream().mapToDouble(DailyMetricSnapshot::getRevenue).sum();
        long totalWon = all.stream().mapToInt(DailyMetricSnapshot::getWonDeals).sum();
        long totalDeals = all.stream().mapToInt(DailyMetricSnapshot::getTotalDeals).sum();
        long totalLeads = all.isEmpty() ? 120 : all.get(all.size() - 1).getTotalLeads();
        long totalCust = all.isEmpty() ? 96 : all.get(all.size() - 1).getTotalCustomers();
        long openTickets = all.isEmpty() ? 5 : all.get(all.size() - 1).getOpenTickets();

        return new DashboardStatsResponse(totalLeads, totalCust, totalDeals, totalRev, openTickets, totalWon);
    }

    public List<MonthlyRevenueResponse> getRevenueByMonth(String range) {
        int count = resolveMonthsCount(range);
        List<DailyMetricSnapshot> all = snapshotRepository.findAll();
        List<MonthlyRevenueResponse> list = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yy");
        int start = Math.max(0, all.size() - count);
        for (int i = start; i < all.size(); i++) {
            DailyMetricSnapshot s = all.get(i);
            list.add(new MonthlyRevenueResponse("T" + s.getMetricDate().format(fmt), s.getRevenue()));
        }
        return list;
    }

    public List<LeadSourceStatResponse> getLeadSourceStats() {
        return List.of(
                new LeadSourceStatResponse("Website", 45),
                new LeadSourceStatResponse("Facebook", 32),
                new LeadSourceStatResponse("Giới thiệu", 28),
                new LeadSourceStatResponse("Sự kiện", 15),
                new LeadSourceStatResponse("Email Campaign", 12)
        );
    }

    public List<DealStageStatResponse> getDealStageStats(String range) {
        return List.of(
                new DealStageStatResponse("NEW", 8, 120000000.0),
                new DealStageStatResponse("QUALIFIED", 12, 280000000.0),
                new DealStageStatResponse("PROPOSAL", 7, 210000000.0),
                new DealStageStatResponse("NEGOTIATION", 5, 190000000.0),
                new DealStageStatResponse("WON", 16, 540000000.0),
                new DealStageStatResponse("LOST", 4, 85000000.0)
        );
    }

    public TicketStatusOverviewResponse getTicketStatusStats() {
        return new TicketStatusOverviewResponse(
                List.of(
                        new TicketStatusOverviewResponse.StatusItem("OPEN", 6),
                        new TicketStatusOverviewResponse.StatusItem("IN_PROGRESS", 4),
                        new TicketStatusOverviewResponse.StatusItem("RESOLVED", 18),
                        new TicketStatusOverviewResponse.StatusItem("CLOSED", 25)
                ),
                3
        );
    }

    public List<TopCustomerResponse> getTopCustomers(String range) {
        return List.of(
                new TopCustomerResponse(1L, "Tập đoàn Vingroup", 5, 250000000.0, "Sơn"),
                new TopCustomerResponse(2L, "Công ty FPT Software", 4, 180000000.0, "Trúc"),
                new TopCustomerResponse(3L, "Viettel Telecom", 3, 150000000.0, "Hải Anh"),
                new TopCustomerResponse(4L, "Ngân hàng Techcombank", 3, 120000000.0, "Sơn"),
                new TopCustomerResponse(5L, "Masan Group", 2, 95000000.0, "Trúc")
        );
    }

    public List<RecentActivityResponse> getRecentActivities(String range) {
        List<AnalyticsActivity> activities = activityRepository.findTop10ByOrderByCreatedAtDesc();
        List<RecentActivityResponse> result = new ArrayList<>();
        int limit = "7d".equalsIgnoreCase(range) ? 4 : activities.size();

        for (int i = 0; i < Math.min(limit, activities.size()); i++) {
            AnalyticsActivity a = activities.get(i);
            result.add(new RecentActivityResponse(a.getId(), a.getType(), a.getDescription(), formatTimeAgo(a.getCreatedAt())));
        }
        return result;
    }

    public List<SalesPerformanceResponse> getSalesPerformance(String range) {
        return List.of(
                new SalesPerformanceResponse("Sơn", 18, 12, 380000000.0, 67),
                new SalesPerformanceResponse("Trúc", 15, 9, 290000000.0, 60),
                new SalesPerformanceResponse("Hải Anh", 11, 7, 210000000.0, 64)
        );
    }

    public List<CustomerGrowthResponse> getCustomerGrowth(String range) {
        int count = resolveMonthsCount(range);
        List<DailyMetricSnapshot> all = snapshotRepository.findAll();
        List<CustomerGrowthResponse> list = new ArrayList<>();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yy");
        int start = Math.max(0, all.size() - count);
        for (int i = start; i < all.size(); i++) {
            DailyMetricSnapshot s = all.get(i);
            list.add(new CustomerGrowthResponse("T" + s.getMetricDate().format(fmt), s.getTotalCustomers()));
        }
        return list;
    }

    public List<ConversionFunnelResponse> getConversionFunnel() {
        return List.of(
                new ConversionFunnelResponse("Leads", 132, 100),
                new ConversionFunnelResponse("Qualified Leads", 86, 65),
                new ConversionFunnelResponse("Customers", 62, 72),
                new ConversionFunnelResponse("Deals", 45, 73),
                new ConversionFunnelResponse("Won Deals", 28, 62)
        );
    }

    private int resolveMonthsCount(String range) {
        if ("7d".equalsIgnoreCase(range)) return 1;
        if ("30d".equalsIgnoreCase(range)) return 2;
        if ("3m".equalsIgnoreCase(range)) return 3;
        if ("6m".equalsIgnoreCase(range)) return 6;
        return 12;
    }

    private String formatTimeAgo(LocalDateTime time) {
        if (time == null) return "Vừa xong";
        long minutes = java.time.Duration.between(time, LocalDateTime.now()).toMinutes();
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return minutes + " phút trước";
        long hours = minutes / 60;
        if (hours < 24) return hours + " giờ trước";
        long days = hours / 24;
        return days + " ngày trước";
    }
}

