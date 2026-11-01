
package auth_service.repository;

import auth_service.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    List<PasswordResetToken> findByUserIdOrderByIdDesc(
            Long userId
    );
}
