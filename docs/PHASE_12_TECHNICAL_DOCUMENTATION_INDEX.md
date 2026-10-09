# HAMS — Technical Documentation Index

**Project:** Hospital Appointment Management System (HAMS)  
**Academic Context:** BCA Final-Year Project  
**Documentation Version:** 1.0.0 (Phase 12 Complete)  
**Status:** Official Technical Documentation Master Index  

---

## 1. Primary Documentation Suite (Phase 12)

The following core documentation documents provide complete technical coverage of the system:

| Document | Purpose & Scope | Direct Link |
|---|---|---|
| **System Architecture** | Tier decoupling, frontend/backend architecture, state management, request lifecycles | [PHASE_12_SYSTEM_ARCHITECTURE.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_SYSTEM_ARCHITECTURE.md) |
| **Database Schema** | Flyway migrations `V1`–`V7`, ER diagrams, partial indexes (`idx_appt_unique_slot`), table definitions | [PHASE_12_DATABASE_SCHEMA.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_DATABASE_SCHEMA.md) |
| **API Reference** | Complete REST endpoint specifications, RFC-7807 error schema, request/response DTOs | [PHASE_12_API_DOCUMENTATION.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_API_DOCUMENTATION.md) |
| **Security Architecture** | Spring Security 6, JWT dual tokens, BCrypt, RBAC matrix, IDOR protection, Secure Administrative Audit Trail | [PHASE_12_SECURITY_DOCUMENTATION.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_SECURITY_DOCUMENTATION.md) |
| **Setup & Installation** | Local developer prerequisites, database provisioning, environment profiles, execution steps | [PHASE_12_SETUP_AND_INSTALLATION.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_SETUP_AND_INSTALLATION.md) |
| **Deployment Guide** | Docker Compose multi-container setup, Vercel frontend, Render backend, managed PostgreSQL | [PHASE_12_DEPLOYMENT_GUIDE.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_DEPLOYMENT_GUIDE.md) |
| **Testing Documentation**| 143/143 backend tests, frontend builds, 6-viewport browser regressions, WCAG accessibility audit | [PHASE_12_TESTING_DOCUMENTATION.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_TESTING_DOCUMENTATION.md) |
| **Developer Guide** | Package structures, naming conventions, extension patterns, adding endpoints and pages | [PHASE_12_DEVELOPER_GUIDE.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_DEVELOPER_GUIDE.md) |
| **Completion Report** | Formal Phase 12 sign-off, artifact inventory, and readiness status | [PHASE_12_COMPLETION_REPORT.md](file:///d:/Hospital%20Management%20System/docs/PHASE_12_COMPLETION_REPORT.md) |

---

## 2. Historical & Phase Verification References

| Phase Reference | Scope & Focus Area | Direct Link |
|---|---|---|
| **Phase 09 Performance** | Frontend bundle optimization, code splitting, lazy-loading | [PHASE_09_PERFORMANCE_AUDIT.md](file:///d:/Hospital%20Management%20System/docs/PHASE_09_PERFORMANCE_AUDIT.md) |
| **Phase 10 Security** | Security audit findings, penetration hardening, token segregation | [PHASE_10_SECURITY_AUDIT_REPORT.md](file:///d:/Hospital%20Management%20System/docs/PHASE_10_SECURITY_AUDIT_REPORT.md) |
| **Phase 11 QA Baseline** | Baseline repository health, Docker configurations, migration integrity | [PHASE_11_QA_BASELINE.md](file:///d:/Hospital%20Management%20System/docs/PHASE_11_QA_BASELINE.md) |
| **Phase 11 QA Test Plan** | 18-stage regression verification plan & methodology | [PHASE_11_QA_TEST_PLAN.md](file:///d:/Hospital%20Management%20System/docs/PHASE_11_QA_TEST_PLAN.md) |
| **Phase 11 QA Results** | Execution results across all 18 QA verification stages | [PHASE_11_QA_RESULTS.md](file:///d:/Hospital%20Management%20System/docs/PHASE_11_QA_RESULTS.md) |
| **Phase 11 Sign-Off** | Formal QA decision: `READY_FOR_DOCUMENTATION` | [PHASE_11_COMPLETION_REPORT.md](file:///d:/Hospital%20Management%20System/docs/PHASE_11_COMPLETION_REPORT.md) |

---

## 3. Technology Stack Reference

- **Backend:** Spring Boot 3.3.5, Java 17/25, Spring Security 6, Hibernate / JPA, Flyway 10, PostgreSQL 16
- **Frontend:** React 19.2.8, TypeScript 6.0, Vite 8.3.0, Tailwind CSS 3.4, Framer Motion 14, Lucide React 1.52
- **Testing:** JUnit 5, Mockito, Spring Boot Test, Playwright, Axios / Node HTTP Harness
- **Infrastructure:** Docker, Docker Compose, Nginx Alpine, Multi-Stage JDK/JRE Containers
