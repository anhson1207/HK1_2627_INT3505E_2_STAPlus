package auth_service.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String message;

    private int status;

    private LocalDateTime timestamp;
}
