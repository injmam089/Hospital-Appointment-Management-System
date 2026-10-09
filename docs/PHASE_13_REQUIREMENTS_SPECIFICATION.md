# HAMS Phase 13 — Requirements Specification Document

**Project:** Hospital Appointment Management System (HAMS)  
**Academic Context:** BCA Final-Year Project  
**Methodology:** Formal Software Requirements Specification (SRS)  
**Status:** Grounded in Completed Implementation  

---

## 1. Introduction & Project Scope

The Hospital Appointment Management System (HAMS) is a digital healthcare management platform designed to automate appointment bookings, schedule management, clinical records documentation, digital prescriptions, and administrative governance.

### 1.1 In-Scope Capabilities
- User authentication and role-based access control for Patients, Doctors, and Administrators.
- Public medical department discovery and verified physician search.
- Doctor weekly availability management, intra-shift breaks, and leave requests.
- Real-time patient appointment booking with database-level double-booking prevention.
- Appointment lifecycle progression (`PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`).
- Doctor clinical workstation: consultation notes recording and multi-item digital prescription issuance.
- Administrative oversight: user account activation/deactivation, doctor credential verification, department management, and operational volume reports.
- **Secure Administrative Audit Trail** recording sensitive operational actions.
- In-app notification center for status updates and alerts.

### 1.2 Out-of-Scope Capabilities (Not Implemented)
- External third-party payment gateway integration.
- Video conferencing or telemedicine streaming.
- Native mobile applications (iOS/Android) — mobile access is delivered via responsive web interface.
- AI-based diagnosis or predictive clinical machine learning.
- Direct multi-hospital federated database integration.

---

## 2. User Roles & Personas

| Role Identifier | Description & System Permissions |
|---|---|
| `ROLE_PATIENT` | End-user seeking healthcare. Can browse doctors, check availability, book/reschedule/cancel appointments, view consultation notes, access prescriptions, and manage demographic profile. |
| `ROLE_DOCTOR` | Licensed medical practitioner. Can define recurring availability, manage breaks, submit leaves, review daily patient queue, check-in patients, document consultations, and generate digital prescriptions. |
| `ROLE_ADMIN` | Hospital administrative authority. Has global visibility over system metrics, user statuses, doctor verification workflows, department catalog, full appointment logs, operational reports, and the Secure Administrative Audit Trail. |

---

## 3. Functional Requirements (FR)

### Module 1: Authentication & Access Control
- **FR-AUTH-01:** The system shall allow new patients to register with an email, password, and demographic details.
- **FR-AUTH-02:** The system shall authenticate users using email and password, issuing an HMAC-SHA256 signed Access Token (15-minute validity) and Refresh Token (7-day validity).
- **FR-AUTH-03:** The system shall throttle authentication attempts to a maximum of 10 requests per minute per IP address.
- **FR-AUTH-04:** The system shall hash all passwords using BCrypt with a minimum work factor (cost) of 12.
- **FR-AUTH-05:** The system shall enforce role-based access control across all restricted endpoints, returning HTTP 403 Forbidden on unauthorized role attempts.

### Module 2: Doctor Discovery & Availability
- **FR-DOC-01:** The system shall allow public browsing and search of doctors filtered by medical department or name.
- **FR-DOC-02:** The system shall compute real-time available time slots for any doctor on a chosen future date, factoring in recurring weekly hours, intra-shift breaks, scheduled leaves, and pre-existing bookings.
- **FR-DOC-03:** Doctors shall be able to configure their weekly practice schedules and slot duration (default: 30 minutes).
- **FR-DOC-04:** Doctors shall be able to register planned leaves across single dates or multi-day date ranges.

### Module 3: Appointment Scheduling & Concurrency
- **FR-APPT-01:** Patients shall be able to reserve an open 30-minute time slot with an active doctor.
- **FR-APPT-02:** The system shall prevent double-booking of any active appointment slot through PostgreSQL partial unique index `idx_appt_unique_slot`, returning HTTP 409 Conflict upon collision.
- **FR-APPT-03:** Patients shall be able to reschedule or cancel existing appointments.
- **FR-APPT-04:** Upon cancellation or rescheduling, the previous slot shall be immediately released for other patients without deleting history.

### Module 4: Clinical Consultation & Digital Prescriptions
- **FR-CLIN-01:** Doctors shall have access to a daily appointment queue showing patient statuses.
- **FR-CLIN-02:** Doctors shall be able to update visit status from `CONFIRMED` to `CHECKED_IN` and `IN_CONSULTATION`.
- **FR-CLIN-03:** Doctors shall be able to record clinical findings (symptoms, diagnosis, clinical notes, advice, follow-up date).
- **FR-CLIN-04:** Doctors shall be able to issue digital prescriptions comprising medication names, dosages, frequencies, durations, and instructions.
- **FR-CLIN-05:** Completing a consultation shall atomically transition the appointment status to `COMPLETED` and trigger a `PRESCRIPTION_READY` notification to the patient.

### Module 5: Administrative Governance & Audit Trail
- **FR-ADM-01:** Administrators shall view hospital-wide operational metrics (total patients, active doctors, today's appointments).
- **FR-ADM-02:** Administrators shall be able to activate or deactivate user accounts.
- **FR-ADM-03:** Administrators shall review pending doctor registrations and approve or reject their credentials.
- **FR-ADM-04:** Administrators shall be able to create and update medical departments.
- **FR-ADM-05:** The system shall log administrative and clinical lifecycle actions into a persistent **Secure Administrative Audit Trail** accessible only by administrators.

### Module 6: Notifications
- **FR-NOTIF-01:** The system shall generate in-app notifications for appointment bookings, confirmations, cancellations, reminders, and prescription readiness.
- **FR-NOTIF-02:** Users shall be able to view their notification history, observe an unread badge counter, and mark notifications as read.

---

## 4. Non-Functional Requirements (NFR)

| Identifier | Category | Requirement Specification |
|---|---|---|
| **NFR-SEC-01** | Security | All API communications must support TLS/HTTPS encryption. |
| **NFR-SEC-02** | Security | Enforce security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and CSP. |
| **NFR-SEC-03** | Security | Sanitize all error responses via RFC 7807 `ProblemDetail` without exposing database or framework stack traces. |
| **NFR-PERF-01**| Performance | Client-side search inputs must be debounced by at least 300ms to reduce unnecessary server load. |
| **NFR-PERF-02**| Performance | Frontend main entry bundle size must remain under 50 kB gzipped via Vite manual chunking. |
| **NFR-A11Y-01**| Accessibility | All interactive buttons and touch triggers must meet the 44x44px minimum touch target size. |
| **NFR-A11Y-02**| Accessibility | Modal dialogs must trap keyboard focus, provide `aria-modal="true"`, and dismiss on `Escape` key. |
| **NFR-RESP-01**| Responsiveness | Web layout must render cleanly across viewports from 375px (mobile) to 1920px (desktop) with zero horizontal overflow. |
| **NFR-DATA-01**| Reliability | Relational data integrity must be maintained using foreign keys, cascade rules, and Flyway migration tracking. |
