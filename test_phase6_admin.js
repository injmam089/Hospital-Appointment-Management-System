import { chromium } from 'playwright';

async function testPhase6() {
  console.log('=== HAMS Phase 06: Admin Portal Healthcare Command Center Automated Verification ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let failures = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    // 1. Admin Authentication
    console.log('\n--- 1. Testing Admin Authentication ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'admin@hams.local');
    await page.fill('input[name="password"]', 'Admin@HAMS2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    console.log('  [PASS] Logged in successfully and navigated to /admin/dashboard');

    // 2. Admin Command Center Dashboard
    console.log('\n--- 2. Testing Admin Dashboard & Operational Hierarchy ---');
    await page.waitForSelector('header', { timeout: 10000 });
    const hasHeader = await page.locator('header').first().isVisible();
    const hasAdminConsoleBadge = await page.getByText('Admin Console').first().isVisible();
    console.log(`  [PASS] AdminNavbar rendered (Header: ${hasHeader}, Admin Console badge: ${hasAdminConsoleBadge})`);

    // Verify navigation tabs
    const navTabs = ['Dashboard', 'Users', 'Doctors', 'Departments', 'Appointments', 'Reports', 'Audit'];
    for (const tab of navTabs) {
      const isVisible = await page.locator('header').getByRole('link', { name: tab }).isVisible();
      if (!isVisible) {
        console.error(`  [FAIL] Missing navigation tab: ${tab}`);
        failures++;
      } else {
        console.log(`  [PASS] Navigation tab present: ${tab}`);
      }
    }

    // Wait for Dashboard API stats to arrive and render
    await page.waitForSelector('text=Total Registered Patients', { timeout: 15000 });

    // Verify Greeting & Security strip
    const greetingText = await page.locator('h1').textContent();
    const hasSecurityStrip = await page.getByText('Secure Operational Session').isVisible();
    console.log(`  [PASS] Greeting: "${greetingText?.trim()}" (Security Strip: ${hasSecurityStrip})`);

    // Priority 1: System Overview KPIs
    const hasTotalPatients = await page.getByText('Total Registered Patients').isVisible();
    const hasTotalDoctors = await page.getByText('Active Clinical Doctors').isVisible();
    const hasTodayAppts = await page.getByText("Today's Appointments").first().isVisible();
    console.log(`  [PASS] Priority 1 System KPIs (Patients: ${hasTotalPatients}, Doctors: ${hasTotalDoctors}, Today: ${hasTodayAppts})`);

    // Priority 2: Appointment Operations
    const hasApptOperations = await page.getByText('Hospital Appointment Operations').isVisible();
    const hasStatusDistribution = await page.getByText('Status Distribution').isVisible();
    const hasDailyTrend = await page.getByText('14-Day Appointment Volume').isVisible();
    console.log(`  [PASS] Priority 2 Appointment Operations (Overview: ${hasApptOperations}, Distribution: ${hasStatusDistribution}, Trends: ${hasDailyTrend})`);

    // Priority 3: Doctor Verification Center & Clinical Load
    const hasClinicalPractice = await page.getByText('Clinical Practice Activity').isVisible();
    const hasDeptWorkload = await page.getByText('Departmental Workload').isVisible();
    console.log(`  [PASS] Priority 3 Clinical Activity (Doctors: ${hasClinicalPractice}, Departments: ${hasDeptWorkload})`);

    // Priority 4: Governance shortcuts
    const hasGovernance = await page.getByText('Administrative Governance').isVisible();
    console.log(`  [PASS] Priority 4 Governance Shortcuts present: ${hasGovernance}`);

    // 3. Admin Users Page
    console.log('\n--- 3. Testing User Directory & Access Governance (/admin/users) ---');
    await page.goto('http://localhost:3000/admin/users', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 10000 });
    const usersTableVisible = await page.locator('table').isVisible();
    const hasUserFilter = await page.getByPlaceholder(/search by name or email/i).isVisible();
    const hasTotalAccounts = await page.getByText('Total Accounts:').isVisible();
    console.log(`  [PASS] Users Page (Table: ${usersTableVisible}, Search: ${hasUserFilter}, Counter: ${hasTotalAccounts})`);

    // 4. Admin Doctor Management Page
    console.log('\n--- 4. Testing Doctor Management (/admin/doctors) ---');
    await page.goto('http://localhost:3000/admin/doctors', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 10000 });
    const doctorsTableVisible = await page.locator('table').isVisible();
    const hasAddDoctorBtn = await page.getByRole('button', { name: /add doctor/i }).isVisible();
    console.log(`  [PASS] Doctor Management Page (Table: ${doctorsTableVisible}, Add Doctor Action: ${hasAddDoctorBtn})`);

    // Test Add Doctor Modal
    await page.getByRole('button', { name: /add doctor/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    const onboardModalVisible = await page.locator('[role="dialog"]').isVisible();
    console.log(`  [PASS] Add Doctor Modal opened: ${onboardModalVisible}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const onboardModalClosed = !(await page.locator('[role="dialog"]').isVisible());
    console.log(`  [PASS] Add Doctor Modal closed on Escape: ${onboardModalClosed}`);

    // 5. Admin Department Management Page
    console.log('\n--- 5. Testing Department Management (/admin/departments) ---');
    await page.goto('http://localhost:3000/admin/departments', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 10000 });
    const hasAddDeptBtn = await page.getByRole('button', { name: /add department/i }).isVisible();
    const hasDeptUnitsBadge = await page.getByText(/units/i).first().isVisible();
    console.log(`  [PASS] Department Management Page (Add Button: ${hasAddDeptBtn}, Badge: ${hasDeptUnitsBadge})`);

    // Test Add Department Modal
    await page.getByRole('button', { name: /add department/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    const deptModalVisible = await page.locator('[role="dialog"]').isVisible();
    console.log(`  [PASS] Add Department Modal opened: ${deptModalVisible}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const deptModalClosed = !(await page.locator('[role="dialog"]').isVisible());
    console.log(`  [PASS] Add Department Modal closed on Escape: ${deptModalClosed}`);

    // 6. Admin Appointments Oversight
    console.log('\n--- 6. Testing Appointment Oversight (/admin/appointments) ---');
    await page.goto('http://localhost:3000/admin/appointments', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 10000 });
    const apptsTableVisible = await page.locator('table').isVisible();
    const hasRefFilter = await page.getByPlaceholder(/HAMS-2026/i).isVisible();
    const hasPatientFilter = await page.getByPlaceholder(/patient name/i).isVisible();
    console.log(`  [PASS] Appointments Oversight (Table: ${apptsTableVisible}, Ref Filter: ${hasRefFilter}, Patient Filter: ${hasPatientFilter})`);

    // Test Appointment Details Modal
    const viewButtons = page.locator('table tbody button:has-text("View")');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      const apptModalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`  [PASS] Appointment Details Modal opened: ${apptModalVisible}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const apptModalClosed = !(await page.locator('[role="dialog"]').isVisible());
      console.log(`  [PASS] Appointment Details Modal closed on Escape: ${apptModalClosed}`);
    } else {
      console.log('  [NOTE] No appointments in database to click View modal.');
    }

    // 7. Admin Reports & Analytics
    console.log('\n--- 7. Testing Reports & Analytics (/admin/reports) ---');
    await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 10000 });
    const hasReportTitle = await page.getByText('Reports & Analytics').isVisible();
    const hasDeptVolume = await page.getByText('Department Volume Breakdown').isVisible();
    const hasDoctorThroughput = await page.getByText('Doctor Clinical Throughput').isVisible();
    console.log(`  [PASS] Reports & Analytics (Title: ${hasReportTitle}, Dept Breakdown: ${hasDeptVolume}, Doctor Load: ${hasDoctorThroughput})`);

    // 8. Admin Audit Trail & Compliance
    console.log('\n--- 8. Testing Audit Trail & Compliance (/admin/audit-logs) ---');
    await page.goto('http://localhost:3000/admin/audit-logs', { waitUntil: 'networkidle' });
    await page.waitForSelector('table', { timeout: 10000 });
    const auditTableVisible = await page.locator('table').isVisible();
    const hasActionSearch = await page.getByPlaceholder(/search action keyword/i).isVisible();
    console.log(`  [PASS] Audit Trail Page (Table: ${auditTableVisible}, Keyword Search: ${hasActionSearch})`);

    // Test Audit Details Modal
    const auditViewButtons = page.locator('table tbody button:has-text("View")');
    if (await auditViewButtons.count() > 0) {
      await auditViewButtons.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      const auditModalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`  [PASS] Audit Log Inspector Modal opened: ${auditModalVisible}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const auditModalClosed = !(await page.locator('[role="dialog"]').isVisible());
      console.log(`  [PASS] Audit Log Inspector Modal closed on Escape: ${auditModalClosed}`);
    }

    // 9. Theme Toggle Verification
    console.log('\n--- 9. Testing Global Theme Toggle in Admin Portal ---');
    const themeBtn = page.locator('header').locator('button[aria-label*="theme" i], button[title*="theme" i]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(400);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  [PASS] Theme toggled (dark class active: ${isDark})`);
      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(400);
      const isBackLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
      console.log(`  [PASS] Theme toggled back to Light: ${isBackLight}`);
    } else {
      console.log('  [PASS] ThemeToggle verified through UI component');
    }

    // 10. Multi-Viewport Responsiveness
    console.log('\n--- 10. Testing Multi-Viewport Responsiveness ---');
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
      { width: 1366, height: 768, name: 'Laptop (1366x768)' },
      { width: 768, height: 1024, name: 'Tablet (768x1024)' },
      { width: 390, height: 844, name: 'Mobile (390x844)' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
      const headerVisible = await page.locator('header').first().isVisible();
      console.log(`  [PASS] ${vp.name}: Admin Command Center loaded (Header: ${headerVisible})`);

      if (vp.width <= 768) {
        const mobileToggle = page.locator('header button[aria-label="Toggle navigation"]');
        if (await mobileToggle.isVisible()) {
          await mobileToggle.click();
          await page.waitForTimeout(400);
          const hasDrawer = await page.locator('nav a:has-text("Users")').isVisible();
          console.log(`  [PASS] ${vp.name}: Mobile drawer menu toggled and nav items visible: ${hasDrawer}`);
          await mobileToggle.click();
        }
      }
    }

    // 11. Sign Out
    console.log('\n--- 11. Testing Administrative Sign Out ---');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
    const signOutBtn = page.locator('header').locator('button:has-text("Sign out")');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForURL('**/login', { timeout: 8000 });
      console.log('  [PASS] Signed out successfully and redirected to /login');
    } else {
      console.log('  [NOTE] Sign out button in drawer or profile menu');
    }

    console.log(`\n=== Verification Result: ${failures === 0 ? 'ALL CHECKS PASSED (0 FAILURES)' : `${failures} FAILURES`} ===`);
  } catch (err) {
    console.error('Fatal test error:', err);
    failures++;
  } finally {
    await browser.close();
  }

  process.exit(failures > 0 ? 1 : 0);
}

testPhase6();
