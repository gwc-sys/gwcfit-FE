const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function setup() {
  let state = { user: { id: 'admin' }, tokens: { access_token: 'private-token' } };
  const auth = new Set(), sockets = [], timers = new Map(), requests = [];
  let nextTimer = 0;
  class Socket {
    constructor(url) { this.url = url; this.sent = []; sockets.push(this); }
    send(value) { this.sent.push(JSON.parse(value)); }
    close() { this.closed = true; this.onclose?.({ code: 1000 }); }
    message(type) { this.onmessage?.({ data: JSON.stringify({ type }) }); }
  }
  const file = path.resolve(__dirname, '../src/services/notificationLive.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  const mocks = {
    './api/client': { API_BASE_URL: 'https://api.example.com/api/v1', apiClient: { get: async url => { requests.push(url); state.tokens.access_token = 'refreshed-token'; } } },
    '../store/useAuthStore': { useAuthStore: { getState: () => state, subscribe: fn => { auth.add(fn); return () => auth.delete(fn); } } },
  };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {
    WebSocket: Socket,
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  })(name => mocks[name], module, module.exports);
  return {
    subscribe: module.exports.subscribeNotificationChanges, sockets, timers, requests,
    switchUser(id) { state = { ...state, user: id ? { id } : null }; for (const fn of auth) fn(state); },
    retry() { const entry = [...timers.entries()].find(([, timer]) => timer.delay < 40000); assert.ok(entry); timers.delete(entry[0]); entry[1].fn(); },
  };
}

test('live connections are shared, authenticated without URL secrets and cleaned up after the last listener', () => {
  const d = setup();
  let first = 0, second = 0;
  const a = d.subscribe('admin', () => first++);
  const b = d.subscribe('admin', () => second++);
  assert.equal(d.sockets.length, 1);
  const socket = d.sockets[0];
  assert.equal(socket.url, 'wss://api.example.com/api/v1/notifications/live');
  socket.onopen();
  assert.deepEqual(socket.sent, [{ access_token: 'private-token' }]);
  socket.message('ready');
  socket.message('notifications_changed');
  socket.message('heartbeat');
  assert.equal(first, 2);
  assert.equal(second, 2);
  a();
  assert.equal(socket.closed, undefined);
  b();
  assert.equal(socket.closed, true);
  assert.equal(d.timers.size, 0);
});

test('dropped connections reconnect and refresh history on ready', () => {
  const d = setup();
  let changes = 0;
  const stop = d.subscribe('admin', () => changes++);
  d.sockets[0].onclose({ code: 1006 });
  d.retry();
  assert.equal(d.sockets.length, 2);
  d.sockets[1].message('ready');
  assert.equal(changes, 1);
  stop();
});

test('expired socket authentication uses the existing HTTP token refresh before reconnecting', async () => {
  const d = setup();
  const stop = d.subscribe('admin', () => {});
  d.sockets[0].onclose({ code: 4401 });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(d.requests, ['/auth/me']);
  d.retry();
  d.sockets[1].onopen();
  assert.deepEqual(d.sockets[1].sent, [{ access_token: 'refreshed-token' }]);
  stop();
});

test('logout closes the stream and stale messages cannot expose the previous account updates', () => {
  const d = setup();
  let changes = 0;
  d.subscribe('admin', () => changes++);
  const socket = d.sockets[0];
  d.switchUser(null);
  socket.message('notifications_changed');
  assert.equal(changes, 0);
  assert.equal(socket.closed, true);
  assert.equal(d.timers.size, 0);
});
