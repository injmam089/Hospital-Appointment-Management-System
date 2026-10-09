# HAMS Phase 12 — Developer Guide

**Project:** Hospital Appointment Management System (HAMS)  
**Target Audience:** Future Engineers, BCA Project Maintainers, Faculty Reviewers  
**Status:** Comprehensive Codebase Reference  

---

## 1. Codebase Directory Structure

```text
d:\Hospital Management System
├── docker-compose.yml             # Local & production multi-service configuration
├── docs/                          # Architectural & QA documentation artifacts
├── hams-backend/                  # Spring Boot 3.3.5 Backend (Java 17/25)
│   ├── pom.xml                    # Maven build configuration & dependencies
│   ├── Dockerfile                 # Multi-stage JDK/JRE build definition
│   └── src/
│       ├── main/java/com/hams/
│       │   ├── config/            # JpaConfig, OpenApiConfig, SecurityConfig
│       │   ├── controller/        # REST Controllers (Auth, Patient, Doctor, Admin)
│       │   ├── dto/               # Strongly typed Request/Response DTO records
│       │   ├── entity/            # JPA Entities (User, Appointment, Prescription)
│       │   ├── enums/             # Enums (Role, AppointmentStatus, Gender)
│       │   ├── exception/         # HamsException, GlobalExceptionHandler (RFC 7807)
│       │   ├── repository/        # Spring Data JPA Repository interfaces
│       │   ├── security/          # JWT filters, UserPrincipal, RateLimitingFilter
│       │   ├── seed/              # DemoDataSeeder (Fictional clinical records)
│       │   └── service/           # Core business logic & transaction handling
│       └── main/resources/
│           ├── application.yml    # Base & dev configuration
│           ├── application-prod.yml # Production environment requirements
│           └── db/migration/      # Flyway SQL migrations (V1 to V7)
└── hams-frontend/                 # React 19 + TypeScript + Tailwind SPA
    ├── package.json               # Node packages and build scripts
    ├── vite.config.ts             # Vite bundler configuration & code splitting
    ├── tailwind.config.js         # Medical color tokens & design system rules
    └── src/
        ├── api/                   # apiClient (Axios interceptor) & error sanitizers
        ├── components/
        │   ├── layout/            # Navbar, Footer, Drawers
        │   └── ui/                # Button, Modal, Input, Badge, Skeletons
        ├── hooks/                 # Custom React hooks (useModalA11y, useTheme)
        ├── pages/                 # Route pages (public, auth, patient, doctor, admin)
        ├── router/                # React Router v7 routes & role-based guards
        ├── store/                 # Zustand state stores (authStore)
        └── types/                 # Shared TypeScript interfaces & types
```

---

## 2. Naming Conventions & Patterns

### 2.1 Backend Conventions
- **Entities:** PascalCase matching database tables (`Appointment`, `DoctorLeave`).
- **Repositories:** Entity name suffixed with `Repository` (`AppointmentRepository`).
- **Services:** Entity or domain suffixed with `Service` (`AppointmentService`).
- **Controllers:** Domain and role separated (`PatientAppointmentController`, `DoctorAppointmentController`, `AdminAppointmentController`).
- **DTOs:** Specific purpose indicated in suffix (`CreateDoctorRequest`, `DoctorProfileResponse`).

### 2.2 Frontend Conventions
- **Components:** PascalCase filenames (`Button.tsx`, `DoctorCardSkeleton.tsx`).
- **Hooks:** Prefixed with `use` in camelCase (`useModalA11y.ts`).
- **Pages:** Feature and role suffixed with `Page` (`PatientAppointmentsPage.tsx`).
- **Types:** PascalCase interfaces and union types (`AppointmentStatus`, `Doctor`).

---

## 3. How to Extend the Application

### 3.1 Adding a New REST Endpoint
1. Define the Request/Response DTO in `com.hams.dto.<domain>`.
2. Implement business logic inside `com.hams.service.<Domain>Service`:
   - Annotate with `@Transactional` if writing data.
   - Enforce user identity ownership via `UserPrincipal`.
3. Add controller method in appropriate controller (`PatientController`, etc.):
   - Use Jakarta Validation annotations (`@Valid`).
4. Update `SecurityConfig.java` if custom URL pattern matching is required.

### 3.2 Creating a New Database Migration
1. Create a new SQL migration file in `hams-backend/src/main/resources/db/migration/`:
   ```text
   V8__add_new_feature_table.sql
   ```
2. Adhere to standard PostgreSQL naming conventions (snake_case tables and columns).
3. Update or create the corresponding JPA entity in `com.hams.entity`.

### 3.3 Adding a New Frontend Page
1. Create the page component in `hams-frontend/src/pages/<domain>/<NewPage>.tsx`.
2. Configure lazy-loaded route in `hams-frontend/src/router/index.tsx`.
3. Enclose within `RequireAuth` specifying the allowed roles:
   ```tsx
   {
     element: <RequireAuth allowedRoles={['PATIENT']} />,
     children: [
       { path: '/patient/new-feature', element: <SuspenseWrapper><NewPage /></SuspenseWrapper> }
     ]
   }
   ```
4. Add navigation link to the relevant portal navbar (`PatientNavbar.tsx`, etc.).

---

## 4. UI Design System & Component Guidelines

### Medical Design Tokens
Tailwind classes map directly to the clinical design tokens defined in Phase 01:
- Primary Brand Blue: `bg-primary-600`, `text-primary-700`
- Clinical Success / Completed: `bg-medical-green-light`, `text-medical-green`
- Clinical Pending / Action Needed: `bg-medical-amber-light`, `text-medical-amber`
- Clinical Alert / Cancelled: `bg-medical-red-light`, `text-medical-red`
- Neutral Surfaces: `bg-surface` (`#f8fafc`), Dark mode: `bg-slate-900`

### Accessibility Standards for Components
- Always use semantic HTML elements (`<button>`, `<main>`, `<nav>`, `<table>`).
- Modals must utilize the `useModalA11y` hook for Escape handling and focus looping.
- Interactive elements must maintain a minimum touch target size of 44x44px.
