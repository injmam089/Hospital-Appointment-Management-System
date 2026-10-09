import { chromium } from 'playwright';

async function run() {
  console.log('=== HAMS Phase 01: Theme System & Responsiveness Automated Verification ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let failures = 0;

  // Viewport sizes to test
  const viewports = [
    { name: 'Desktop (1920x1080)', width: 1920, height: 1080 },
    { name: 'Laptop (1366x768)', width: 1366, height: 768 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Mobile (390x844)', width: 390, height: 844 },
  ];

  try {
    for (const vp of viewports) {
      console.log(`\n--- Testing Viewport: ${vp.name} ---`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // 1. Visit landing page
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      const pageTitle = await page.title();
      console.log(`  Page Title: ${pageTitle}`);

      // Check horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      if (scrollWidth > innerWidth + 1) { // 1px rounding tolerance
        console.error(`  [FAIL] Horizontal scroll overflow detected on ${vp.name}: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}`);
        failures++;
      } else {
        console.log(`  [PASS] No horizontal overflow on ${vp.name} (scrollWidth: ${scrollWidth}, innerWidth: ${innerWidth})`);
      }

      await context.close();
    }

    // 2. Comprehensive Theme Switching & Persistence Verification
    console.log('\n--- Testing Theme System & State Persistence ---');
    const themeContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await themeContext.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Initial theme inspection
    const initialDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const initialDataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log(`  Initial HTML data-theme: ${initialDataTheme}, dark class present: ${initialDarkClass}`);

    // Click Theme Toggle to open dropdown
    const toggleBtn = page.locator('button[aria-label*="Click to change theme"]').first();
    await toggleBtn.click();
    await page.waitForTimeout(300);

    // Select Dark mode
    const darkOption = page.locator('button[role="menuitem"]:has-text("Dark")').first();
    await darkOption.click();
    await page.waitForTimeout(400);

    const isDarkAfterClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const dataThemeAfterClick = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const storedTheme = await page.evaluate(() => localStorage.getItem('hams-theme'));
    console.log(`  After selecting Dark: darkClass=${isDarkAfterClick}, data-theme=${dataThemeAfterClick}, storedTheme=${storedTheme}`);

    if (isDarkAfterClick && dataThemeAfterClick === 'dark' && storedTheme === 'dark') {
      console.log('  [PASS] Dark theme applied and persisted in localStorage correctly');
    } else {
      console.error('  [FAIL] Dark theme was not properly set or persisted');
      failures++;
    }

    // Check computed styles in dark mode
    const bodyBgDark = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    console.log(`  Body background in dark mode: ${bodyBgDark} (expected rgb(7, 17, 31) for #07111F)`);

    // Reload page to verify persistence across page reloads (anti-flash check)
    await page.reload({ waitUntil: 'networkidle' });
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedThemeAfterReload = await page.evaluate(() => localStorage.getItem('hams-theme'));
    console.log(`  After reload: darkClass=${isDarkAfterReload}, storedTheme=${storedThemeAfterReload}`);

    if (isDarkAfterReload && storedThemeAfterReload === 'dark') {
      console.log('  [PASS] Dark theme persists across page reload without reset');
    } else {
      console.error('  [FAIL] Dark theme did not survive page reload');
      failures++;
    }

    // Switch to Light mode
    await page.locator('button[aria-label*="Click to change theme"]').first().click();
    await page.waitForTimeout(300);
    const lightOption = page.locator('button[role="menuitem"]:has-text("Light")').first();
    await lightOption.click();
    await page.waitForTimeout(400);

    const isDarkAfterLight = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const storedThemeLight = await page.evaluate(() => localStorage.getItem('hams-theme'));
    console.log(`  After selecting Light: darkClass=${isDarkAfterLight}, storedTheme=${storedThemeLight}`);

    if (!isDarkAfterLight && storedThemeLight === 'light') {
      console.log('  [PASS] Light theme restored and persisted in localStorage');
    } else {
      console.error('  [FAIL] Light theme was not properly restored');
      failures++;
    }

    // 3. Authenticated Functionality & Dashboard Verification
    console.log('\n--- Testing Authentication & Dashboard Portals ---');
    // Navigate to Login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    // Verify ThemeToggle is present on Login page
    const loginThemeToggle = page.locator('button[aria-label*="Click to change theme"]');
    const loginToggleCount = await loginThemeToggle.count();
    console.log(`  ThemeToggle present on Login page: ${loginToggleCount > 0 ? 'YES' : 'NO'}`);

    // Fill Admin credentials
    await page.fill('input[type="email"]', 'admin@hams.local');
    await page.fill('input[type="password"]', 'Admin@HAMS2024!');
    await page.click('button[type="submit"]');

    // Wait for redirect to Admin Dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  [PASS] Admin authenticated successfully and navigated to /admin/dashboard');

    // Check stats and header load
    await page.waitForSelector('text=Hospital Administration', { timeout: 10000 });
    console.log('  [PASS] Admin Dashboard data and header loaded cleanly');

    // Verify Admin Dashboard header contains ThemeToggle
    const adminThemeToggle = page.locator('header button[aria-label*="Click to change theme"]');
    const adminToggleVisible = await adminThemeToggle.isVisible();
    console.log(`  ThemeToggle in Admin Dashboard header: ${adminToggleVisible ? 'YES' : 'NO'}`);

    // Switch theme inside Admin Dashboard
    await adminThemeToggle.click();
    await page.waitForTimeout(300);
    await page.locator('button[role="menuitem"]:has-text("Dark")').first().click();
    await page.waitForTimeout(400);

    const adminIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`  Admin Dashboard in dark theme: ${adminIsDark ? 'YES' : 'NO'}`);

    // Logout
    const signoutBtn = page.locator('button:has-text("Sign out")').first();
    await signoutBtn.click();
    await page.waitForURL('**/login', { timeout: 5000 });
    console.log('  [PASS] Logout works smoothly and returns to /login');

    await themeContext.close();

  } catch (err) {
    console.error('Test error:', err);
    failures++;
  } finally {
    await browser.close();
  }

  console.log(`\n=== Verification Complete: ${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILURES OCCURRED'} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

run();
