package chat_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddGroupMembersRequest {

    @NotEmpty(message = "Danh sách ID thành viên không được để trống")
    private List<Long> userIds;
}

