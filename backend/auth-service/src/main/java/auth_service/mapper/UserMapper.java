package auth_service.mapper;
import auth_service.dto.response.UserResponse; import auth_service.entity.User; import org.springframework.stereotype.Component;
@Component public class UserMapper {
 public UserResponse toResponse(User u){ return UserResponse.builder().id(u.getId()).username(u.getUsername()).email(u.getEmail()).role(u.getRole()).status(u.getStatus()).build(); }
}
