package auth_service.repository;

import auth_service.entity.CompanyInvitation;
import auth_service.entity.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyInvitationRepository extends JpaRepository<CompanyInvitation, Long> {

    Optional<CompanyInvitation> findByCode(String code);

    Optional<CompanyInvitation> findByTokenHash(String tokenHash);

    List<CompanyInvitation> findAllByOrderByCreatedAtDesc();

    List<CompanyInvitation> findByStatusOrderByCreatedAtDesc(InvitationStatus status);
}
