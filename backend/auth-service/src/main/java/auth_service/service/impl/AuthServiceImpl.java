package auth_service.service.impl;
import auth_service.dto.request.*; import auth_service.dto.response.*; import auth_service.entity.*; import auth_service.exception.*;
import auth_service.jwt.JwtService; import auth_service.mapper.UserMapper; import auth_service.repository.*; import auth_service.service.AuthService;
import lombok.RequiredArgsConstructor; import org.springframework.beans.factory.annotation.Value; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.*; import java.util.UUID;
@Service @RequiredArgsConstructor @Transactional
public class AuthServiceImpl implements AuthService {
 private final UserRepository users; private final RefreshTokenRepository refreshTokens; private final PasswordResetTokenRepository resetTokens;
 private final PasswordEncoder encoder; private final JwtService jwt; private final UserMapper mapper;
 @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs;
 public UserResponse register(RegisterRequest r){
   if(users.existsByEmail(r.getEmail())) throw new EmailAlreadyExistsException("Email already exists");
   if(users.existsByUsername(r.getUsername())) throw new UsernameAlreadyExistsException("Username already exists");
   User u=User.builder().username(r.getUsername()).email(r.getEmail()).password(encoder.encode(r.getPassword()))
    .role(null).status(UserStatus.ACTIVE).createdAt(LocalDateTime.now()).build();
   return mapper.toResponse(users.save(u));
 }
 public AuthResponse login(LoginRequest r){
   User u=users.findByEmail(r.getEmail()).orElseThrow(()->new UserNotFoundException("User not found"));
   if(u.getStatus()!=UserStatus.ACTIVE) throw new ForbiddenException("User account is disabled");
   if(!encoder.matches(r.getPassword(),u.getPassword())) throw new InvalidPasswordException("Invalid credentials");
   if(u.getRole()==null) throw new RoleNotAssignedException("Role has not been assigned by ADMIN");
   String rt=UUID.randomUUID().toString();
   refreshTokens.save(RefreshToken.builder().token(rt).user(u).expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs))).revoked(false).build());
   return AuthResponse.builder().accessToken(jwt.generateAccessToken(u)).refreshToken(rt).tokenType("Bearer").username(u.getUsername()).role(u.getRole()).message("Login successful").build();
 }
 public AccessTokenResponse refresh(RefreshTokenRequest r){
   RefreshToken t=refreshTokens.findByToken(r.getRefreshToken()).orElseThrow(()->new InvalidTokenException("Invalid refresh token"));
   if(t.isRevoked()||t.getExpiresAt().isBefore(LocalDateTime.now())) throw new InvalidTokenException("Refresh token expired or revoked");
   User u=users.findById(t.getUser().getId()).orElseThrow(()->new UserNotFoundException("User not found"));
   if(u.getStatus()!=UserStatus.ACTIVE||u.getRole()==null) throw new ForbiddenException("User cannot receive a new access token");
   return AccessTokenResponse.builder().accessToken(jwt.generateAccessToken(u)).tokenType("Bearer").build();
 }
 public void logout(LogoutRequest r){ RefreshToken t=refreshTokens.findByToken(r.getRefreshToken()).orElseThrow(()->new InvalidTokenException("Invalid refresh token")); t.setRevoked(true); refreshTokens.save(t); }
 public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest r){
   User u=users.findByEmail(r.getEmail()).orElse(null);
   if(u==null) return ForgotPasswordResponse.builder().message("If the email exists, a reset token has been created").build();
   String token=UUID.randomUUID().toString();
   resetTokens.save(PasswordResetToken.builder().token(token).user(u).expiresAt(LocalDateTime.now().plusMinutes(15)).used(false).build());
   return ForgotPasswordResponse.builder().message("Reset token created for development/testing").resetToken(token).build();
 }
 public void resetPassword(ResetPasswordRequest r){
   PasswordResetToken t=resetTokens.findByToken(r.getToken()).orElseThrow(()->new InvalidTokenException("Invalid reset token"));
   if(t.isUsed()||t.getExpiresAt().isBefore(LocalDateTime.now())) throw new InvalidTokenException("Reset token expired or used");
   User u=t.getUser(); u.setPassword(encoder.encode(r.getNewPassword())); users.save(u); t.setUsed(true); resetTokens.save(t); refreshTokens.revokeAllByUserId(u.getId());
 }
 public void changePassword(User u,ChangePasswordRequest r){
   if(!encoder.matches(r.getCurrentPassword(),u.getPassword())) throw new InvalidPasswordException("Current password is incorrect");
   u.setPassword(encoder.encode(r.getNewPassword())); users.save(u); refreshTokens.revokeAllByUserId(u.getId());
 }
 public UserResponse me(User u){ return mapper.toResponse(users.findById(u.getId()).orElseThrow(()->new UserNotFoundException("User not found"))); }
}
