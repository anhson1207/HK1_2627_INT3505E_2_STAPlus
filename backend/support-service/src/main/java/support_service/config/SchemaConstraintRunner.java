package support_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaConstraintRunner implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(SchemaConstraintRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public SchemaConstraintRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_priority_check");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS tickets ADD CONSTRAINT tickets_priority_check CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))");
        } catch (Exception e) {
            log.debug("Skipping constraint update (e.g. H2 test DB): {}", e.getMessage());
        }
    }
}
