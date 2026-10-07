-- ============================================================
-- HAMS Migration V6: Consultation and Prescription Extensions
-- ============================================================

-- Extend consultations table with direct doctor, patient, and clinical symptom references
ALTER TABLE consultations
    ADD COLUMN IF NOT EXISTS doctor_id BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS patient_id BIGINT REFERENCES patients(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS symptoms TEXT,
    ADD COLUMN IF NOT EXISTS clinical_notes TEXT,
    ADD COLUMN IF NOT EXISTS treatment_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);

-- Extend prescriptions table with direct doctor, patient, and prescription date/instructions
ALTER TABLE prescriptions
    ADD COLUMN IF NOT EXISTS doctor_id BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS patient_id BIGINT REFERENCES patients(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS general_instructions TEXT;

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
