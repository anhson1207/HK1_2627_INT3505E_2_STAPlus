package analytics_service.dto.response;

public class ConversionFunnelResponse {
    private String label;
    private long value;
    private int conversionRate;

    public ConversionFunnelResponse() {}

    public ConversionFunnelResponse(String label, long value, int conversionRate) {
        this.label = label;
        this.value = value;
        this.conversionRate = conversionRate;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getValue() { return value; }
    public void setValue(long value) { this.value = value; }

    public int getConversionRate() { return conversionRate; }
    public void setConversionRate(int conversionRate) { this.conversionRate = conversionRate; }
}
