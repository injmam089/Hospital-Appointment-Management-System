# HAMS Phase 12 — Setup & Installation Guide

**Project:** Hospital Appointment Management System (HAMS)  
**Target Environment:** Local Workstation (Windows / Linux / macOS)  
**Status:** Verified Installation Procedures  

---

## 1. Prerequisites & Version Requirements

Ensure the following runtimes and development tools are installed prior to setup:

| Tool | Version Requirement | Verification Command |
|---|---|---|
| **Java JDK** | Java 17 LTS or Java 21 / 25 | `java -version` |
| **Node.js** | Node 20.x or 22.x LTS (compatible with v24) | `node -v` |
| **npm** | npm 10.x or higher | `npm -v` |
| **Apache Maven** | Maven 3.8.x or 3.9.x | `mvn -v` |
| **Docker & Compose** | Docker Desktop 4.x / Engine 24+ | `docker -v`, `docker-compose -v` |
| **Git** | Git 2.30+ | `git --version` |

---

## 2. Repository Setup

Clone the repository and inspect the directory structure:

```bash
git clone https://github.com/<org>/hospital-management-system.git
cd "Hospital Management System"
```

The repository structure:
- `hams-backend/`: Spring Boot REST application.
- `hams-frontend/`: React + Vite + TypeScript frontend application.
- `docker-compose.yml`: Multi-container orchestration specification.

---

## 3. Database Initialization

### Option A: Local PostgreSQL (Recommended for Native Dev)
1. Install and launch PostgreSQL 16.
2. Create a local database and user via `psql`:
   ```sql
   CREATE DATABASE hamsdb;
   CREATE USER hams_user WITH ENCRYPTED PASSWORD 'hams_pass';
   GRANT ALL PRIVILEGES ON DATABASE hamsdb TO hams_user;
   \c hamsdb
   GRANT ALL ON SCHEMA public TO hams_user;
   ```

### Option B: Dockerized PostgreSQL
Run isolated PostgreSQL container via Docker:
```bash
docker run -d \
  --name hams_postgres \
  -e POSTGRES_DB=hamsdb \
  -e POSTGRES_USER=hams_user \
  -e POSTGRES_PASSWORD=hams_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## 4. Backend Service Configuration & Launch

### 4.1 Configuration Profiles
- **Default Profile (`application.yml`):**
  - Configured for port `8055`.
  - Automatically migrates database schema via Flyway (`V1` to `V7`).
  - Pre-loads rich clinical demo data (`hams.seed.demo-data: true`).
- **Production Profile (`application-prod.yml`):**
  - Requires explicit external environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### 4.2 Launching the Backend
Navigate to `hams-backend` and start via Maven:
```bash
cd hams-backend
mvn spring-boot:run
```

Once running, verify health:
```bash
curl http://localhost:8055/api/public/health
```
Response:
```json
{"status":"UP","service":"HAMS API","version":"1.0.0"}
```

OpenAPI Swagger UI is available at:  
`http://localhost:8055/swagger-ui.html`

---

## 5. Frontend Client Configuration & Launch

### 5.1 Installing Dependencies
Navigate to `hams-frontend` and install packages:
```bash
cd ../hams-frontend
npm install
```

### 5.2 Environment Variables
Create or verify `.env` in `hams-frontend/`:
```env
VITE_API_URL=http://localhost:8055
```

### 5.3 Launching the Frontend Development Server
Start the Vite development server:
```bash
npm run dev
```
The application will launch on `http://localhost:5173` (or `http://localhost:3000` when running preview).

### 5.4 Production Build Verification
To test frontend production bundling:
```bash
npm run build
npm run preview -- --port 3000
```

---

## 6. Pre-Configured Demo Accounts

HAMS automatically seeds realistic clinical records for immediate testing:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Administrator** | `admin@hams.local` | `Admin@HAMS2024!` | Command Center, User Governance, Audit Logs |
| **Doctor** | `doctor.demo1@hams.local` | `Doctor@HAMS2024!` | Clinical Workstation, Queue, Digital Prescriptions |
| **Doctor** | `doctor.demo2@hams.local` | `Doctor@HAMS2024!` | Workstation, Schedule Management, Leave Filing |
| **Patient** | `patient.demo1@example.com` | `Patient@HAMS2024!` | Patient Portal, Doctor Discovery, Appointments |
| **Patient** | `patient.demo2@example.com` | `Patient@HAMS2024!` | Appointments, Health Records, Prescriptions |

---

## 7. Running Verification & Test Suites

### Backend Unit & Integration Tests
```bash
cd hams-backend
mvn test
```
Executes all 143 test cases including `Phase5AppointmentIntegrationTest` and `AuthAndRbacIntegrationTest`.

### Automated Browser Regression Suites
From the project root:
```bash
node test_phase1_theme.js
node test_phase4_patient.js
node test_phase5_doctor.js
node test_phase6_admin.js
node test_phase7_global_ui.js
node test_phase8_accessibility.js
```
