package sales_service.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deals")
public class Deal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sales_id", nullable = false)
    private Long salesId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "deal_name", nullable = true)
    private String dealName;

    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "stage", nullable = false)
    private String stage;

    @Column(name = "probability")
    private Integer probability;

    @Column(name = "expected_closing_date")
    private String expectedClosingDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_percent")
    private Double discountPercent = 0.0;

    @Column(name = "approval_status")
    private String approvalStatus = "NOT_REQUIRED";

    @Column(name = "discount_reason", columnDefinition = "TEXT")
    private String discountReason;

    @Column(name = "discount_approved_by")
    private String discountApprovedBy;

    @Column(name = "discount_approved_at")
    private LocalDateTime discountApprovedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public double getAmount() {
        return amount != null ? amount : 0.0;
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
        return discountPercent != null ? discountPercent : 0.0;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getApprovalStatus() {
        return approvalStatus != null ? approvalStatus : "NOT_REQUIRED";
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getDiscountReason() {
        return discountReason;
    }

    public void setDiscountReason(String discountReason) {
        this.discountReason = discountReason;
    }

    public String getDiscountApprovedBy() {
        return discountApprovedBy;
    }

    public void setDiscountApprovedBy(String discountApprovedBy) {
        this.discountApprovedBy = discountApprovedBy;
    }

    public LocalDateTime getDiscountApprovedAt() {
        return discountApprovedAt;
    }

    public void setDiscountApprovedAt(LocalDateTime discountApprovedAt) {
        this.discountApprovedAt = discountApprovedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
