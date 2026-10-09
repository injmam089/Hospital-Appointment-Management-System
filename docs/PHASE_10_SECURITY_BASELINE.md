# HAMS — Phase 10: Security Baseline & Audit Findings

**Project:** Hospital Appointment Management System (HAMS)  
**Date:** October 2026  
**Auditor:** Antigravity AI Security Audit Agent  
**Scope:** Spring Boot 3.3.5 Backend, React 19 Frontend, PostgreSQL Data Layer, Security Configurations, and REST APIs  

---

## 1. Executive Summary

As part of the final production hardening lifecycle for the Hospital Appointment Management System (HAMS), an exhaustive, evidence-based security audit was conducted. The objective was to audit the full attack surface across authentication, authorization/RBAC, JWT mechanics, IDOR / ownership isolation, clinical data privacy, input validation, SQL/query safety, security headers, CORS policies, error sanitization, and brute-force mitigations.

### Overall Security Posture
The HAMS application exhibits a strong baseline security architecture:
- **Authentication & Cryptography:** Passwords hashed with BCrypt (cost factor 12). JWTs use HMAC-SHA256 with distinct token types (`ACCESS` vs `REFRESH`).
- **Role-Based Access Control (RBAC):** Strict Spring Security 6 filter chain with `@PreAuthorize` method security isolating `PATIENT`, `DOCTOR`, and `ADMIN` roles.
- **IDOR / Ownership Isolation:** Controllers and services verify resource ownership against `@AuthenticationPrincipal UserDetails` / authenticated security context rather than trusting client-provided user IDs.
- **Data Integrity:** Database indexes and unique constraints prevent double booking and duplicate records.
- **Information Disclosure:** `GlobalExceptionHandler` maps exceptions to RFC-7807 `ProblemDetail` structures, suppressing raw stack traces and internal database schemas.

---

## 2. Identified Vulnerabilities & Hardening Opportunities

| ID | Category | Severity | Description | Remediation Plan |
|---|---|---|---|---|
| **SEC-01** | JWT / Secrets | **Medium** | Default development secret key fallback present in `JwtService` without mandatory fail-fast in production profile. | Introduce production-profile fail-fast check in `JwtService` to guarantee default development secret cannot be used in production. |
| **SEC-02** | Authentication / DoS | **Medium** | Lack of endpoint-level rate limiting on `/api/auth/login`, `/api/auth/register`, and `/api/auth/refresh`. | Implement a high-performance, in-memory sliding window / token bucket filter targeting auth endpoints with HTTP 429 response. |
| **SEC-03** | CORS & Headers | **Low** | CORS configuration permits wildcard `allowedHeaders("*")` alongside `allowCredentials(true)`. Missing explicit `Permissions-Policy`. | Specify explicit allowed headers in CORS and add `Permissions-Policy` header in `SecurityConfig`. |
| **SEC-04** | Authentication / DoS | **Medium** | In `AuthService.login`, password hashing verification was executed prior to verifying whether the account was already locked. | Reorder checks to verify account lockout and active status prior to CPU-intensive BCrypt hashing. |
| **SEC-05** | Input Validation | **Low** | Certain clinical request fields (symptoms, diagnosis, notes) lacked explicit `@Size` upper bounds. | Add explicit `@Size(max = ...)` constraints on consultation DTOs to enforce boundary limits. |
| **SEC-06** | Audit Trail | **Low** | Clarify audit logging documentation and contracts to represent reliable relational audit logging without inaccurate claims of cryptographic tamper-proofing. | Standardize documentation and audit log comments. |

---

## 3. Detailed Audit Findings

### SEC-01: JWT Secret Management & Production Fail-Fast
- **Affected File:** `com.hams.security.JwtService`
- **Current Behavior:** `@Value("${hams.jwt.secret:...}")` contains a default development fallback key (`ThisIsAVeryLong...`). Although `application-prod.yml` specifies `${JWT_SECRET}` without default, accidental misconfiguration or running without an explicit secret could allow a known fallback key in production.
- **Risk:** Known signing keys allow attackers to forge valid JWT tokens with arbitrary claims (role escalation).
- **Remediation:** In `JwtService`, inspect active environment profiles or enforce that if profile contains `prod`, any use of the default key or key shorter than 32 bytes immediately throws an `IllegalStateException` during application bootstrap.

### SEC-02: Endpoint-Level Brute-Force Rate Limiting
- **Affected File:** `com.hams.security.RateLimitingFilter` (New Component)
- **Current Behavior:** The system locks accounts after 5 consecutive failed attempts per email address. However, an attacker can launch distributed dictionary attacks against multiple accounts or hammer `/api/auth/login` to cause high CPU load on the BCrypt hasher.
- **Risk:** CPU exhaustion denial-of-service and credential stuffing attacks.
- **Remediation:** Introduce a stateless, thread-safe in-memory rate limiting filter for `/api/auth/login`, `/api/auth/register`, and `/api/auth/refresh` allowing up to 30 requests per minute per IP address, returning RFC-7807 429 with appropriate error message.

### SEC-03: CORS Configuration & Security Headers
- **Affected File:** `com.hams.config.SecurityConfig`
- **Current Behavior:** `config.setAllowedHeaders(List.of("*"))` is set with credentials enabled.
- **Risk:** Permissive header matching can violate security policy best practices.
- **Remediation:** Explicitly configure allowed headers (`Authorization`, `Content-Type`, `Accept`, `Origin`, `X-Requested-With`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`) and add `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### SEC-04: Account Lock Status Verification Order
- **Affected File:** `com.hams.service.AuthService`
- **Current Behavior:** `passwordEncoder.matches(request.getPassword(), user.getPasswordHash())` is evaluated before checking `user.getLockedUntil()`.
- **Risk:** An attacker hammering a locked account forces the server to compute expensive BCrypt hashes on every request, bypassing the CPU protection intended by account lockout.
- **Remediation:** Check `if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))` before `passwordEncoder.matches`.

### SEC-05: Input Validation Bounds on Clinical Payloads
- **Affected File:** `com.hams.dto.consultation.CreateConsultationRequest`
- **Current Behavior:** `symptoms`, `clinicalNotes`, `treatmentNotes` lacked explicit `@Size` validation annotations.
- **Risk:** Unbounded payload strings could lead to memory bloat or unexpected database truncation errors.
- **Remediation:** Add `@Size(max = 2000)` and `@Size(max = 1000)` annotations to safeguard payload boundaries.

---

## 4. Pre-Remediation Verified Strengths

1. **Horizontal IDOR Protection:**
   - Patient appointment cancellation, rescheduling, viewing: all verified with `appointment.getPatient().getId().equals(patient.getId())`.
   - Doctor consultation and prescription viewing: all verified with `validateDoctorAppointmentOwnership(doctor, appointment)` and doctor ID matching.
   - Notifications: verified with `notification.getUser().getId().equals(user.getId())`.
2. **Stateless JWT Authorization:**
   - REFRESH tokens cannot be used as Bearer tokens in API requests (`JwtAuthenticationFilter` rejects non-ACCESS tokens).
3. **Double Booking Prevention:**
   - Unique partial index `idx_appt_unique_slot` in PostgreSQL guarantees that even concurrent requests cannot create duplicate active appointments for the same doctor and slot.
4. **Information Disclosure & Error Handling:**
   - `GlobalExceptionHandler` translates exceptions into clean RFC-7807 responses without exposing SQL fragments, stack traces, or environment details.

---

## 5. Next Steps
- Execute remediations SEC-01 through SEC-05.
- Run automated security tests (`Phase8SecurityHardeningIntegrationTest` and new `Phase10SecurityIntegrationTest`).
- Verify regression status on all Playwright/Node suites and frontend production build.
