package analytics_service.repository;

import analytics_service.model.AnalyticsActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalyticsActivityRepository extends JpaRepository<AnalyticsActivity, Long> {
    List<AnalyticsActivity> findTop10ByOrderByCreatedAtDesc();
}
