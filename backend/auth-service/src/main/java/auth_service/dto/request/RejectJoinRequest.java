package auth_service.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectJoinRequest {

    private String reason;
}
