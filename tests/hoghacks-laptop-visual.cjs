// Optional real-browser checks; same environment conventions as check-in-visual.cjs.
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
    // The existing route entrance translates/fades the entire view for 200ms.
    // Measure the lid loop only after that unrelated entrance has completed.
    await page.locator('.view').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    assert.equal(await page.locator('.hoghacks-laptop').count(), 1, 'Set Up actually renders the laptop');
    assert.equal(await page.locator('.hoghacks-laptop').getAttribute('aria-hidden'), 'true');
    const output = path.join(__dirname, '..', '.openchamber', 'screenshots');
    fs.mkdirSync(output, { recursive: true });

    const integrity = await page.evaluate(async () => {
      const image = new Image();
      image.src = new URL('assets/hoghacks/laptop-sprite.png', location.href).href;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const strip = index => context.getImageData(index * 320, 240, 320, 20).data;
      const base = strip(0);
      const baseStill = Array.from({ length: 19 }, (_, index) => strip(index)).every(pixels => pixels.every((value, index) => value === base[index]));
      const count = (index, predicate) => {
        const pixels = context.getImageData(index * 320, 0, 320, 260).data;
        let n = 0;
        for (let i = 0; i < pixels.length; i += 4) if (predicate(pixels.slice(i, i + 4))) n++;
        return n;
      };
      const orange = rgba => rgba[3] === 255 && rgba[0] > 180 && rgba[1] > 60 && rgba[1] < 190 && rgba[2] < 160;
      const purple = rgba => rgba[3] === 255 && rgba[0] > 90 && rgba[0] < 180 && rgba[1] > 70 && rgba[1] < 170 && rgba[2] > 170;
      const front = context.getImageData(150, 50, 1, 1).data;
      const exterior = context.getImageData(0, 0, 1, 1).data;
      return { width: image.width, height: image.height, baseStill, orangeOpen: count(0, orange), orangeClosed: count(18, orange), purpleClosed: count(18, purple), blackScreen: front[3] === 255 && Math.max(...front.slice(0, 3)) < 30, transparentExterior: exterior[3] === 0 };
    });
    assert.deepEqual([integrity.width, integrity.height], [6080, 260]);
    assert.ok(integrity.baseStill, 'all frames have identical exposed base/port pixels');
    assert.ok(integrity.orangeOpen > 500 && integrity.orangeClosed === 0, 'original HogHacks screen is present open and faces away closed');
    assert.ok(integrity.purpleClosed > 12000, 'closed frame has a substantial intentional purple lid, not a missing screen');
    assert.ok(integrity.blackScreen && integrity.transparentExterior, 'interior blacks stay opaque; exterior remains transparent');
    console.log('Sprite integrity:', integrity);

    for (const [width, height] of [[1440, 900], [1280, 800], [1280, 720], [1024, 768], [768, 1024], [600, 900], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const geometry = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect();
        const laptop = rect('.hoghacks-laptop'), header = rect('.kiosk-poster__header'), info = rect('#kioskEditEvent');
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('#kioskEventMeta'));
        const title = range.getBoundingClientRect();
        const metadata = rect('.kiosk-poster__metadata');
        const event = rect('.kiosk-poster__event');
        const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const center = r => (r.left + r.right) / 2;
        const style = getComputedStyle(document.querySelector('.hoghacks-laptop'));
        return {
          width: laptop.width,
          groupCentered: Math.abs((laptop.left + event.right) / 2 - center(header)) < 1,
          titleCentered: Math.abs(center(title) - center(event)) < 1,
          metadataCentered: Math.abs(center(metadata) - center(event)) < 1,
          gap: event.left - laptop.right,
          verticallyCentered: Math.abs((laptop.top + laptop.bottom) / 2 - (event.top + event.bottom) / 2) < 1,
          metadataBelow: metadata.top >= title.bottom,
          titleClear: !overlaps(laptop, title) && !overlaps(info, title),
          metadataClear: !overlaps(laptop, metadata) && !overlaps(info, metadata),
          infoAtEdge: Math.abs(info.right - header.right) < 1,
          contained: laptop.bottom <= header.bottom - parseFloat(getComputedStyle(document.querySelector('.kiosk-poster__header')).paddingBottom) - 1 && laptop.right <= header.right,
          overflow: document.documentElement.scrollWidth > innerWidth,
          animation: style.animationName, duration: style.animationDuration, rendering: style.imageRendering,
          transform: style.transform, opacity: style.opacity
        };
      });
      assert.ok(geometry.groupCentered && geometry.titleCentered && geometry.metadataCentered, 'combined laptop and text group is centered on the full header');
      assert.ok(geometry.gap >= 20 && geometry.gap <= 24 && geometry.verticallyCentered && geometry.metadataBelow, 'laptop sits 20–24px left of the vertically centered title and metadata block');
      assert.ok(geometry.titleClear && geometry.metadataClear && geometry.infoAtEdge && geometry.contained && !geometry.overflow, 'all header elements fit without collisions or overflow');
      assert.ok(width > 1100 ? geometry.width >= 100 && geometry.width <= 120 : geometry.width <= 80, 'responsive laptop width');
      assert.equal(geometry.animation, 'hoghacks-lid');
      assert.equal(geometry.duration, '7.2s');
      assert.equal(geometry.rendering, 'pixelated');
      assert.equal(geometry.transform, 'none', 'the whole laptop is never transformed');
      assert.equal(geometry.opacity, '1', 'the laptop is never faded');
      const positions = [];
      for (const [phase, time] of [['open', 1000], ['closing', 3800], ['closed', 5000], ['opening', 6400]]) {
        positions.push(await page.evaluate(time => {
          const laptop = document.querySelector('.hoghacks-laptop');
          const animation = laptop.getAnimations()[0];
          animation.pause(); animation.currentTime = time;
          const rect = selector => {
            const r = document.querySelector(selector).getBoundingClientRect();
            return [r.x, r.y, r.width, r.height];
          };
          return ['.hoghacks-laptop', '.kiosk-poster__event-group', '.kiosk-poster__event', '.kiosk-poster__metadata', '.kiosk-poster__header', '#kioskEventMeta', '.kiosk-poster__body', '.kiosk-poster__footer'].map(rect);
        }, time));
        if ([1440, 1280, 390].includes(width) && height !== 720) await page.screenshot({ path: path.join(output, `hoghacks-${width}-${phase}.png`), fullPage: true });
      }
      assert.ok(positions.every(position => JSON.stringify(position) === JSON.stringify(positions[0])), 'no layout shift through all four animation phases');
      console.log(`PASS ${width}×${height}: laptop ${geometry.width}px, ${geometry.gap}px gap, centered combined group, no collisions, no shift`);
    }

    for (const mode of ['reduce', 'print']) {
      await page.emulateMedia(mode === 'reduce' ? { reducedMotion: 'reduce' } : { reducedMotion: 'no-preference', media: 'print' });
      const staticState = await page.locator('.hoghacks-laptop').evaluate(element => {
        const css = getComputedStyle(element);
        return { animation: css.animationName, position: css.backgroundPositionX, height: element.getBoundingClientRect().height };
      });
      assert.equal(staticState.animation, 'none', mode + ' disables animation');
      assert.equal(staticState.position, '0%', mode + ' shows the open frame');
      assert.ok(staticState.height > 0, mode + ' keeps the reserved footprint');
      console.log('PASS static ' + mode);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
