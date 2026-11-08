package auth_service.repository;

import auth_service.entity.JoinRequest;
import auth_service.entity.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    Optional<JoinRequest> findFirstByUserIdOrderByRequestedAtDesc(Long userId);

    List<JoinRequest> findByStatusOrderByRequestedAtDesc(JoinRequestStatus status);

    List<JoinRequest> findAllByOrderByRequestedAtDesc();

    long countByStatus(JoinRequestStatus status);

    boolean existsByUserIdAndStatus(Long userId, JoinRequestStatus status);
}
