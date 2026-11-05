package analytics_service.dto.response;

public class CustomerGrowthResponse {
    private String month;
    private long customers;

    public CustomerGrowthResponse() {}

    public CustomerGrowthResponse(String month, long customers) {
        this.month = month;
        this.customers = customers;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public long getCustomers() { return customers; }
    public void setCustomers(long customers) { this.customers = customers; }
}
