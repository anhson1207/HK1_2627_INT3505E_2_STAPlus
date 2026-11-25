package analytics_service.service;

import analytics_service.dto.response.*;
import analytics_service.model.AnalyticsActivity;
import analytics_service.model.DailyMetricSnapshot;
import analytics_service.repository.AnalyticsActivityRepository;
import analytics_service.repository.DailyMetricSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MM/yy");

    private final AnalyticsActivityRepository activityRepository;
    private final DailyMetricSnapshotRepository snapshotRepository;
    private final RestClient restClient;

    @Value("${services.lead.url:http://localhost:8082}")
    private String leadServiceUrl;

    @Value("${services.customer.url:http://localhost:8083}")
    private String customerServiceUrl;

    @Value("${services.sales.url:http://localhost:8084}")
    private String salesServiceUrl;

    @Value("${services.support.url:http://localhost:8085}")
    private String supportServiceUrl;

    public AnalyticsService(AnalyticsActivityRepository activityRepository,
                            DailyMetricSnapshotRepository snapshotRepository) {
        this.activityRepository = activityRepository;
        this.snapshotRepository = snapshotRepository;
        this.restClient = RestClient.create();
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

    // ===================== LIVE DOWNSTREAM FETCHERS =====================

    private Map<String, Object> fetchPageMap(String url, String authHeader) {
        try {
            RestClient.RequestHeadersSpec<?> spec = restClient.get().uri(url);
            if (authHeader != null && !authHeader.isBlank()) {
                spec = spec.header("Authorization", authHeader);
            }
            spec = spec.header("X-User-Role", "ADMIN");
            Map<String, Object> body = spec.retrieve().body(new ParameterizedTypeReference<>() {});
            return body != null ? body : Collections.emptyMap();
        } catch (Exception e) {
            log.debug("Downstream analytics fetch unavailable for {}: {}", url, e.getMessage());
            return Collections.emptyMap();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractContent(Map<String, Object> pageMap) {
        Object content = pageMap.get("content");
        if (content instanceof List<?> list) {
            return (List<Map<String, Object>>) list;
        }
        return Collections.emptyList();
    }

    private List<Map<String, Object>> fetchAllPaged(String basePath, String pageParam, String sizeParam, String authHeader) {
        List<Map<String, Object>> all = new ArrayList<>();
        int page = 0;
        int maxPages = 20;
        while (page < maxPages) {
            String sep = basePath.contains("?") ? "&" : "?";
            String url = basePath + sep + pageParam + "=" + page + "&" + sizeParam + "=100";
            Map<String, Object> pageMap = fetchPageMap(url, authHeader);
            List<Map<String, Object>> content = extractContent(pageMap);
            if (content.isEmpty()) break;
            all.addAll(content);
            int totalPages = pageMap.get("totalPages") instanceof Number n ? n.intValue() : 1;
            page++;
            if (page >= totalPages) break;
        }
        return all;
    }

    private List<Map<String, Object>> fetchLeads(String authHeader) {
        return fetchAllPaged(leadServiceUrl + "/api/v1/leads", "page", "size", authHeader);
    }

    private List<Map<String, Object>> fetchCustomers(String authHeader) {
        return fetchAllPaged(customerServiceUrl + "/api/v1/customers", "page", "size", authHeader);
    }

    private List<Map<String, Object>> fetchDeals(String authHeader) {
        return fetchAllPaged(salesServiceUrl + "/deals", "pgNum", "pgSize", authHeader);
    }

    private List<Map<String, Object>> fetchTickets(String authHeader) {
        return fetchAllPaged(supportServiceUrl + "/tickets", "pgNum", "pgSize", authHeader);
    }

    // ===================== PUBLIC ANALYTICS METHODS =====================

    public DashboardStatsResponse getDashboardStats(String range, String authHeader) {
        List<Map<String, Object>> leads = fetchLeads(authHeader);
        List<Map<String, Object>> customers = fetchCustomers(authHeader);
        List<Map<String, Object>> allDeals = fetchDeals(authHeader);
        List<Map<String, Object>> allTickets = fetchTickets(authHeader);

        long totalLeads = leads.size();
        long totalCustomers = customers.size();

        List<Map<String, Object>> rangedDeals = filterByRange(allDeals, range);
        long totalDeals = rangedDeals.size();

        List<Map<String, Object>> wonDealsList = rangedDeals.stream()
                .filter(d -> "WON".equalsIgnoreCase(str(d.get("stage"))))
                .toList();
        long wonDeals = wonDealsList.size();
        double totalRevenue = wonDealsList.stream().mapToDouble(d -> dbl(d.get("amount"))).sum();

        long openTickets = allTickets.stream()
                .filter(t -> "OPEN".equalsIgnoreCase(str(t.get("status"))))
                .count();

        DashboardStatsResponse resp = new DashboardStatsResponse(
                totalLeads, totalCustomers, totalDeals, totalRevenue, openTickets, wonDeals
        );

        resp.setLeadsTrend(computeCountTrend(leads, range));
        resp.setCustomersTrend(computeCountTrend(customers, range));
        resp.setDealsTrend(computeCountTrend(allDeals, range));
        resp.setWonDealsTrend(computeCountTrend(
                allDeals.stream().filter(d -> "WON".equalsIgnoreCase(str(d.get("stage")))).toList(),
                range
        ));
        resp.setRevenueTrend(computeRevenueTrend(
                allDeals.stream().filter(d -> "WON".equalsIgnoreCase(str(d.get("stage")))).toList(),
                range
        ));
        return resp;
    }

    public List<MonthlyRevenueResponse> getRevenueByMonth(String range, String authHeader) {
        int months = resolveMonthsCount(range);
        List<Map<String, Object>> deals = fetchDeals(authHeader);

        Map<YearMonth, Double> revByMonth = new HashMap<>();
        for (Map<String, Object> deal : deals) {
            if (!"WON".equalsIgnoreCase(str(deal.get("stage")))) continue;
            LocalDateTime created = parseDateTime(deal.get("createdAt"));
            if (created == null) continue;
            YearMonth ym = YearMonth.from(created);
            revByMonth.merge(ym, dbl(deal.get("amount")), Double::sum);
        }

        YearMonth current = YearMonth.now();
        List<MonthlyRevenueResponse> result = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String label = "T" + ym.format(MONTH_FMT);
            result.add(new MonthlyRevenueResponse(label, revByMonth.getOrDefault(ym, 0.0)));
        }
        return result;
    }

    public List<LeadSourceStatResponse> getLeadSourceStats(String authHeader) {
        List<Map<String, Object>> leads = fetchLeads(authHeader);
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Map<String, Object> lead : leads) {
            String src = str(lead.get("source"));
            if (src.isEmpty()) src = "OTHER";
            counts.merge(src, 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new LeadSourceStatResponse(e.getKey(), e.getValue()))
                .toList();
    }

    public List<DealStageStatResponse> getDealStageStats(String range, String authHeader) {
        List<Map<String, Object>> deals = filterByRange(fetchDeals(authHeader), range);
        String[] stages = {"NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"};
        List<DealStageStatResponse> result = new ArrayList<>();
        for (String stage : stages) {
            List<Map<String, Object>> matched = deals.stream()
                    .filter(d -> stage.equalsIgnoreCase(str(d.get("stage"))))
                    .toList();
            double sum = matched.stream().mapToDouble(d -> dbl(d.get("amount"))).sum();
            result.add(new DealStageStatResponse(stage, matched.size(), sum));
        }
        return result;
    }

    public TicketStatusOverviewResponse getTicketStatusStats(String authHeader) {
        List<Map<String, Object>> tickets = fetchTickets(authHeader);
        String[] statuses = {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"};
        List<TicketStatusOverviewResponse.StatusItem> items = new ArrayList<>();
        for (String status : statuses) {
            long count = tickets.stream()
                    .filter(t -> status.equalsIgnoreCase(str(t.get("status"))))
                    .count();
            items.add(new TicketStatusOverviewResponse.StatusItem(status, count));
        }
        long urgentCount = tickets.stream()
                .filter(t -> "URGENT".equalsIgnoreCase(str(t.get("priority"))))
                .count();
        return new TicketStatusOverviewResponse(items, urgentCount);
    }

    public List<TopCustomerResponse> getTopCustomers(String range, String authHeader) {
        List<Map<String, Object>> customers = fetchCustomers(authHeader);
        List<Map<String, Object>> deals = filterByRange(fetchDeals(authHeader), range);

        Map<Long, Map<String, Object>> customerById = new HashMap<>();
        for (Map<String, Object> c : customers) {
            Long id = lng(c.get("id"));
            if (id != null) customerById.put(id, c);
        }

        Map<Long, List<Map<String, Object>>> dealsByCustomer = new HashMap<>();
        for (Map<String, Object> d : deals) {
            Long cid = lng(d.get("customerId"));
            if (cid == null || cid <= 0) cid = lng(d.get("salesId"));
            if (cid != null && cid > 0) {
                dealsByCustomer.computeIfAbsent(cid, k -> new ArrayList<>()).add(d);
            }
        }

        List<TopCustomerResponse> list = new ArrayList<>();
        for (Map.Entry<Long, List<Map<String, Object>>> entry : dealsByCustomer.entrySet()) {
            Long cid = entry.getKey();
            List<Map<String, Object>> cDeals = entry.getValue();
            Map<String, Object> cust = customerById.get(cid);
            String name = cust != null && !str(cust.get("fullName")).isEmpty()
                    ? str(cust.get("fullName"))
                    : ("Khách hàng #" + cid);
            String owner = cDeals.stream()
                    .map(d -> str(d.get("owner")))
                    .filter(s -> !s.isEmpty())
                    .findFirst()
                    .orElse("—");
            double wonVal = cDeals.stream()
                    .filter(d -> "WON".equalsIgnoreCase(str(d.get("stage"))))
                    .mapToDouble(d -> dbl(d.get("amount")))
                    .sum();
            list.add(new TopCustomerResponse(cid, name, cDeals.size(), wonVal, owner));
        }

        return list.stream()
                .sorted(Comparator.comparingDouble(TopCustomerResponse::getWonValue)
                        .thenComparingLong(TopCustomerResponse::getDeals).reversed())
                .limit(5)
                .toList();
    }

    public List<RecentActivityResponse> getRecentActivities(String range, String authHeader) {
        record TimestampedActivity(String type, String description, LocalDateTime time) {}
        List<TimestampedActivity> items = new ArrayList<>();

        for (AnalyticsActivity a : activityRepository.findTop10ByOrderByCreatedAtDesc()) {
            items.add(new TimestampedActivity(a.getType(), a.getDescription(), a.getCreatedAt()));
        }

        for (Map<String, Object> lead : fetchLeads(authHeader)) {
            LocalDateTime dt = parseDateTime(lead.get("createdAt"));
            String fullName = (str(lead.get("firstName")) + " " + str(lead.get("lastName"))).trim();
            if (fullName.isEmpty()) fullName = str(lead.get("email"));
            if (dt != null) {
                items.add(new TimestampedActivity("LEAD", "Lead mới \"" + fullName + "\" (" + str(lead.get("source")) + ")", dt));
            }
        }

        for (Map<String, Object> c : fetchCustomers(authHeader)) {
            LocalDateTime dt = parseDateTime(c.get("createdAt"));
            if (dt != null) {
                items.add(new TimestampedActivity("CUSTOMER", "Khách hàng \"" + str(c.get("fullName")) + "\" được ghi nhận", dt));
            }
        }

        for (Map<String, Object> d : fetchDeals(authHeader)) {
            LocalDateTime dt = parseDateTime(d.get("updatedAt") != null ? d.get("updatedAt") : d.get("createdAt"));
            if (dt != null) {
                items.add(new TimestampedActivity("DEAL", "Cơ hội \"" + str(d.get("dealName")) + "\" ở giai đoạn " + str(d.get("stage")), dt));
            }
        }

        for (Map<String, Object> t : fetchTickets(authHeader)) {
            LocalDateTime dt = parseDateTime(t.get("updatedAt") != null ? t.get("updatedAt") : t.get("createdAt"));
            if (dt != null) {
                items.add(new TimestampedActivity("TICKET", "Ticket #" + lng(t.get("id")) + " \"" + str(t.get("subject")) + "\" (" + str(t.get("status")) + ")", dt));
            }
        }

        int limit = "7d".equalsIgnoreCase(range) ? 5 : 8;
        List<TimestampedActivity> sorted = items.stream()
                .sorted(Comparator.comparing(TimestampedActivity::time, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .toList();

        List<RecentActivityResponse> result = new ArrayList<>();
        long idSeq = 1;
        for (TimestampedActivity item : sorted) {
            result.add(new RecentActivityResponse(idSeq++, item.type(), item.description(), formatTimeAgo(item.time())));
        }
        return result;
    }

    public List<SalesPerformanceResponse> getSalesPerformance(String range, String authHeader) {
        List<Map<String, Object>> deals = filterByRange(fetchDeals(authHeader), range);
        Map<String, List<Map<String, Object>>> byOwner = deals.stream()
                .collect(Collectors.groupingBy(d -> {
                    String o = str(d.get("owner"));
                    return o.isEmpty() ? "Chưa phân công" : o;
                }));

        return byOwner.entrySet().stream()
                .map(entry -> {
                    List<Map<String, Object>> list = entry.getValue();
                    long total = list.size();
                    long won = list.stream().filter(d -> "WON".equalsIgnoreCase(str(d.get("stage")))).count();
                    double revenue = list.stream()
                            .filter(d -> "WON".equalsIgnoreCase(str(d.get("stage"))))
                            .mapToDouble(d -> dbl(d.get("amount")))
                            .sum();
                    int convRate = total > 0 ? (int) Math.round((won * 100.0) / total) : 0;
                    return new SalesPerformanceResponse(entry.getKey(), total, won, revenue, convRate);
                })
                .sorted(Comparator.comparingDouble(SalesPerformanceResponse::getRevenue)
                        .thenComparingLong(SalesPerformanceResponse::getDeals).reversed())
                .toList();
    }

    public List<CustomerGrowthResponse> getCustomerGrowth(String range, String authHeader) {
        int months = resolveMonthsCount(range);
        List<Map<String, Object>> customers = fetchCustomers(authHeader);

        YearMonth current = YearMonth.now();
        List<CustomerGrowthResponse> list = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59);
            long cumulative = customers.stream()
                    .map(c -> parseDateTime(c.get("createdAt")))
                    .filter(dt -> dt != null && !dt.isAfter(endOfMonth))
                    .count();
            list.add(new CustomerGrowthResponse("T" + ym.format(MONTH_FMT), cumulative));
        }
        return list;
    }

    public List<ConversionFunnelResponse> getConversionFunnel(String authHeader) {
        List<Map<String, Object>> leads = fetchLeads(authHeader);
        List<Map<String, Object>> customers = fetchCustomers(authHeader);
        List<Map<String, Object>> deals = fetchDeals(authHeader);

        long totalLeads = leads.size();
        long qualifiedLeads = leads.stream()
                .filter(l -> {
                    String s = str(l.get("status"));
                    return "QUALIFIED".equalsIgnoreCase(s) || "CONVERTED".equalsIgnoreCase(s);
                })
                .count();
        long totalCustomers = customers.size();
        long totalDeals = deals.size();
        long wonDeals = deals.stream().filter(d -> "WON".equalsIgnoreCase(str(d.get("stage")))).count();

        return List.of(
                new ConversionFunnelResponse("Leads", totalLeads, totalLeads > 0 ? 100 : 0),
                new ConversionFunnelResponse("Qualified Leads", qualifiedLeads, totalLeads > 0 ? (int) Math.round((qualifiedLeads * 100.0) / totalLeads) : 0),
                new ConversionFunnelResponse("Customers", totalCustomers, totalLeads > 0 ? (int) Math.round((totalCustomers * 100.0) / totalLeads) : 0),
                new ConversionFunnelResponse("Deals", totalDeals, totalCustomers > 0 ? (int) Math.round((totalDeals * 100.0) / totalCustomers) : 0),
                new ConversionFunnelResponse("Won Deals", wonDeals, totalDeals > 0 ? (int) Math.round((wonDeals * 100.0) / totalDeals) : 0)
        );
    }

    // ===================== HELPERS =====================

    private List<Map<String, Object>> filterByRange(List<Map<String, Object>> items, String range) {
        int days = resolveDays(range);
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        return items.stream()
                .filter(item -> {
                    LocalDateTime dt = parseDateTime(item.get("createdAt"));
                    return dt == null || !dt.isBefore(cutoff);
                })
                .toList();
    }

    private String computeCountTrend(List<Map<String, Object>> items, String range) {
        int days = resolveDays(range);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusDays(days);
        LocalDateTime prevStart = currentStart.minusDays(days);

        long currentCount = 0;
        long prevCount = 0;
        for (Map<String, Object> item : items) {
            LocalDateTime dt = parseDateTime(item.get("createdAt"));
            if (dt == null) continue;
            if (!dt.isBefore(currentStart)) currentCount++;
            else if (!dt.isBefore(prevStart)) prevCount++;
        }
        return formatGrowth(currentCount, prevCount);
    }

    private String computeRevenueTrend(List<Map<String, Object>> wonDeals, String range) {
        int days = resolveDays(range);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusDays(days);
        LocalDateTime prevStart = currentStart.minusDays(days);

        double currentSum = 0;
        double prevSum = 0;
        for (Map<String, Object> item : wonDeals) {
            LocalDateTime dt = parseDateTime(item.get("createdAt"));
            if (dt == null) continue;
            double val = dbl(item.get("amount"));
            if (!dt.isBefore(currentStart)) currentSum += val;
            else if (!dt.isBefore(prevStart)) prevSum += val;
        }
        return formatGrowth(currentSum, prevSum);
    }

    private String formatGrowth(double current, double previous) {
        if (previous <= 0) return null;
        long pct = Math.round(((current - previous) / previous) * 100.0);
        return (pct >= 0 ? "+" : "") + pct + "%";
    }

    private int resolveDays(String range) {
        if ("7d".equalsIgnoreCase(range)) return 7;
        if ("30d".equalsIgnoreCase(range)) return 30;
        if ("3m".equalsIgnoreCase(range)) return 90;
        if ("6m".equalsIgnoreCase(range)) return 180;
        return 365;
    }

    private int resolveMonthsCount(String range) {
        if ("7d".equalsIgnoreCase(range)) return 1;
        if ("30d".equalsIgnoreCase(range)) return 2;
        if ("3m".equalsIgnoreCase(range)) return 3;
        if ("6m".equalsIgnoreCase(range)) return 6;
        return 12;
    }

    private LocalDateTime parseDateTime(Object raw) {
        if (raw == null) return null;
        String s = String.valueOf(raw).trim();
        if (s.isEmpty() || "null".equals(s)) return null;
        try {
            if (s.endsWith("Z")) s = s.substring(0, s.length() - 1);
            int plusIdx = s.indexOf('+');
            if (plusIdx > 10) s = s.substring(0, plusIdx);
            return LocalDateTime.parse(s);
        } catch (Exception e) {
            try {
                return LocalDate.parse(s.substring(0, Math.min(10, s.length()))).atStartOfDay();
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    private String str(Object val) {
        return val != null ? String.valueOf(val).trim() : "";
    }

    private double dbl(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        try {
            return val != null ? Double.parseDouble(String.valueOf(val)) : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    private Long lng(Object val) {
        if (val instanceof Number n) return n.longValue();
        try {
            return val != null ? Long.parseLong(String.valueOf(val)) : null;
        } catch (Exception e) {
            return null;
        }
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
