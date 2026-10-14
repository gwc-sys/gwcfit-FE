const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const React = require('react');
const ts = require('typescript');

const mobile = path.resolve(__dirname, '..');
function harness(width, scheme = 'dark', { os = 'ios', fontScale = 1, reduceMotion = false } = {}) {
  const cache = new Map();
  const contexts = new Map();
  let colors;
  const rn = {
    Platform: { OS: os, select: v => v[os] ?? v.default },
    StyleSheet: { create: v => v, hairlineWidth: 0.5 },
    useWindowDimensions: () => ({ width, height: 844, fontScale }),
    View: 'View', Text: 'Text', Pressable: 'Pressable', ScrollView: 'ScrollView',
    Modal: 'Modal', TextInput: 'TextInput', KeyboardAvoidingView: 'KeyboardAvoidingView', Image: 'Image', ActivityIndicator: 'ActivityIndicator',
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    cache.set(file, module.exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    function requireMock(request) {
      if (request === 'react') return { ...React, useMemo: fn => fn(), useContext: ctx => contexts.get(ctx) ?? false, useState: initial => [initial, () => {}] };
      if (request === 'react/jsx-runtime') return require(request);
      if (request === 'react-native') return rn;
      if (request === '@expo/vector-icons') return { Ionicons: 'Icon' };
      if (request === 'expo-linear-gradient') return { LinearGradient: 'Gradient' };
      if (request === 'react-native-reanimated') return { useReducedMotion: () => reduceMotion };
      if (request === '@react-navigation/native') return { NavigationContainer: 'NavigationContainer' };
      if (request === '@react-navigation/bottom-tabs') return { BottomTabBar: 'BottomTabBar' };
      if (request.includes('data/onboarding')) return { onboardingSlides: [{ id: 'one' }, { id: 'two' }, { id: 'three' }] };
      if (request === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }) };
      if (request.includes('AppThemeProvider')) return { useAppTheme: () => ({ colors }) };
      if (request.includes('utils/formatters')) return { initials: name => name.split(' ').map(p => p[0]).join('') };
      if (request.includes('utils/logoutConfirmation')) return { requestLogoutConfirmation: fn => fn() };
      const base = path.resolve(path.dirname(file), request);
      const resolved = [base + '.tsx', base + '.ts'].find(p => fs.existsSync(p));
      assert.ok(resolved, request);
      if (!resolved.startsWith(mobile + path.sep)) return new Proxy({}, { get: () => function SharedComponentStub() { return null; } });
      return load(resolved);
    }
    vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(requireMock, module, module.exports);
    cache.set(file, module.exports);
    return module.exports;
  }
  colors = load(path.join(mobile, 'theme/theme.ts')).getThemeColors(scheme);
  function expand(element) {
    if (Array.isArray(element)) return element.flatMap(expand);
    if (!React.isValidElement(element)) return [];
    if (element.type?.$$typeof === Symbol.for('react.context')) {
      const previous = contexts.get(element.type);
      contexts.set(element.type, element.props.value);
      const children = expand(element.props.children);
      contexts.set(element.type, previous);
      return children;
    }
    if (typeof element.type === 'function') return expand(element.type(element.props));
    return [element, ...expand(element.props.children)];
  }
  return { load, expand, colors };
}

const flattenStyle = value => Object.assign({}, ...[value].flat(Infinity).filter(v => v && typeof v === 'object'));

test('native feature pages have one scroller and preserve their refresh and keyboard handling', () => {
  for (const width of [320, 390, 768, 1024]) {
    const h = harness(width);
    const { Screen } = h.load(path.join(mobile, 'components/Screen.tsx'));
    const { PulseDashboardLayoutView } = h.load(path.join(mobile, 'layouts/PulseDashboardLayout.tsx'));
    const refreshControl = React.createElement('RefreshControl', { onRefresh() {} });
    const props = { styles: {}, colors: h.colors, activeLabel: 'Members', resolvedRoleLabel: 'Gym Owner', userName: 'Long Owner Name', navigation: { navigate() {} }, setAccountMenuOpen() {}, isGymOwner: true,
      children: React.createElement(Screen, { scroll: true, keyboard: true, refreshControl }, React.createElement('Text', null, 'Members')) };
    const nodes = h.expand(PulseDashboardLayoutView({ model: { kind: 'view1', props } }));
    const scrollers = nodes.filter(n => n.type === 'ScrollView');
    assert.equal(scrollers.length, 1, `one scroll owner at ${width}`);
    assert.equal(scrollers[0].props.refreshControl, refreshControl);
    assert.equal(scrollers[0].props.keyboardShouldPersistTaps, 'handled');
    assert.equal(nodes.filter(n => n.type === 'KeyboardAvoidingView').length, 1);
    const safeAreas = nodes.filter(n => n.type === 'SafeAreaView');
    assert.deepEqual(safeAreas.map(n => n.props.edges), [['top', 'right', 'bottom', 'left'], []]);
    assert.equal(nodes.filter(n => n.props.accessibilityLabel === 'Add member').length, 0);
  }
});

test('native dashboard shortcuts and account access retain their original destinations', () => {
  const h = harness(320);
  const { PulseDashboardLayoutView } = h.load(path.join(mobile, 'layouts/PulseDashboardLayout.tsx'));
  const destinations = [];
  let opened = false;
  const props = { styles: {}, colors: h.colors, activeLabel: 'Dashboard', resolvedRoleLabel: 'Gym Owner', userName: 'Owner Name', firstName: name => name.split(' ')[0], ownerDate: '14 Oct 2026', unreadNotificationCount: 2, navigation: { navigate: route => destinations.push(route) }, setAccountMenuOpen: value => opened = value, isGymOwner: true, children: React.createElement('Text', null, 'Summary') };
  const nodes = h.expand(PulseDashboardLayoutView({ model: { kind: 'view1', props } }));
  assert.equal(nodes.filter(n => n.type === 'ScrollView').length, 1);
  for (const label of ['Add member', 'Open attendance calendar', 'Notifications, 2 unread', 'Open account menu']) nodes.find(n => n.props.accessibilityLabel === label).props.onPress();
  assert.deepEqual(destinations, ['AddMember', 'Attendance', 'Notifications']);
  assert.equal(opened, true);
});

test('direct-content plan pages keep workspace scrolling', () => {
  const h = harness(390);
  const { PulseDashboardLayoutView } = h.load(path.join(mobile, 'layouts/PulseDashboardLayout.tsx'));
  const props = { styles: {}, colors: h.colors, activeLabel: 'Membership plans', contentStyle: { gap: 20 }, resolvedRoleLabel: 'Gym Owner', userName: 'Owner', navigation: { navigate() {} }, setAccountMenuOpen() {}, isGymOwner: true, children: React.createElement('View', null, 'Plans') };
  const nodes = h.expand(PulseDashboardLayoutView({ model: { kind: 'view1', props } }));
  assert.equal(nodes.filter(n => n.type === 'ScrollView').length, 1);
});

test('phone directories expose full-width search and readable themed profile cards', () => {
  for (const scheme of ['light', 'dark']) {
    const h = harness(320, scheme);
    const memberStyles = h.load(path.join(mobile, 'styles/screens/saas/MemberListScreen.styles.ts')).createStyles(h.colors);
    assert.equal(memberStyles.pageHeader.flexDirection, 'column');
    assert.equal(memberStyles.toolbarSearch.width, '100%');
    assert.equal(memberStyles.headerActions.flexWrap, 'wrap');
    assert.equal(memberStyles.memberRow.flexDirection, 'column');
    assert.ok(memberStyles.iconButton.width >= 44);
    const profile = h.load(path.join(mobile, 'styles/screens/saas/ProfileScreen.styles.ts')).createStyles(h.colors);
    assert.notEqual(profile.hero.backgroundColor, profile.name.color);
    assert.notEqual(profile.hero.backgroundColor, profile.email.color);
    const dashboard = h.load(path.join(mobile, 'styles/screens/saas/GymAdminDashboardScreen.styles.ts')).createOwnerDashboardStyles(h.colors);
    assert.notEqual(dashboard.statusRingValue.color, h.colors.card);
    assert.equal(dashboard.metric.minWidth, 0);
    assert.equal(dashboard.metric.flexBasis, '45%');
  }
});

test('platform control targets use 44 points on iOS and 48 dp on Android', () => {
  for (const [os, minimum] of [['ios', 44], ['android', 48]]) {
    const h = harness(320, 'light', { os, fontScale: 2 });
    const { controlMetrics } = h.load(path.join(mobile, 'theme/theme.ts'));
    assert.equal(controlMetrics.minimumTouchSize, minimum);
    const chrome = h.load(path.join(mobile, 'layouts/WorkspaceChrome.styles.ts')).createWorkspaceChromeStyles(h.colors, 320);
    assert.ok(chrome.iconButton.width >= minimum);
    assert.ok(chrome.iconButton.height >= minimum);
    const { SegmentedControl } = h.load(path.join(mobile, 'components/SegmentedControl.tsx'));
    let selected;
    const nodes = h.expand(SegmentedControl({ options: ['All memberships', 'Active memberships'], value: 'All memberships', onChange: value => selected = value }));
    const buttons = nodes.filter(n => n.type === 'Pressable');
    assert.equal(buttons.length, 2);
    assert.ok(flattenStyle(buttons[0].props.style).minHeight >= minimum);
    assert.equal(buttons[0].props.accessibilityState.selected, true);
    assert.equal(nodes.filter(n => n.type === 'Text').every(n => n.props.numberOfLines === undefined), true);
    buttons[1].props.onPress();
    assert.equal(selected, 'Active memberships');
  }
});

test('buttons retain pending/disabled semantics and remove scaling feedback for reduced motion', () => {
  for (const reduceMotion of [false, true]) {
    const h = harness(390, 'dark', { reduceMotion });
    const { PrimaryButton } = h.load(path.join(mobile, 'components/PrimaryButton.tsx'));
    const onPress = () => {};
    const ready = PrimaryButton({ title: 'Save changes', onPress });
    assert.equal(ready.props.onPress, onPress);
    assert.equal(ready.props.accessibilityLabel, 'Save changes');
    const pressed = flattenStyle(ready.props.style({ pressed: true }));
    assert.equal(Boolean(pressed.transform), !reduceMotion);
    const pending = PrimaryButton({ title: 'Save changes', onPress, loading: true });
    assert.equal(pending.props.disabled, true);
    assert.deepEqual(pending.props.accessibilityState, { disabled: true, busy: true });
    assert.equal(h.expand(pending).some(n => n.type === 'ActivityIndicator'), true);
    const disabled = PrimaryButton({ title: 'Save changes', onPress, disabled: true });
    assert.equal(disabled.props.disabled, true);
  }
});

test('form fields preserve input callbacks and announce required/error information', () => {
  const h = harness(320, 'light', { os: 'android', fontScale: 2 });
  const { FormTextField } = h.load(path.join(mobile, 'components/FormTextField.tsx'));
  let changes = [], focus = 0, blur = 0;
  const onChangeText = value => changes.push(value);
  const nodes = h.expand(FormTextField({ label: 'Email', required: true, error: 'Enter a valid email', value: 'invalid', keyboardType: 'email-address', maxLength: 120, onChangeText, onFocus: () => focus++, onBlur: () => blur++ }));
  const input = nodes.find(n => n.type === 'TextInput');
  assert.equal(input.props.value, 'invalid');
  assert.equal(input.props.keyboardType, 'email-address');
  assert.equal(input.props.maxLength, 120);
  assert.equal(input.props.accessibilityLabel, 'Email, required, invalid entry');
  assert.equal(input.props.accessibilityHint, 'Enter a valid email');
  assert.equal(input.props.onChangeText, onChangeText);
  input.props.onChangeText('member@example.com'); input.props.onFocus({}); input.props.onBlur({});
  assert.deepEqual(changes, ['member@example.com']);
  assert.equal(focus, 1); assert.equal(blur, 1);
  assert.equal(nodes.some(n => n.props.accessibilityRole === 'alert'), true);
  assert.equal(nodes.some(n => flattenStyle(n.props.style).borderWidth === 2), true);
});

test('onboarding preserves skip, next, final-account and sign-in actions', () => {
  const h = harness(320, 'light', { fontScale: 2 });
  const { OnboardingScreenView } = h.load(path.join(mobile, 'screens/auth/OnboardingScreen.tsx'));
  const calls = [];
  for (const last of [false, true]) {
    const props = { slide: { image: 1, title: 'Build a stronger life', body: 'Track your existing fitness journey.' }, navigation: { replace: route => calls.push(['replace', route]), navigate: route => calls.push(['navigate', route]) }, index: last ? 2 : 0, last, goNext: () => calls.push(['next', last]) };
    const nodes = h.expand(OnboardingScreenView({ model: { kind: 'view1', props } }));
    const primary = nodes.find(n => n.props.accessibilityLabel === (last ? 'Create Account' : 'Next'));
    primary.props.onPress();
    const buttons = nodes.filter(n => n.type === 'Pressable');
    buttons[0].props.onPress(); buttons.at(-1).props.onPress();
    assert.equal(nodes.filter(n => n.type === 'ScrollView').length, 1);
    assert.equal(nodes.some(n => n.props.accessibilityRole === 'header'), true);
  }
  assert.deepEqual(calls, [['next', false], ['replace', 'Login'], ['navigate', 'Login'], ['next', true], ['replace', 'Login'], ['navigate', 'Login']]);
});

test('central text and button colors meet 4.5:1 against their primary surfaces', () => {
  function luminance(hex) {
    const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  function contrast(a, b) { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + 0.05) / (low + 0.05); }
  for (const scheme of ['light', 'dark']) {
    const { colors } = harness(390, scheme);
    for (const background of ['background', 'surface']) {
      for (const foreground of ['ink', 'muted', 'primary', 'success', 'warning', 'danger']) {
        assert.ok(contrast(colors[foreground], colors[background]) >= 4.5, `${scheme}: ${foreground} on ${background}`);
      }
    }
    assert.ok(contrast(colors.white, colors.primaryButton) >= 4.5);
    assert.ok(contrast(colors.white, colors.dangerButton) >= 4.5);
  }
});

test('narrow and large-text calendars keep restrictions, selected state and date callbacks', () => {
  for (const [os, width, fontScale] of [['android', 320, 1], ['ios', 390, 2]]) {
    const h = harness(width, 'light', { os, fontScale, reduceMotion: true });
    const { DatePickerFieldView } = h.load(path.join(mobile, 'components/DatePickerField.tsx'));
    const styles = h.load(path.join(mobile, 'styles/components/DatePickerField.styles.ts')).createStyles(h.colors);
    const changed = [], opened = [], months = [];
    const valueOf = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const props = { styles, label: 'Start date', displayDate: value => value, value: '2026-10-02', open: true, show() {}, colors: h.colors, setOpen: value => opened.push(value), width, setVisibleMonth: value => months.push(value), year: 2026, month: 9, MONTHS: Array.from({ length: 12 }, (_, i) => String(i + 1)), WEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], cells: [null, 1, 2], dateValue: valueOf, minimum: new Date(2026, 9, 2), onChange: value => changed.push(value), todayDisabled: false };
    const nodes = h.expand(DatePickerFieldView({ model: { kind: 'view1', props } }));
    assert.equal(nodes.find(n => n.type === 'Modal').props.animationType, 'none');
    const day = label => nodes.find(n => n.type === 'Pressable' && n.props.accessibilityLabel === label);
    assert.equal(day('2026-10-01').props.disabled, true);
    assert.equal(day('2026-10-02').props.accessibilityState.selected, true);
    const style = flattenStyle(day('2026-10-02').props.style({ pressed: false }));
    assert.equal(style.width, '100%');
    assert.ok(style.minHeight >= (os === 'android' ? 48 : 44));
    day('2026-10-02').props.onPress();
    assert.deepEqual(changed, ['2026-10-02']); assert.deepEqual(opened, [false]);
    nodes.find(n => n.props.accessibilityLabel === 'Next month').props.onPress();
    assert.equal(months[0].getMonth(), 10);
  }
});

test('network error guidance preserves the original error and leaves empty/loading states intact', () => {
  const h = harness(390);
  const { DataState } = h.load(path.join(mobile, 'components/DataState.tsx'));
  const failed = h.expand(DataState({ error: 'Network Error' }));
  assert.equal(failed.some(n => n.props.accessibilityRole === 'alert'), true);
  assert.equal(failed.some(n => n.type === 'Text' && n.props.children === 'Network Error'), true);
  assert.equal(failed.some(n => n.type === 'Text' && String(n.props.children).startsWith('Check your connection')), true);
  const loading = h.expand(DataState({ loading: true }));
  assert.equal(loading.some(n => n.props.accessibilityState?.busy), true);
});

test('member workout tab uses the selected tint and grows with system font size', () => {
  for (const fontScale of [1, 2]) {
    const h = harness(390, 'light', { fontScale });
    const { MemberTabsNavigatorView } = h.load(path.join(mobile, 'navigation/RootNavigator.tsx'));
    const styles = h.load(path.join(mobile, 'styles/navigation/RootNavigator.styles.ts')).createMemberTabStyles(h.colors, 390, 34);
    const props = { MemberTabs: { Navigator: 'TabNavigator', Screen: 'TabScreen' }, memberTabNames: ['MemberHome', 'MemberWorkout'], colors: h.colors, styles, getMemberTabIcon: () => 'barbell' };
    const navigator = MemberTabsNavigatorView({ model: { kind: 'view1', props } });
    const options = navigator.props.screenOptions({ route: { name: 'MemberWorkout' } });
    assert.equal(flattenStyle(options.tabBarStyle).height, styles.tabBar.height + (fontScale - 1) * 24);
    const icon = h.expand(options.tabBarIcon({ color: '#6E6E73', focused: false, size: 24 })).find(n => n.type === 'Icon');
    assert.equal(icon.props.color, '#6E6E73');
  }
});

test('keyboard avoidance uses one iOS inset strategy and Android height behavior', () => {
  for (const os of ['ios', 'android']) {
    const h = harness(390, 'light', { os });
    const { Screen } = h.load(path.join(mobile, 'components/Screen.tsx'));
    const nodes = h.expand(Screen({ scroll: true, keyboard: true, children: null }));
    assert.equal(nodes.find(n => n.type === 'ScrollView').props.automaticallyAdjustKeyboardInsets, false);
    assert.equal(nodes.find(n => n.type === 'KeyboardAvoidingView').props.behavior, os === 'ios' ? 'padding' : 'height');
  }
});
