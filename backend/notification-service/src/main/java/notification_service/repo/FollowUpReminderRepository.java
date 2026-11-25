package notification_service.repo;

import notification_service.model.FollowUpReminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowUpReminderRepository extends JpaRepository<FollowUpReminder, Long> {
    List<FollowUpReminder> findAllByOrderByDueAtAsc();
    List<FollowUpReminder> findByUserIdOrderByDueAtAsc(Long userId);
    List<FollowUpReminder> findByEntityTypeAndEntityIdOrderByDueAtAsc(String entityType, Long entityId);
}
