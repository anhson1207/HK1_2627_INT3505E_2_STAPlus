package auth_service.service.impl;

import auth_service.dto.request.CreateAuditLogRequest;
import auth_service.dto.response.AuditLogResponse;
import auth_service.dto.response.AuditLogStatsResponse;
import auth_service.entity.AuditLog;
import auth_service.repository.AuditLogRepository;
import auth_service.service.AuditLogService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public AuditLogResponse recordLog(CreateAuditLogRequest req) {
        AuditLog auditLog = AuditLog.builder()
                .timestamp(LocalDateTime.now())
                .userId(req.getUserId())
                .userEmail(req.getUserEmail())
                .userName(req.getUserName())
                .userRole(req.getUserRole())
                .action(req.getAction() != null ? req.getAction().toUpperCase() : "UNKNOWN")
                .module(req.getModule() != null ? req.getModule().toUpperCase() : "SYSTEM")
                .entityType(req.getEntityType())
                .entityId(req.getEntityId())
                .description(req.getDescription() != null ? req.getDescription() : "Thao tác hệ thống")
                .ipAddress(req.getIpAddress())
                .status(req.getStatus() != null ? req.getStatus().toUpperCase() : "SUCCESS")
                .details(req.getDetails())
                .build();

        AuditLog saved = auditLogRepository.save(auditLog);
        return mapToResponse(saved);
    }

    @Override
    public void log(Long userId, String userEmail, String userName, String userRole,
                    String action, String module, String entityType, String entityId,
                    String description, String ipAddress, String status, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .userId(userId)
                    .userEmail(userEmail)
                    .userName(userName)
                    .userRole(userRole)
                    .action(action != null ? action.toUpperCase() : "UNKNOWN")
                    .module(module != null ? module.toUpperCase() : "SYSTEM")
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .ipAddress(ipAddress)
                    .status(status != null ? status.toUpperCase() : "SUCCESS")
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.error("Failed to write audit log asynchronously: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(String module, String action, String status, String q,
                                          LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (module != null && !module.isBlank() && !"ALL".equalsIgnoreCase(module)) {
                predicates.add(cb.equal(cb.upper(root.get("module")), module.toUpperCase()));
            }

            if (action != null && !action.isBlank() && !"ALL".equalsIgnoreCase(action)) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.toUpperCase()));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
            }

            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
            }

            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
            }

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase() + "%";
                Predicate qDesc = cb.like(cb.lower(root.get("description")), pattern);
                Predicate qEmail = cb.like(cb.lower(root.get("userEmail")), pattern);
                Predicate qName = cb.like(cb.lower(root.get("userName")), pattern);
                Predicate qEntityId = cb.like(cb.lower(root.get("entityId")), pattern);
                predicates.add(cb.or(qDesc, qEmail, qName, qEntityId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogStatsResponse getStats() {
        long totalLogs = auditLogRepository.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        long todayLogs = auditLogRepository.countByTimestampBetween(startOfToday, endOfToday);

        long successCount = auditLogRepository.countByStatus("SUCCESS");
        long failedCount = auditLogRepository.countByStatus("FAILED");

        Map<String, Long> moduleCounts = new HashMap<>();
        for (Object[] row : auditLogRepository.countByModuleGroup()) {
            if (row[0] != null && row[1] != null) {
                moduleCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        Map<String, Long> actionCounts = new HashMap<>();
        for (Object[] row : auditLogRepository.countByActionGroup()) {
            if (row[0] != null && row[1] != null) {
                actionCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        return AuditLogStatsResponse.builder()
                .totalLogs(totalLogs)
                .todayLogs(todayLogs)
                .successCount(successCount)
                .failedCount(failedCount)
                .moduleCounts(moduleCounts)
                .actionCounts(actionCounts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(String module, String action, String status, String q,
                            LocalDateTime start, LocalDateTime end) {
        Page<AuditLogResponse> logsPage = getLogs(module, action, status, q, start, end, Pageable.unpaged());
        List<AuditLogResponse> list = logsPage.getContent();

        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM for Excel
        sb.append('\ufeff');
        sb.append("ID,Thời gian,Người thực hiện,Email,Vai trò,Thao tác,Phân hệ,Đối tượng,Mã đối tượng,Mô tả,IP,Trạng thái\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        for (AuditLogResponse logItem : list) {
            sb.append(logItem.getId()).append(",");
            sb.append(escapeCsv(logItem.getTimestamp() != null ? logItem.getTimestamp().format(dtf) : "")).append(",");
            sb.append(escapeCsv(logItem.getUserName())).append(",");
            sb.append(escapeCsv(logItem.getUserEmail())).append(",");
            sb.append(escapeCsv(logItem.getUserRole())).append(",");
            sb.append(escapeCsv(logItem.getAction())).append(",");
            sb.append(escapeCsv(logItem.getModule())).append(",");
            sb.append(escapeCsv(logItem.getEntityType())).append(",");
            sb.append(escapeCsv(logItem.getEntityId())).append(",");
            sb.append(escapeCsv(logItem.getDescription())).append(",");
            sb.append(escapeCsv(logItem.getIpAddress())).append(",");
            sb.append(escapeCsv(logItem.getStatus())).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }

    private AuditLogResponse mapToResponse(AuditLog item) {
        return AuditLogResponse.builder()
                .id(item.getId())
                .timestamp(item.getTimestamp())
                .userId(item.getUserId())
                .userEmail(item.getUserEmail())
                .userName(item.getUserName())
                .userRole(item.getUserRole())
                .action(item.getAction())
                .module(item.getModule())
                .entityType(item.getEntityType())
                .entityId(item.getEntityId())
                .description(item.getDescription())
                .ipAddress(item.getIpAddress())
                .status(item.getStatus())
                .details(item.getDetails())
                .build();
    }
}

