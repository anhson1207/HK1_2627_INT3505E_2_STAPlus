package auth_service.controller;

import auth_service.dto.request.*;
import auth_service.dto.response.*;
import auth_service.entity.User;
import auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

 private final AuthService service;

 @PostMapping("/register")
 ResponseEntity<UserResponse> register(
         @Valid @RequestBody RegisterRequest r
 ) {
  return ResponseEntity
          .status(201)
          .body(service.register(r));
 }

 @PostMapping("/login")
 AuthResponse login(
         @Valid @RequestBody LoginRequest r
 ) {
  return service.login(r);
 }

 @PostMapping("/refresh")
 AccessTokenResponse refresh(
         @Valid @RequestBody RefreshTokenRequest r
 ) {
  return service.refresh(r);
 }

 @PostMapping("/logout")
 ResponseEntity<Void> logout(
         @Valid @RequestBody LogoutRequest r
 ) {
  service.logout(r);
  return ResponseEntity.noContent().build();
 }

 @PostMapping("/forgot-password")
 ForgotPasswordResponse forgot(
         @Valid @RequestBody ForgotPasswordRequest r
 ) {
  return service.forgotPassword(r);
 }

 @PostMapping("/reset-password")
 ResponseEntity<Void> reset(
         @Valid @RequestBody ResetPasswordRequest r
 ) {
  service.resetPassword(r);
  return ResponseEntity.noContent().build();
 }

 @PatchMapping("/password")
 ResponseEntity<Void> password(
         @AuthenticationPrincipal User u,
         @Valid @RequestBody ChangePasswordRequest r
 ) {
  service.changePassword(u, r);
  return ResponseEntity.noContent().build();
 }

 @GetMapping("/me")
 UserResponse me(
         @AuthenticationPrincipal User u
 ) {
  return service.me(u);
 }
}