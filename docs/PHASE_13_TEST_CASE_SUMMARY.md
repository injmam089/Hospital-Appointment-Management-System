# HAMS Phase 13 — Test Case Summary & Verification Matrix

**Project:** Hospital Appointment Management System (HAMS)  
**Academic Context:** BCA Final-Year Project  
**QA Verification Standard:** Evidence-Based Multi-Tier Testing Results  
**Status:** 100% Passed Across All Suites  

---

## 1. Testing Framework & Methodology

HAMS was tested across multiple layers:
1. **Backend Integration & Unit Tests:** JUnit 5, Mockito, Spring Boot Test (`@SpringBootTest`, `@AutoConfigureMockMvc`).
2. **Frontend Build Verification:** TypeScript compiler (`tsc -b`) and Vite production bundler (`vite build`).
3. **Browser Automation Regression Suites:** Playwright headless Chromium engine running realistic user scenarios across 6 discrete viewport dimensions.
4. **API RBAC Live Matrix:** Direct HTTP requests validating token rejection, cross-role denials, and authorized responses.
5. **Accessibility Hardening Verification:** Scripted DOM inspections verifying WCAG 2.1 AA compliance (touch targets, aria tags, focus trapping).

---

## 2. Test Execution Metrics

| Testing Category | Executed Suite | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|---|
| **Backend Core Suite** | `mvn clean test` (Spring Boot 3.3.5) | 143 | 143 | 0 | **PASS** |
| **Frontend Production Build** | `npm run build` (Vite 8 / TS 6) | 2,773 modules | 2,773 | 0 | **PASS** |
| **Theme & Dark Mode E2E** | `test_phase1_theme.js` | 7 states | 7 | 0 | **PASS** |
| **Micro-Interactions & UX States**| `test_phase3_ux.js` | 8 checks | 8 | 0 | **PASS** |
| **Patient Workflows E2E** | `test_phase4_patient.js` | 9 flows | 9 | 0 | **PASS** |
| **Doctor Workstation E2E** | `test_phase5_doctor.js` | 8 flows | 8 | 0 | **PASS** |
| **Admin Command Center E2E** | `test_phase6_admin.js` | 9 flows | 9 | 0 | **PASS** |
| **Global Visual Consistency E2E**| `test_phase7_global_ui.js` | 16 checks | 16 | 0 | **PASS** |
| **Accessibility Audit (WCAG AA)** | `test_phase8_accessibility.js` | 65 checks | 65 | 0 | **PASS** |
| **Live RBAC Matrix Checks** | `scratch/test_rbac_matrix.js` | 15 routes | 15 | 0 | **PASS** |
| **Slot Concurrency Collision** | `Phase5AppointmentIntegrationTest` | 20 checks | 20 | 0 | **PASS** |
| **Docker Compose Config** | `docker-compose config` | 3 services | 3 | 0 | **PASS** |

---

## 3. Representative Test Cases

### 3.1 Authentication & Security Test Cases

| Test Case ID | Test Objective | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SEC-01** | Verify login with valid patient credentials | `patient.demo1@example.com` / `Patient@HAMS2024!` | HTTP 200 with JWT access and refresh token pair | HTTP 200 returned with valid tokens | **PASS** |
| **TC-SEC-02** | Verify login rejection on invalid password | `patient.demo1@example.com` / `WrongPassword` | HTTP 400 Bad Request ProblemDetail | HTTP 400 with sanitized error detail | **PASS** |
| **TC-SEC-03** | Verify token refresh using valid refresh token | Valid `refreshToken` string | HTTP 200 with newly generated `accessToken` | HTTP 200 with valid access token | **PASS** |
| **TC-SEC-04** | Verify rate limiting on brute force attacks | 11 rapid requests to `/api/auth/login` | HTTP 429 Too Many Requests | HTTP 429 returned after 10 requests | **PASS** |
| **TC-SEC-05** | Verify RBAC blocks Patient from Admin stats | Bearer token for `ROLE_PATIENT` to `/api/admin/dashboard/stats` | HTTP 403 Forbidden ProblemDetail | HTTP 403 returned | **PASS** |
| **TC-SEC-06** | Verify RBAC blocks Doctor from Admin stats | Bearer token for `ROLE_DOCTOR` to `/api/admin/dashboard/stats` | HTTP 403 Forbidden ProblemDetail | HTTP 403 returned | **PASS** |
| **TC-SEC-07** | Verify unauthenticated request to protected API | Request without `Authorization` header | HTTP 401 Unauthorized ProblemDetail | HTTP 401 returned | **PASS** |

### 3.2 Appointment & Concurrency Test Cases

| Test Case ID | Test Objective | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-APPT-01**| Patient reserves valid open time slot | Doctor ID 1, Date tomorrow, Time 10:00 AM | HTTP 201 Created with status `PENDING` | HTTP 201 with appointment ref | **PASS** |
| **TC-APPT-02**| Prevent double-booking on same slot | Two concurrent requests for Doctor 1 at 10:00 AM | One succeeds (201), second receives HTTP 409 Conflict | Primary succeeds, collision blocked (409) | **PASS** |
| **TC-APPT-03**| Slot re-booking after cancellation | Cancel previous booking, attempt new booking on same slot | HTTP 201 Created (slot released by partial index) | HTTP 201 Created successfully | **PASS** |
| **TC-APPT-04**| Patient reschedules appointment | New valid date and time slot | HTTP 200 OK with updated slot time | HTTP 200 OK returned | **PASS** |
| **TC-APPT-05**| Prevent patient from cancelling another's booking (IDOR) | Patient A token attempting cancel on Patient B appointment ID | HTTP 403 Forbidden ("Permission denied") | HTTP 403 Forbidden returned | **PASS** |

### 3.3 Clinical Consultation & Prescription Test Cases

| Test Case ID | Test Objective | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-CLIN-01**| Doctor updates visit status to Checked-In | Appointment ID in doctor queue | HTTP 200 with status `CHECKED_IN` | HTTP 200 OK returned | **PASS** |
| **TC-CLIN-02**| Doctor records consultation and prescription | Diagnosis, clinical notes, 2 medicines | HTTP 201 Created, appointment status `COMPLETED` | HTTP 201 Created, status updated | **PASS** |
| **TC-CLIN-03**| Patient accesses prescription records | Patient token to `/api/patient/prescriptions` | HTTP 200 OK with list of issued prescriptions | HTTP 200 OK returned | **PASS** |
| **TC-CLIN-04**| Prevent patient from viewing another's prescription | Patient token requesting another patient's prescription ID | HTTP 403 Forbidden ProblemDetail | HTTP 403 Forbidden returned | **PASS** |

### 3.4 Administrative Governance Test Cases

| Test Case ID | Test Objective | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-ADM-01** | Admin reviews and verifies doctor credentials | Doctor ID, action `APPROVED` | HTTP 200 with `is_verified: true` | HTTP 200 OK returned | **PASS** |
| **TC-ADM-02** | Admin activates/deactivates user account | User ID, status toggle | HTTP 200 with updated active state | HTTP 200 OK returned | **PASS** |
| **TC-ADM-03** | Verify audit log generation for admin actions | Audit log query after doctor verification | New row in `audit_logs` table matching action | Row verified in audit table | **PASS** |

### 3.5 Responsive & Accessibility Test Cases

| Test Case ID | Test Objective | Viewport / Criterion | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-UI-01**  | Responsive layout on Mobile Standard (375x812) | Mobile iPhone (375px) | Zero horizontal overflow (`scrollWidth <= clientWidth`) | Verified: zero overflow | **PASS** |
| **TC-UI-02**  | Responsive layout on Tablet Portrait (768x1024) | iPad portrait (768px) | Zero horizontal overflow, drawer functional | Verified: zero overflow | **PASS** |
| **TC-UI-03**  | Responsive layout on Desktop (1920x1080) | 1080p Desktop | Zero horizontal overflow, full desktop nav | Verified: zero overflow | **PASS** |
| **TC-A11Y-01**| Modal keyboard focus trap & Escape key | Prescription modal | Tab key trapped, Escape key dismisses modal | Verified across all modals | **PASS** |
| **TC-A11Y-02**| Minimum touch target size compliance | Interactive triggers | Dimensions >= 44x44px for touch elements | Verified (65/65 passed) | **PASS** |
