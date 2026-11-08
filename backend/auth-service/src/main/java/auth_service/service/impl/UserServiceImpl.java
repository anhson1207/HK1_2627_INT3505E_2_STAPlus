package auth_service.service.impl;

import auth_service.dto.request.*;
import auth_service.dto.response.UserResponse;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.exception.ForbiddenException;
import auth_service.exception.UserNotFoundException;
import auth_service.mapper.UserMapper;
import auth_service.repository.UserRepository;
import auth_service.service.AuditLogService;
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
 private final AuditLogService auditLogService;

 public List<UserResponse> findAll() {
  return users.findAll()
          .stream()
          .map(mapper::toResponse)
          .toList();
 }

 public UserResponse findById(Long id) {
  return mapper.toResponse(get(id));
 }

 public UserResponse updateRole(Long id, UpdateRoleRequest r, User actor) {
  User u = get(id);
  var oldRole = u.getRole();

  if (oldRole == Role.ADMIN && r.getRole() != Role.ADMIN) {
   long activeAdminCount = users.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
   if (activeAdminCount <= 1 && u.getStatus() == UserStatus.ACTIVE) {
    throw new ForbiddenException("Không thể hạ quyền Quản trị viên (ADMIN) cuối cùng đang hoạt động trong hệ thống.");
   }
  }

  u.setRole(r.getRole());
  User saved = users.save(u);

  Long actorId = actor != null ? actor.getId() : 1L;
  String actorEmail = actor != null ? actor.getEmail() : "admin@crm.local";
  String actorName = actor != null ? (actor.getFullName() != null ? actor.getFullName() : actor.getUsername()) : "Quản trị viên";
  String actorRole = actor != null && actor.getRole() != null ? actor.getRole().name() : "ADMIN";

  auditLogService.log(
          actorId,
          actorEmail,
          actorName,
          actorRole,
          "ROLE_CHANGE",
          "USER",
          "User",
          saved.getId().toString(),
          "Cập nhật vai trò người dùng '" + saved.getUsername() + "' (" + saved.getEmail() + ") thành " + r.getRole(),
          "127.0.0.1",
          "SUCCESS",
          "{\"oldRole\": \"" + oldRole + "\", \"newRole\": \"" + r.getRole() + "\"}"
  );
  return mapper.toResponse(saved);
 }

 public UserResponse updateStatus(Long id, UpdateUserStatusRequest r, User actor) {
  User u = get(id);
  var oldStatus = u.getStatus();

  if (u.getRole() == Role.ADMIN && oldStatus == UserStatus.ACTIVE && r.getStatus() != UserStatus.ACTIVE) {
   long activeAdminCount = users.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
   if (activeAdminCount <= 1) {
    throw new ForbiddenException("Không thể vô hiệu hóa Quản trị viên (ADMIN) cuối cùng đang hoạt động trong hệ thống.");
   }
  }

  u.setStatus(r.getStatus());
  User saved = users.save(u);

  Long actorId = actor != null ? actor.getId() : 1L;
  String actorEmail = actor != null ? actor.getEmail() : "admin@crm.local";
  String actorName = actor != null ? (actor.getFullName() != null ? actor.getFullName() : actor.getUsername()) : "Quản trị viên";
  String actorRole = actor != null && actor.getRole() != null ? actor.getRole().name() : "ADMIN";

  auditLogService.log(
          actorId,
          actorEmail,
          actorName,
          actorRole,
          "STATUS_CHANGE",
          "USER",
          "User",
          saved.getId().toString(),
          "Thay đổi trạng thái tài khoản '" + saved.getUsername() + "' (" + saved.getEmail() + ") thành " + r.getStatus(),
          "127.0.0.1",
          "SUCCESS",
          "{\"oldStatus\": \"" + oldStatus + "\", \"newStatus\": \"" + r.getStatus() + "\"}"
  );
  return mapper.toResponse(saved);
 }

 private User get(Long id) {
  return users.findById(id)
          .orElseThrow(() ->
                  new UserNotFoundException("User not found")
          );
 }
}