package auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceResponse {

    private Long id;
    private Long userId;
    private Boolean chatToast;
    private Boolean chatSound;
    private Boolean chatBrowser;
    private Boolean chatGroupEvents;
    private Boolean notifyLeadAssigned;
    private Boolean notifyDealStage;
    private Boolean notifyTicket;
    private Boolean notifySystem;
    private String reminderBefore;
    private String themeMode;
    private String tableDensity;
    private Boolean sidebarCollapsed;
    private String dateFormat;
    private LocalDateTime updatedAt;
}
