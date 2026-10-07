package com.hams.dto.admin;

import java.time.LocalDateTime;

public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String actorEmail;
    private String action;
    private String entityType;
    private Long entityId;
    private String ipAddress;
    private String details;
    private LocalDateTime createdAt;

    public AuditLogResponse() {
    }

    public AuditLogResponse(Long id, Long userId, String actorEmail, String action,
                            String entityType, Long entityId, String ipAddress,
                            String details, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.ipAddress = ipAddress;
        this.details = details;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
