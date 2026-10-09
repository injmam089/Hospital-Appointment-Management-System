# HAMS — Phase 09 Performance Baseline Audit

**Project:** Hospital Appointment Management System (HAMS)  
**Root:** `D:\Hospital Management System`  
**Frontend:** `hams-frontend/` (React + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React)  
**Audit Date:** 2026-10-09  

---

## 1. Baseline Build Result

Command executed:
```bash
npm run build
# -> tsc -b && vite build
```

- **Build Status:** Succeeded (exit code 0)
- **Vite Version:** 8.3.3
- **Modules Transformed:** 2,772 modules
- **Build Duration:** 4.71 seconds
- **HTML Entry:** `dist/index.html` — 1.56 kB (gzip: 0.70 kB)
- **Global CSS:** `dist/assets/index-CPE2nKFK.css` — 57.28 kB (gzip: 11.40 kB)

### Baseline Chunks Breakdown

| Chunk Name | Size (Raw) | Gzip Size | Nature / Contents |
| :--- | :--- | :--- | :--- |
| `index-BzzP_WFy.js` | 257.88 kB | 80.32 kB | Main app entry + React + React-Router-DOM |
| `ThemeContext-CP6rlVIR.js` | 232.78 kB | 76.59 kB | Grouped vendor (@tanstack/react-query, react-hot-toast) |
| `ThemeToggle-CIFOhX7J.js` | 78.96 kB | 25.81 kB | Framer Motion + theme interaction logic |
| `client-DfmnZHyi.js` | 52.47 kB | 19.61 kB | Axios client + shared error handlers |
| `DoctorAppointmentsPage-L5xKrHEF.js` | 30.89 kB | 6.19 kB | Doctor appointment consultation interface |
| `AdminDoctorManagementPage-CgrOBP96.js` | 29.96 kB | 6.16 kB | Staff management & credentialing modal |
| `DoctorDashboard-uDGslj3e.js` | 19.56 kB | 4.34 kB | Clinician dashboard |
| `AdminDashboard-CdrfZW7s.js` | 19.16 kB | 4.68 kB | Administration command center |
| `DoctorDiscoveryPage-BhfM8rHy.js` | 19.05 kB | 4.84 kB | Public directory & appointment reservation |
| `AdminDepartmentManagementPage-h-riLXfB.js` | 18.90 kB | 4.47 kB | Department catalog management |
| `PatientAppointmentsPage-DCNCg381.js` | 18.19 kB | 4.51 kB | Patient appointments list |
| `DoctorProfilePage-CHOTPPah.js` | 17.68 kB | 4.48 kB | Doctor profile editor |
| `DoctorSchedulePage-B28ZNmRj.js` | 17.48 kB | 4.45 kB | Doctor schedule & leave manager |
| `LandingPage-B1hOXwMy.js` | 17.01 kB | 4.68 kB | Public landing page |
| `PatientDashboard-CDuV340E.js` | 14.20 kB | 3.38 kB | Patient home overview |
| `AdminAppointmentsPage-BzPlRI7x.js` | 12.50 kB | 3.54 kB | Admin master appointment tracker |
| `PatientPrescriptionsPage-yD6Cwq9v.js` | 12.15 kB | 3.28 kB | Patient digital prescriptions viewer |
| `AdminReportsPage-HcUNE_ep.js` | 11.61 kB | 2.64 kB | Aggregated hospital reports & print view |
| `PatientProfilePage-CSdNQNMM.js` | 10.52 kB | 3.02 kB | Patient medical profile |
| `AdminAuditLogsPage-CBOrfEFz.js` | 10.28 kB | 3.23 kB | Security & audit event explorer |
| `AdminUsersPage-DhC4cj1w.js` | 10.03 kB | 3.23 kB | System user administration |
| `Footer-Bt9hMY-7.js` | 8.40 kB | 2.37 kB | Shared footer |
| `LoginPage-CD0gXxHG.js` | 7.40 kB | 2.37 kB | Authentication login |
| `NotificationCenterPage-BR7Uwaq1.js` | 6.99 kB | 2.34 kB | Full notification feed |
| `NotificationBell-D6uFHp4x.js` | 6.58 kB | 2.46 kB | Interactive notification bell dropdown |
| `RegisterPage-BwKUhd9s.js` | 6.54 kB | 2.35 kB | Patient registration |
| `AdminNavbar-ByWWCKWq.js` | 6.17 kB | 1.94 kB | Admin navigation bar |
| `DoctorNavbar-D5nqESmP.js` | 5.98 kB | 1.94 kB | Doctor navigation bar |
| `PatientNavbar-DiiL5eBu.js` | 5.92 kB | 1.89 kB | Patient navigation bar |
| *(13+ micro-chunks)* | 0.16 – 0.42 kB | 0.16 – 0.28 kB | Fragmented individual icon files |

---

## 2. Bundle & Code-Splitting Observations

1. **Existing Route-Level Lazy Loading:**
   - Routes in `src/router/index.tsx` are already configured with `React.lazy()` and `Suspense`, correctly isolating individual pages into separate dynamic chunks.
2. **Micro-Chunk Fragmentation:**
   - Because `lucide-react` icons are imported individually across dynamic chunks without a defined manual chunking policy, Rollup extracts 13+ shared icons into separate sub-0.5 kB files (e.g. `chevron-left-DgaK5HCd.js` at 160B, `lock-Bd9cnZtK.js` at 240B). This introduces unnecessary HTTP request overhead.
3. **Vendor Grouping Absence:**
   - No explicit vendor chunking exists in `vite.config.ts`.
   - React, React-DOM, and React Router DOM are bundled directly with the application shell (`index-BzzP_WFy.js`).
   - Query client and toast libraries are accidentally bundled under `ThemeContext` due to graph proximity in `App.tsx`.
   - Defining a clean manual chunk configuration will create stable vendor caches and prevent micro-chunk proliferation.

---

## 3. Dependency Observations

- **Core Dependencies:**
  - `react` (v19.2.8) & `react-dom` (v19.2.8)
  - `react-router-dom` (v7.18.4)
  - `@tanstack/react-query` (v5.104.1)
  - `zustand` (v5.0.15)
  - `axios` (v1.20.0)
  - `framer-motion` (v14.0.0)
  - `lucide-react` (v1.52.0)
  - `date-fns` (v4.4.0)
  - `react-hot-toast` (v2.6.1)
- **Observations:**
  - No legacy or duplicate heavy packages (e.g. Moment.js, Lodash, duplicate icon libraries) exist in `package.json`.
  - All installed packages are directly imported and actively utilized.

---

## 4. Rendering Observations

1. **Search Input Reactivity:**
   - `DoctorDiscoveryPage.tsx` and `AdminDoctorManagementPage.tsx` directly bind input `onChange` to state variables that immediately trigger `fetchDoctors()` in a `useEffect`.
   - Rapid typing (e.g., typing a 10-character doctor name) results in up to 10 sequential API calls without delay, leading to request spam and multiple re-renders.
2. **Dashboard Derived Calculations:**
   - In `DoctorDashboard.tsx`, `waitingPatientsCount`, `completedTodayCount`, and `upcomingAppointments` are recalculated on every single render without `useMemo`, even when appointment arrays have not changed.
3. **Table & List Rendering:**
   - Table rows and cards re-render cleanly; virtualization is not warranted for BCA project data scale (typically 10-50 rows per page), but lightweight memoization of filter states will prevent wasted render passes.

---

## 5. API Request & Network Observations

1. **Redundant Department Fetching:**
   - Static hospital departments (`/public/departments`) are repeatedly fetched across `LandingPage`, `DoctorDiscoveryPage`, `AdminDoctorManagementPage`, `AdminDepartmentManagementPage`, and `AdminReportsPage`.
   - Because department definitions rarely change during an active session, an in-memory client-side cache will eliminate redundant HTTP requests across route transitions.
2. **Parallel Request Coordination:**
   - Dashboards (`PatientDashboard`, `DoctorDashboard`) already leverage `Promise.all` for initial statistics and appointment lists, which is an existing positive pattern.
3. **Live Polling Frequency:**
   - `NotificationBell.tsx` polls `/notifications/unread-count` every 30 seconds. This is a lightweight integer endpoint and safe for clinical alerting.

---

## 6. Static Assets & Typography Observations

1. **Render-Blocking Typography:**
   - `src/index.css` contains `@import url('https://fonts.googleapis.com/...');` at line 1.
   - CSS `@import` delays font discovery until after the main CSS file is fetched and parsed, creating a noticeable render-blocking waterfall.
   - Migrating font loading to `<link rel="preconnect">` and `<link rel="stylesheet">` in `index.html` will allow the browser to initiate DNS, TLS, and font stylesheet downloads in parallel with HTML parsing.
2. **Favicon Link Error:**
   - `index.html` references `/vite.svg` which does not exist in the `public/` directory (where `favicon.svg` exists). This triggers a redundant 404 HTTP request on initial load.
3. **Images:**
   - No oversized or unoptimized raster images (PNG/JPEG) exist; the project relies entirely on clean inline SVG icons and vector illustrations.

---

## 7. Prioritized Optimization Plan

1. **Rollup / Vite Chunk Strategy (P1):**
   - Introduce sensible `manualChunks` in `vite.config.ts` (`react-vendor`, `ui-vendor`, `query-vendor`).
   - Eliminate sub-0.5 kB micro-chunk fragmentation.
   - Stabilize vendor caching for long-term browser cache hits.
2. **Font & Document Shell Optimization (P1):**
   - Move Google Fonts from `@import` in `index.css` to preconnected `<link>` tags in `index.html`.
   - Correct `/favicon.svg` link in `index.html` to prevent 404 network penalty.
3. **Search Debouncing (P2):**
   - Implement `useDebounce` hook for real-time search inputs in `DoctorDiscoveryPage.tsx` and `AdminDoctorManagementPage.tsx` with a 300ms delay.
4. **Static Reference Caching (P2):**
   - Add in-memory caching to `publicApi.getDepartments()` to prevent repeated roundtrips across page changes while providing cache invalidation for admin updates.
5. **Component Render Efficiency (P3):**
   - Memoize derived appointment calculations in `DoctorDashboard.tsx` and `PatientDashboard.tsx` with `useMemo`.
6. **Verification & Regression Testing:**
   - Re-run production build (`npm run build`) and record before/after bundle metrics.
   - Run complete suite of Phase 01–08 regression tests.
