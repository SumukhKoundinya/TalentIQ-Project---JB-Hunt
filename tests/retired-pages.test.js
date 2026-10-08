const assert = require('node:assert/strict');
const {loadApp} = require('./harness');
const TIQ = loadApp(['workflow.js']);

assert(TIQ.CONFIG.workflow.some(page => page.key === 'analytics'), 'Event Results remains in workflow navigation');
assert(TIQ.CONFIG.workflow.some(page => page.key === 'review'), 'Review remains in workflow navigation');
assert(!TIQ.CONFIG.workflow.some(page => page.key === 'metrics'), 'research metrics stay out of the core booth workflow');
const nav = TIQ.renderWorkflowNav();
assert(nav.includes('data-nav="capture"'), 'Capture remains available');
assert(nav.includes('data-nav="kiosk"'), 'Set Up remains available');
assert(nav.includes('data-nav="review"'), 'Review is explicitly connected');
assert(nav.includes('data-nav="analytics"'), 'Event Results is explicitly connected');
console.log('PASS core booth workflow pages remain navigable');
