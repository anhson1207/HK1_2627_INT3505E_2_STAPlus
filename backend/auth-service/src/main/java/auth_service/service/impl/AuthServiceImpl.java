package auth_service.service.impl;

import auth_service.dto.request.LoginRequest;
import auth_service.dto.request.RegisterRequest;
import auth_service.dto.response.AuthResponse;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.exception.EmailAlreadyExistsException;
import auth_service.exception.InvalidPasswordException;
import auth_service.exception.UserNotFoundException;
import auth_service.jwt.JwtService;
import auth_service.repository.UserRepository;
import auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "Email already exists"
            );
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(Role.SALES)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        return AuthResponse.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .message("Register successful")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail())
                .orElseThrow(() ->
                new UserNotFoundException(
                        "User not found"
                ));

        boolean matches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!matches) {
            throw new InvalidPasswordException(
                    "Invalid password"
            );
        }

        String token =
                jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}