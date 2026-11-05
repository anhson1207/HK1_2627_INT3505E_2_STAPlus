package analytics_service.dto.response;

public class RecentActivityResponse {
    private Long id;
    private String type;
    private String description;
    private String timeAgo;

    public RecentActivityResponse() {}

    public RecentActivityResponse(Long id, String type, String description, String timeAgo) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.timeAgo = timeAgo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }
}
