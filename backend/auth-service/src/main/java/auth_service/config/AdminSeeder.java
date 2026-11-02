package auth_service.config;

import auth_service.entity.*;
import auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email}")
    String email;

    @Value("${app.admin.password}")
    String password;

    @Value("${app.admin.username}")
    String username;

    public void run(String... args) {
        User u = users.findByEmail(email).orElse(null);

        if (u == null) {
            users.save(
                    User.builder()
                            .username(username)
                            .email(email)
                            .password(encoder.encode(password))
                            .role(Role.ADMIN)
                            .status(UserStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .build()
            );
        } else {
            boolean changed = false;

            if (u.getRole() != Role.ADMIN) {
                u.setRole(Role.ADMIN);
                changed = true;
            }

            if (u.getStatus() != UserStatus.ACTIVE) {
                u.setStatus(UserStatus.ACTIVE);
                changed = true;
            }

            if (changed) {
                users.save(u);
            }
        }
    }
}