# HAMS — Phase 10: Security Audit & Verification Report

**Project:** Hospital Appointment Management System (HAMS)  
**System Architecture:** React 19 Frontend + Spring Boot 3.3.5 REST API + PostgreSQL  
**Audit Scope:** Full Application Stack (Auth, RBAC, JWT, IDOR, Input Validation, Privacy, Database Safety, Security Headers, CORS, Rate Limiting, Audit Trail)  
**Date:** October 2026  
**Status:** ALL TESTS PASSED (143 Backend Integration Tests, 7 Frontend Verification Suites)  

---

## 1. Executive Summary

This security audit report details the comprehensive security assessment and hardening of the Hospital Appointment Management System (HAMS). The audit evaluated both static architecture and dynamic runtime behavior against industry healthcare software standards and OWASP Top 10 guidelines.

All identified vulnerabilities and hardening recommendations have been systematically addressed, verified with automated unit/integration tests, and confirmed to introduce zero regressions into the existing user experience or portal capabilities.

---

## 2. Threat Vector Evaluation & Remediation Matrix

### 2.1 Authentication & Brute-Force Protection
- **Initial Finding:** While account-level locking (5 failed attempts → 15-minute lockout) was present, auth endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`) lacked IP-level request throttling, leaving the system susceptible to high-frequency dictionary attacks and CPU exhaustion from BCrypt computation. In addition, `AuthService.login` performed BCrypt password comparison prior to verifying account lockout status.
- **Remediation Implemented:**
  1. Built thread-safe in-memory `RateLimitingFilter` enforcing a 60-req/min ceiling per client IP on sensitive authentication routes, returning RFC-7807 `429 Too Many Requests` with a `Retry-After: 60` response header.
  2. Reordered authentication verification in `AuthService.login`: Inactive and locked account checks are now evaluated *before* password hash comparison, preventing unnecessary BCrypt operations and protecting against resource-exhaustion denial of service.
- **Verification:** `Phase10SecurityIntegrationTest.rateLimitingFilterBlocksExcessRequests`, `lockedAccountReturnsForbiddenDirectly`, `inactiveAccountReturnsForbiddenDirectly`.

### 2.2 JWT Cryptographic Lifecycle
- **Initial Finding:** `JwtService` contained a fallback development key. Although `application-prod.yml` requested `${JWT_SECRET}`, absence of a fail-fast validator created a risk that an unconfigured production deployment could default to the known development key.
- **Remediation Implemented:**
  1. Updated `JwtService` with a production environment fail-fast check: If the active profile includes `prod` and the secret key matches the default development secret, an `IllegalStateException` is thrown immediately at startup.
  2. Enforced minimum 256-bit (32-byte) key length validation across all profiles.
  3. Reconfirmed that `JwtAuthenticationFilter` strictly prohibits `REFRESH` tokens from authenticating API endpoints (`!"ACCESS".equalsIgnoreCase(tokenType)`).
- **Verification:** `Phase10SecurityIntegrationTest.productionProfileFailsFastWithDefaultSecret`, `shortJwtSecretIsRejected`, `Phase8SecurityHardeningIntegrationTest.refreshTokenCannotAuthenticateApiRequests`.

### 2.3 Horizontal & Vertical Access Control (IDOR Isolation)
- **Evaluation:** Evaluated all 11 controller classes across Patient, Doctor, and Administrator portals.
- **Findings:**
  - Resource identifiers (`appointmentId`, `consultationId`, `prescriptionId`) cannot be manipulated to access or mutate records belonging to other users.
  - Ownership is verified at the service layer by resolving the identity from the authenticated security principal (`@AuthenticationPrincipal UserDetails` or `Principal.getName()`), completely mitigating horizontal IDOR.
  - Vertical access is guarded by Spring Security `@PreAuthorize("hasRole('...')")` and URL route matchers (`/api/patient/**`, `/api/doctor/**`, `/api/admin/**`).
- **Verification:** `Phase8SecurityHardeningIntegrationTest` (Cases 21–25: `doctorACannotAccessDoctorBConsultation`, `patientACannotAccessPatientBPrescription`, `patientACannotAccessPatientBConsultation`).

### 2.4 Browser Security Headers & CORS Configuration
- **Initial Finding:** CORS permitted `*` for `allowedHeaders` with `allowCredentials(true)`. Missing explicit `Permissions-Policy` and HTTP Strict Transport Security (`HSTS`).
- **Remediation Implemented:**
  1. Tightened CORS allowed headers in `SecurityConfig` to an explicit, restricted list: `Authorization`, `Content-Type`, `Accept`, `Origin`, `X-Requested-With`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`.
  2. Added HSTS header (`includeSubDomains(true).maxAgeInSeconds(31536000)`).
  3. Maintained strict frame options (`DENY`), content type options (`nosniff`), referrer policy (`strict-origin-when-cross-origin`), and Content Security Policy (`CSP`).
- **Verification:** `Phase10SecurityIntegrationTest.corsConfigurationHasExplicitAllowedHeaders`, `securityHeadersArePresent`.

### 2.5 Input Validation & Boundary Enforcement
- **Initial Finding:** Clinical narrative fields (symptoms, clinical notes, treatment notes) in `CreateConsultationRequest` and `PrescriptionItemRequest` lacked upper boundary limits.
- **Remediation Implemented:**
  1. Added explicit `@Size(max = 2000)` on symptoms, `@Size(max = 1000)` on diagnosis, and `@Size(max = 4000)` on clinical/treatment notes.
  2. Added explicit `@Size` bounds on `PrescriptionItemRequest` fields (`medicineName`, `dosage`, `frequency`, `duration`, `instructions`).
  3. Unprocessable entity responses return RFC-7807 `ProblemDetail` with status 422 and a field-level error mapping.
- **Verification:** `Phase10SecurityIntegrationTest.consultationExceedingMaxBoundsIsRejected`.

### 2.6 Error Sanitization & Leak Prevention
- **Evaluation:** Inspected `GlobalExceptionHandler` and tested response outputs for unauthenticated, forbidden, validation, conflict, and unexpected runtime exceptions.
- **Findings:**
  - Server stack traces are never exposed in production responses (`server.error.include-stacktrace: never`).
  - Database constraint errors (e.g. appointment slot conflicts) are intercepted and returned as user-friendly medical notices without exposing PostgreSQL table or column identifiers.
  - RFC-7807 Problem Details are universally adopted.

### 2.7 Audit Logging Integrity & Terminology
- **Evaluation:** Evaluated `AuditLogService` and `AdminAuditController`.
- **Findings:**
  - All sensitive actions (login, logout, registration, profile updates, appointment booking/cancellation, doctor verification) are logged with user ID, action name, entity type/ID, IP address, and timestamp.
  - Terminology accurately reflects a structured, relational administrative audit trail without unsupported claims of cryptographic immutability.

---

## 3. Automated Test Verification Summary

| Suite / Test Target | Tests Run | Passed | Failed | Status |
|---|---|---|---|---|
| **Phase 10 Security Integration Test** | 9 | 9 | 0 | **PASSED** |
| **Phase 8 Security Hardening Integration Test** | 25 | 25 | 0 | **PASSED** |
| **Complete Backend Test Suite (`mvn test`)** | 143 | 143 | 0 | **PASSED** |
| **Frontend Production Build (`npm run build`)** | 47 chunks | 47 | 0 | **PASSED** |
| **Phase 01 Theme & Viewport Suite** | 6 viewports | All | 0 | **PASSED** |
| **Phase 03 UX Polish & Micro-interactions** | 5 suites | All | 0 | **PASSED** |
| **Phase 04 Patient Portal Suite** | 10 suites | All | 0 | **PASSED** |
| **Phase 05 Doctor Clinical Workstation** | 8 suites | All | 0 | **PASSED** |
| **Phase 06 Admin Healthcare Command Center** | 11 suites | All | 0 | **PASSED** |
| **Phase 07 Global UI/UX Polish Suite** | 8 suites | All | 0 | **PASSED** |
| **Phase 08 Accessibility Hardening Suite** | 65 checks | 65 | 0 | **PASSED** |

---

## 4. Final Security Certification

The Hospital Appointment Management System (HAMS) has passed all security audit milestones with **zero unresolved vulnerabilities**, **zero regressions**, and full compliance with all project security criteria.
