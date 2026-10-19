package auth_service.controller;
import auth_service.dto.request.*; import auth_service.dto.response.UserResponse; import auth_service.service.UserService;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/v1/users") @RequiredArgsConstructor
public class UserController {
 private final UserService service;
 @GetMapping List<UserResponse> all(){return service.findAll();}
 @GetMapping("/{id}") UserResponse one(@PathVariable Long id){return service.findById(id);}
 @PatchMapping("/{id}/role") UserResponse role(@PathVariable Long id,@Valid @RequestBody UpdateRoleRequest r){return service.updateRole(id,r);}
 @PatchMapping("/{id}/status") UserResponse status(@PathVariable Long id,@Valid @RequestBody UpdateUserStatusRequest r){return service.updateStatus(id,r);}
}
