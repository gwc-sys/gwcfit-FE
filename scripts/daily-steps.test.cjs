const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function setup(os = 'android', permission = true) {
  const states = []; let stateIndex = 0, cleanup, callback, lifecycle, removed = 0;
  const stored = new Map();
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/hooks/useDailySteps.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const sensor = {
    getPermissionsAsync: async () => ({ granted: permission, canAskAgain: true }),
    isAvailableAsync: async () => true,
    watchStepCount: cb => { callback = cb; return { remove() { removed++; } }; },
    getStepCountAsync: async () => ({ steps: 10 })
  };
  vm.runInNewContext(source, { exports: mod.exports, module: mod, Date, setInterval: () => 1, clearInterval() {}, require(name) {
    if (name === 'react') return { useCallback: f => f, useEffect: f => { cleanup = f(); }, useState: initial => { const i = stateIndex++; states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], v => { states[i] = v; }]; } };
    if (name === 'react-native') return { Platform: { OS: os }, AppState: { currentState: 'active', addEventListener: (_, cb) => { lifecycle = cb; return { remove() {} }; } } };
    if (name === 'expo-sensors') return { Pedometer: sensor };
    if (name === 'expo-secure-store') return { getItemAsync: async key => stored.get(key), setItemAsync: async (key, value) => { stored.set(key, value); } };
    if (name.includes('useAuthStore')) return { useAuthStore: f => f({ user: { id: 'member-1' } }) };
    throw Error(name);
  } });
  mod.exports.useDailySteps();
  return { states, send: n => callback({ steps: n }), lifecycle: s => lifecycle(s), cleanup: () => cleanup(), removed: () => removed, hasWatch: () => !!callback };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
test('sensor cumulative readings add only new steps and resume starts a fresh baseline', async () => {
  const h = setup(); await settle();
  h.send(5); h.send(5); h.send(8);
  assert.equal(h.states[0].hours.reduce((a,b) => a+b), 8);
  h.lifecycle('background'); h.lifecycle('active'); await settle(); h.send(3);
  assert.equal(h.states[0].hours.reduce((a,b) => a+b), 11);
  h.cleanup(); assert.ok(h.removed() >= 2);
});
test('motion permission is required before subscribing to the sensor', async () => {
  const h = setup('android', false); await settle();
  assert.equal(h.states[1], 'permission'); assert.equal(h.hasWatch(), false); h.cleanup();
});
test('iOS reads hourly history without adding a duplicate live subscription', async () => {
  const h = setup('ios'); await settle();
  assert.equal(h.states[0].hours.reduce((a,b) => a+b), (new Date().getHours() + 1) * 10);
  assert.equal(h.hasWatch(), false); assert.equal(h.states[1], 'tracking'); h.cleanup();
});
