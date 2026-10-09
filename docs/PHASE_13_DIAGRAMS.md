# HAMS Phase 13 — Comprehensive System Diagrams

**Project:** Hospital Appointment Management System (HAMS)  
**Academic Context:** BCA Final-Year Project  
**Specification:** Evidence-Based Mermaid Architectural & Workflow Diagrams  
**Status:** Verified Against Actual Implementation  

---

## 1. System Architecture Diagram

This diagram visualizes the actual 3-tier decoupled architecture: React Single Page Application (SPA), Spring Boot monolithic REST backend with layered security, and PostgreSQL 16 database.

```mermaid
flowchart TD
    subgraph ClientTier["Client Tier (Presentation Layer)"]
        Browser["User Web Browser (Desktop / Tablet / Mobile)"]
        subgraph FrontendSPA["hams-frontend (Port 3000 / Vercel)"]
            ReactCore["React 19 + TypeScript + Vite"]
            Router["React Router v7 (Guarded Routes)"]
            StateMgmt["Zustand (authStore) + TanStack Query"]
            AxiosInterceptors["Axios API Client (JWT Interceptor)"]
            UI["Tailwind CSS + Lucide Icons + Framer Motion"]
        end
    end

    subgraph AppTier["Application Tier (Spring Boot Monolith)"]
        subgraph BackendAPI["hams-backend (Port 8055 / Render)"]
            FilterRate["RateLimitingFilter (Bucket4j IP Throttling)"]
            FilterCORS["CorsConfigurationSource (Origin Whitelist)"]
            FilterSec["Security Headers (CSP, HSTS, X-Frame-Options)"]
            FilterJWT["JwtAuthenticationFilter (Access Token Parser)"]
            SpringSec["Spring Security 6 (DaoAuthProvider, BCrypt Cost 12)"]
            
            subgraph Controllers["REST Controllers"]
                PublicCtrl["Public & Discovery Controllers"]
                AuthCtrl["AuthController"]
                PatientCtrl["Patient Controllers"]
                DoctorCtrl["Doctor Controllers"]
                AdminCtrl["Admin Controllers"]
                NotifCtrl["NotificationController"]
            end
            
            subgraph Services["Service Layer (Business Logic & Transactions)"]
                AuthSvc["AuthService"]
                PatientSvc["PatientService"]
                DoctorSvc["DoctorService"]
                ApptSvc["AppointmentService"]
                ConsultSvc["ConsultationService"]
                NotifSvc["NotificationService"]
                AuditSvc["AuditLogService"]
            end
            
            subgraph Repos["Data Access Layer"]
                JPARepos["Spring Data JPA Repositories"]
            end
        end
    end

    subgraph DataTier["Data Persistence Tier (PostgreSQL 16)"]
        PostgresDB[("PostgreSQL 16 Database (hamsdb)")]
        FlywayMigrations["Flyway Migrations (V1 to V7)"]
        PartialIndex["Constraint: idx_appt_unique_slot"]
    end

    Browser -->|HTTP/HTTPS| ReactCore
    ReactCore --> Router
    Router --> StateMgmt
    StateMgmt --> AxiosInterceptors
    AxiosInterceptors -->|REST JSON API Requests| FilterRate
    FilterRate --> FilterCORS
    FilterCORS --> FilterSec
    FilterSec --> FilterJWT
    FilterJWT --> SpringSec
    SpringSec --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos --> PostgresDB
    FlywayMigrations -.-> PostgresDB
    PartialIndex -.-> PostgresDB
```

---

## 2. Use Case Diagram

The use case model reflects the three supported user roles (`PATIENT`, `DOCTOR`, `ADMIN`) and their permitted functional interactions.

```mermaid
flowchart LR
    subgraph Actors
        P(("Patient"))
        D(("Doctor"))
        A(("Administrator"))
    end

    subgraph System["Hospital Appointment Management System (HAMS)"]
        UC_Reg["Register Account"]
        UC_Auth["Authenticate (Login / Refresh / Logout)"]
        UC_Profile["Manage Profile"]
        
        UC_FindDoc["Browse & Filter Doctors by Department"]
        UC_ViewSlots["Inspect Available Time Slots"]
        UC_BookAppt["Book Appointment Slot"]
        UC_ManageAppt["View, Reschedule & Cancel Appointments"]
        UC_ViewPresc["View & Download Digital Prescriptions"]
        
        UC_DocQueue["View Daily Patient Queue"]
        UC_UpdateStatus["Update Appointment Status (Checked-In, etc.)"]
        UC_Consult["Record Consultation Findings"]
        UC_WritePresc["Issue Digital Prescription"]
        UC_SetSched["Manage Weekly Working Hours & Breaks"]
        UC_FileLeave["Submit Planned Leaves"]
        
        UC_AdminDash["Monitor Hospital Metrics & KPIs"]
        UC_UserGov["Manage User Activation & Roles"]
        UC_DocVerify["Verify & Approve Doctor Credentials"]
        UC_DeptMgmt["Manage Medical Departments"]
        UC_ApptOver["Hospital-Wide Appointment Oversight"]
        UC_AuditLog["Inspect Secure Administrative Audit Trail"]
        UC_Reports["Generate Operational Volume Reports"]
        
        UC_Notif["Receive Real-Time Notifications"]
    end

    P --> UC_Reg
    P --> UC_Auth
    P --> UC_Profile
    P --> UC_FindDoc
    P --> UC_ViewSlots
    P --> UC_BookAppt
    P --> UC_ManageAppt
    P --> UC_ViewPresc
    P --> UC_Notif

    D --> UC_Auth
    D --> UC_Profile
    D --> UC_DocQueue
    D --> UC_UpdateStatus
    D --> UC_Consult
    D --> UC_WritePresc
    D --> UC_SetSched
    D --> UC_FileLeave
    D --> UC_Notif

    A --> UC_Auth
    A --> UC_AdminDash
    A --> UC_UserGov
    A --> UC_DocVerify
    A --> UC_DeptMgmt
    A --> UC_ApptOver
    A --> UC_AuditLog
    A --> UC_Reports
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 DFD Level 0 (Context Diagram)

```mermaid
flowchart TD
    Patient["Patient"]
    Doctor["Doctor"]
    Admin["Administrator"]

    HAMS["Hospital Appointment Management System (HAMS)"]

    Patient -->|Registration & Login Data| HAMS
    Patient -->|Booking & Reschedule Requests| HAMS
    HAMS -->|Appointments, Prescriptions & Notifications| Patient

    Doctor -->|Credentials & Profile Updates| HAMS
    Doctor -->|Consultation Notes, Prescriptions, Leaves| HAMS
    HAMS -->|Today's Queue, Schedules & Clinical Alerts| Doctor

    Admin -->|Admin Credentials & Governance Actions| HAMS
    Admin -->|Department & Doctor Approvals| HAMS
    HAMS -->|KPI Stats, Audit Logs & Operational Reports| Admin
```

### 3.2 DFD Level 1 (Major Functional Processes)

```mermaid
flowchart TD
    Patient["Patient"]
    Doctor["Doctor"]
    Admin["Administrator"]

    subgraph CoreProcesses["HAMS Level 1 Processes"]
        P1["1.0 Authentication & Token Lifecycle"]
        P2["2.0 Patient Portal Management"]
        P3["3.0 Doctor Clinical Management"]
        P4["4.0 Appointment Scheduling & Concurrency"]
        P5["5.0 Clinical Consultation & Prescription"]
        P6["6.0 Real-Time Notifications"]
        P7["7.0 Hospital Administration & Audit"]
    end

    subgraph DataStores[("Data Stores")]
        DS_Users[("D1: users")]
        DS_Patients[("D2: patients")]
        DS_Doctors[("D3: doctors / schedules")]
        DS_Appointments[("D4: appointments")]
        DS_Clinical[("D5: consultations / prescriptions")]
        DS_Notifications[("D6: notifications")]
        DS_Audit[("D7: audit_logs")]
    end

    Patient -->|Login / Credentials| P1
    Doctor -->|Login / Credentials| P1
    Admin -->|Login / Credentials| P1
    P1 <-->|Read / Write Auth Tokens| DS_Users

    Patient -->|Demographics Update| P2
    P2 <-->|Patient Details| DS_Patients

    Doctor -->|Availability & Leaves| P3
    P3 <-->|Doctor Schedule Data| DS_Doctors

    Patient -->|Slot Reservation Request| P4
    P4 <-->|Check Slots & Write Appointment| DS_Appointments
    P4 -->|Trigger Event| P6
    P4 -->|Log Action| P7

    Doctor -->|Consultation & Rx Submission| P5
    P5 <-->|Link to Appointment| DS_Appointments
    P5 -->|Write Findings & Medicines| DS_Clinical
    P5 -->|Trigger Rx Alert| P6
    P5 -->|Log Consultation| P7

    Admin -->|Governance & Verifications| P7
    P7 <-->|User & Doctor Status Updates| DS_Users
    P7 <-->|Doctor Verification Records| DS_Doctors
    P7 -->|Read Audit Records| DS_Audit
    P7 -->|Write Admin Logs| DS_Audit

    P6 -->|Deliver Alerts| DS_Notifications
    DS_Notifications -->|Unread Notices| Patient
    DS_Notifications -->|Queue Notices| Doctor
```

---

## 4. Entity Relationship (ER) Diagram

Represents all 13 PostgreSQL tables implemented via Flyway migrations (`V1` through `V7`).

```mermaid
erDiagram
    users ||--o| patients : "user_id"
    users ||--o| doctors : "user_id"
    users ||--o{ notifications : "user_id"
    users ||--o{ audit_logs : "user_id"
    departments ||--o{ doctors : "department_id"
    doctors ||--o{ doctor_availability : "doctor_id"
    doctor_availability ||--o{ doctor_breaks : "availability_id"
    doctors ||--o{ doctor_leaves : "doctor_id"
    patients ||--o{ appointments : "patient_id"
    doctors ||--o{ appointments : "doctor_id"
    appointments ||--o| consultations : "appointment_id"
    consultations ||--o| prescriptions : "consultation_id"
    prescriptions ||--o{ prescription_items : "prescription_id"

    users {
        bigserial id PK
        varchar email UK
        varchar password_hash
        varchar role
        boolean is_active
        boolean email_verified
        int failed_login_attempts
        timestamp locked_until
        timestamp created_at
        timestamp updated_at
    }

    departments {
        bigserial id PK
        varchar name UK
        text description
        varchar icon
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    patients {
        bigserial id PK
        bigint user_id FK,UK
        varchar first_name
        varchar last_name
        date date_of_birth
        varchar gender
        varchar phone
        text address
        varchar blood_group
        varchar emergency_contact
        timestamp created_at
        timestamp updated_at
    }

    doctors {
        bigserial id PK
        bigint user_id FK,UK
        bigint department_id FK
        varchar first_name
        varchar last_name
        varchar specialization
        text qualification
        int experience_years
        decimal consultation_fee
        text bio
        varchar photo_url
        boolean is_verified
        varchar verification_status
        boolean is_active
        varchar phone
        varchar registration_number
        timestamp created_at
        timestamp updated_at
    }

    doctor_availability {
        bigserial id PK
        bigint doctor_id FK
        varchar day_of_week
        time start_time
        time end_time
        int slot_duration_mins
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    doctor_breaks {
        bigserial id PK
        bigint availability_id FK
        time start_time
        time end_time
        timestamp created_at
    }

    doctor_leaves {
        bigserial id PK
        bigint doctor_id FK
        date leave_date
        date start_date
        date end_date
        text reason
        timestamp created_at
        timestamp updated_at
    }

    appointments {
        bigserial id PK
        bigint patient_id FK
        bigint doctor_id FK
        date appointment_date
        time appointment_time
        time end_time
        varchar status
        text reason
        varchar appointment_ref UK
        text cancellation_reason
        timestamp created_at
        timestamp updated_at
    }

    consultations {
        bigserial id PK
        bigint appointment_id FK,UK
        bigint doctor_id FK
        bigint patient_id FK
        text symptoms
        text diagnosis
        text clinical_notes
        text treatment_notes
        text advice
        text notes
        date follow_up_date
        timestamp created_at
        timestamp updated_at
    }

    prescriptions {
        bigserial id PK
        bigint consultation_id FK,UK
        bigint doctor_id FK
        bigint patient_id FK
        date prescription_date
        text general_instructions
        timestamp created_at
        timestamp updated_at
    }

    prescription_items {
        bigserial id PK
        bigint prescription_id FK
        varchar medicine_name
        varchar dosage
        varchar frequency
        varchar duration
        text instructions
    }

    notifications {
        bigserial id PK
        bigint user_id FK
        varchar title
        text message
        boolean is_read
        varchar type
        timestamp created_at
        timestamp updated_at
    }

    audit_logs {
        bigserial id PK
        bigint user_id
        varchar action
        varchar entity_type
        bigint entity_id
        varchar ip_address
        text details
        timestamp created_at
    }
```

---

## 5. Domain Class Diagram

This diagram displays the key backend Java domain entities, relationships, and business repositories.

```mermaid
classDiagram
    class BaseEntity {
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getCreatedAt() LocalDateTime
        +getUpdatedAt() LocalDateTime
    }

    class User {
        -Long id
        -String email
        -String passwordHash
        -Role role
        -boolean active
        -boolean emailVerified
        -int failedLoginAttempts
        -LocalDateTime lockedUntil
    }

    class Patient {
        -Long id
        -User user
        -String firstName
        -String lastName
        -LocalDate dateOfBirth
        -Gender gender
        -String phone
        -String bloodGroup
    }

    class Doctor {
        -Long id
        -User user
        -Department department
        -String firstName
        -String lastName
        -String specialization
        -BigDecimal consultationFee
        -boolean verified
        -VerificationStatus verificationStatus
        -boolean active
    }

    class Appointment {
        -Long id
        -Patient patient
        -Doctor doctor
        -LocalDate appointmentDate
        -LocalTime appointmentTime
        -LocalTime endTime
        -AppointmentStatus status
        -String appointmentRef
        -String reason
    }

    class Consultation {
        -Long id
        -Appointment appointment
        -Doctor doctor
        -Patient patient
        -String diagnosis
        -String notes
        -String advice
        -LocalDate followUpDate
    }

    class Prescription {
        -Long id
        -Consultation consultation
        -Doctor doctor
        -Patient patient
        -LocalDate prescriptionDate
        -List~PrescriptionItem~ items
    }

    class PrescriptionItem {
        -Long id
        -Prescription prescription
        -String medicineName
        -String dosage
        -String frequency
        -String duration
    }

    BaseEntity <|-- User
    BaseEntity <|-- Patient
    BaseEntity <|-- Doctor
    BaseEntity <|-- Appointment
    BaseEntity <|-- Consultation
    BaseEntity <|-- Prescription
    
    User "1" <-- "1" Patient : belongsTo
    User "1" <-- "1" Doctor : belongsTo
    Patient "1" <-- "*" Appointment : books
    Doctor "1" <-- "*" Appointment : attends
    Appointment "1" <-- "1" Consultation : generates
    Consultation "1" <-- "1" Prescription : issues
    Prescription "1" *-- "*" PrescriptionItem : contains
```

---

## 6. Sequence Diagrams

### 6.1 Authentication & Token Refresh Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant ReactClient as React Frontend (Axios)
    participant RateLimiter as RateLimitingFilter
    participant AuthController as AuthController
    participant AuthService as AuthService
    participant JwtService as JwtService
    participant DB as PostgreSQL

    User->>ReactClient: Submits email & password
    ReactClient->>RateLimiter: POST /api/auth/login
    RateLimiter->>AuthController: Request within 10 req/min limit
    AuthController->>AuthService: authenticate(loginRequest)
    AuthService->>DB: findByEmail(email)
    DB-->>AuthService: Returns User (passwordHash)
    AuthService->>AuthService: BCrypt.checkpw(rawPassword, hash)
    AuthService->>JwtService: generateAccessToken(user) & generateRefreshToken(user)
    JwtService-->>AuthService: Generated token pair
    AuthService-->>AuthController: AuthResponse
    AuthController-->>ReactClient: 200 OK (accessToken, refreshToken, user)
    ReactClient->>ReactClient: Save to localStorage & Zustand

    Note over ReactClient,AuthController: Expired Access Token Scenario
    ReactClient->>AuthController: GET /api/patient/appointments (Expired Token)
    AuthController-->>ReactClient: 401 Unauthorized ProblemDetail
    ReactClient->>AuthController: POST /api/auth/refresh { refreshToken }
    AuthController->>JwtService: validateRefreshToken()
    JwtService-->>AuthController: Valid
    AuthController-->>ReactClient: 200 OK (new accessToken)
    ReactClient->>ReactClient: Re-execute queued appointment request
```

### 6.2 Appointment Booking & Concurrency Protection Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Frontend as Patient Portal
    participant Controller as PatientAppointmentController
    participant Service as AppointmentService
    participant DB as PostgreSQL

    Patient->>Frontend: Selects Doctor, Date, and Time Slot
    Frontend->>Controller: POST /api/patient/appointments { doctorId, date, time, reason }
    Controller->>Service: bookAppointment(patientUserId, request)
    Service->>DB: Verify patient profile & doctor active status
    Service->>DB: Check doctor leaves for given date
    Service->>DB: Check doctor recurring availability
    Service->>DB: existsActiveAppointment(doctorId, date, time)
    
    alt Slot is Available
        Service->>DB: INSERT INTO appointments (status='PENDING', ref='APT-...')
        Note over DB: Constraint idx_appt_unique_slot guarantees uniqueness
        Service->>DB: INSERT INTO audit_logs (Action: 'APPOINTMENT_BOOKED')
        Service->>DB: INSERT INTO notifications (For Doctor & Patient)
        Service-->>Controller: AppointmentDetailsResponse
        Controller-->>Frontend: 201 Created
        Frontend-->>Patient: Display Confirmation Toast
    else Slot Collision Detected (Race Condition)
        DB-->>Service: Unique Constraint Violation or active row exists
        Service-->>Controller: Throw HamsException.conflict("Slot already booked")
        Controller-->>Frontend: 409 Conflict ProblemDetail
        Frontend-->>Patient: Display "Slot unavailable, please select another time"
    end
```

### 6.3 Clinical Consultation & Prescription Flow

```mermaid
sequenceDiagram
    autonumber
    actor Doctor
    participant Workstation as Doctor Workstation
    participant Controller as DoctorConsultationController
    participant Service as ConsultationService
    participant DB as PostgreSQL

    Doctor->>Workstation: Selects checked-in patient from queue
    Doctor->>Workstation: Fills Diagnosis, Symptoms, Notes, Rx Medicines
    Workstation->>Controller: POST /api/doctor/appointments/{id}/consultation
    Controller->>Service: completeConsultation(doctorUserId, apptId, request)
    Service->>DB: Verify appointment ownership (doctorId matches authenticated doctor)
    Service->>DB: UPDATE appointments SET status = 'COMPLETED'
    Service->>DB: INSERT INTO consultations (diagnosis, clinical_notes, advice)
    Service->>DB: INSERT INTO prescriptions (general_instructions)
    Service->>DB: INSERT INTO prescription_items (batch items)
    Service->>DB: INSERT INTO audit_logs (Action: 'CONSULTATION_COMPLETED')
    Service->>DB: INSERT INTO notifications (Patient: 'PRESCRIPTION_READY')
    Service-->>Controller: ConsultationResponse
    Controller-->>Workstation: 201 Created
    Workstation-->>Doctor: Render consultation summary & refresh queue
```

### 6.4 Admin Governance Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Console as Admin Command Center
    participant AdminCtrl as AdminDoctorController / AdminUserController
    participant AdminSvc as DoctorService / AdminUserService
    participant DB as PostgreSQL

    Admin->>Console: Reviews pending doctor registration
    Admin->>AdminCtrl: PATCH /api/admin/doctors/{id}/verify { "status": "APPROVED" }
    AdminCtrl->>AdminSvc: verifyDoctor(id, status)
    AdminSvc->>DB: UPDATE doctors SET is_verified = TRUE, verification_status = 'APPROVED'
    AdminSvc->>DB: INSERT INTO audit_logs (Action: 'DOCTOR_VERIFIED', entity: 'Doctor', id)
    AdminSvc->>DB: INSERT INTO notifications (Doctor: 'Account verified')
    AdminSvc-->>AdminCtrl: DoctorManagementResponse
    AdminCtrl-->>Console: 200 OK
    Console-->>Admin: Updates doctor status badge in table
```

---

## 7. Deployment Diagram

```mermaid
flowchart TD
    subgraph ClientEnvironment["End-User Client Devices"]
        Desktop["Desktop Browser (1920x1080)"]
        Tablet["Tablet Browser (768x1024)"]
        Mobile["Mobile Browser (375x812 / 390x844)"]
    end

    subgraph CDN_Host["Static Edge & Cloud CDN (Vercel)"]
        VercelEdge["Vercel Global Edge CDN"]
        FrontendFiles["Static React 19 Bundle (HTML, JS, CSS, SVG)"]
    end

    subgraph Backend_Host["Application Platform (Render / Docker Host)"]
        subgraph DockerContainer["Containerized Spring Boot Instance"]
            JavaRuntime["Eclipse Temurin JRE 17 Alpine"]
            SpringBoot["HAMS Spring Boot 3.3.5 (Port 8055)"]
            HikariCP["Hikari Connection Pool (Size: 20)"]
        end
    end

    subgraph ManagedDatabase["Relational Database Host"]
        subgraph PostgresInstance["PostgreSQL 16 Alpine Engine"]
            PostgresEngine["PostgreSQL 16 (Port 5432 / SSL)"]
            DiskVolume[("Persistent Storage: hams_postgres_data")]
        end
    end

    Desktop -->|HTTPS / Port 443| VercelEdge
    Tablet -->|HTTPS / Port 443| VercelEdge
    Mobile -->|HTTPS / Port 443| VercelEdge
    VercelEdge --> FrontendFiles

    Desktop -->|REST API Calls / Port 8055| SpringBoot
    Tablet -->|REST API Calls / Port 8055| SpringBoot
    Mobile -->|REST API Calls / Port 8055| SpringBoot

    SpringBoot --> HikariCP
    HikariCP -->|JDBC TLS Port 5432| PostgresEngine
    PostgresEngine <--> DiskVolume
```
