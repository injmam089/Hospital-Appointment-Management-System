package com.hams.service;

import com.hams.dto.admin.AuditLogResponse;
import com.hams.entity.AuditLog;
import com.hams.entity.User;
import com.hams.repository.AuditLogRepository;
import com.hams.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminAuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AdminAuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public Page<AuditLogResponse> getAuditLogs(
            Long userId,
            String action,
            String entityType,
            Long entityId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        String trimmedAction = (action != null && !action.trim().isEmpty()) ? action.trim() : null;
        String trimmedEntityType = (entityType != null && !entityType.trim().isEmpty()) ? entityType.trim() : null;

        Page<AuditLog> page;
        if (userId == null && trimmedAction == null && trimmedEntityType == null && entityId == null && startDate == null && endDate == null) {
            page = auditLogRepository.findByOrderByCreatedAtDesc(pageable);
        } else {
            page = auditLogRepository.findAuditLogsFiltered(
                    userId,
                    trimmedAction,
                    trimmedEntityType,
                    entityId,
                    startDate,
                    endDate,
                    pageable
            );
        }

        // Preload email cache to prevent N+1 queries
        Map<Long, String> userEmailCache = new HashMap<>();

        return page.map(log -> {
            String actorEmail = null;
            if (log.getUserId() != null) {
                if (userEmailCache.containsKey(log.getUserId())) {
                    actorEmail = userEmailCache.get(log.getUserId());
                } else {
                    actorEmail = userRepository.findById(log.getUserId())
                            .map(User::getEmail)
                            .orElse("user#" + log.getUserId());
                    userEmailCache.put(log.getUserId(), actorEmail);
                }
            }

            return new AuditLogResponse(
                    log.getId(),
                    log.getUserId(),
                    actorEmail,
                    log.getAction(),
                    log.getEntityType(),
                    log.getEntityId(),
                    log.getIpAddress(),
                    sanitizeDetails(log.getDetails()),
                    log.getCreatedAt()
            );
        });
    }

    private String sanitizeDetails(String details) {
        if (details == null) return null;
        // Strict guard against accidental token or password logging
        return details
                .replaceAll("(?i)(password|token|secret|jwt)=\\S+", "$1=***")
                .replaceAll("(?i)(bearer\\s+)[a-zA-Z0-9._\\-]+", "$1***");
    }
}
