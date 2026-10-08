const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const browser = await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage();
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.TIQ_URL || 'http://localhost:8000');
    await page.locator('[data-demo-recruiter]').first().click();
    await page.locator('[data-demo-continue]').click();
    await page.locator('#view-intake').waitFor();
    assert.deepEqual(await page.locator('.sidebar-nav [data-nav]').evaluateAll(links=>links.map(a=>a.dataset.nav)),['kiosk','capture','review']);
    assert.deepEqual(await page.evaluate(()=>TIQ.router.routes.map(route=>route.key)),['kiosk','capture','review']);
    for(const retired of ['analytics','metrics']) {
      const current=await page.evaluate(()=>TIQ.router.currentView);
      await page.evaluate(route=>TIQ.router.navigateTo(route),retired);
      assert.equal(await page.evaluate(()=>TIQ.router.currentView),current,retired+' route is unavailable');
    }
    await page.evaluate(()=>TIQ.router.navigateTo('kiosk'));
    assert.equal(await page.evaluate(()=>TIQ.router.currentView),'kiosk','Set Up remains usable');
    await page.evaluate(()=>TIQ.router.navigateTo('capture'));
    assert.equal(await page.evaluate(()=>TIQ.router.currentView),'capture','Capture remains usable');
    await page.locator('[data-nav="review"]').click();
    assert(await page.locator('.review-simplified').isVisible(),'simplified Review is connected');
    assert.deepEqual(errors,[]);
    console.log('PASS Event Results and Research remain disconnected; Set Up, Capture and simplified Review are available');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
