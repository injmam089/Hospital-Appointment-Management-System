# HAMS Phase 11 — QA Test Plan

**Project:** Hospital Appointment Management System (HAMS)  
**Academic Context:** BCA Final-Year Project  
**Author:** QA & Engineering Team  
**Scope:** Stages 1 through 18 comprehensive regression and verification plan  
**Status:** Verified & Executed  

---

## 1. Objectives & Scope

The purpose of Phase 11 is to execute a rigorous, non-destructive Quality Assurance (QA) and regression audit across all components of the Hospital Appointment Management System (HAMS). 

### Scope Boundaries:
- **No feature additions:** The business functionality remains strictly within the specifications established in Phases 01–10.
- **No architectural redesign:** UI layout, Spring Boot REST layers, and PostgreSQL schema are tested in their hardened production state.
- **Strict terminology standards:** All audit logs and administrative oversight are validated under the standard designation of **Secure Administrative Audit Trail** (eschewing non-verifiable claims like "tamper-proof" or "100% secure").
- **Verification mode:** Read-only audits, automated unit/integration suites, browser automation regression suites, live API matrix testing, and container configuration validations.

---

## 2. Test Execution Matrix & Stages

| Stage | Domain / Objective | Methodology / Test Command | Target Criteria | Status |
|---|---|---|---|---|
| **01** | Baseline & Git Cleanliness | `git status`, `.env` exclusion check | Clean working tree on `main`, zero exposed secrets | **PASSED** |
| **02** | Backend Unit & Integration Suite | `mvn clean test` (143 tests) | 100% pass rate, 0 failures, 0 errors, 0 skipped | **PASSED** |
| **03** | Frontend Build & Asset Integrity | `npm run build` (Vite + TypeScript) | Zero compile errors, code splitting verified | **PASSED** |
| **04** | Authentication & JWT Lifecycle | `AuthAndRbacIntegrationTest` + live tests | BCrypt cost 12, token expiration, refresh flow | **PASSED** |
| **05** | RBAC & IDOR Enforcement | RBAC live API matrix (15 assertions) | 401 on missing tokens, 403 on role breach | **PASSED** |
| **06** | Patient Clinical Workflows | `test_phase4_patient.js` + Playwright | Booking, schedule view, prescription access | **PASSED** |
| **07** | Slot Concurrency & Collision Guard | `Phase5AppointmentIntegrationTest` | Double-booking blocked by `idx_appt_unique_slot` | **PASSED** |
| **08** | Doctor Clinical Workstation | `test_phase5_doctor.js` + Playwright | Queue management, consultation, prescription | **PASSED** |
| **09** | Admin Command Center & Governance | `test_phase6_admin.js` + Playwright | User governance, doctor approvals, audit log | **PASSED** |
| **10** | Notification System Delivery | API & Service layer verifications | Event-driven notifications (User ID mapped) | **PASSED** |
| **11** | Security Controls & Hardening | Security integration suite + headers | RFC-7807 problem details, rate limiting, CORS | **PASSED** |
| **12** | Database & Migration Health | Flyway migrations `V1`–`V7` audit | Clean schema application, valid indexes | **PASSED** |
| **13** | Responsive Layouts Across 6 Viewports | `test_phase7_global_ui.js` | Zero horizontal scroll across 375px to 1920px | **PASSED** |
| **14** | Accessibility Hardening (WCAG 2.1 AA) | `test_phase8_accessibility.js` (65 tests) | Modal focus traps, 44px touch targets, aria tags | **PASSED** |
| **15** | Docker Compose Production Readiness | `docker-compose config` | Valid multi-container configuration | **PASSED** |
| **16** | Error Handling & ProblemDetail Formats| RFC-7807 response audits | Consistent JSON schema for 400, 401, 403, 409 | **PASSED** |
| **17** | Demo Seed Data Fidelity | Database seed inspection (`V3`–`V7`) | Realistic, fictional clinical records | **PASSED** |
| **18** | Completion Report & Decision | Report generation & classification | Artifact generation and formal sign-off | **PASSED** |

---

## 3. Environment & Stack Architecture

- **Operating System:** Windows (Local Dev & Verification Environment)
- **Backend Runtime:** Java 17 / 25, Spring Boot 3.3.5, Spring Security 6, Hibernate / JPA
- **Database Engine:** PostgreSQL 16 (dev / prod profile) & H2 In-Memory (test profile)
- **Frontend Framework:** React 19, TypeScript, Tailwind CSS, Vite 8, Framer Motion, Lucide Icons
- **End-to-End Test Engine:** Playwright browser automation & Node HTTP integration test harness
- **Container Environment:** Docker & Docker Compose (`postgres:16-alpine`, multi-stage Spring Boot, multi-stage Nginx Alpine)
