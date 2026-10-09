import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Works when run from hams-frontend/src/tests or root
const FRONTEND_DIR = fs.existsSync(path.join(__dirname, '..', 'lib'))
  ? path.join(__dirname, '..')
  : path.join(__dirname, '..', 'hams-frontend', 'src');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

function readFile(relPath) {
  const fullPath = path.join(FRONTEND_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('\n============================================================');
console.log('HAMS PHASE 08 — ACCESSIBILITY & RESPONSIVE HARDENING AUDIT');
console.log('============================================================\n');

// 1. useModalA11y Hook Verification
console.log('1. Focus Trap & Modal A11y Hook (useModalA11y.ts):');
try {
  const hookContent = readFile('lib/useModalA11y.ts');
  assert(hookContent.includes('export function useModalA11y'), 'Hook useModalA11y exported');
  assert(hookContent.includes('document.activeElement'), 'Captures previously active element for focus restoration');
  assert(hookContent.includes("e.key === 'Escape'"), 'Handles Escape key dismissal');
  assert(hookContent.includes("e.key === 'Tab'"), 'Handles Tab cycling focus trap');
  assert(hookContent.includes('document.body.style.overflow = \'hidden\''), 'Locks body scroll while modal is active');
  assert(hookContent.includes('previouslyFocusedRef.current.focus()'), 'Restores trigger focus on modal unmount');
} catch (err) {
  assert(false, 'useModalA11y.ts existence', err.message);
}

// 2. Base Modal Component Verification
console.log('\n2. Reusable Modal Component (Modal.tsx):');
try {
  const modalContent = readFile('components/ui/Modal.tsx');
  assert(modalContent.includes('useModalA11y'), 'Modal integrates useModalA11y hook');
  assert(modalContent.includes('role="dialog"'), 'Modal declares role="dialog"');
  assert(modalContent.includes('aria-modal="true"'), 'Modal declares aria-modal="true"');
  assert(modalContent.includes('aria-labelledby='), 'Modal declares aria-labelledby');
  assert(modalContent.includes('aria-describedby='), 'Modal declares aria-describedby');
  assert(modalContent.includes('min-w-[44px]') && modalContent.includes('min-h-[44px]'), 'Close button enforces 44x44px touch target');
} catch (err) {
  assert(false, 'Modal.tsx verification', err.message);
}

// 3. Table Semantic Headers Verification
console.log('\n3. Semantic Table Infrastructure (Table.tsx & Page Tables):');
try {
  const tableContent = readFile('components/ui/Table.tsx');
  assert(tableContent.includes("scope = 'col'") || tableContent.includes('scope = "col"'), 'TableHead defaults to scope="col"');
  assert(tableContent.includes('break-words'), 'TableCell includes break-words protection');

  const pagesWithTables = [
    'pages/admin/AdminAppointmentsPage.tsx',
    'pages/admin/AdminAuditLogsPage.tsx',
    'pages/admin/AdminDashboard.tsx',
    'pages/admin/AdminDoctorManagementPage.tsx',
    'pages/admin/AdminReportsPage.tsx',
    'pages/admin/AdminUsersPage.tsx',
    'pages/doctor/DoctorAppointmentsPage.tsx',
    'pages/patient/PatientPrescriptionsPage.tsx',
  ];

  pagesWithTables.forEach((pagePath) => {
    const pageContent = readFile(pagePath);
    const hasScopeCol = pageContent.includes('scope="col"') || pageContent.includes("<TableHead");
    assert(hasScopeCol, `${path.basename(pagePath)} contains scope="col" headers`);
  });
} catch (err) {
  assert(false, 'Table semantic verification', err.message);
}

// 4. Form Controls Hardening
console.log('\n4. Form Controls Hardening (Input, Select, Textarea):');
try {
  const inputContent = readFile('components/ui/Input.tsx');
  assert(inputContent.includes('aria-required={props.required}'), 'Input declares aria-required from required prop');
  assert(inputContent.includes('aria-invalid='), 'Input reflects aria-invalid based on error state');
  assert(inputContent.includes('aria-describedby='), 'Input associates error and hint IDs via aria-describedby');
  assert(inputContent.includes('role="alert"'), 'Input error message has role="alert"');
  assert(inputContent.includes('min-w-[36px]') && inputContent.includes('min-h-[36px]'), 'Password visibility toggle has enlarged touch target');

  const selectContent = readFile('components/ui/Select.tsx');
  assert(selectContent.includes('aria-required={props.required}'), 'Select declares aria-required');
  assert(selectContent.includes('aria-invalid='), 'Select reflects aria-invalid');

  const textareaContent = readFile('components/ui/Textarea.tsx');
  assert(textareaContent.includes('aria-required={props.required}'), 'Textarea declares aria-required');
  assert(textareaContent.includes('aria-invalid='), 'Textarea reflects aria-invalid');
} catch (err) {
  assert(false, 'Form controls verification', err.message);
}

// 5. Accessible Names on Search and Filter Bars
console.log('\n5. Accessible Search & Filter Form Inputs:');
try {
  const doctorDiscovery = readFile('pages/public/DoctorDiscoveryPage.tsx');
  assert(doctorDiscovery.includes('aria-label="Search doctors by name or specialty"'), 'DoctorDiscoveryPage search input has accessible name');

  const adminUsers = readFile('pages/admin/AdminUsersPage.tsx');
  assert(adminUsers.includes('aria-label="Search by name or email address"'), 'AdminUsersPage search input has accessible name');
  assert(adminUsers.includes('aria-label="Clear all filters"'), 'AdminUsersPage clear button has accessible name');

  const adminDepts = readFile('pages/admin/AdminDepartmentManagementPage.tsx');
  assert(adminDepts.includes('aria-label="Search departments or specialties"'), 'AdminDepartmentManagementPage search has accessible name');

  const adminDocs = readFile('pages/admin/AdminDoctorManagementPage.tsx');
  assert(adminDocs.includes('aria-label="Search by doctor or specialty"'), 'AdminDoctorManagementPage search has accessible name');

  const doctorSchedule = readFile('pages/doctor/DoctorSchedulePage.tsx');
  assert(doctorSchedule.includes('aria-label="Preview calendar date"'), 'DoctorSchedulePage preview date has accessible name');
  assert(doctorSchedule.includes('aria-label="Leave start date"'), 'DoctorSchedulePage leave start date has accessible name');
} catch (err) {
  assert(false, 'Accessible form inputs verification', err.message);
}

// 6. Navigation Landmark & Mobile Drawer Accessibility
console.log('\n6. Navigation Landmarks & Drawer A11y:');
try {
  const navbars = [
    { file: 'components/layout/PatientNavbar.tsx', name: 'PatientNavbar' },
    { file: 'components/layout/DoctorNavbar.tsx', name: 'DoctorNavbar' },
    { file: 'components/layout/AdminNavbar.tsx', name: 'AdminNavbar' },
    { file: 'components/layout/PublicNavbar.tsx', name: 'PublicNavbar' },
  ];

  navbars.forEach(({ file, name }) => {
    const navContent = readFile(file);
    assert(navContent.includes('aria-label='), `${name} has aria-label on navigation landmark`);
    assert(navContent.includes('aria-expanded='), `${name} declares aria-expanded on mobile menu toggle`);
    assert(navContent.includes("e.key === 'Escape'"), `${name} handles Escape key to dismiss drawer`);
    assert(navContent.includes('min-h-[44px]') || navContent.includes('min-w-[44px]'), `${name} enforces 44px touch targets on mobile triggers`);
  });
} catch (err) {
  assert(false, 'Navigation verification', err.message);
}

// 7. Interactive Utilities (ThemeToggle & NotificationBell)
console.log('\n7. Interactive Utilities (ThemeToggle & NotificationBell):');
try {
  const bellContent = readFile('components/notifications/NotificationBell.tsx');
  assert(bellContent.includes('aria-live="polite"'), 'NotificationBell badge has aria-live="polite"');
  assert(bellContent.includes('aria-expanded='), 'NotificationBell declares aria-expanded on dropdown toggle');
  assert(bellContent.includes("e.key === 'Escape'"), 'NotificationBell dismisses on Escape key');
  assert(bellContent.includes('min-w-[44px]') && bellContent.includes('min-h-[44px]'), 'NotificationBell trigger satisfies 44x44px touch target');

  const themeToggleContent = readFile('components/ui/ThemeToggle.tsx');
  assert(themeToggleContent.includes('aria-expanded='), 'ThemeToggle declares aria-expanded');
  assert(themeToggleContent.includes("e.key === 'Escape'"), 'ThemeToggle dismisses menu on Escape key');
  assert(themeToggleContent.includes('min-w-[44px]') && themeToggleContent.includes('min-h-[44px]'), 'ThemeToggle trigger satisfies 44x44px touch target');
} catch (err) {
  assert(false, 'Interactive utilities verification', err.message);
}

// 8. Motion & Focus Ring Accessibility in Styles
console.log('\n8. Reduced-Motion & Focus Visual Styles (index.css & tailwind):');
try {
  const cssContent = readFile('index.css');
  assert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'index.css defines prefers-reduced-motion media query');
  assert(cssContent.includes('animation-duration: 0.01ms !important'), 'Animations dampened to 0.01ms for reduced motion');
  assert(cssContent.includes('transition-duration: 0.01ms !important'), 'Transitions dampened to 0.01ms for reduced motion');
  assert(cssContent.includes('focus-visible:ring-2'), 'Interactive utility classes define focus-visible rings');
} catch (err) {
  assert(false, 'CSS accessibility verification', err.message);
}

// Summary
console.log('\n============================================================');
console.log(`AUDIT RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All Phase 08 accessibility hardening checks passed successfully!\n');
  process.exit(0);
}
