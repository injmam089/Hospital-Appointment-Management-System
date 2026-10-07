-- V3 Migration: Add verification_status to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
UPDATE doctors SET verification_status = 'APPROVED' WHERE is_verified = TRUE;
