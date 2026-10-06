const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeStubs(overrides) {
  overrides = overrides || {};
  const store = {};
  const window = Object.assign({
    TIQ: {},
    pdfjsLib: { getDocument: () => ({ promise: Promise.reject(new Error('no pdf in harness')) }) },
    addEventListener: function() {},
    removeEventListener: function() {}
  }, overrides);

  /* Minimal FileReader so parseAndStoreResume can run in Node tests.
     Decodes file.text into a Uint8Array, exactly like a browser would. */
  const FileReader = function() {
    this.readAsArrayBuffer = function(file) {
      var text = String((file && file.text) || '');
      var buf = new TextEncoder().encode(text);
      this.result = buf;
      if (typeof this.onload === 'function') this.onload();
    };
  };

  return {
    window: window,
    pdfjsLib: window.pdfjsLib,
    FileReader: FileReader,
    navigator: {},
    store: store,
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
    pdfjsLib: stubs.pdfjsLib,
    FileReader: stubs.FileReader,
    localStorage: stubs.localStorage,
    navigator: stubs.navigator,
    console: console,
    get TIQ() { return stubs.window.TIQ; },
    set TIQ(v) { stubs.window.TIQ = v; }
  }, stubs));
  vm.runInContext(code, context, { filename: file });
}

function loadApp(extraFiles, overrides) {
  extraFiles = extraFiles || [];
  const stubs = makeStubs(overrides);
  loadInto(stubs, path.join(__dirname, '..', 'config.js'));
  loadInto(stubs, path.join(__dirname, '..', 'data.js'));
  loadInto(stubs, path.join(__dirname, '..', 'workflow.js'));
  for (const f of extraFiles) if (f !== 'workflow.js') loadInto(stubs, path.join(__dirname, '..', f));
  const TIQ = stubs.window.TIQ;
  TIQ.__testStorage = stubs.localStorage;
  TIQ.__testStorageStore = stubs.store;
  return TIQ;
}

function assert(cond, msg) {
  if (cond) { console.log('PASS: ' + msg); }
  else { console.error('FAIL: ' + msg); process.exitCode = 1; }
}

module.exports = { loadApp, assert };
