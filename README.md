# 🏥 Hospital Appointment Management System (HAMS)

> BCA Final Year Project — Modern Healthcare Appointment Platform

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Java 25 + Spring Boot 3.3 + Spring Security + JWT |
| Database | PostgreSQL 16 (via Docker) |
| Auth | JWT (access + refresh) + BCrypt password hashing |
| API Docs | Swagger UI / OpenAPI 3 |
| Container | Docker + Docker Compose |

---

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Start Backend

```bash
cd hams-backend
mvn spring-boot:run
```

Backend runs at: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html  
Health: http://localhost:8080/api/public/health

### 3. Start Frontend

```bash
cd hams-frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Environment Variables

### Backend (`hams-backend/src/main/resources/application.yml`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/hamsdb` | PostgreSQL connection URL |
| `DB_USERNAME` | `hams_user` | Database user |
| `DB_PASSWORD` | `hams_pass` | Database password |
| `JWT_SECRET` | *(see config)* | JWT signing secret (change in production!) |
| `JWT_ACCESS_EXPIRY` | `900000` | Access token TTL (15 min) |
| `JWT_REFRESH_EXPIRY` | `604800000` | Refresh token TTL (7 days) |
| `ADMIN_EMAIL` | `admin@hams.local` | Default admin email |
| `ADMIN_PASSWORD` | `Admin@HAMS2024!` | Default admin password |

### Frontend (`hams-frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend API base URL |

---

## Project Structure

```
Hospital Management System/
├── hams-backend/          ← Spring Boot API
├── hams-frontend/         ← React + Vite UI
├── docker-compose.yml     ← PostgreSQL + pgAdmin
└── README.md
```

---

## Development Phases

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project setup + UI foundation + PostgreSQL | ✅ Complete |
| 2 | Authentication + RBAC (JWT) | 🔄 Next |
| 3 | Patient + Doctor + Department CRUD | ⬜ Pending |
| 4 | Doctor availability management | ⬜ Pending |
| 5 | Appointment booking + double-booking prevention | ⬜ Pending |
| 6 | Consultation + digital prescription | ⬜ Pending |
| 7 | Admin dashboard + reports + audit logs | ⬜ Pending |
| 8 | Security hardening + testing | ⬜ Pending |
| 9 | Dockerization (full stack) | ⬜ Pending |
| 10 | AWS deployment architecture | ⬜ Pending |

---

## Database

Default credentials (development only):

| Field | Value |
|-------|-------|
| Host | localhost |
| Port | 5432 |
| Database | hamsdb |
| User | hams_user |
| Password | hams_pass |

**pgAdmin** (optional UI): `docker compose --profile tools up -d`  
Access at http://localhost:5050 — Login: `admin@hams.local` / `admin`

---

## API Endpoints (Phase 1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/health` | None | Health check |
| GET | `/swagger-ui.html` | None | API documentation |
| GET | `/actuator/health` | None | Actuator health |

---

## Security Notes

- Never commit real `.env` files with production secrets
- Change `JWT_SECRET` in production
- Change default admin credentials in production
- PostgreSQL password in `docker-compose.yml` is for development only
