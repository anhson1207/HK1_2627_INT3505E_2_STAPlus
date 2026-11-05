package analytics_service.dto.response;

public class DashboardStatsResponse {
    private long totalLeads;
    private long totalCustomers;
    private long totalDeals;
    private double totalRevenue;
    private long openTickets;
    private long wonDeals;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalLeads, long totalCustomers, long totalDeals, double totalRevenue, long openTickets, long wonDeals) {
        this.totalLeads = totalLeads;
        this.totalCustomers = totalCustomers;
        this.totalDeals = totalDeals;
        this.totalRevenue = totalRevenue;
        this.openTickets = openTickets;
        this.wonDeals = wonDeals;
    }

    public long getTotalLeads() { return totalLeads; }
    public void setTotalLeads(long totalLeads) { this.totalLeads = totalLeads; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(long totalDeals) { this.totalDeals = totalDeals; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getOpenTickets() { return openTickets; }
    public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }

    public long getWonDeals() { return wonDeals; }
    public void setWonDeals(long wonDeals) { this.wonDeals = wonDeals; }
}
