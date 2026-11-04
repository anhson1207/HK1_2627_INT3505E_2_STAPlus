package auth_service.service;

import auth_service.dto.request.CreateAuditLogRequest;
import auth_service.dto.response.AuditLogResponse;
import auth_service.dto.response.AuditLogStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AuditLogService {

    AuditLogResponse recordLog(CreateAuditLogRequest request);

    void log(Long userId, String userEmail, String userName, String userRole,
             String action, String module, String entityType, String entityId,
             String description, String ipAddress, String status, String details);

    Page<AuditLogResponse> getLogs(String module, String action, String status, String q,
                                   LocalDateTime start, LocalDateTime end, Pageable pageable);

    AuditLogStatsResponse getStats();

    byte[] exportCsv(String module, String action, String status, String q,
                     LocalDateTime start, LocalDateTime end);
}

