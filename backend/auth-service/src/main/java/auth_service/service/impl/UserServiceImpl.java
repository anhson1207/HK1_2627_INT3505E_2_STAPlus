package auth_service.service.impl;

import auth_service.dto.request.*;
import auth_service.dto.response.UserResponse;
import auth_service.entity.JoinRequestStatus;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.exception.EmailAlreadyExistsException;
import auth_service.exception.ForbiddenException;
import auth_service.exception.UserNotFoundException;
import auth_service.mapper.UserMapper;
import auth_service.repository.JoinRequestRepository;
import auth_service.repository.UserRepository;
import auth_service.service.AuditLogService;
import auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

 private final UserRepository users;
 private final JoinRequestRepository joinRequestRepository;
 private final UserMapper mapper;
 private final AuditLogService auditLogService;
 private final PasswordEncoder encoder;

 public List<UserResponse> findAll() {
  return users.findAll()
          .stream()
          .map(mapper::toResponse)
          .toList();
 }

 public UserResponse findById(Long id) {
  return mapper.toResponse(get(id));
 }

 public UserResponse createUser(CreateUserRequest r, User actor) {
  String normalizedEmail = r.getEmail().trim().toLowerCase();
  if (users.existsByEmail(normalizedEmail)) {
   throw new EmailAlreadyExistsException("Email đã tồn tại trong hệ thống: " + normalizedEmail);
  }

  String baseUsername = normalizedEmail.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
  if (baseUsername.isBlank()) baseUsername = "user";
  String username = baseUsername;
  int suffix = 1;
  while (users.existsByUsername(username)) {
   username = baseUsername + suffix++;
  }

  UserStatus targetStatus = r.getStatus() != null ? r.getStatus() : UserStatus.ACTIVE;
  if (r.getRole() == null && targetStatus == UserStatus.ACTIVE) {
   throw new ForbiddenException("Không thể kích hoạt tài khoản chưa được phân vai trò.");
  }

  String rawPassword = (r.getPassword() != null && !r.getPassword().isBlank())
          ? r.getPassword()
          : "Crm@123456";

  User u = User.builder()
          .username(username)
          .email(normalizedEmail)
          .fullName(r.getFullName().trim())
          .phone(r.getPhone() != null && !r.getPhone().isBlank() ? r.getPhone().trim() : null)
          .department(r.getDepartment() != null && !r.getDepartment().isBlank() ? r.getDepartment().trim() : null)
          .avatarUrl(r.getAvatar() != null && !r.getAvatar().isBlank() ? r.getAvatar().trim() : null)
          .password(encoder.encode(rawPassword))
          .role(r.getRole())
          .status(targetStatus)
          .createdAt(LocalDateTime.now())
          .build();

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
          "CREATE",
          "USER",
          "User",
          saved.getId().toString(),
          "Admin tạo tài khoản người dùng mới '" + saved.getUsername() + "' (" + saved.getEmail() + ")",
          "127.0.0.1",
          "SUCCESS",
          null
  );

  return mapper.toResponse(saved);
 }

 public UserResponse updateUser(Long id, UpdateUserRequest r, User actor) {
  User u = get(id);
  String normalizedEmail = r.getEmail().trim().toLowerCase();

  if (!normalizedEmail.equalsIgnoreCase(u.getEmail()) && users.existsByEmail(normalizedEmail)) {
   throw new EmailAlreadyExistsException("Email đã được sử dụng bởi tài khoản khác: " + normalizedEmail);
  }

  Role targetRole = r.getRole();
  UserStatus targetStatus = r.getStatus() != null ? r.getStatus() : u.getStatus();

  if (u.getRole() == Role.ADMIN && targetRole != Role.ADMIN) {
   long activeAdminCount = users.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
   if (activeAdminCount <= 1 && u.getStatus() == UserStatus.ACTIVE) {
    throw new ForbiddenException("Không thể hạ quyền Quản trị viên (ADMIN) cuối cùng đang hoạt động trong hệ thống.");
   }
  }

  if (u.getRole() == Role.ADMIN && u.getStatus() == UserStatus.ACTIVE && targetStatus != UserStatus.ACTIVE) {
   long activeAdminCount = users.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
   if (activeAdminCount <= 1) {
    throw new ForbiddenException("Không thể vô hiệu hóa Quản trị viên (ADMIN) cuối cùng đang hoạt động trong hệ thống.");
   }
  }

  if (targetRole == null && targetStatus == UserStatus.ACTIVE) {
   throw new ForbiddenException("Không thể kích hoạt tài khoản chưa được phân vai trò.");
  }

  u.setFullName(r.getFullName().trim());
  u.setEmail(normalizedEmail);
  u.setPhone(r.getPhone() != null && !r.getPhone().isBlank() ? r.getPhone().trim() : null);
  u.setDepartment(r.getDepartment() != null && !r.getDepartment().isBlank() ? r.getDepartment().trim() : null);
  if (r.getAvatar() != null) {
   u.setAvatarUrl(!r.getAvatar().isBlank() ? r.getAvatar().trim() : null);
  }
  u.setRole(targetRole);
  u.setStatus(targetStatus);

  User saved = users.save(u);

  Long actorId = actor != null ? actor.getId() : 1L;
  String actorEmail = actor != null ? actor.getEmail() : "admin@crm.local";
  String actorName = actor != null ? (actor.getFullName() != null ? actor.getFullName() : actor.getUsername()) : "Quản trị viên";
  String actorRole = actor != null && actor.getRole() != null ? actor.getRole().name() : "ADMIN";

  syncPendingJoinRequest(saved, saved.getStatus(), actorId);

  auditLogService.log(
          actorId,
          actorEmail,
          actorName,
          actorRole,
          "UPDATE",
          "USER",
          "User",
          saved.getId().toString(),
          "Cập nhật thông tin tài khoản '" + saved.getUsername() + "' (" + saved.getEmail() + ")",
          "127.0.0.1",
          "SUCCESS",
          null
  );

  return mapper.toResponse(saved);
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

  syncPendingJoinRequest(saved, saved.getStatus(), actorId);

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

 /** Keeps any open join request aligned when an admin approves/rejects from User Management. */
 private void syncPendingJoinRequest(User user, UserStatus targetStatus, Long actorId) {
  if (targetStatus != UserStatus.ACTIVE
          && targetStatus != UserStatus.REJECTED
          && targetStatus != UserStatus.DISABLED) {
   return;
  }

  joinRequestRepository.findFirstByUserIdOrderByRequestedAtDesc(user.getId())
          .filter(req -> req.getStatus() == JoinRequestStatus.PENDING)
          .ifPresent(req -> {
           req.setStatus(targetStatus == UserStatus.ACTIVE
                   ? JoinRequestStatus.APPROVED
                   : JoinRequestStatus.REJECTED);
           req.setReviewedBy(actorId);
           req.setReviewedAt(LocalDateTime.now());
           if (targetStatus == UserStatus.ACTIVE) {
            req.setAssignedRole(user.getRole());
           }
           joinRequestRepository.save(req);
          });
 }
}