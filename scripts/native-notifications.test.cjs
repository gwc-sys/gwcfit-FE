const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function setup(os = 'android') {
  let user = { id: 'admin' }, token = 'ExponentPushToken[first]', onToken;
  const registered = [], removed = [], channels = [], badges = [], cleanups = [];
  let handler, asked = 0, dismissed = 0;
  let permission = { granted: true, canAskAgain: true };
  const notifications = {
    IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 }, AndroidImportance: { HIGH: 4 },
    setNotificationHandler: value => { handler = value; },
    getPermissionsAsync: async () => permission,
    requestPermissionsAsync: async () => { asked++; return permission; },
    setNotificationChannelAsync: async (id, options) => channels.push(id),
    getExpoPushTokenAsync: async () => ({ data: token }),
    setBadgeCountAsync: async count => badges.push(count),
    dismissAllNotificationsAsync: async () => { dismissed++; },
    addNotificationReceivedListener: () => ({ remove() {} }),
    addNotificationResponseReceivedListener: () => ({ remove() {} }),
    addPushTokenListener: fn => { onToken = fn; return { remove() {} }; },
    getLastNotificationResponseAsync: async () => null,
  };
  const constants = { easConfig: { projectId: 'project' } };
  const api = { registerDevice: async value => registered.push(value), unregisterDevice: async value => removed.push(value) };
  const mocks = {
    react: { useEffect: fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); } },
    'react-native': { Platform: { OS: os }, AppState: { addEventListener: () => ({ remove() {} }) } },
    'expo-constants': { __esModule: true, default: constants },
    'expo-notifications': notifications,
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }) },
    './api/notifications': { notificationsApi: api },
    '../store/useAuthStore': { useAuthStore: { getState: () => ({ user }) } },
    '../hooks/useLiveNotifications': { useLiveNotifications() {} },
  };
  const file = path.resolve(__dirname, '../src/services/notificationDelivery.native.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`)(name => mocks[name], module, module.exports);
  return { ...module.exports, notifications, constants, api, registered, removed, channels, badges, handler,
    permission: value => { permission = value; }, user: value => { user = value; }, token: value => { token = value; },
    rotate: () => onToken(), asked: () => asked, dismissed: () => dismissed,
    cleanup: () => cleanups.forEach(fn => fn()),
  };
}

test('Android creates the notification channel, registers a token and removes it on logout', async () => {
  const d = setup();
  await d.enableNotificationDelivery();
  assert.deepEqual(d.channels, ['platform-alerts']);
  assert.equal(d.registered.length, 1);
  await d.disableNotificationDelivery();
  assert.deepEqual(d.removed, d.registered);
  assert.equal(d.dismissed(), 1);
  assert.deepEqual(d.badges, [0]);
});

test('iOS provisional permission supports push registration without prompting again', async () => {
  const d = setup('ios');
  d.permission({ granted: false, canAskAgain: true, ios: { status: 3 } });
  await d.enableNotificationDelivery();
  assert.equal(d.asked(), 0);
  assert.equal(d.registered.length, 1);
  assert.equal(d.channels.length, 0);
});

test('denied permissions and Expo Go never report that phone push is enabled', async () => {
  const d = setup();
  d.permission({ granted: false, canAskAgain: false });
  await assert.rejects(d.enableNotificationDelivery(), /device settings/);
  assert.equal(d.registered.length, 0);
  d.constants.appOwnership = 'expo';
  await assert.rejects(d.enableNotificationDelivery(), /Expo Go/);
});

test('token rotation re-registers the device and removes the previous token', async () => {
  const d = setup();
  d.useNotificationDelivery({ navigate() {} }, 'admin', 3);
  await new Promise(resolve => setImmediate(resolve));
  d.token('ExponentPushToken[rotated]');
  d.rotate();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(d.registered, ['ExponentPushToken[first]', 'ExponentPushToken[rotated]']);
  assert.deepEqual(d.removed, ['ExponentPushToken[first]']);
  d.cleanup();
});

test('foreground notifications addressed to another account are hidden', async () => {
  const d = setup('ios');
  const result = await d.handler.handleNotification({ request: { content: { data: { receiverId: 'other' } } } });
  assert.equal(result.shouldShowBanner, false);
  assert.equal(result.shouldPlaySound, false);
  assert.equal(result.shouldSetBadge, false);
});

test('logout clears visible notifications even if token unregistering fails', async () => {
  const d = setup();
  await d.enableNotificationDelivery();
  d.api.unregisterDevice = async () => { throw new Error('offline'); };
  await assert.rejects(d.disableNotificationDelivery(), /offline/);
  assert.equal(d.dismissed(), 1);
  assert.deepEqual(d.badges, [0]);
});
