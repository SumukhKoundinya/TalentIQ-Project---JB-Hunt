const assert = require('node:assert/strict');
const {loadApp} = require('./harness');
const TIQ = loadApp(['workflow.js']);

const retired = ['analytics','metrics'];
for (const key of retired) {
  assert(!TIQ.CONFIG.workflow.some(page => page.key === key), key + ' is removed from workflow navigation');
  assert(!TIQ.CONFIG.study.some(page => page.key === key), key + ' is removed from study navigation');
}
const nav = TIQ.renderWorkflowNav();
for (const key of retired) assert(!nav.includes('data-nav="' + key + '"'), key + ' is not linked in the sidebar');
assert(nav.includes('data-nav="capture"'), 'Capture remains available');
assert(nav.includes('data-nav="kiosk"'), 'Set Up remains available');
assert(nav.includes('data-nav="review"'), 'simplified Review is explicitly connected');
console.log('PASS retired pages are absent while setup and capture remain navigable');
