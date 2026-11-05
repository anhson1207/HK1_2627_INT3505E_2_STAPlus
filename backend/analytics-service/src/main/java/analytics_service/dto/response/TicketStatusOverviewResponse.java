package analytics_service.dto.response;

import java.util.List;

public class TicketStatusOverviewResponse {
    public static class StatusItem {
        private String status;
        private long count;

        public StatusItem() {}
        public StatusItem(String status, long count) {
            this.status = status;
            this.count = count;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    private List<StatusItem> statuses;
    private long urgentCount;

    public TicketStatusOverviewResponse() {}
    public TicketStatusOverviewResponse(List<StatusItem> statuses, long urgentCount) {
        this.statuses = statuses;
        this.urgentCount = urgentCount;
    }

    public List<StatusItem> getStatuses() { return statuses; }
    public void setStatuses(List<StatusItem> statuses) { this.statuses = statuses; }

    public long getUrgentCount() { return urgentCount; }
    public void setUrgentCount(long urgentCount) { this.urgentCount = urgentCount; }
}

