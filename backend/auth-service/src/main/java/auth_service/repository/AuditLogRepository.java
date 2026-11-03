package auth_service.repository;

import auth_service.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    long countByTimestampBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(String status);

    @Query("SELECT a.module, COUNT(a) FROM AuditLog a GROUP BY a.module")
    List<Object[]> countByModuleGroup();

    @Query("SELECT a.action, COUNT(a) FROM AuditLog a GROUP BY a.action")
    List<Object[]> countByActionGroup();
}
