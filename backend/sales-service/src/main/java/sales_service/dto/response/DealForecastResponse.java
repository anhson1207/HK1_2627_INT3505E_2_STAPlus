package sales_service.dto.response;

import java.util.List;

public class DealForecastResponse {
    private double totalPipelineValue;
    private double weightedForecastValue;
    private long totalDeals;
    private List<PipelineStageSummary> stages;

    public DealForecastResponse() {}

    public DealForecastResponse(double totalPipelineValue, double weightedForecastValue, long totalDeals, List<PipelineStageSummary> stages) {
        this.totalPipelineValue = totalPipelineValue;
        this.weightedForecastValue = weightedForecastValue;
        this.totalDeals = totalDeals;
        this.stages = stages;
    }

    public double getTotalPipelineValue() { return totalPipelineValue; }
    public void setTotalPipelineValue(double totalPipelineValue) { this.totalPipelineValue = totalPipelineValue; }

    public double getWeightedForecastValue() { return weightedForecastValue; }
    public void setWeightedForecastValue(double weightedForecastValue) { this.weightedForecastValue = weightedForecastValue; }

    public long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(long totalDeals) { this.totalDeals = totalDeals; }

    public List<PipelineStageSummary> getStages() { return stages; }
    public void setStages(List<PipelineStageSummary> stages) { this.stages = stages; }
}

