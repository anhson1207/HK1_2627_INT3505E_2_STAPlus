package analytics_service.dto.response;

public class LeadSourceStatResponse {
    private String source;
    private long count;

    public LeadSourceStatResponse() {}

    public LeadSourceStatResponse(String source, long count) {
        this.source = source;
        this.count = count;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
