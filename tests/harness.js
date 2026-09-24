const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeStubs() {
  const store = {};
  const window = {
    TIQ: {},
    pdfjsLib: { getDocument: () => ({ promise: Promise.reject(new Error('no pdf in harness')) }) },
    addEventListener: function() {},
    removeEventListener: function() {}
  };
  return {
    window: window,
    navigator: {},
    localStorage: {
      getItem: function(k) { return (k in store) ? store[k] : null; },
      setItem: function(k, v) { store[k] = String(v); },
      removeItem: function(k) { delete store[k]; }
    }
  };
}

function loadInto(stubs, file) {
  const code = fs.readFileSync(file, 'utf8');
  const context = vm.createContext(Object.assign({
    window: stubs.window,
    localStorage: stubs.localStorage,
    navigator: stubs.navigator,
    console: console,
    get TIQ() { return stubs.window.TIQ; },
    set TIQ(v) { stubs.window.TIQ = v; }
  }, stubs));
  vm.runInContext(code, context, { filename: file });
}

function loadApp(extraFiles = []) {
  const stubs = makeStubs();
  loadInto(stubs, path.join(__dirname, '..', 'config.js'));
  loadInto(stubs, path.join(__dirname, '..', 'data.js'));
  for (const f of extraFiles) loadInto(stubs, path.join(__dirname, '..', f));
  return stubs.window.TIQ;
}

function assert(cond, msg) {
  if (cond) { console.log('PASS: ' + msg); }
  else { console.error('FAIL: ' + msg); process.exitCode = 1; }
}

module.exports = { loadApp, assert };