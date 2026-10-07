-- ============================================================
-- HAMS Database Schema - V1 Initial Migration
-- ============================================================

-- USERS
CREATE TABLE users (
    id               BIGSERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(20)  NOT NULL CHECK (role IN ('PATIENT','DOCTOR','ADMIN')),
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- DEPARTMENTS
CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(50),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
);

-- PATIENTS
CREATE TABLE patients (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    date_of_birth     DATE,
    gender            VARCHAR(10)  CHECK (gender IN ('MALE','FEMALE','OTHER')),
    phone             VARCHAR(20),
    address           TEXT,
    blood_group       VARCHAR(5),
    emergency_contact VARCHAR(20),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);

-- DOCTORS
CREATE TABLE doctors (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department_id       BIGINT       REFERENCES departments(id) ON DELETE SET NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    specialization      VARCHAR(150) NOT NULL,
    qualification       TEXT,
    experience_years    INTEGER,
    consultation_fee    DECIMAL(10,2),
    bio                 TEXT,
    photo_url           VARCHAR(500),
    is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    phone               VARCHAR(20),
    registration_number VARCHAR(255),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_department ON doctors(department_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);

-- DOCTOR AVAILABILITY
CREATE TABLE doctor_availability (
    id                 BIGSERIAL PRIMARY KEY,
    doctor_id          BIGINT    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week        VARCHAR(10) NOT NULL CHECK (day_of_week IN
                       ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
    start_time         TIME      NOT NULL,
    end_time           TIME      NOT NULL,
    slot_duration_mins INTEGER   NOT NULL DEFAULT 30,
    is_active          BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP,
    UNIQUE (doctor_id, day_of_week)
);

-- DOCTOR LEAVES
CREATE TABLE doctor_leaves (
    id         BIGSERIAL PRIMARY KEY,
    doctor_id  BIGINT    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    leave_date DATE      NOT NULL,
    reason     TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_doctor_leaves_date ON doctor_leaves(doctor_id, leave_date);

-- APPOINTMENTS
CREATE TABLE appointments (
    id                  BIGSERIAL PRIMARY KEY,
    patient_id          BIGINT    NOT NULL REFERENCES patients(id),
    doctor_id           BIGINT    NOT NULL REFERENCES doctors(id),
    appointment_date    DATE      NOT NULL,
    appointment_time    TIME      NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','CHECKED_IN','IN_CONSULTATION',
                                          'COMPLETED','CANCELLED','REJECTED','NO_SHOW','RESCHEDULED')),
    reason              TEXT,
    appointment_ref     VARCHAR(20) UNIQUE,
    cancellation_reason TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP
);

CREATE INDEX idx_appt_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appt_patient ON appointments(patient_id);
CREATE INDEX idx_appt_status ON appointments(status);
-- Unique constraint: one active appointment per doctor per time slot
CREATE UNIQUE INDEX idx_appt_unique_slot
    ON appointments(doctor_id, appointment_date, appointment_time)
    WHERE status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW');

-- CONSULTATIONS
CREATE TABLE consultations (
    id             BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT    NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis      TEXT      NOT NULL,
    notes          TEXT,
    advice         TEXT,
    follow_up_date DATE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP
);

-- PRESCRIPTIONS
CREATE TABLE prescriptions (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT    NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

-- PRESCRIPTION ITEMS
CREATE TABLE prescription_items (
    id              BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT       NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name   VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration        VARCHAR(100),
    instructions    TEXT
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(200) NOT NULL,
    message    TEXT        NOT NULL,
    is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
    type       VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id) WHERE is_read = FALSE;

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   BIGINT,
    ip_address  VARCHAR(45),
    details     TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
