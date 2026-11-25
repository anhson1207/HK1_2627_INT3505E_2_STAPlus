package sales_service.dto.request;

public class DealRequest {

    private String dealName;
    private String owner;
    private Double amount;
    private String stage;
    private Long salesId;
    private Long customerId;
    private Integer probability;
    private String expectedClosingDate;
    private String description;
    private Double discountPercent;
    private String discountReason;
    private String approvalStatus;

    public DealRequest() {
    }

    public DealRequest(String dealName, String owner, Double amount, String stage) {
        this.dealName = dealName;
        this.owner = owner;
        this.amount = amount;
        this.stage = stage;
    }

    public String getDealName() {
        return dealName;
    }

    public void setDealName(String dealName) {
        this.dealName = dealName;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Long getSalesId() {
        return salesId;
    }

    public void setSalesId(Long salesId) {
        this.salesId = salesId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Integer getProbability() {
        return probability;
    }

    public void setProbability(Integer probability) {
        this.probability = probability;
    }

    public String getExpectedClosingDate() {
        return expectedClosingDate;
    }

    public void setExpectedClosingDate(String expectedClosingDate) {
        this.expectedClosingDate = expectedClosingDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getDiscountReason() {
        return discountReason;
    }

    public void setDiscountReason(String discountReason) {
        this.discountReason = discountReason;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
}
