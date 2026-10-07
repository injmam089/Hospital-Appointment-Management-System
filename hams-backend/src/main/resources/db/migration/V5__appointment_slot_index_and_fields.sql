-- ============================================================
-- V5: Update Appointment Slot Unique Index & Add End Time
-- ============================================================

-- Drop old partial index if it exists
DROP INDEX IF EXISTS idx_appt_unique_slot;

-- Recreate unique partial index to ensure CANCELLED, REJECTED, NO_SHOW,
-- and RESCHEDULED appointments do NOT block the slot from being booked again
CREATE UNIQUE INDEX idx_appt_unique_slot
    ON appointments(doctor_id, appointment_date, appointment_time)
    WHERE status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED');

-- Add end_time column if not present
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIME;
