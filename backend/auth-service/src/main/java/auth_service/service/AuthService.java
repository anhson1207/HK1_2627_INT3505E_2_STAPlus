package auth_service.service;

import auth_service.dto.request.*;
import auth_service.dto.response.*;
import auth_service.entity.User;

public interface AuthService {

 UserResponse register(RegisterRequest r);

 AuthResponse login(LoginRequest r);

 AccessTokenResponse refresh(RefreshTokenRequest r);

 void logout(LogoutRequest r);

 ForgotPasswordResponse forgotPassword(ForgotPasswordRequest r);

 void resetPassword(ResetPasswordRequest r);

 void changePassword(User user, ChangePasswordRequest r);

 UserResponse me(User user);
}