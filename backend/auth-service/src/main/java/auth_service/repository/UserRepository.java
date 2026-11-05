
package auth_service.repository;

import auth_service.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

 Optional<User> findByEmail(String email);

 boolean existsByEmail(String email);

 boolean existsByUsername(String username);

 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("SELECT u FROM User u WHERE u.email = :email")
 Optional<User> findByEmailForUpdate(
         @Param("email") String email
 );

 @Query("SELECT u FROM User u WHERE u.status = :status AND u.role IS NOT NULL " +
        "AND (:search IS NULL OR :search = '' " +
        "     OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
        "ORDER BY u.username ASC")
 java.util.List<User> searchColleagues(
         @Param("status") auth_service.entity.UserStatus status,
         @Param("search") String search
 );
}
