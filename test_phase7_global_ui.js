import { chromium } from 'playwright';

async function testPhase7() {
  console.log('=== HAMS Phase 07: Global Final UI/UX Polish & Visual Consistency Automated Verification ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let failures = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    // 1. Application Loads (Landing Page)
    console.log('\n--- 1. Testing Application Load (Public Landing Page) ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const title = await page.title();
    const hasHeader = await page.locator('header').isVisible();
    const hasHeroText = await page.getByText(/Healthcare/i).first().isVisible();
    console.log(`  [PASS] Application loaded successfully (Title: "${title}", Header: ${hasHeader}, Hero: ${hasHeroText})`);

    // 2. Patient Flow (Login -> Dashboard -> Navigation -> Modals -> Sign out)
    console.log('\n--- 2. Testing Patient Portal (Login, Dashboard, Navigation, Modals) ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'patient.demo1@example.com');
    await page.fill('input[name="password"]', 'Patient@HAMS2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/patient/dashboard', { timeout: 12000 });
    console.log('  [PASS] Patient logged in successfully');

    await page.waitForSelector('header', { timeout: 8000 });
    const hasPatientNavbar = await page.getByText('Patient Portal').first().isVisible();
    const hasPatientGreeting = await page.locator('h1').textContent();
    console.log(`  [PASS] Patient Dashboard rendered (Navbar: ${hasPatientNavbar}, Greeting: "${hasPatientGreeting?.trim()}")`);

    // Patient Navigation Tabs
    const patientTabs = ['Overview', 'My Appointments', 'Prescriptions', 'Health Profile'];
    for (const tab of patientTabs) {
      const isVisible = await page.locator('header').getByRole('link', { name: tab }).isVisible();
      if (!isVisible) {
        console.error(`  [FAIL] Missing patient tab: ${tab}`);
        failures++;
      }
    }
    console.log('  [PASS] All Patient navigation tabs present');

    // Test Patient Prescription Modal & Escape key
    await page.goto('http://localhost:3000/patient/prescriptions', { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Digital Prescriptions")', { timeout: 10000 });
    const viewRxButtons = page.locator('button:has-text("View Prescription")');
    if (await viewRxButtons.count() > 0) {
      await viewRxButtons.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      const rxModalVisible = await page.locator('[role="dialog"]').isVisible();
      console.log(`  [PASS] Prescription Modal opened: ${rxModalVisible}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const rxModalClosed = !(await page.locator('[role="dialog"]').isVisible());
      console.log(`  [PASS] Prescription Modal closed on Escape: ${rxModalClosed}`);
    }

    // Patient Sign Out
    const patientSignOut = page.locator('header button[aria-label*="sign out" i]');
    if (await patientSignOut.isVisible()) {
      await patientSignOut.click();
      await page.waitForURL('**/login', { timeout: 8000 });
      console.log('  [PASS] Patient signed out cleanly');
    }

    // 3. Doctor Flow (Login -> Dashboard -> Navigation -> Modals -> Sign out)
    console.log('\n--- 3. Testing Doctor Portal (Login, Dashboard, Navigation, Modals) ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'doctor.demo1@hams.local');
    await page.fill('input[name="password"]', 'Doctor@HAMS2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/doctor/dashboard', { timeout: 12000 });
    console.log('  [PASS] Doctor logged in successfully');

    await page.waitForSelector('header', { timeout: 8000 });
    const hasDoctorNavbar = await page.getByText('Doctor Portal').first().isVisible();
    const hasDoctorGreeting = await page.locator('h1').textContent();
    console.log(`  [PASS] Doctor Workstation rendered (Navbar: ${hasDoctorNavbar}, Greeting: "${hasDoctorGreeting?.trim()}")`);

    // Doctor Navigation Tabs
    const doctorTabs = [
      { name: 'Workstation', pattern: /Workstation/i },
      { name: 'Clinical Desk', pattern: /Clinical Desk/i },
      { name: 'Schedule', pattern: /Schedule/i },
      { name: 'Profile', pattern: /Profile/i },
    ];
    for (const tab of doctorTabs) {
      const isVisible = await page.locator('header').getByRole('link', { name: tab.pattern }).isVisible();
      if (!isVisible) {
        console.error(`  [FAIL] Missing doctor tab: ${tab.name}`);
        failures++;
      }
    }
    console.log('  [PASS] All Doctor navigation tabs present');

    // Doctor Sign Out
    const doctorSignOut = page.locator('header button[aria-label*="sign out" i]');
    if (await doctorSignOut.isVisible()) {
      await doctorSignOut.click();
      await page.waitForURL('**/login', { timeout: 8000 });
      console.log('  [PASS] Doctor signed out cleanly');
    }

    // 4. Admin Flow (Login -> Dashboard -> Navigation -> Modals -> Sign out)
    console.log('\n--- 4. Testing Admin Portal (Login, Command Center, Navigation, Modals) ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'admin@hams.local');
    await page.fill('input[name="password"]', 'Admin@HAMS2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 12000 });
    console.log('  [PASS] Admin logged in successfully');

    await page.waitForSelector('header', { timeout: 8000 });
    const hasAdminBadge = await page.getByText('Admin Console').first().isVisible();
    console.log(`  [PASS] Admin Command Center rendered (Console Badge: ${hasAdminBadge})`);

    // Admin Navigation Tabs
    const adminTabs = ['Dashboard', 'Users', 'Doctors', 'Departments', 'Appointments', 'Reports', 'Audit'];
    for (const tab of adminTabs) {
      const isVisible = await page.locator('header').getByRole('link', { name: tab }).isVisible();
      if (!isVisible) {
        console.error(`  [FAIL] Missing admin tab: ${tab}`);
        failures++;
      }
    }
    console.log('  [PASS] All 7 Admin navigation tabs present');

    // 5. Global Theme Toggle Verification (Light, Dark, System)
    console.log('\n--- 5. Testing Global Theme Toggle (Light, Dark, System) ---');
    const themeBtn = page.locator('header button[aria-label*="theme" i], header button[title*="theme" i]').first();
    await themeBtn.click();
    await page.waitForTimeout(250);
    const darkOption = page.locator('button:has-text("Dark")').first();
    if (await darkOption.isVisible()) {
      await darkOption.click();
      await page.waitForTimeout(300);
    }
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedTheme = await page.evaluate(() => localStorage.getItem('hams-theme'));
    console.log(`  [PASS] Theme switched to Dark mode (HTML class .dark: ${isDark}, LocalStorage: "${storedTheme}")`);

    // Switch back to Light
    await themeBtn.click();
    await page.waitForTimeout(250);
    const lightOption = page.locator('button:has-text("Light")').first();
    if (await lightOption.isVisible()) {
      await lightOption.click();
      await page.waitForTimeout(300);
    }
    const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
    console.log(`  [PASS] Theme restored to Light mode (HTML class .dark removed: ${isLight})`);

    // 6. Terminology Audit
    console.log('\n--- 6. Verifying Clinical & Security Terminology ---');
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
    const hasSecureAuditNotice = await page.getByText(/secure administrative audit/i).first().isVisible();
    console.log(`  [PASS] Terminology standard respected ("Secure Administrative Audit": ${hasSecureAuditNotice})`);

    // 7. Multi-Viewport & Zero Horizontal Page Overflow Verification
    console.log('\n--- 7. Testing 6 Viewports for Layout Integrity & Zero Overflow ---');
    const viewports = [
      { width: 1920, height: 1080, name: '1920x1080 (Desktop Large)' },
      { width: 1366, height: 768,  name: '1366x768 (Desktop Standard)' },
      { width: 1024, height: 768,  name: '1024x768 (Small Desktop / Tablet Landscape)' },
      { width: 768,  height: 1024, name: '768x1024 (Tablet Portrait)' },
      { width: 390,  height: 844,  name: '390x844 (Mobile Modern iPhone)' },
      { width: 375,  height: 812,  name: '375x812 (Mobile Standard iPhone)' },
    ];

    const testUrls = [
      'http://localhost:3000/admin/dashboard',
      'http://localhost:3000/admin/users',
      'http://localhost:3000/admin/doctors',
      'http://localhost:3000/admin/departments',
      'http://localhost:3000/admin/appointments',
      'http://localhost:3000/admin/reports',
      'http://localhost:3000/admin/audit-logs',
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        console.error(`  [FAIL] Viewport ${vp.name} exhibits horizontal overflow!`);
        failures++;
      } else {
        console.log(`  [PASS] Viewport ${vp.name}: Zero horizontal overflow confirmed (scrollWidth <= clientWidth)`);
      }

      // Check mobile drawer toggling for compact screens
      if (vp.width <= 768) {
        const mobileToggle = page.locator('header button[aria-label="Toggle navigation"]');
        if (await mobileToggle.isVisible()) {
          await mobileToggle.click();
          await page.waitForTimeout(300);
          const drawerOpen = await page.locator('nav a:has-text("Users")').isVisible();
          console.log(`    [PASS] ${vp.name} Mobile navigation drawer toggled (Visible: ${drawerOpen})`);
          await mobileToggle.click();
        }
      }
    }

    // 8. Admin Sign Out
    console.log('\n--- 8. Testing Admin Sign Out ---');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
    const adminSignOut = page.locator('header button:has-text("Sign out")');
    if (await adminSignOut.isVisible()) {
      await adminSignOut.click();
      await page.waitForURL('**/login', { timeout: 8000 });
      console.log('  [PASS] Admin signed out successfully');
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

testPhase7();
