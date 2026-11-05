package analytics_service.dto.response;

public class DealStageStatResponse {
    private String stage;
    private long count;
    private double value;

    public DealStageStatResponse() {}

    public DealStageStatResponse(String stage, long count, double value) {
        this.stage = stage;
        this.count = count;
        this.value = value;
    }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
}
