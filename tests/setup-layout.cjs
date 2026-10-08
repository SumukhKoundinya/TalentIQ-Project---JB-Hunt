const assert = require('assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 780 } });
    await page.goto(process.env.SETUP_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.locator('[data-nav="kiosk"]').click();
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [[1440, 780], [1280, 650], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      const layout = await page.evaluate(() => {
        const el = s => document.querySelector(s);
        const rect = s => { const r = el(s).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
        const style = s => getComputedStyle(el(s));
        return {
          workspace: rect('.kiosk-workspace'), left: rect('.kiosk-col-left'), panel: rect('.kiosk-qr-panel'),
          qr: rect('.kiosk-qr-container'), canvas: rect('#kiosk-qr-canvas'), actions: rect('.kiosk-qr-actions'),
          print: rect('#kioskPrintPoster'), copy: rect('#kioskCopyLink'), stage: rect('.kiosk-camera-stage'),
          allow: rect('#kioskCamEnable'), footer: rect('.kiosk-camera-panel__footer'), capture: rect('#kioskOpenCapture'),
          padding: style('.kiosk-workspace').padding, gap: style('.kiosk-workspace').gap,
          panels: ['.kiosk-event-card', '.kiosk-location-card', '.kiosk-camera-panel', '.kiosk-qr-panel'].map(s => style(s).padding),
          text: el('.kiosk-workspace').textContent,
          overflow: document.documentElement.scrollWidth > innerWidth,
          zoom: visualViewport.scale,
          controlsVisible: ['#kioskPrintPoster', '#kioskCopyLink', '#kioskCamEnable', '#kioskOpenCapture'].every(s => rect(s).bottom <= innerHeight),
        };
      });
      const close = (a, b, label) => assert(Math.abs(a - b) < 1, `${width}: ${label}: ${a} vs ${b}`);
      assert.strictEqual((layout.text.match(/scan to submit profile/gi) || []).length, 1, 'single scan caption');
      assert(!layout.text.includes('Candidate Intake Config'), 'configuration heading removed');
      assert(!layout.overflow, `${width}: no horizontal scrolling`);
      assert.strictEqual(layout.zoom, 1, '100% viewport scale');
      assert(layout.panels.every(p => p === '24px'), 'consistent panel padding');
      close(layout.qr.width, layout.qr.height, 'square QR container');
      close(layout.canvas.width, layout.canvas.height, 'square QR canvas');
      close(layout.actions.width, layout.qr.width, 'QR and action row widths');
      close(layout.print.width, layout.copy.width, 'equal buttons');
      assert(layout.print.height >= 44 && layout.copy.height >= 44, '44px actions');
      assert(layout.stage.bottom - layout.allow.bottom >= 16, 'camera button bottom padding');
      assert(layout.footer.y - layout.stage.bottom >= 16, 'camera footer separation');
      if (width >= 1200) {
        assert.strictEqual(layout.padding, '32px');
        assert.strictEqual(layout.gap, '24px');
        assert(layout.left.width >= 360 && layout.left.width <= 400, 'desktop left column width');
        close(layout.left.y, layout.panel.y, 'aligned tops');
        close(layout.left.bottom, layout.panel.bottom, 'aligned bottoms');
      } else {
        assert(layout.left.y >= layout.panel.bottom || layout.panel.y >= layout.left.bottom, 'stacked columns');
      }
      if (height === 780) assert(layout.controlsVisible, 'desktop controls fit available laptop content height');
      console.log(JSON.stringify({ viewport: `${width}x${height}`, ...layout }));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
