const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp();
  assert(TIQ.displayValue('3.78', 'N/A') === '3.78', 'keeps non-empty value');
  assert(TIQ.displayValue('', 'N/A') === 'N/A', 'empty string falls back');
  assert(TIQ.displayValue(undefined, 'N/A') === 'N/A', 'undefined falls back');
  assert(TIQ.displayValue(null, 'N/A') === 'N/A', 'null falls back');
  assert(TIQ.displayValue(0, 'N/A') === 0, '0 is kept (valid count/GPA)');
  assert(TIQ.displayValue('', '0') === '0', 'custom fallback respected');
}
main();