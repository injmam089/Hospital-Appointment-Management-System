package com.hams.repository;

import com.hams.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByOrderByCreatedAtDesc(Pageable pageable);
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(CAST(:userId AS long) IS NULL OR a.userId = :userId) AND " +
           "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', CAST(:action AS string), '%'))) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(CAST(:entityId AS long) IS NULL OR a.entityId = :entityId) AND " +
           "(CAST(:startDate AS timestamp) IS NULL OR a.createdAt >= :startDate) AND " +
           "(CAST(:endDate AS timestamp) IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findAuditLogsFiltered(
        @Param("userId") Long userId,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("entityId") Long entityId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}

