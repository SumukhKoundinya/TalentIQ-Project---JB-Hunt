// Isolated browser context: never writes the user's live local records.
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.TIQ_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.evaluate(()=>{
      TIQ.state.candidates = [1,2,3].map(i=>({id:'trial-c'+i,firstName:'Sample'+i,lastName:'Person',email:'sample'+i+'@example.test',recordStatus:'New',priority:'Low',approvalStatus:'Pending',summary:'Supplied factual draft '+i,notes:'Recruiter notes',skills:['Excel'],areasDiscussed:['Operations'],eventId:TIQ.currentEventId(),isDemo:true,auditTrail:[],audioNotes:[]}));
      const first=TIQ.state.candidates[0];
      first.parsedResume=TIQ.ai.extractResumeData('Sample1 Person\nEXPERIENCE\nAnalyst | Example Org | 2024\n• Built a report using SQL for 12 branches.\nPROJECTS\nProject: Route Dashboard\n• Built a dashboard for 3 routes.\nSKILLS\nSQL, Python, Excel, Java, Tableau');
      first.skills=['SQL','Python','Excel','Java','Tableau'];
      TIQ.router.navigateTo('review');
    });
    await page.locator('#reviewSummary').waitFor();
    const icon=await page.locator('#reviewCard .capture-section-icon').first().boundingBox();
    assert.ok(icon.width<=20 && icon.height<=20,'shared outline cues retain card-scale sizing');
    await page.locator('[data-capture-skills]').click();
    assert.equal(await page.locator('#capture-skills-popover').count(),1,'shared card remaining skills has a real popover');
    assert.ok(await page.locator('#capture-skills-popover').evaluate(e=>e.matches(':popover-open')));
    await page.waitForFunction(()=>document.querySelector('[data-capture-skills]').getAttribute('aria-expanded')==='true');
    await page.keyboard.press('Escape');
    await page.locator('#reviewCard button[data-flag-tab="notes"]').first().click();
    assert.equal(await page.locator('[data-review-tab="notes"]').getAttribute('aria-selected'),'true','shared missing-info controls open their supporting evidence');
    assert.match(await page.locator('#reviewFlagGuidance').innerText(),/Capture/);
    const source=page.locator('#reviewCard [data-resume-source]').first();
    const passage=await source.getAttribute('data-resume-source');
    await source.click();
    assert.equal(await page.locator('#reviewEvidence .is-source-highlighted').getAttribute('data-resume-passage-id'),passage);
    await page.evaluate(()=>{ TIQ.views._aiReviewCompare=['trial-c1','trial-c2']; TIQ.router.navigateTo('review'); });
    await page.locator('[data-review-action="compare"]').click();
    const compareSource=page.locator('#reviewCompareDialog [data-resume-source]').first();
    const comparisonPassage=await compareSource.getAttribute('data-resume-source');
    await compareSource.click();
    assert.equal(await page.locator('#reviewCompareDialog .is-source-highlighted').getAttribute('data-resume-passage-id'),comparisonPassage,'comparison uses source-owned candidate section');
    await page.locator('[data-review-action="compare-close"]').click();
    await page.locator('#reviewSummary').fill('Recruiter edited draft');
    await page.locator('#reviewNextStep').fill('Discuss supplied project');
    await page.locator('[data-review-action="next"]').click();
    await page.locator('[data-review-action="previous"]').click();
    assert.equal(await page.locator('#reviewSummary').inputValue(),'Recruiter edited draft');
    await page.locator('#reviewEvidenceChecked').check();
    await page.locator('[data-review-action="approve"]').click();
    assert.equal(await page.evaluate(()=>TIQ.state.candidates[0].approvalStatus),'Approved');
    assert.equal(await page.evaluate(()=>TIQ.state.candidates[0].recordStatus),'New');
    await page.locator('#reviewRejectReason').fill('Needs clearer attribution');
    await page.locator('[data-review-action="reject"]').click();
    assert.equal(await page.evaluate(()=>TIQ.state.candidates[0].approvalStatus),'Rejected');
    await page.locator('#reviewSummary').fill('Corrected supplied draft');
    await page.locator('[data-review-action="save"]').click();
    assert.equal(await page.evaluate(()=>TIQ.state.candidates[0].approvalStatus),'Pending');
    await page.locator('#reviewStatus').selectOption('Follow-Up');
    await page.locator('[data-review-action="status"]').click();
    assert.equal(await page.evaluate(()=>TIQ.state.candidates[0].recordStatus),'Follow-Up');
    await page.evaluate(()=>TIQ.router.navigateTo('analytics'));
    await page.locator('.purpose-results').waitFor();
    await page.locator('[data-results-kind="status"][data-results-value="Follow-Up"]').first().click();
    await page.locator('#reviewSummary').waitFor();
    assert.equal(await page.locator('[data-review-select]').count(),1);
    await page.locator('[data-review-action="results-return"]').click();
    await page.locator('.purpose-results').waitFor();
    await page.evaluate(()=>TIQ.router.navigateTo('metrics'));
    await page.locator('#studyCreate [name="name"]').fill('Browser study');
    for(const [name,value] of Object.entries({dataset:'synthetic-v1',taskDefinition:'Capture identity and review sources',consistencyRubric:'Required record sections',supportRubric:'Whole claim matches passage',question:'Confidence 1 low to 5 high'})) await page.locator('#studyCreate [name="'+name+'"]').fill(value);
    await page.locator('#studyCreate [name="confirmed"]').check();
    await page.locator('#studyCreate button').click();
    await page.locator('#studyStart [name="participant"]').fill('P1');
    await page.locator('#studyStart [name="pair"]').fill('pair1');
    await page.locator('#studyStart [name="synthetic"]').check();
    await page.locator('#studyStart button').click();
    await page.locator('#studyStop button').click();
    await page.locator('#studyFinish [name="field_firstName"]').fill('Sample');
    await page.locator('#studyFinish [name="field_lastName"]').fill('Person');
    await page.locator('#studyFinish [name="field_email"]').fill('sample@example.test');
    await page.locator('#studyFinish [name="errors"]').fill('0');
    await page.locator('#studyFinish button').click();
    assert.equal(await page.evaluate(()=>TIQ.study.data.studies[0].trials[0].status),'completed');
    assert.equal(await page.locator('#studyCorrection [name="errors"]').inputValue(),'0','zero observed errors remains explicit');
    await page.locator('#studyCorrection [name="originalDraft"]').fill('Unsaved assessment working copy');
    await page.locator('#studyStatement [name="statement"]').fill('Built report');
    await page.locator('#studyStatement [name="source"]').fill('Built report for supplied task');
    await page.locator('#studyStatement [name="judgment"]').selectOption('Supported');
    await page.locator('#studyStatement button').click();
    assert.equal(await page.locator('#studyCorrection [name="originalDraft"]').inputValue(),'Unsaved assessment working copy','submitting one assessment preserves another form draft');
    assert.equal(await page.evaluate(()=>TIQ.study.support(TIQ.study.data.studies[0]).supported),1);
    await page.locator('[data-study-tab="compare"]').click();
    assert.ok((await page.locator('.study-comparison').textContent()).includes('Not measured'));
    const download = page.waitForEvent('download'); await page.locator('#studyJson').click();
    assert.equal((await download).suggestedFilename(),'talentiq-study.json');
    for(const width of [1920,1600,1280,720,390,320]) {
      await page.setViewportSize({width,height:900});
      for(const route of ['analytics','metrics','review']) {
        await page.evaluate(route=>TIQ.router.navigateTo(route),route);
        await page.waitForTimeout(70);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow '+route+' at '+width);
      }
      if(width===1280) {
        assert.equal(await page.locator('#reviewQueue').isVisible(),false,'laptop collapses queue before evidence');
        await page.locator('[data-review-action="queue-open"]').click();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#reviewQueueDialog').evaluate(e=>e.open),false);
        assert.ok(await page.locator('[data-review-action="queue-open"]').evaluate(e=>e===document.activeElement),'Escape restores drawer trigger focus');
      }
      if(width===1920) assert.equal(await page.locator('#reviewQueue').isVisible(),true,'wide workspace retains three columns');
    }
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(()=>document.documentElement.style.zoom='2');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% CSS zoom reflow without horizontal overflow');
    await page.evaluate(()=>document.documentElement.style.zoom='');
    await page.setViewportSize({width:1920,height:1080});
    await require('node:fs/promises').mkdir('.openchamber/postevent',{recursive:true});
    for(const route of ['review','analytics','metrics']) {
      await page.evaluate(route=>TIQ.router.navigateTo(route),route);
      await page.waitForTimeout(300); // Existing 200ms route entrance must settle before visual capture.
      await page.screenshot({path:'.openchamber/postevent/'+route+'.png',fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS rendered verification, source/skill controls, retained drafts, status/drill-downs, study timing/assessment/export, 320–1920 reflow, 200% CSS zoom, drawer focus; isolated screenshots in .openchamber/postevent/');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
