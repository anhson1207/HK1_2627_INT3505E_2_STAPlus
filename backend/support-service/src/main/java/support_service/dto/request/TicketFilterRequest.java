package support_service.dto.request;


import support_service.model.enums.Priority;

import java.time.LocalDateTime;

public class TicketFilterRequest {
    //private String priority;
    private Priority priority;
    private String status;
    private Long salesId;
    private Long supportId;
    private LocalDateTime createdAfter;
    private LocalDateTime createdBefore;
    private String order = "desc";
    private String sortedBy = "createdAt";

    private Integer pgSize;
    private Integer pgNum;

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

    public String getSortedBy() {
        return sortedBy;
    }

    public void setSortedBy(String sortedBy) {
        this.sortedBy = sortedBy;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }



    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSalesId() {
        return salesId;
    }

    public void setSalesId(Long salesId) {
        this.salesId = salesId;
    }

    public Long getSupportId() {
        return supportId;
    }

    public void setSupportId(Long supportId) {
        this.supportId = supportId;
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
}
