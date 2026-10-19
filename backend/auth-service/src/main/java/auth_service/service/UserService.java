package auth_service.service;
import auth_service.dto.request.*; import auth_service.dto.response.UserResponse; import java.util.List;
public interface UserService { List<UserResponse> findAll(); UserResponse findById(Long id); UserResponse updateRole(Long id,UpdateRoleRequest r); UserResponse updateStatus(Long id,UpdateUserStatusRequest r); }
