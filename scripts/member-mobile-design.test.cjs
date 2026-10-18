const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const source = path.resolve(__dirname, '../src/ui/mobile/components/member/MemberReference.tsx');
function render(logs, { range = 'Month', loading = false, failed = false } = {}) {
  let selected;
  const output = { exports: {} };
  const native = Object.fromEntries(['Text', 'View', 'Image'].map(name => [name, name]));
  native.StyleSheet = { create: styles => styles, absoluteFill: {} };
  const svg = Object.fromEntries(['Circle', 'Defs', 'G', 'Line', 'LinearGradient', 'Path', 'Stop', 'Text'].map(name => [name, `Svg${name}`]));
  svg.default = 'Svg'; svg.__esModule = true;
  const code = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const fixedNow = Date.parse('2026-10-15T12:00:00Z');
  class FixedDate extends Date { static now() { return fixedNow; } }
  vm.runInNewContext(code, { module: output, exports: output.exports, Date: FixedDate, require(name) {
    if (name === 'react') return { ...React, useState: () => [range, value => { selected = value; }] };
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react-native') return native;
    if (name === 'react-native-svg') return svg;
    if (name === '@expo/vector-icons') return { Ionicons: 'Icon' };
    if (name === 'expo-linear-gradient') return { LinearGradient: 'Gradient' };
    if (name.includes('NativePressable')) return { Pressable: 'Pressable' };
    if (name === '../WeekCalendar') return { WeekCalendar: 'WeekCalendar' };
    if (name.includes('AppThemeProvider')) return { useAppTheme: () => ({ isDark: true }) };
    if (name.endsWith('.jpg')) return {};
    throw Error(`Unexpected dependency: ${name}`);
  } });
  const root = output.exports.MemberProgressOverview({ logs, loading, failed });
  const nodes = [];
  function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; nodes.push(node); visit(node.props?.children); }
  visit(root);
  return { nodes, text: nodes.flatMap(n => React.Children.toArray(n.props?.children).filter(c => typeof c === 'string')).join(' '), selected: () => selected };
}
const log = (id, date, weight) => ({ progress_uuid: id, logged_at: date, weight, measurements: {} });
test('member chart shows only recorded finite weights in the selected period and exposes readable data', () => {
  const logs = [log('a', '2026-10-01T12:00:00Z', 75), log('b', '2026-10-14T12:00:00Z', 74), log('old', '2025-01-01', 100), log('bad', 'invalid', 90), log('nan', '2026-10-10', NaN), log('future', '2027-01-01', 73)];
  const month = render(logs);
  const chart = month.nodes.find(n => n.props?.accessible && n.props?.accessibilityLabel?.startsWith('Weight over'));
  assert.match(chart.props.accessibilityLabel, /75 kilograms/);
  assert.match(chart.props.accessibilityLabel, /74 kilograms/);
  assert.doesNotMatch(chart.props.accessibilityLabel, /100 kilograms|90 kilograms|NaN|73 kilograms/);
  const week = render(logs, { range: 'Week' });
  const weekChart = week.nodes.find(n => n.props?.accessible && n.props?.accessibilityLabel?.startsWith('Weight over'));
  assert.doesNotMatch(weekChart.props.accessibilityLabel, /75 kilograms/);
  assert.equal(week.nodes.filter(n => n.type === 'SvgPath').length, 0, 'one measurement must not become an invented trend');
});
test('member progress ranges are selectable and loading/error states hide values and goal rings', () => {
  const result = render([]);
  const year = result.nodes.find(n => n.props?.accessibilityRole === 'tab' && React.Children.toArray(n.props.children)[0]?.props.children === 'Year');
  year.props.onPress(); assert.equal(result.selected(), 'Year');
  assert.match(result.text, /No weight recorded/);
  for (const state of [{ loading: true }, { failed: true }]) {
    const view = render([{ ...log('a', '2026-10-14', 74), goal_progress_percentage: 75 }], state);
    assert.equal(view.nodes.some(n => n.props?.accessibilityLabel?.startsWith('Goal progress')), false);
    assert.doesNotMatch(view.text, /74 kg|75%/);
  }
});
function loadPureTs(relative, mocks = {}) {
  const output = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { module: output, exports: output.exports, require(name) {
    if (name in mocks) return mocks[name];
    if (name === 'react/jsx-runtime') return require(name);
    throw Error(`Unexpected dependency: ${name}`);
  } });
  return output.exports;
}
test('all mobile member services are reachable through real menu callbacks', () => {
  const menu = loadPureTs('../src/ui/mobile/components/member/MemberServicesMenu.tsx', {
    'react': { useState: () => [false, () => {}] },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { Text: 'Text', View: 'View' },
    '../NativePressable': { Pressable: 'Pressable' },
    './MemberReference': { useMemberReferenceColors: () => ({ text: 'white', card: 'navy', border: 'gray', blue: 'blue', muted: 'gray' }) },
  });
  const calls = [];
  const root = menu.MemberServicesMenu({ onNavigate: route => calls.push(route) });
  const buttons = [];
  function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; if (node.props?.accessibilityRole === 'button') buttons.push(node); visit(node.props?.children); }
  visit(root);
  buttons.forEach(button => button.props.onPress());
  assert.deepEqual(calls.sort(), ['MemberMembership', 'MemberPayments', 'MemberMealPlan', 'MemberTrainer', 'MemberClasses', 'MemberGoals', 'MemberRewards', 'MemberNotifications', 'MemberSupport', 'MemberSettings'].sort());
});
test('member form validation rejects invalid measurements and matches support API limits', () => {
  const { positiveNumberError, progressFormError, supportFormError } = loadPureTs('../src/ui/mobile/components/member/formValidation.ts');
  for (const value of ['bad', '-2', 'Infinity', '0']) assert.ok(positiveNumberError(value, 'Weight'));
  for (const value of ['', '72.5']) assert.equal(positiveNumberError(value, 'Weight'), undefined);
  assert.ok(progressFormError('', '', ''));
  assert.ok(progressFormError('72', '101', ''));
  assert.ok(progressFormError('72', '-1', ''));
  assert.equal(progressFormError('72.5', '0', ''), undefined);
  assert.equal(progressFormError('', '', 'Training felt easier'), undefined);
  assert.ok(supportFormError('support', ' ', 'Valid message'));
  assert.ok(supportFormError('support', 'a'.repeat(181), 'Valid message'));
  assert.ok(supportFormError('support', 'Valid subject', 'a'.repeat(2001)));
  assert.equal(supportFormError('trainer', 'Training help', 'Please review my plan'), undefined);
});
test('mobile QR camera submits each scan once until the current request settles', () => {
  let submitted = 0;
  let historyExpanded = false;
  let options;
  const ref = { current: false };
  const renderer = loadPureTs('../src/ui/mobile/screens/member/MemberAttendanceScreen.tsx', {
    'react': { useState: () => [false, action => { historyExpanded = action(false); }], useRef: () => ref },
    '../../components/NativePressable': { Pressable: 'Pressable' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': Object.fromEntries(['ActivityIndicator', 'Modal', 'RefreshControl', 'ScrollView', 'Text', 'View'].map(name => [name, name])),
    'react-native-qrcode-svg': { default: 'QRCode' },
    'expo-camera': { CameraView: 'Camera' },
    '../../components/Screen': { Screen: 'Screen' },
    '../../../../services/api/client': { getApiErrorMessage: () => '' },
  });
  const root = renderer.MemberAttendanceScreenView({ model: { kind: 'view1', props: {
    styles: {}, formatDate: () => "Oct 15, 2026", query: { isLoading: false, isRefetching: false, refetch() {} }, colors: {}, data: { history: Array.from({length: 8}, (_, i) => ({ attendance_uuid: String(i) })), daily_visit_limit: 3, today_visit_count: 0 }, error: null, StatCard: "StatCard", HistoryRow: "HistoryRow",
    scannerOpen: true, setScannerOpen() {}, qrAction: null, setQrAction() {}, qrToken: null,
    checkIn: { isPending: false }, checkOut: { isPending: false }, scanMutation: { isPending: false, mutate(data, callback) { submitted++; options = callback; } },
  } } });
  let camera;
  let historyButton;
  function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; if (node.type === 'Camera') camera = node; if (node.props?.accessibilityLabel === 'Toggle full attendance history') historyButton = node; visit(node.props?.children); }
  visit(root);
  assert.ok(historyButton); historyButton.props.onPress(); assert.equal(historyExpanded, true);
  camera.props.onBarcodeScanned({ data: 'gym-daily-token' });
  camera.props.onBarcodeScanned({ data: 'gym-daily-token' });
  assert.equal(submitted, 1);
  options.onSettled();
  camera.props.onBarcodeScanned({ data: 'gym-daily-token' });
  assert.equal(submitted, 2, 'a later attempt is allowed after the prior request settles');
});
