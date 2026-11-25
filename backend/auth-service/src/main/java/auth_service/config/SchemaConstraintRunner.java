package auth_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchemaConstraintRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        syncConstraint("users", "users_role_check", "role IS NULL OR role IN ('ADMIN', 'MANAGER', 'SALES', 'SUPPORT')");
        syncConstraint("users", "users_status_check", "status IN ('PENDING', 'ACTIVE', 'DISABLED', 'REJECTED')");
        syncConstraint("join_requests", "join_requests_assigned_role_check", "assigned_role IS NULL OR assigned_role IN ('ADMIN', 'MANAGER', 'SALES', 'SUPPORT')");
        syncConstraint("join_requests", "join_requests_status_check", "status IN ('PENDING', 'APPROVED', 'REJECTED')");
    }

    private void syncConstraint(String table, String constraint, String checkExpression) {
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS " + table + " DROP CONSTRAINT IF EXISTS " + constraint);
            jdbcTemplate.execute("ALTER TABLE IF EXISTS " + table + " ADD CONSTRAINT " + constraint + " CHECK (" + checkExpression + ")");
        } catch (Exception e) {
            log.debug("Skipping {} update: {}", constraint, e.getMessage());
        }
    }
}
