package analytics_service.dto.response;

public class SalesPerformanceResponse {
    private String owner;
    private long deals;
    private long wonDeals;
    private double revenue;
    private int conversionRate;

    public SalesPerformanceResponse() {}

    public SalesPerformanceResponse(String owner, long deals, long wonDeals, double revenue, int conversionRate) {
        this.owner = owner;
        this.deals = deals;
        this.wonDeals = wonDeals;
        this.revenue = revenue;
        this.conversionRate = conversionRate;
    }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public long getDeals() { return deals; }
    public void setDeals(long deals) { this.deals = deals; }

    public long getWonDeals() { return wonDeals; }
    public void setWonDeals(long wonDeals) { this.wonDeals = wonDeals; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }

    public int getConversionRate() { return conversionRate; }
    public void setConversionRate(int conversionRate) { this.conversionRate = conversionRate; }
}
