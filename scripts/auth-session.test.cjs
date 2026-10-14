const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const test = require('node:test');
const ts = require('typescript');
const axios = require('axios');

// Execute the real TypeScript modules, replacing only platform IO and HTTP.
function loadSource(relativePath, mocks) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const module = { exports: {} };
  const realRequire = createRequire(filename);
  const requireMock = (name) => Object.hasOwn(mocks, name) ? mocks[name] : realRequire(name);
  vm.runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename })(requireMock, module, module.exports);
  return module.exports;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const tokens = (name) => ({ access_token: `${name}-access`, refresh_token: `${name}-refresh`, token_type: 'bearer' });
const session = (name) => ({ user: { id: name, gym_id: name, role: 'member', permissions: [], full_name: name, email: `${name}@test.invalid` }, tokens: tokens(name) });
const flush = () => new Promise((resolve) => setImmediate(resolve));

function storeHarness(getMe) {
  let authHandlers;
  const writes = [], apiTokens = [];
  const counts = { clearStorage: 0, clearCache: 0 };
  const storeModule = loadSource('src/store/useAuthStore.ts', {
    '../services/authSessionStorage': {
      loadStoredSession: async () => session('old'),
      saveStoredSession: async (value) => { writes.push(value); },
      clearStoredSession: async () => { counts.clearStorage++; },
    },
    '../services/api/client': {
      apiClient: { get: () => getMe(authHandlers) },
      getApiStatus: (error) => error.status,
      setApiTokens: (value) => apiTokens.push(value),
      setApiAuthHandlers: (value) => { authHandlers = value; },
    },
    '../services/queryClient': { queryClient: { clear: () => { counts.clearCache++; } } },
  });
  return { store: storeModule.useAuthStore, writes, counts, apiTokens };
}

test('startup persists refreshed tokens, not the expired pair loaded from storage', async () => {
  const h = storeHarness(async (handlers) => {
    handlers.onTokensRefreshed(tokens('fresh'));
    return { data: session('old').user };
  });
  await h.store.getState().hydrateSession();
  assert.deepEqual(h.store.getState().tokens, tokens('fresh'));
  assert.deepEqual(h.writes.at(-1).tokens, tokens('fresh'));
  assert.equal(h.store.getState().isAuthenticated, true);
});

test('logout while startup verification is pending cannot restore the old account', async () => {
  const response = deferred();
  const h = storeHarness(() => response.promise);
  const hydrating = h.store.getState().hydrateSession();
  await flush();
  h.store.getState().clearSession();
  response.resolve({ data: session('old').user });
  await hydrating;
  assert.equal(h.store.getState().isAuthenticated, false);
  assert.equal(h.writes.length, 0);
});

test('a late startup response cannot overwrite a newly signed-in account', async () => {
  const response = deferred();
  const h = storeHarness(() => response.promise);
  const hydrating = h.store.getState().hydrateSession();
  await flush();
  h.store.getState().setSession(session('new'));
  response.resolve({ data: session('old').user });
  await hydrating;
  assert.equal(h.store.getState().user.id, 'new');
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].user.id, 'new');
});

test('temporary startup network failures preserve the saved session for a later retry', async () => {
  const h = storeHarness(async () => { throw new Error('offline'); });
  await h.store.getState().hydrateSession();
  assert.equal(h.counts.clearStorage, 0);
  assert.equal(h.store.getState().isHydrating, false);
  assert.equal(h.store.getState().isAuthenticated, false);
});

test('expired sessions and account switches clear cached private data', async () => {
  const h = storeHarness(async () => { throw { status: 401 }; });
  await h.store.getState().hydrateSession();
  assert.equal(h.counts.clearStorage, 1);
  assert.equal(h.counts.clearCache, 1);
  h.store.getState().setSession(session('new'));
  h.store.getState().clearSession();
  assert.equal(h.counts.clearCache, 3);
});

function clientHarness(refresh, adapter) {
  const counts = { refresh: 0, expired: 0, updated: 0 };
  const client = loadSource('src/services/api/client.ts', {
    axios: {
      create: (config) => axios.create({ ...config, adapter }),
      post: (...args) => { counts.refresh++; return refresh(...args); },
      isAxiosError: axios.isAxiosError,
    },
    'expo-constants': {},
    'react-native': { Platform: { OS: 'web' }, NativeModules: {} },
  });
  client.setApiAuthHandlers({
    onTokensRefreshed: () => { counts.updated++; },
    onAuthExpired: () => { counts.expired++; },
  });
  client.setApiTokens(tokens('old'));
  return { ...client, counts };
}

function unauthorized(config) {
  throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, { status: 401, data: {}, config });
}

function protectedAdapter(config) {
  if (!config._retry) unauthorized(config);
  return Promise.resolve({ status: 200, data: config.headers.Authorization, config, headers: {} });
}

test('simultaneous unauthorized requests share one token refresh', async () => {
  const response = deferred();
  const h = clientHarness(() => response.promise, protectedAdapter);
  const first = h.apiClient.get('/members');
  const second = h.apiClient.get('/payments');
  await flush();
  assert.equal(h.counts.refresh, 1);
  response.resolve({ data: tokens('fresh') });
  const replies = await Promise.all([first, second]);
  assert.ok(replies.every((reply) => reply.data === 'Bearer fresh-access'));
  assert.equal(h.counts.updated, 1);
});

test('a refresh completing after logout cannot sign the user back in', async () => {
  const response = deferred();
  const h = clientHarness(() => response.promise, protectedAdapter);
  const request = assert.rejects(h.apiClient.get('/members'));
  await flush();
  h.setApiTokens(null);
  response.resolve({ data: tokens('fresh') });
  await request;
  assert.equal(h.counts.updated, 0);
  assert.equal(h.counts.expired, 0);
});

test('a failed old refresh cannot sign out a newly signed-in account', async () => {
  const response = deferred();
  const h = clientHarness(() => response.promise, protectedAdapter);
  const request = assert.rejects(h.apiClient.get('/members'));
  await flush();
  h.setApiTokens(tokens('new'));
  response.reject(new axios.AxiosError('Expired', 'ERR_BAD_REQUEST', undefined, {}, { status: 401 }));
  await request;
  assert.equal(h.counts.expired, 0);
});

test('temporary refresh network failures do not sign the user out', async () => {
  const h = clientHarness(async () => { throw new axios.AxiosError('offline', 'ERR_NETWORK'); }, protectedAdapter);
  await assert.rejects(h.apiClient.get('/members'));
  assert.equal(h.counts.expired, 0);
});

test('invalid login credentials never trigger session refresh', async () => {
  const h = clientHarness(async () => ({ data: tokens('fresh') }), unauthorized);
  await assert.rejects(h.apiClient.post('/auth/login', { email: 'test', password: 'wrong' }));
  assert.equal(h.counts.refresh, 0);
  assert.equal(h.counts.expired, 0);
});

test('native storage serializes save and logout so a late write cannot restore credentials', async () => {
  const firstWrite = deferred();
  const values = new Map();
  let started = false;
  const storage = loadSource('src/services/authSessionStorage.ts', {
    'react-native': { Platform: { OS: 'ios' } },
    'expo-secure-store': {
      getItemAsync: async (key) => values.get(key) ?? null,
      setItemAsync: async (key, value) => { started = true; await firstWrite.promise; values.set(key, value); },
      deleteItemAsync: async (key) => { values.delete(key); },
    },
  });
  const saving = storage.saveStoredSession(session('old'));
  await flush();
  assert.equal(started, true);
  const clearing = storage.clearStoredSession();
  firstWrite.resolve();
  await Promise.all([saving, clearing]);
  assert.equal(await storage.loadStoredSession(), null);
});

test('malformed saved sessions are discarded safely', async () => {
  const values = new Map([['pulsefit.auth.session.v2', '{"user":{},"tokens":{}}']]);
  const storage = loadSource('src/services/authSessionStorage.ts', {
    'react-native': { Platform: { OS: 'ios' } },
    'expo-secure-store': {
      getItemAsync: async (key) => values.get(key) ?? null,
      deleteItemAsync: async (key) => { values.delete(key); },
    },
  });
  assert.equal(await storage.loadStoredSession(), null);
  assert.equal(values.has('pulsefit.auth.session.v2'), false);
});
