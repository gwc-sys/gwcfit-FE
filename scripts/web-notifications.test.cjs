const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function delivery() {
  let user = { id: 'admin' };
  let rows;
  let subscribed;
  const alerts = [], marked = [], invalidated = [], navigated = [];
  let requested = 0;
  class BrowserNotification {
    static permission = 'granted';
    static async requestPermission() { requested++; return this.permission = 'granted'; }
    constructor(title, options) { this.title = title; this.options = options; alerts.push(this); }
    close() { this.closed = true; this.onclose?.(); }
  }
  const client = { invalidateQueries: async options => { invalidated.push(options); } };
  const listeners = new Map();
  const window = { Notification: BrowserNotification, isSecureContext: true, focus() {},
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
  };
  const document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  const queryOptions = [];
  const mocks = {
    react: { useEffect: fn => { fn(); } },
    '@tanstack/react-query': { useQueryClient: () => client, useQuery: options => { queryOptions.push(options); return { data: rows }; } },
    './api/notifications': { notificationsApi: { list: async () => rows, markRead: async id => marked.push(id) } },
    '../store/useAuthStore': { useAuthStore: { getState: () => ({ user }), subscribe: fn => { subscribed = fn; } } },
    '../hooks/useLiveNotifications': { useLiveNotifications() {} },
  };
  const file = path.resolve(__dirname, '../src/services/notificationDelivery.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, { window, document })(name => mocks[name], module, module.exports);
  return {
    ...module.exports, window, alerts, marked, invalidated, navigated, queryOptions, listeners,
    interact(type = 'click') { for (const fn of [...(listeners.get(type) ?? [])]) fn(); },
    requested: () => requested,
    setUser(next) { const previous = { user }; user = next; subscribed({ user }, previous); },
    render(nextRows, id = user?.id) {
      rows = nextRows;
      module.exports.useNotificationDelivery({ navigate: route => navigated.push(route) }, id, 0);
    },
  };
}

const unread = id => ({ id, title: 'New gym enquiry', body: 'Review the new enquiry.', status: 'unread' });

test('browser delivery seeds existing alerts and delivers new unread alerts only once', async () => {
  const d = delivery();
  d.render([unread('old')]);
  assert.equal(d.alerts.length, 0);
  assert.equal(d.requested(), 0, 'polling must never prompt for permission');
  d.render([unread('new'), unread('old'), { ...unread('read'), status: 'read' }]);
  d.render([unread('new'), unread('old')]);
  assert.equal(d.alerts.length, 1);
  assert.equal(d.alerts[0].options.tag, 'new');
  assert.equal(d.queryOptions[0].refetchIntervalInBackground, true);
  d.alerts[0].onclick();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(d.navigated, ['Notifications']);
  assert.deepEqual(d.marked, ['new']);
  assert.equal(d.invalidated.length, 1);
});

test('logout closes alerts and rejects stale account data and notification clicks', () => {
  const d = delivery();
  d.render([]);
  d.render([unread('new')]);
  d.setUser(null);
  assert.equal(d.alerts[0].closed, true);
  d.alerts[0].onclick();
  d.render([unread('stale')], 'admin');
  assert.equal(d.alerts.length, 1);
  assert.equal(d.navigated.length, 0);
  d.setUser({ id: 'other' });
  d.render([unread('other-old')]);
  assert.equal(d.alerts.length, 1);
});

test('enabling browser alerts requests permission only on demand and confirms delivery', async () => {
  const d = delivery();
  d.window.Notification.permission = 'default';
  assert.match(await d.enableNotificationDelivery(), /while PulseFit is open/);
  assert.equal(d.requested(), 1);
  assert.equal(d.alerts.length, 1);
});

test('unsupported, insecure and denied notifications give actionable errors', async () => {
  const d = delivery();
  d.window.isSecureContext = false;
  await assert.rejects(d.enableNotificationDelivery(), /HTTPS/);
  d.window.isSecureContext = true;
  d.window.Notification.permission = 'denied';
  await assert.rejects(d.enableNotificationDelivery(), /site settings/);
  assert.equal(d.requested(), 0);
  delete d.window.Notification;
  await assert.rejects(d.enableNotificationDelivery(), /does not support/);
});

test('a browser that exposes Notification but cannot display alerts never reports success', async () => {
  const d = delivery();
  d.window.Notification = class { static permission = 'granted'; constructor() { throw new Error('unsupported'); } };
  await assert.rejects(d.enableNotificationDelivery(), /cannot display/);
});

test('browser permission uses the first interaction without a separate enable button', async () => {
  const d = delivery();
  d.window.Notification.permission = 'default';
  d.requestBrowserNotificationsOnInteraction('admin');
  assert.equal(d.requested(), 0, 'Never request permission directly on page load');
  d.interact();
  d.interact('keydown');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(d.requested(), 1);
  assert.equal(d.listeners.get('click').size, 0);
  assert.equal(d.listeners.get('keydown').size, 0);
});

test('granted or denied browser permission never triggers another prompt', () => {
  for (const permission of ['granted', 'denied']) {
    const d = delivery();
    d.window.Notification.permission = permission;
    d.requestBrowserNotificationsOnInteraction('admin');
    d.interact();
    assert.equal(d.requested(), 0);
    assert.equal(d.listeners.size, 0);
  }
});

test('permission listeners are removed on unmount and ignore changed accounts', () => {
  const d = delivery();
  d.window.Notification.permission = 'default';
  const cleanup = d.requestBrowserNotificationsOnInteraction('admin');
  cleanup();
  d.interact();
  assert.equal(d.requested(), 0);
  d.requestBrowserNotificationsOnInteraction('admin');
  d.setUser(null);
  d.interact();
  assert.equal(d.requested(), 0);
});

test('notification history displays saved alerts without browser permission and preserves read actions', () => {
  const React = require('react');
  const file = path.resolve(__dirname, '../src/ui/web/pages/saas/NotificationsScreen.tsx');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stub = new Proxy({}, { get: (_, name) => name });
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`)(name => name === 'react' ? { useState: () => ['All', () => {}] } : name === 'react/jsx-runtime' ? require(name) : stub, module, module.exports);
  const marked = [];
  const opened = [];
  const saved = { ...unread('saved'), created_at: '2026-10-24T06:00:00Z', route: 'Invitations' };
  const read = { ...unread('read'), title: 'Subscription updated', status: 'read', created_at: saved.created_at };
  const tree = module.exports.NotificationsScreenView({ model: { kind: 'view1', props: {
    styles: {}, colors: {}, query: { data: [saved, read] },
    markRead: { mutate: id => marked.push(id) }, enableDelivery: {}, openRelated: item => opened.push(item.id),
  } } });
  const nodes = value => Array.isArray(value) ? value.flatMap(nodes) : React.isValidElement(value) ? [value, ...nodes(value.props.children)] : [];
  const rendered = nodes(tree);
  assert.equal(rendered.some(node => node.props.title === 'Enable browser notifications'), false);
  assert.ok(rendered.some(node => node.props.title === saved.title));
  assert.ok(rendered.some(node => node.props.title === read.title));
  assert.equal(rendered.some(node => node.props.title === 'All caught up'), false);
  const markButtons = rendered.filter(node => node.props.title === 'Mark as read');
  assert.equal(markButtons.length, 1);
  markButtons[0].props.onPress();
  rendered.find(node => node.props.title === 'Open related information').props.onPress();
  assert.deepEqual(marked, ['saved', 'saved']);
  assert.deepEqual(opened, ['saved']);
});
