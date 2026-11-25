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

    @Value("${app.demo-users.enabled:false}")
    boolean demoUsersEnabled;

    @Value("${app.sales.email:sales@crm.local}")
    String salesEmail;

    @Value("${app.sales.username:sales}")
    String salesUsername;

    @Value("${app.sales.password:Sales@123456}")
    String salesPassword;

    @Value("${app.support.email:support@crm.local}")
    String supportEmail;

    @Value("${app.support.username:support}")
    String supportUsername;

    @Value("${app.support.password:Support@123456}")
    String supportPassword;

    @Override
    public void run(String... args) {
        seedAccount(username, email, password, null, null, Role.ADMIN);
        if (demoUsersEnabled) {
            seedAccount(
                    salesUsername,
                    salesEmail,
                    salesPassword,
                    "Nhân viên Kinh doanh (Demo)",
                    "Kinh doanh",
                    Role.SALES
            );
            seedAccount(
                    supportUsername,
                    supportEmail,
                    supportPassword,
                    "Nhân viên Hỗ trợ (Demo)",
                    "Chăm sóc khách hàng",
                    Role.SUPPORT
            );
        }
    }

    private void seedAccount(
            String targetUsername,
            String targetEmail,
            String rawPassword,
            String fullName,
            String department,
            Role role
    ) {
        User u = users.findByEmail(targetEmail)
                .or(() -> users.findByUsernameIgnoreCase(targetUsername))
                .orElse(null);

        if (u == null) {
            users.save(
                    User.builder()
                            .username(targetUsername)
                            .email(targetEmail)
                            .password(encoder.encode(rawPassword))
                            .fullName(fullName)
                            .department(department)
                            .role(role)
                            .status(UserStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .build()
            );
            return;
        }

        boolean changed = false;
        if (u.getRole() != role) {
            u.setRole(role);
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