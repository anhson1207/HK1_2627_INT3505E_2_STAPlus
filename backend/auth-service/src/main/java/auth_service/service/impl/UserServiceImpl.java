package auth_service.service.impl;

import auth_service.dto.request.*;
import auth_service.dto.response.UserResponse;
import auth_service.entity.User;
import auth_service.exception.UserNotFoundException;
import auth_service.mapper.UserMapper;
import auth_service.repository.UserRepository;
import auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

 private final UserRepository users;
 private final UserMapper mapper;

 public List<UserResponse> findAll() {
  return users.findAll()
          .stream()
          .map(mapper::toResponse)
          .toList();
 }

 public UserResponse findById(Long id) {
  return mapper.toResponse(get(id));
 }

 public UserResponse updateRole(Long id, UpdateRoleRequest r) {
  User u = get(id);
  u.setRole(r.getRole());
  return mapper.toResponse(users.save(u));
 }

 public UserResponse updateStatus(Long id, UpdateUserStatusRequest r) {
  User u = get(id);
  u.setStatus(r.getStatus());
  return mapper.toResponse(users.save(u));
 }

 private User get(Long id) {
  return users.findById(id)
          .orElseThrow(() ->
                  new UserNotFoundException("User not found")
          );
 }
}