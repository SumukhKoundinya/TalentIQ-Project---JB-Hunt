const assert = require('assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  try {
    const context = await browser.newContext({ permissions: ['camera', 'clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.SETUP_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.locator('[data-nav="kiosk"]').click();
    await page.locator('#kioskCameraPanel').waitFor();
    assert(await page.locator('#kiosk-qr-canvas').isVisible());
    assert.strictEqual(await page.evaluate(() => TIQ.views._kioskCamera == null), true, 'no camera permission requested on entry');

    const eventId = await page.evaluate(() => TIQ.state.event.id);
    await page.locator('#kioskEditEvent').click();
    await page.locator('#kioskEditName').fill('Setup smoke fair');
    await page.locator('#kioskEditDate').fill('Oct 8, 2026');
    await page.locator('#kioskEditLocation').fill('Test booth');
    await page.locator('[data-kiosk-save]').click();
    assert.strictEqual(await page.locator('#kioskEventMeta').textContent(), 'Setup smoke fair');
    assert.strictEqual(await page.evaluate(() => TIQ.state.event.id), eventId);
    await page.reload();
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.locator('[data-nav="kiosk"]').click();
    assert.strictEqual(await page.locator('#kioskEventMeta').textContent(), 'Setup smoke fair', 'event survives reload');

    const qrBefore = await page.locator('#kiosk-qr-canvas').evaluate(canvas => canvas.toDataURL());
    await page.locator('#kioskEditQr').click();
    await page.locator('#kioskEditMethod').selectOption('custom-url');
    await page.locator('#kioskEditUrl').fill('https://example.com/setup-smoke');
    await page.locator('[data-kiosk-save]').click();
    assert.notStrictEqual(await page.locator('#kiosk-qr-canvas').evaluate(canvas => canvas.toDataURL()), qrBefore);
    await page.locator('#kioskCopyLink').click();
    assert.strictEqual(await page.evaluate(() => navigator.clipboard.readText()), 'https://example.com/setup-smoke');
    await page.evaluate(() => { window.print = () => { window.__setupPrinted = true; }; });
    await page.locator('#kioskPrintPoster').click();
    assert.strictEqual(await page.evaluate(() => window.__setupPrinted), true);
    await page.emulateMedia({ media: 'print' });
    assert.strictEqual(await page.locator('#kioskQrPanel').evaluate(el => getComputedStyle(el).visibility), 'visible');
    assert.strictEqual(await page.locator('#kioskCameraPanel').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    assert.strictEqual(await page.locator('.kiosk-qr-actions').evaluate(el => getComputedStyle(el).display), 'none');
    await page.emulateMedia({ media: 'screen' });

    await page.locator('#kioskCamEnable').click();
    await page.waitForFunction(() => document.querySelector('#kioskCameraPreview').srcObject != null);
    await page.evaluate(() => { window.__setupTracks = TIQ.views._kioskCamera.stream.getTracks(); });
    await page.locator('#kioskOpenCapture').click();
    assert.strictEqual(await page.evaluate(() => TIQ.router.currentView), 'capture');
    assert.strictEqual(await page.evaluate(() => window.__setupTracks.every(track => track.readyState === 'ended')), true, 'leaving setup stops all tracks');
    assert.strictEqual(await page.evaluate(() => TIQ.views._kioskCamera), null);

    await page.locator('[data-nav="kiosk"]').click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.strictEqual(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile has no horizontal overflow');
    assert.deepStrictEqual(errors, [], 'no browser exceptions');
    console.log('PASS: Setup browser smoke — rendering, event persistence/identity, QR, clipboard, print, camera teardown, mobile');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
