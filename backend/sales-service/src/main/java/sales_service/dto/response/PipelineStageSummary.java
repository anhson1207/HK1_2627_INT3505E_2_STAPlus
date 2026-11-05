package sales_service.dto.response;

public class PipelineStageSummary {
    private String stage;
    private long count;
    private double totalValue;

    public PipelineStageSummary() {}

    public PipelineStageSummary(String stage, long count, double totalValue) {
        this.stage = stage;
        this.count = count;
        this.totalValue = totalValue;
    }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public double getTotalValue() { return totalValue; }
    public void setTotalValue(double totalValue) { this.totalValue = totalValue; }
}

