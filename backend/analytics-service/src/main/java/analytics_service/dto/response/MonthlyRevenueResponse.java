package analytics_service.dto.response;

public class MonthlyRevenueResponse {
    private String month;
    private double revenue;

    public MonthlyRevenueResponse() {}

    public MonthlyRevenueResponse(String month, double revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}
