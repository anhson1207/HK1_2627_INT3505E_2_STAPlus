package analytics_service.dto.response;

public class TopCustomerResponse {
    private Long customerId;
    private String customerName;
    private long deals;
    private double wonValue;
    private String ownerName;

    public TopCustomerResponse() {}

    public TopCustomerResponse(Long customerId, String customerName, long deals, double wonValue, String ownerName) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.deals = deals;
        this.wonValue = wonValue;
        this.ownerName = ownerName;
    }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public long getDeals() { return deals; }
    public void setDeals(long deals) { this.deals = deals; }

    public double getWonValue() { return wonValue; }
    public void setWonValue(double wonValue) { this.wonValue = wonValue; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
}

