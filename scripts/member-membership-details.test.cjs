const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');

function harness(payments = []) {
  const cache = new Map();
  const colors = { ink: '#111', muted: '#666', surface: '#fff', primary: '#06c', danger: '#c00' };
  function load(relative) {
    const file = path.resolve(__dirname, '../src', relative);
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const requireMock = name => {
      if (name === 'react') return { ...React, useEffect: () => {}, useRef: value => ({ current: value }), useState: initial => [initial, () => {}] };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'react-native') return { View: 'View', Text: 'Text', Modal: 'Modal', RefreshControl: 'RefreshControl', Platform: { OS: 'web' } };
      if (name === '@tanstack/react-query') return {
        useQuery: () => ({ data: { payments, settings: { enabled: true } } }),
        useMutation: () => ({}),
        useQueryClient: () => ({ invalidateQueries: async () => {} }),
      };
      if (name.includes('AppThemeProvider')) return { useAppTheme: () => ({ colors }) };
      if (name.endsWith('/formatters')) return load('utils/formatters.ts');
      if (name.endsWith('/MemberMembershipDetails')) return load('components/member/MemberMembershipDetails.tsx');
      if (name.endsWith('/client')) return { getApiErrorMessage: e => e.message };
      if (name.endsWith('/membershipCheckout')) return { membershipCheckoutApi: {} };
      if (name.endsWith('/upiApps')) return { upiApps: [] };
      if (name.endsWith('/useAuthStore')) return { useAuthStore: () => false };
      return new Proxy({}, { get: (_, key) => key === '__esModule' ? true : String(key) });
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(requireMock, module, module.exports);
    cache.set(file, module.exports);
    return module.exports;
  }
  function expand(element) {
    if (Array.isArray(element)) return element.flatMap(expand);
    if (!React.isValidElement(element)) return [];
    if (element.type === 'Modal' && !element.props.visible) return [];
    if (typeof element.type === 'function') return expand(element.type(element.props));
    return [element, ...expand(element.props.children)];
  }
  function content(element) {
    if (Array.isArray(element)) return element.map(content).join('');
    if (typeof element === 'string' || typeof element === 'number') return String(element);
    return element?.props ? content(element.props.children) : '';
  }
  return { load, expand, text: element => expand(element).filter(e => e.type === 'Text').map(content).join('\n') };
}

test('confirmed payment displays its purchased plan and recorded membership period', () => {
  const h = harness([{ id: 'p1', plan_name: 'Quarterly Strength', amount_cents: 450000, currency: 'INR', status: 'paid', start_date: '2026-10-22', expiry_date: '2027-01-19' }]);
  const { MemberPlanCheckout } = h.load('features/operations/MembershipCheckout.tsx');
  const text = h.text(MemberPlanCheckout({ plans: [] }));
  assert.match(text, /Quarterly Strength/);
  assert.match(text, /Start date: Oct 22, 2026/);
  assert.match(text, /End date: Jan 19, 2027/);
  assert.match(text, /Confirmed/);
});

test('pending and failed payments never present membership dates as activated', () => {
  for (const status of ['pending', 'failed']) {
    const h = harness([{ id: 'p1', plan_name: 'Monthly', amount_cents: 100000, currency: 'INR', status, start_date: '2026-10-22', expiry_date: '2026-11-20' }]);
    const { MemberPlanCheckout } = h.load('features/operations/MembershipCheckout.tsx');
    const text = h.text(MemberPlanCheckout({ plans: [] }));
    assert.match(text, /Monthly/);
    assert.doesNotMatch(text, /Start date:|End date:|Confirmed/);
    if (status === 'pending') assert.match(text, /after gym approval/);
  }
});

test('profile summary displays authoritative dates and handles unassigned memberships', () => {
  const h = harness();
  const { MemberMembershipDetails } = h.load('components/member/MemberMembershipDetails.tsx');
  const props = { planName: 'Annual Fitness', startDate: '2026-10-22', endDate: '2027-10-21', onRetry: () => {} };
  const text = h.text(MemberMembershipDetails(props));
  assert.match(text, /Annual Fitness/);
  assert.match(text, /Start date\nOct 22, 2026/);
  assert.match(text, /End date\nOct 21, 2027/);
  const empty = h.text(MemberMembershipDetails({ onRetry: () => {} }));
  assert.match(empty, /Not assigned/);
  assert.equal(empty.match(/Not set/g).length, 2);
});

test('loading or failed membership requests hide stale dates and expose retry', () => {
  const h = harness();
  const { MemberMembershipDetails } = h.load('components/member/MemberMembershipDetails.tsx');
  let retries = 0;
  const props = { planName: 'Stale plan', startDate: '2026-10-22', endDate: '2027-10-21', onRetry: () => retries++ };
  const loading = h.text(MemberMembershipDetails({ ...props, loading: true }));
  assert.match(loading, /Loading membership/);
  assert.doesNotMatch(loading, /Stale plan|2026|2027/);
  const errorTree = MemberMembershipDetails({ ...props, error: new Error('Membership unavailable') });
  assert.doesNotMatch(h.text(errorTree), /Stale plan|2026|2027/);
  const retry = h.expand(errorTree).find(e => e.type === 'PrimaryButton');
  retry.props.onPress();
  assert.equal(retries, 1);
});

test('web and mobile profiles show the membership API dates and refresh both resources', () => {
  for (const file of ['ui/web/pages/member/MemberProfileScreen.tsx', 'ui/mobile/screens/member/MemberProfileScreen.tsx']) {
    const h = harness();
    const { MemberProfileScreenView } = h.load(file);
    let refreshes = 0;
    const tree = MemberProfileScreenView({ model: { kind: 'view1', props: {
      styles: {}, colors: {}, form: {}, updateProfile: {},
      profileQuery: { isRefetching: false },
      membershipQuery: { isRefetching: true, data: { membership_plan_name: 'Confirmed annual plan', start_date: '2026-10-22', expiry_date: '2027-10-21' } },
      profile: { member_name: 'Test Member', membership_status: 'active', membership_plan_name: 'Older cached plan' },
      refreshProfile: () => { refreshes++; }, navigation: {},
    } } });
    const text = h.text(tree);
    assert.match(text, /Confirmed annual plan/, file);
    assert.match(text, /Start date\nOct 22, 2026/, file);
    assert.match(text, /End date\nOct 21, 2027/, file);
    assert.doesNotMatch(text, /Older cached plan/, file);
    const refreshControl = h.expand(tree)[0].props.refreshControl;
    assert.equal(refreshControl.props.refreshing, true);
    refreshControl.props.onRefresh();
    assert.equal(refreshes, 1);
  }
});
