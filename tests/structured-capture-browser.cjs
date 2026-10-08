// Isolated synthetic records only; never opens an email app or a microphone.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.RESUME_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.evaluate(() => {
      const c = TIQ.normalizeCandidate(TIQ.intake.buildCandidate({ firstName: 'Synthetic', lastName: 'Example', email: 'synthetic@example.invalid' }, { state: TIQ.state }));
      c.id = 'synthetic-capture-test'; c.notes = 'Existing local observation'; c.summary = 'Recruiter observation awaiting verification';
      TIQ.state.candidates = [c]; TIQ.saveState(); TIQ.views._captureIndex = 0;
      TIQ.router.navigateTo('capture');
      window.__micStarts = 0;
      TIQ.views._captureRecorder.start = () => { window.__micStarts++; return Promise.reject(new Error('Simulated unavailable microphone')); };
    });
    await page.locator('#capture-tab-notes').click();
    await page.locator('.capture-conversation summary').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('.capture-conversation').getAttribute('open'), '');
    const fields = { function: 'Product Owner', technicalInterests: 'Research, Testing', workLocations: 'Remote, Nashville', candidateQuestions: 'What mentoring is available?', followUpQuestions: 'Clarify project contribution', nextStepNotes: 'Share event resources' };
    for (const [key, value] of Object.entries(fields)) {
      await page.locator('#capture-' + key).fill(value);
      await page.locator('#capture-' + key).press('Tab');
    }
    await page.locator('[data-conversation-tag][value="Coursework"]').check();
    assert.match(await page.locator('#captureConversationPrompts').textContent(), /prioritize/);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem(TIQ.STORAGE_KEY)).candidates[0]);
    assert.equal(stored.candidateQuestions, fields.candidateQuestions);
    assert.deepEqual(stored.technicalInterests, ['Research', 'Testing']);
    assert.deepEqual(stored.workLocations, ['Remote', 'Nashville']);
    assert.equal(stored.provenance.workLocations, 'recruiter');
    assert.equal(stored.recordStatus, 'New');
    await page.locator('#audioRecordBtn').click();
    assert.equal(await page.evaluate(() => window.__micStarts), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'captureRecordingPermission');
    await page.locator('#captureRecordingPermission').check();
    await page.locator('#audioRecordBtn').click();
    await page.waitForFunction(() => window.__micStarts === 1);
    assert.equal(await page.locator('#captureRecordingPermission').isChecked(), false, 'acknowledgement is consumed for one recording attempt');
    assert(await page.evaluate(() => TIQ.state.candidates[0].auditLog.some(e => e.action === 'RECORDING_PERMISSION')), 'permission acknowledgement has recruiter audit evidence');
    await page.locator('#capture-tab-notes').focus();
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#capture-tab-resume').getAttribute('aria-selected'), 'true');
    assert.equal(await page.evaluate(() => TIQ.state.candidates[0].recordStatus), 'New');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#capture-tab-notes').getAttribute('aria-selected'), 'true');
    await page.reload();
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.evaluate(() => TIQ.router.navigateTo('capture'));
    assert.equal(await page.evaluate(() => TIQ.state.candidates[0].notes), 'Existing local observation');
    assert.equal(await page.evaluate(() => TIQ.state.candidates[0].candidateQuestions), fields.candidateQuestions);
    for (const [width, height] of [[1440,900],[1280,720],[768,1024],[390,844],[320,844]]) {
      await page.setViewportSize({ width, height });
      if (width < 960) await page.locator('[data-capture-details-open]').click();
      await page.locator('#capture-tab-notes').click();
      await page.locator('.capture-conversation').evaluate(e => { e.open = true; });
      await page.locator('#capture-nextStepNotes').scrollIntoViewIfNeeded();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow at ' + width);
      for (const id of ['capture-function','capture-technicalInterests','capture-workLocations','capture-candidateQuestions','capture-followUpQuestions','capture-nextStepNotes']) {
        const box = await page.locator('#' + id).boundingBox();
        assert(box && box.width > 100 && box.x >= 0 && box.x + box.width <= width + 1, 'field fits at ' + width + ': ' + id);
      }
      console.log('PASS structured Notes reflow ' + width + 'x' + height);
      if (width < 960) await page.locator('[data-capture-details-back]').click();
    }
    assert.deepEqual(errors, []);
    console.log('PASS persistence, role prompts, native disclosure/tabs, permission-before-microphone and optional status');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
