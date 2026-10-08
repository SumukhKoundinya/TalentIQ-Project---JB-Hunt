// Optional rendered check: provide an installed Playwright via PLAYWRIGHT_MODULE.
// CHECK_IN_URL defaults to the static server at localhost:8000.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(process.env.CHECK_IN_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.evaluate(() => document.fonts.ready);
    // Pixel measurements must wait for the existing view entrance fade/translate.
    await page.locator('.view').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    const output = path.join(__dirname, '..', '.openchamber', 'screenshots');
    fs.mkdirSync(output, { recursive: true });
    for (const [width, height] of [[1440, 900], [1800, 980], [1280, 800], [1440, 780], [1280, 720]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const screenshot = await page.screenshot({ path: path.join(output, `check-in-${width}.png`) });
      const result = await page.evaluate(async (base64) => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const scale = image.width / innerWidth;
        const paintedTop = (selector, threshold) => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          const x = Math.ceil(rect.x * scale), y = Math.floor(rect.y * scale);
          const w = Math.floor(rect.width * scale), h = Math.floor(rect.height * scale);
          const pixels = context.getImageData(x, y, w, h).data;
          for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
              const i = (row * w + col) * 4;
              if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < threshold) return (y + row) / scale;
            }
          }
          throw new Error('No painted pixels for ' + selector);
        };
        const body = document.querySelector('.kiosk-poster__body').getBoundingClientRect();
        const columns = document.querySelector('.kiosk-poster__columns').getBoundingClientRect();
        const info = document.querySelector('#kioskEditQr').getBoundingClientRect();
        const headerInfo = document.querySelector('#kioskEditEvent').getBoundingClientRect();
        const intro = document.querySelector('.kiosk-instructions__intro').getBoundingClientRect();
        const left = document.querySelector('.kiosk-instructions').getBoundingClientRect();
        const footer = document.querySelector('.kiosk-poster__footer');
        const logo = footer.querySelector('img');
        const motto = footer.querySelector('.kiosk-poster__motto') || footer.querySelector('span');
        const leader = footer.querySelector('.kiosk-poster__leader');
        const actions = document.querySelector('.kiosk-qr-actions').getBoundingClientRect();
        const qrBlock = document.querySelector('.kiosk-qr-container').getBoundingClientRect();
        const qrCanvas = document.querySelector('#kiosk-qr-canvas').getBoundingClientRect();
        const qrPanel = document.querySelector('.kiosk-qr-panel');
        // Outer edges of the visible black pattern (the canvas' own white margin
        // is quiet zone, so it must not set the action row's width).
        const canvasEl = document.getElementById('kiosk-qr-canvas');
        const canvasCtx = canvasEl.getContext('2d');
        const modules = canvasCtx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
        let minX = canvasEl.width, maxX = -1;
        for (let mY = 0; mY < canvasEl.height; mY++) {
          for (let mX = 0; mX < canvasEl.width; mX++) {
            if (modules[(mY * canvasEl.width + mX) * 4] < 128) { if (mX < minX) minX = mX; if (mX > maxX) maxX = mX; }
          }
        }
        const moduleScale = qrCanvas.width / canvasEl.width;
        const pattern = { left: qrCanvas.left + minX * moduleScale, right: qrCanvas.left + (maxX + 1) * moduleScale };
        const fontSize = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('#kioskEventMeta'));
        const eventTitle = range.getBoundingClientRect();
        const header = document.querySelector('.kiosk-poster__header').getBoundingClientRect();
        const laptop = document.querySelector('.hoghacks-laptop').getBoundingClientRect();
        const event = document.querySelector('.kiosk-poster__event').getBoundingClientRect();
        const date = document.querySelector('#kioskEventDate').getBoundingClientRect();
        const location = document.querySelector('#kioskEventLocation').getBoundingClientRect();
        const text = document.querySelector('.kiosk-instructions__intro').firstChild;
        const words = text.textContent.match(/\S+/g);
        const lastLineWords = [];
        let index = 0;
        for (const word of words) {
          index = text.textContent.indexOf(word, index);
          range.setStart(text, index); range.setEnd(text, index + word.length);
          lastLineWords.push({ word, top: range.getBoundingClientRect().top });
          index += word.length;
        }
        // Painted tops of the heading, the QR pattern and the QR settings control.
        const inkTops = [paintedTop('#kioskInstructionsTitle', 100), paintedTop('#kiosk-qr-canvas', 100), paintedTop('#kioskEditQr', 245)];
        return {
          eventCentered: Math.abs((laptop.left + event.right) / 2 - (header.left + header.right) / 2) <= 1 && Math.abs((eventTitle.left + eventTitle.right) / 2 - (event.left + event.right) / 2) <= 1 && Math.abs((Math.min(date.left, location.left) + Math.max(date.right, location.right)) / 2 - (event.left + event.right) / 2) <= 1,
          ink: inkTops,
          margins: [columns.left - body.left, body.right - columns.right],
          infoAtCardEdge: Math.abs(info.right - body.right) < 1 && Math.abs(info.width - headerInfo.width) < 1 && Math.abs(info.top - columns.top) < 1 && Math.abs((info.left + info.right) / 2 - (headerInfo.left + headerInfo.right) / 2) < 1,
          centredGroup: Math.abs((columns.top - header.bottom) - (footer.getBoundingClientRect().top - columns.bottom)) < 2,
          gap: parseFloat(getComputedStyle(document.querySelector('.kiosk-poster__columns')).columnGap),
          introContained: intro.left >= left.left && intro.right <= left.right,
          overflow: document.documentElement.scrollWidth > innerWidth,
          titleSizes: [fontSize('.kiosk-poster__header .kiosk-event-card__title'), fontSize('#kioskInstructionsTitle')],
          branding: { logo: logo.getBoundingClientRect().width, motto: parseFloat(getComputedStyle(footer).fontSize), padding: parseFloat(getComputedStyle(footer).paddingTop), centered: Math.abs(logo.getBoundingClientRect().top + logo.getBoundingClientRect().height / 2 - motto.getBoundingClientRect().top - motto.getBoundingClientRect().height / 2) < 1 },
          inlineBranding: leader && getComputedStyle(leader).borderBottomStyle === 'dotted' && leader.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(footer).borderTopWidth) === 0 && parseFloat(getComputedStyle(footer).paddingBottom) === 0 && [leader.getBoundingClientRect().left - logo.getBoundingClientRect().right, motto.getBoundingClientRect().left - leader.getBoundingClientRect().right].every(gap => gap >= 16 && gap <= 24),
          footerSpacing: {
            leaderOpacity: leader ? parseFloat(getComputedStyle(leader).opacity) : 0,
            extraBottomInset: document.querySelector('.kiosk-poster').getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom - parseFloat(getComputedStyle(document.querySelector('.kiosk-poster')).paddingBottom) - 1,
            contentGap: footer.getBoundingClientRect().top - Math.max(left.bottom, actions.bottom)
          },
          sidebarSizes: [fontSize('.sidebar-card__event'), fontSize('.sidebar-card__meta')],
          lastLineCount: lastLineWords.filter(w => Math.abs(w.top - lastLineWords.at(-1).top) < 1).length,
          actionGap: parseFloat(getComputedStyle(qrPanel).rowGap),
          actionsMatchQr: Math.abs(actions.left - pattern.left) < 1.5 && Math.abs(actions.right - pattern.right) < 1.5,
          paintedBalance: Math.abs((inkTops[0] - header.bottom) - (footer.getBoundingClientRect().top - Math.max(left.bottom, actions.bottom))) < 3 && Math.abs(columns.bottom - Math.max(left.bottom, actions.bottom)) < 1,
          quietZoneIntact: Math.abs(qrCanvas.left - qrBlock.left - 12) < 1 && Math.abs(qrBlock.bottom - qrCanvas.bottom - 12) < 1 && Math.abs(actions.top - qrBlock.bottom - 22) < 1,
          actionLabelsFit: [...document.querySelectorAll('.kiosk-qr-actions button')].every(button => {
            const label = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            range.selectNodeContents(label);
            return range.getBoundingClientRect().height < parseFloat(getComputedStyle(button).fontSize) * 1.6;
          }),
          fits: Math.max(left.bottom, actions.bottom) <= footer.getBoundingClientRect().top && footer.getBoundingClientRect().bottom <= innerHeight,
          utilitiesFit: document.querySelector('.sidebar-card').getBoundingClientRect().bottom <= innerHeight
        };
      }, screenshot.toString('base64'));
      assert.ok(Math.max(...result.ink) - Math.min(...result.ink) <= 1, 'painted heading, QR and button tops agree within one CSS pixel');
      assert.ok(Math.abs(result.margins[0] - result.margins[1]) <= 1 && result.margins[0] >= 48, 'balanced inset columns');
       assert.ok(result.infoAtCardEdge, 'check-in info control shares the header control edge, size and centre, aligned with the heading and QR tops');
       assert.ok(result.centredGroup, 'check-in group is centred between the header rule and the footer branding row');
      assert.ok(result.paintedBalance, 'painted check-in group keeps equal space above and below between the header rule and the footer');
      assert.ok(result.gap >= 48 && result.gap <= 80);
      assert.ok(result.introContained && !result.overflow);
      assert.ok(result.eventCentered, 'combined laptop and event group is centered across the header, with centered title and metadata within the text block');
      console.log(`Height budget ${width}×${height}: ${JSON.stringify(result)}`);
      assert.ok(result.titleSizes[0] > result.titleSizes[1], 'event title leads check-in heading');
      const roomy = width >= 1440;
       assert.ok(roomy ? result.branding.logo >= 220 && result.branding.logo <= 260 : result.branding.logo >= 160 && result.branding.logo < 220, 'footer logo scales with desktop space');
      assert.ok(roomy ? result.branding.motto >= 22 && result.branding.motto <= 24 : result.branding.motto >= 18 && result.branding.motto <= 20, 'footer motto scales with desktop space');
      assert.ok(result.branding.centered, 'footer branding remains vertically centered');
      assert.equal(result.branding.padding, 0, 'footer has no bar padding');
      assert.ok(result.inlineBranding, 'inline branding has a dotted leader, 16–24px gaps, and no top divider');
       assert.equal(result.footerSpacing.leaderOpacity, 1, 'footer leader is fully visible');
      assert.ok(result.footerSpacing.extraBottomInset >= 15.99 && result.footerSpacing.extraBottomInset <= 24.01, 'branding moves upward by a modest amount');
      assert.ok(result.footerSpacing.contentGap >= 24, 'branding keeps comfortable separation from check-in content and QR buttons');
      assert.ok(result.sidebarSizes[0] >= 16 && result.sidebarSizes[0] <= 18 && result.sidebarSizes[1] === 14);
      assert.ok(result.lastLineCount >= 2, 'supporting sentence has no orphaned last word');
       assert.ok(result.actionGap >= 20 && result.actionGap <= 24, 'QR actions sit 20–24px below the quiet zone');
       assert.ok(result.actionsMatchQr, 'action row edges match the visible black QR pattern, inside its quiet zone');
       assert.ok(result.quietZoneIntact, 'QR keeps its full white quiet zone with a 20–24px gap to the action row');
      assert.ok(result.actionLabelsFit, 'QR button labels stay on one line');
      assert.ok(result.fits && result.utilitiesFit, 'poster and sidebar utilities fit the laptop height');
      console.log(`PASS ${width}×${height}: visible tops ${result.ink.join(', ')}px; gap ${result.gap}px`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile has no horizontal overflow');
    assert.ok(await page.evaluate(() => getComputedStyle(document.querySelector('.kiosk-poster__leader')).display === 'none' && getComputedStyle(document.querySelector('.kiosk-poster__footer')).flexDirection === 'column'), 'mobile branding stacks without a leader');
    await page.screenshot({ path: path.join(output, 'check-in-mobile.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
