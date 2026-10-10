package sales_service.dto.request;

import java.time.LocalDateTime;

public class DealFilterRequest {
    private Long salesId;
    private String owner;
    private Double minAmount;
    private Double maxAmount;
    private String stage;
    private LocalDateTime createdAfter;
    private LocalDateTime createdBefore;
    private String order = "asc";
    private String sortedBy = "createdAt";

    private Integer pgSize;
    private Integer pgNum;

    public Long getSalesId() {
        return salesId;
    }

    public void setSalesId(Long salesId) {
        this.salesId = salesId;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Double getMinAmount() {
        return minAmount;
    }

    public void setMinAmount(Double minAmount) {
        this.minAmount = minAmount;
    }

    public Double getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(Double maxAmount) {
        this.maxAmount = maxAmount;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public LocalDateTime getCreatedAfter() {
        return createdAfter;
    }

    public void setCreatedAfter(LocalDateTime createdAfter) {
        this.createdAfter = createdAfter;
    }

    public LocalDateTime getCreatedBefore() {
        return createdBefore;
    }

    public void setCreatedBefore(LocalDateTime createdBefore) {
        this.createdBefore = createdBefore;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public String getSortedBy() {
        return sortedBy;
    }

    public void setSortedBy(String sortedBy) {
        this.sortedBy = sortedBy;
    }

    public Integer getPgSize() {
        return pgSize;
    }

    public void setPgSize(Integer pgSize) {
        this.pgSize = pgSize;
    }

    public Integer getPgNum() {
        return pgNum;
    }

    public void setPgNum(Integer pgNum) {
        this.pgNum = pgNum;
    }
}
