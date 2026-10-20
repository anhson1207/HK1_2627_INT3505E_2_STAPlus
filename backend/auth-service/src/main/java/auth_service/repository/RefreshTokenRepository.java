package auth_service.repository;
import auth_service.entity.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
 Optional<RefreshToken> findByToken(String token);
 @Modifying @Query("update RefreshToken r set r.revoked=true where r.user.id=:userId and r.revoked=false")
 int revokeAllByUserId(@Param("userId") Long userId);
}
