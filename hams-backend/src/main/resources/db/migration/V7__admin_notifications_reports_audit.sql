-- ============================================================
-- HAMS Migration V7: Admin, Notifications, Reports & Audit Indexes
-- ============================================================

-- Fast lookup for user notifications ordered by time
CREATE INDEX IF NOT EXISTS idx_notif_user_created
    ON notifications(user_id, created_at DESC);

-- Fast composite lookup for notification unread status per user
CREATE INDEX IF NOT EXISTS idx_notif_user_read_status
    ON notifications(user_id, is_read);

-- Fast filtering for appointments by status and date
CREATE INDEX IF NOT EXISTS idx_appt_status_date
    ON appointments(status, appointment_date);

-- Fast filtering for audit logs by action and creation date
CREATE INDEX IF NOT EXISTS idx_audit_action_created
    ON audit_logs(action, created_at DESC);

-- Fast filtering for audit logs by entity_type and creation date
CREATE INDEX IF NOT EXISTS idx_audit_entity_created
    ON audit_logs(entity_type, created_at DESC);
