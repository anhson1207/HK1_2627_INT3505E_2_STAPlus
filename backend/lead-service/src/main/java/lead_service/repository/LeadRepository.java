package lead_service.repository;

import lead_service.entity.Lead;
import lead_service.entity.LeadSource;
import lead_service.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    @Query("""
            select l from Lead l
            where (:status is null or l.status = :status)
              and (:source is null or l.source = :source)
              and (:assignedUserId is null or l.assignedUserId = :assignedUserId)
              and (
                   lower(l.fullName) like lower(concat('%', :q, '%'))
                   or lower(coalesce(l.email, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(l.phone, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(l.company, '')) like lower(concat('%', :q, '%'))
              )
            """)
    Page<Lead> search(
            @Param("q") String q,
            @Param("status") LeadStatus status,
            @Param("source") LeadSource source,
            @Param("assignedUserId") Long assignedUserId,
            Pageable pageable
    );
}