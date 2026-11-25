package auth_service.service;

import auth_service.dto.request.*;
import auth_service.dto.response.UserResponse;
import auth_service.entity.User;

import java.util.List;

public interface UserService {

    List<UserResponse> findAll();

    UserResponse findById(Long id);

    UserResponse createUser(CreateUserRequest r, User actor);

    UserResponse updateUser(Long id, UpdateUserRequest r, User actor);

    UserResponse updateRole(Long id, UpdateRoleRequest r, User actor);

    UserResponse updateStatus(Long id, UpdateUserStatusRequest r, User actor);
}
