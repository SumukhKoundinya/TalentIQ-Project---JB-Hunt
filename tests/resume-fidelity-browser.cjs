// Optional rendered interaction regression; uses an isolated browser context.
const assert = require('node:assert/strict');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.RESUME_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.evaluate(() => TIQ.router.navigateTo('capture'));
    await page.locator('#captureImportEmptyInput').setInputFiles(['01_avery_brooks.pdf','03_jordan_ellis.pdf','05_alexander_montgomery-rivera.pdf','10_morgan_davis.pdf'].map(f => path.resolve(__dirname,'../resume_test_pack 2/',f)));
    await page.waitForFunction(() => TIQ.state.candidates.length === 4 && TIQ.state.candidates.every(c => c.parsedResume?.parserVersion === TIQ.ai.PARSER_VERSION));
    await page.locator('.resume-highlights__entry').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.toast--show').waitFor({state:'hidden'});
    const defaults = page.locator('.resume-highlights__entry');
    assert.equal(await defaults.count(), 4);
    assert.equal(await page.locator('details.capture-contributions').count(), 0);
    const first = defaults.first();
    assert.equal(await first.locator('.capture-facts li').count(), 3);
    const source = first.locator('.resume-source-link').first();
    const passageId = await source.getAttribute('data-resume-source');
    await source.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.is-source-highlighted').getAttribute('data-resume-passage-id'), passageId);
    assert.equal(await page.locator('#capture-tab-resume').getAttribute('aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('is-source-highlighted')), true);
    await page.locator('[data-resume-source-dismiss]').click();
    assert.equal(await page.locator('.is-source-highlighted').count(), 0);
    for (const [width,height] of [[1440,900],[1280,720],[390,844]]) {
      await page.setViewportSize({width,height});
      if (width < 960) await page.locator('[data-capture-details-back]').click();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const controls = await page.locator('.capture-triage').boundingBox();
      assert(controls && controls.y >= 0 && controls.y + controls.height <= height, 'decision controls stay visible at ' + width);
      assert(await page.locator('.capture-facts li').evaluateAll(elements => elements.every(e => e.textContent.trim().split(/\s+/).length <= 10)), 'every rendered contribution respects word limit');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal page overflow');
      const skills = page.locator('.capture-top-skills');
      assert.equal(await skills.locator('[data-skill-index]:visible').count(),3, 'exactly three skills at '+width);
      const expected = await page.evaluate(()=>TIQ.views._captureSkills(TIQ.state.candidates[TIQ.views._captureIndex]));
      assert.deepEqual(await skills.locator('[data-skill-index]:visible').allTextContents(),expected.slice(0,3));
      const more=skills.locator('[data-capture-skills]');
      assert.equal(await more.textContent(),'+'+(expected.length-3));
      assert(await skills.evaluate(e=>Math.abs(e.getBoundingClientRect().right-e.querySelector('.capture-skill-pills').getBoundingClientRect().right)<1), 'skills align right');
      assert(await skills.evaluate(e=>{
        const h=e.querySelector('h3').getBoundingClientRect(),p=e.querySelector('.capture-skill-pills').getBoundingClientRect(),r=e.getBoundingClientRect();
        return Math.abs(h.left-r.left)<1 && h.right<=p.left && Math.abs((h.top+h.bottom)/2-(p.top+p.bottom)/2)<1;
      }), 'label and right-aligned skills share one row at '+width);
      assert.equal(await skills.locator('.capture-skills-leader').evaluate(e=>getComputedStyle(e).display==='none'),width<481);
      await more.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(()=>document.querySelector('#capture-skills-popover').matches(':popover-open'));
      const remaining=await page.locator('[data-remaining-skills] li').allTextContents();
      assert.deepEqual(remaining.slice().sort(),expected.slice(3).sort(), 'popover contains precisely remaining skills');
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#capture-skills-popover').matches(':popover-open'));
      const number = page.locator('.capture-facts .capture-metric').first();
      assert.equal(await page.locator('.capture-facts .resume-source-link').first().evaluate(e => getComputedStyle(e).verticalAlign), 'top', 'multiline source buttons keep list markers on the first line');
      assert.equal(await number.evaluate(e => getComputedStyle(e).fontWeight), '600');
      assert(await page.locator('.capture-item-heading').evaluateAll(headings => headings.every(h => {
        const name=h.querySelector('.resume-highlights__name'), date=h.querySelector('.capture-item-context__dates');
        if (!date || !name) return true;
        const hr=h.getBoundingClientRect(), nr=name.getBoundingClientRect(), dr=date.getBoundingClientRect();
        return Math.abs(hr.right-dr.right)<1 && Math.abs(nr.top-dr.top)<5 && nr.right<=dr.left+1;
      })), 'dates share title row and align right without title overlap at '+width);
      assert.equal(await page.locator('.capture-item-leader').first().evaluate(e => getComputedStyle(e).display === 'none'), width < 481, 'leaders disappear only on narrow layouts');
      await page.screenshot({path:path.resolve(__dirname,'../.openchamber/screenshots/resume-fidelity-' + width + '.png')});
      await page.locator('.resume-highlights').evaluate(e => { e.scrollTop = 0; });
      await page.mouse.move(0,0);
      await page.screenshot({path:path.resolve(__dirname,'../.openchamber/screenshots/resume-fidelity-default-' + width + '.png')});
    }
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(() => { TIQ.views._captureIndex=TIQ.state.candidates.findIndex(c=>c.firstName==='Jordan'); TIQ.router.navigateTo('capture'); });
    const project = page.locator('.resume-highlights__entry').filter({hasText:'Cross-Dock Process Study'});
    assert.match(await project.locator('.capture-facts li').first().textContent(), /Estimated 12% reduction.*stated assumptions/);
    assert.equal(await project.locator('.capture-facts li').first().locator('strong').textContent(), '12%');
    await project.scrollIntoViewIfNeeded();
    await project.locator('.resume-source-link').first().click();
    assert.match(await page.locator('.is-source-highlighted').textContent(), /estimated a 12% reduction/);
    await page.mouse.move(0,0);
    await page.screenshot({path:path.resolve(__dirname,'../.openchamber/screenshots/resume-outcomes-dates-1440.png')});
    for (const width of [1280,390]) {
      await page.setViewportSize({width,height:844});
      for (let index=0;index<4;index++) {
        await page.evaluate(i => { TIQ.views._captureIndex=i; TIQ.views._captureDetailsId=null; TIQ.router.navigateTo('capture'); },index);
        assert(await page.locator('.capture-item-heading').evaluateAll(headings=>headings.every(h=> {
          const n=h.querySelector('.resume-highlights__name'),d=h.querySelector('.capture-item-context__dates');
          if (!n||!d) return true;
          const hr=h.getBoundingClientRect(),nr=n.getBoundingClientRect(),dr=d.getBoundingClientRect();
          return Math.abs(hr.right-dr.right)<1 && Math.abs(nr.top-dr.top)<5 && nr.right<=dr.left+1;
        })), 'wrapped title/date alignment for candidate '+index+' at '+width);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), 'no overflow for candidate '+index+' at '+width);
        assert.equal(await page.locator('.capture-top-skills [data-skill-index]:visible').count(),3, 'stable three skills for candidate '+index+' at '+width);
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS real PDF import, concise bullets, keyboard source navigation, focus, dismissal, and responsive stability');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
