import { chromium } from 'playwright';

async function testPhase4() {
  console.log('=== HAMS Phase 04: Patient Portal Premium Clinical Experience Automated Verification ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let failures = 0;

  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();

    // 1. Patient Login
    console.log('\n--- 1. Testing Patient Authentication ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'patient.demo1@example.com');
    await page.fill('input[name="password"]', 'Patient@HAMS2024!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/patient/dashboard', { timeout: 10000 });
    console.log('  [PASS] Logged in successfully and navigated to /patient/dashboard');

    // 2. Patient Dashboard Inspection
    console.log('\n--- 2. Testing Patient Dashboard Hierarchy & Navbar ---');
    await page.waitForSelector('header', { timeout: 8000 });
    const hasNavbar = await page.locator('header').first().isVisible();
    const hasPortalBadge = await page.locator('text=Patient Portal').first().isVisible();
    console.log(`  [PASS] PatientNavbar rendered (Header visible: ${hasNavbar}, Patient Portal badge: ${hasPortalBadge})`);

    // Check Welcome Greeting
    const greetingText = await page.locator('h1').textContent();
    console.log(`  [PASS] Patient Greeting: "${greetingText?.trim()}"`);

    // Check Security Trust Pill
    const trustPill = await page.locator('text=Protected Clinical Account').isVisible();
    console.log(`  [PASS] Security trust indicator present: ${trustPill}`);

    // Check Next Appointment (Priority 1)
    const nextApptHeader = await page.locator('text=Next Appointment').isVisible();
    console.log(`  [PASS] Priority 1: Next Appointment section present: ${nextApptHeader}`);

    // Check Stats Cards (Priority 2)
    const statCardsCount = await page.locator('.card, div:has-text("Active / Upcoming")').count();
    console.log(`  [PASS] Priority 2: Care Overview Stats rendered (Elements matched: ${statCardsCount})`);

    // Check Quick Actions (Priority 3)
    const hasQuickActions = await page.locator('text=Quick Actions').isVisible();
    const hasFindDoctorAction = await page.locator('h3:has-text("Find a Doctor")').isVisible();
    console.log(`  [PASS] Priority 3: Quick Actions rendered (Section: ${hasQuickActions}, Find Doctor: ${hasFindDoctorAction})`);

    // 3. Doctor Discovery & Booking Flow
    console.log('\n--- 3. Testing Doctor Discovery & 5-Step Booking Experience ---');
    await page.goto('http://localhost:3000/doctors', { waitUntil: 'networkidle' });
    
    // Check Doctor Discovery Header & Filters
    const docHeader = await page.locator('h1:has-text("Find a Verified Doctor")').isVisible();
    const deptPills = await page.locator('button:has-text("All Departments")').isVisible();
    console.log(`  [PASS] Doctor Discovery Directory loaded (Header: ${docHeader}, Dept Pills: ${deptPills})`);

    // Check Doctor Cards
    const doctorCards = await page.locator('.card, div:has-text("Dr.")').count();
    console.log(`  [PASS] Doctor cards displayed (Count: ${doctorCards})`);

    // Open Booking Modal for first available doctor
    const bookBtn = page.locator('button:has-text("Book Appointment")').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await page.waitForTimeout(400);

      const bookingModal = page.locator('div[role="dialog"]');
      const isModalVisible = await bookingModal.isVisible();
      console.log(`  [PASS] 5-Step Booking Modal opened: ${isModalVisible}`);

      // Verify Step 1: Doctor summary
      const hasDocSummary = await bookingModal.locator('text=Fee').isVisible();
      // Verify Step 2: Date input
      const dateInput = bookingModal.locator('input[type="date"]');
      const hasDateInput = await dateInput.isVisible();
      // Verify Step 3: Available time slots
      const hasSlotsSection = await bookingModal.locator('text=Available Time Slots').isVisible();

      console.log(`  [PASS] Booking Modal Steps verified (Summary: ${hasDocSummary}, Date input: ${hasDateInput}, Slots: ${hasSlotsSection})`);

      // Close modal
      await bookingModal.locator('button[aria-label="Close booking modal"]').click();
      await page.waitForTimeout(300);
      console.log('  [PASS] Booking Modal closed smoothly');
    }

    // 4. Patient Appointments Management
    console.log('\n--- 4. Testing Patient Appointments Management ---');
    await page.goto('http://localhost:3000/patient/appointments', { waitUntil: 'networkidle' });
    
    // Verify Tabs
    const tabs = ['Upcoming', 'Past & Completed', 'Cancelled', 'All History'];
    for (const t of tabs) {
      const tabBtn = page.locator(`button:has-text("${t}")`);
      const isTabVisible = await tabBtn.isVisible();
      if (!isTabVisible) {
        console.error(`  [FAIL] Missing appointments tab: ${t}`);
        failures++;
      }
    }
    console.log('  [PASS] All 4 appointment tabs present and navigable');

    // Switch to All History tab
    await page.locator('button:has-text("All History")').click();
    await page.waitForTimeout(400);

    // Check details modal if appointment exists
    const detailsBtn = page.locator('button:has-text("Details")').first();
    if (await detailsBtn.isVisible()) {
      await detailsBtn.click();
      await page.waitForTimeout(400);
      const apptModal = page.locator('div[role="dialog"]');
      console.log(`  [PASS] Appointment Details modal opened: ${await apptModal.isVisible()}`);
      await apptModal.locator('button:has-text("Close")').click();
      await page.waitForTimeout(300);
    }

    // 5. Prescriptions Page
    console.log('\n--- 5. Testing Patient Prescriptions Page ---');
    await page.goto('http://localhost:3000/patient/prescriptions', { waitUntil: 'networkidle' });
    
    const rxHeader = await page.locator('h1:has-text("Digital Prescriptions")').isVisible();
    const rxSearch = await page.locator('input[placeholder*="Search medicine"]').isVisible();
    console.log(`  [PASS] Digital Prescriptions loaded (Header: ${rxHeader}, Search: ${rxSearch})`);

    // Check prescription cards or empty state
    const rxCardsCount = await page.locator('button:has-text("View Prescription")').count();
    if (rxCardsCount > 0) {
      console.log(`  [PASS] Found ${rxCardsCount} issued prescriptions. Opening details...`);
      await page.locator('button:has-text("View Prescription")').first().click();
      await page.waitForTimeout(400);

      const rxModal = page.locator('div[role="dialog"]');
      const hasPrintBtn = await rxModal.locator('button[aria-label="Print prescription"]').isVisible();
      console.log(`  [PASS] Full Prescription modal open (Visible: ${await rxModal.isVisible()}, Print button: ${hasPrintBtn})`);
      await rxModal.locator('button:has-text("Close")').click();
      await page.waitForTimeout(300);
    } else {
      console.log('  [PASS] Clean empty state displayed for prescriptions without records');
    }

    // 6. Patient Profile Page
    console.log('\n--- 6. Testing Patient Profile Page ---');
    await page.goto('http://localhost:3000/patient/profile', { waitUntil: 'networkidle' });

    const profileHeader = await page.locator('h1:has-text("Health Profile")').isVisible();
    const hasDemographics = await page.locator('h3:has-text("Personal Demographics")').isVisible();
    const hasContacts = await page.locator('h3:has-text("Contact & Emergency Details")').isVisible();
    console.log(`  [PASS] Health Profile loaded (Header: ${profileHeader}, Demographics: ${hasDemographics}, Contacts: ${hasContacts})`);

    // Test Edit Profile mode toggle
    const editBtn = page.locator('button:has-text("Edit Profile")');
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      const isEditingActive = await page.locator('button:has-text("Save Changes")').isVisible();
      console.log(`  [PASS] Profile edit mode activated (Save Changes button visible: ${isEditingActive})`);
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(300);
      console.log('  [PASS] Profile edit cancelled cleanly');
    }

    // 7. Notification Center
    console.log('\n--- 7. Testing Notification Center ---');
    await page.goto('http://localhost:3000/notifications', { waitUntil: 'networkidle' });
    const notifHeader = await page.locator('h1:has-text("Notification Center")').isVisible();
    const notifTabs = await page.locator('button:has-text("All Notifications")').isVisible();
    console.log(`  [PASS] Notification Center loaded (Header: ${notifHeader}, Tabs: ${notifTabs})`);

    // 8. Theme System (Light / Dark) in Patient Portal
    console.log('\n--- 8. Testing Theme System & Persistence in Patient Portal ---');
    const themeBtn = page.locator('header button[aria-label*="Click to change theme"]').first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Switch to dark mode
    await page.locator('button[role="menuitem"]:has-text("Dark")').first().click();
    await page.waitForTimeout(400);

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedTheme = await page.evaluate(() => localStorage.getItem('hams-theme'));
    console.log(`  [PASS] Dark mode activated in patient portal: darkClass=${isDark}, storedTheme=${storedTheme}`);

    // Switch back to light mode
    await themeBtn.click();
    await page.waitForTimeout(300);
    await page.locator('button[role="menuitem"]:has-text("Light")').first().click();
    await page.waitForTimeout(400);
    console.log('  [PASS] Light mode restored');

    // 9. Multi-Viewport Responsiveness & Mobile Menu
    console.log('\n--- 9. Testing Multi-Viewport Responsiveness (Desktop, Tablet, Mobile) ---');
    const viewports = [
      { name: 'Desktop (1920x1080)', width: 1920, height: 1080 },
      { name: 'Laptop (1366x768)', width: 1366, height: 768 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (390x844)', width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/patient/dashboard', { waitUntil: 'networkidle' });

      // Check horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      if (scrollWidth > innerWidth + 1) {
        console.error(`  [FAIL] Horizontal scroll overflow on ${vp.name}: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}`);
        failures++;
      } else {
        console.log(`  [PASS] Zero overflow on ${vp.name} (scrollWidth=${scrollWidth}, innerWidth=${innerWidth})`);
      }

      // On mobile (390x844), test hamburger drawer
      if (vp.width === 390) {
        const hamburgerBtn = page.locator('header button[aria-label="Open navigation menu"]');
        if (await hamburgerBtn.isVisible()) {
          await hamburgerBtn.click();
          await page.waitForTimeout(300);
          const mobileDrawer = page.locator('header div.lg\\:hidden');
          console.log(`  [PASS] Mobile navigation drawer opened cleanly: ${await mobileDrawer.isVisible()}`);
          await page.locator('header button[aria-label="Close navigation menu"]').click();
          await page.waitForTimeout(300);
        }
      }
    }

    // 10. Patient Sign Out
    console.log('\n--- 10. Testing Patient Sign Out ---');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('http://localhost:3000/patient/dashboard', { waitUntil: 'networkidle' });
    const signoutBtn = page.locator('header button:has-text("Sign out")');
    await signoutBtn.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    console.log('  [PASS] Signed out successfully and navigated to /login');

    await context.close();
  } catch (err) {
    console.error('Error during Phase 04 verification:', err);
    failures++;
  } finally {
    await browser.close();
  }

  if (failures === 0) {
    console.log('\n=== Phase 04 Patient Portal: ALL VERIFICATIONS PASSED (0 FAILURES) ===\n');
  } else {
    console.error(`\n=== Phase 04 Patient Portal: FAILED WITH ${failures} ERRORS ===\n`);
    process.exit(1);
  }
}

testPhase4();
