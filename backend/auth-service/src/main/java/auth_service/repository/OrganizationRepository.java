package auth_service.repository;

import auth_service.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findFirstByOrderByIdAsc();

    boolean existsByOwnerUserId(Long ownerUserId);
}
