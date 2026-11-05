package analytics_service.repository;

import analytics_service.model.DailyMetricSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyMetricSnapshotRepository extends JpaRepository<DailyMetricSnapshot, Long> {
    Optional<DailyMetricSnapshot> findByMetricDate(LocalDate metricDate);
    List<DailyMetricSnapshot> findByMetricDateBetweenOrderByMetricDateAsc(LocalDate start, LocalDate end);
}

