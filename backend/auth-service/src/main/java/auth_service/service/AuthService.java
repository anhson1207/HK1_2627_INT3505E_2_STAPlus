package auth_service.service;

import auth_service.dto.request.LoginRequest;
import auth_service.dto.request.RegisterRequest;
import auth_service.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}