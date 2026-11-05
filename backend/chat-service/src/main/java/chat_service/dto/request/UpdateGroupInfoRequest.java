package chat_service.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGroupInfoRequest {

    @Size(max = 255, message = "Tên nhóm không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 500, message = "Đường dẫn ảnh không được vượt quá 500 ký tự")
    private String avatarUrl;
}

