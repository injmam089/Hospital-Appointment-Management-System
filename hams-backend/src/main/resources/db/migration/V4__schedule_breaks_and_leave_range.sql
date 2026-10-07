-- ============================================================
-- HAMS Database Schema - V4 Schedule Breaks & Leave Range
-- ============================================================

-- DOCTOR BREAKS
CREATE TABLE doctor_breaks (
    id                 BIGSERIAL PRIMARY KEY,
    availability_id    BIGINT NOT NULL REFERENCES doctor_availability(id) ON DELETE CASCADE,
    start_time         TIME NOT NULL,
    end_time           TIME NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_breaks_avail ON doctor_breaks(availability_id);

-- EXTEND DOCTOR LEAVES WITH DATE RANGE SUPPORT
ALTER TABLE doctor_leaves ADD COLUMN start_date DATE;
ALTER TABLE doctor_leaves ADD COLUMN end_date DATE;

-- BACKFILL EXISTING LEAVES
UPDATE doctor_leaves SET start_date = leave_date, end_date = leave_date WHERE start_date IS NULL;

CREATE INDEX idx_doctor_leaves_range ON doctor_leaves(doctor_id, start_date, end_date);
