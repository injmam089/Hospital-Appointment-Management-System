# HAMS Phase 08 — Pre-Flight Accessibility & Responsive Hardening Audit

**Audit Timestamp**: 2026-10-09  
**Scope**: Hospital Appointment Management System (HAMS) Frontend  
**Audited Roots**: `hams-frontend/src/`  
**Purpose**: Baseline audit of keyboard operability, focus control, ARIA semantics, form validation accessibility, table structure, touch target sizing, responsive overflow, and long content stability prior to hardening.

---

## 1. Executive Summary & Existing Strengths

The HAMS frontend has completed Phases 01 through 07, establishing strong design token foundations, responsive grid primitives, centralized theme switching (Light / Dark / System), sanitized API error messages, and baseline modal dismissals.

### Existing Strengths (Verified):
- **Semantic CSS Tokens**: Consistent variables (`--background`, `--surface`, `--primary`, `--foreground`, `--muted`, `--border`) with high-contrast palette mappings.
- **Base Modal Keyboard Listeners**: Escape key listeners implemented in `Modal.tsx` and across primary dialogs (`DoctorDiscoveryPage.tsx`, `PatientPrescriptionsPage.tsx`, `PatientAppointmentsPage.tsx`, `DoctorAppointmentsPage.tsx`, `AdminDoctorManagementPage.tsx`, `AdminDepartmentManagementPage.tsx`, `AdminAppointmentsPage.tsx`, `AdminAuditLogsPage.tsx`).
- **Form Primitives (`Input.tsx`, `Select.tsx`, `Textarea.tsx`)**: Reusable components bind `id`, `htmlFor`, `aria-invalid={!!error}`, `aria-describedby`, and provide `role="alert"` on validation error summaries.
- **Scroll Lock on Overlays**: `Modal.tsx` locks body scroll (`document.body.style.overflow = 'hidden'`) while open and restores it cleanly on dismissal.
- **Reduced Motion Support**: Global media query `@media (prefers-reduced-motion: reduce)` sets animation/transition durations to `0.01ms`.
- **Zero Viewport Overflow**: Page-level overflow hardening in Phase 07 confirmed zero horizontal scroll (`scrollWidth <= clientWidth`) across 6 target viewports.
- **Print Styles**: `@media print` in `index.css` strips navigation chrome and interactive action bars tagged with `.no-print`.

---

## 2. Identified Deficiencies & Hardening Requirements

### Finding A: Navigation Landmark Labels
- **Observation**: `<nav>` elements in `AdminNavbar.tsx` (line 134), `DoctorNavbar.tsx` (line 102), `PatientNavbar.tsx` (line 102), and `PublicNavbar.tsx` (line 43) lack distinct `aria-label` attributes.
- **Requirement**: Add unambiguous landmark labels:
  - `AdminNavbar`: `aria-label="Administrator console navigation"`
  - `DoctorNavbar`: `aria-label="Doctor workstation navigation"`
  - `PatientNavbar`: `aria-label="Patient portal navigation"`
  - `PublicNavbar`: `aria-label="Public website navigation"`
- **Drawer Requirement**: Mobile slide-down navigation drawers must also be enclosed in `<nav>` with matching mobile `aria-label` and close upon `Escape` key press.

### Finding B: Modal Focus Management (Trapping & Restoring Focus)
- **Observation**: While modals support `Escape` dismissal, focus is neither strictly trapped inside the dialog during Tab navigation nor restored to the triggering element upon closure.
- **Requirement**: Implement a reusable `useFocusTrap` / `useModalA11y` hook:
  1. Capture previously focused element on modal open (`document.activeElement`).
  2. Trap Tab / Shift+Tab cycling within focusable elements inside the modal.
  3. Automatically focus the modal or its first focusable control on mount.
  4. Restore focus to the initiating element on modal dismiss.

### Finding C: Table Header Semantic Scopes
- **Observation**: 49 `<th` elements in `Table.tsx` and custom data tables across Admin, Doctor, and Patient pages lack `scope="col"`.
- **Requirement**: Ensure all column header `<th>` tags declare `scope="col"`, and any row-identifying headers declare `scope="row"`.

### Finding D: Naked `<input>` Accessible Names
- **Observation**: Several in-page search inputs, filter controls, and date pickers directly use native `<input>` tags without explicit `<label>` or `aria-label` (e.g. search filters in `AdminAppointmentsPage.tsx`, `DoctorAppointmentsPage.tsx`, `PatientPrescriptionsPage.tsx`, `AdminReportsPage.tsx`).
- **Requirement**: Provide explicit `aria-label` or `<label htmlFor="...">` attributes for every standalone input field.

### Finding E: Touch Target Dimensions on Mobile
- **Observation**: Certain mobile action triggers (e.g. mobile drawer hamburger toggles, table inline action buttons, modal close `X` buttons) measure ~32-36px, below the recommended 44×44px minimum touch target for mobile usability.
- **Requirement**: Apply minimum touch target sizing (`min-w-[44px] min-h-[44px] flex items-center justify-center` or responsive padding) on touch and mobile viewport controls.

### Finding F: Long Clinical Content Wrapping
- **Observation**: Long patient names, doctor credentials, medical diagnoses, and multi-line prescription dosage instructions in table cells could overflow on small viewports without explicit word break directives.
- **Requirement**: Reinforce `break-words`, `overflow-wrap-anywhere`, and `min-w-0` on container cards, table cells, and consultation notes.

### Finding G: Status & Live Regions
- **Observation**: Dynamic notification badge count updates, appointment filter refreshes, and toast confirmations rely on visual rendering without explicit `aria-live="polite"` or `role="status"` region wrappers.
- **Requirement**: Equip notification counters and filter loading indicators with `aria-live="polite"`.

---

## 3. Component Action Matrix

| Component / Page | Current Accessibility State | Hardening Actions Required |
| :--- | :--- | :--- |
| `Modal.tsx` | Partial (Escape + scroll lock + role="dialog") | Add focus trap, initial focus, and return focus on close. |
| `Table.tsx` | Partial (overflow-x-auto, no scope) | Default `scope="col"` on `TableHead` component. |
| `PatientNavbar.tsx` | Good | Add `aria-label` to nav, add Escape listener to mobile drawer, verify 44px touch targets. |
| `DoctorNavbar.tsx` | Good | Add `aria-label` to nav, add Escape listener to mobile drawer, verify 44px touch targets. |
| `AdminNavbar.tsx` | Good | Add `aria-label` to nav, add Escape listener to mobile drawer, verify 44px touch targets. |
| `PublicNavbar.tsx` | Good | Add `aria-label` to nav, add Escape listener to mobile drawer. |
| `Input.tsx` | Strong | Add `aria-required={props.required}`, enhance password button touch area. |
| `AdminAppointmentsPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label` to filter inputs. |
| `AdminAuditLogsPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label` to filter/search inputs. |
| `AdminDoctorManagementPage.tsx` | Functional | Add `scope="col"` on `<th>`, ensure modal focus trap on Add Doctor modal. |
| `AdminDepartmentManagementPage.tsx`| Functional | Add `scope="col"` on `<th>`, ensure modal focus trap on Add Dept modal. |
| `AdminReportsPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label` to date range inputs. |
| `AdminUsersPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label="Clear all filters"` on icon button. |
| `DoctorAppointmentsPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label` on search & date inputs, focus trap consultation modal. |
| `PatientPrescriptionsPage.tsx` | Functional | Add `scope="col"` on `<th>`, add `aria-label` on search input, focus trap prescription modal. |
| `DoctorDiscoveryPage.tsx` | Functional | Add `aria-label` on search & filter inputs, focus trap booking wizard modal. |
