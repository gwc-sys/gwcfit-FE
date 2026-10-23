const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');

function harness({ trainer = false, pending = false, reducedMotion = false } = {}) {
  const calls = [];
  const source = path.resolve(__dirname, '../src/ui/web/layouts/PulseDashboardLayout.tsx');
  const module = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const native = Object.fromEntries(['Modal', 'Pressable', 'ScrollView', 'Text', 'TextInput', 'View'].map(name => [name, name]));
  native.StyleSheet = { absoluteFill: { position: 'absolute', inset: 0 } };
  const mockRequire = name => {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react-native') return native;
    if (name === 'react-native-reanimated') return { useReducedMotion: () => reducedMotion };
    if (name === '@expo/vector-icons') return { Ionicons: 'Icon' };
    if (name === 'expo-linear-gradient') return { LinearGradient: 'Gradient' };
    if (name.endsWith('/formatters')) return { initials: () => 'TU' };
    if (name.endsWith('/logoutConfirmation')) return { requestLogoutConfirmation: callback => calls.push(['confirmation', callback]) };
    if (name === '../components/Screen') return { Screen: 'Screen' };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: source })(mockRequire, module, module.exports);
  const styles = new Proxy({}, { get: (_, key) => String(key) });
  const props = {
    styles, isDesktop: false, isTrainer: trainer, isGymOwner: false, isPlatformAdmin: false,
    colors: {}, resolvedRoleLabel: trainer ? 'Trainer' : 'Gym Owner', sidebarItems: [],
    setAccountMenuOpen: value => calls.push(['open', value]), userName: 'Test User',
    MobileBrandButton: () => null, firstName: () => 'Test', accountMenuOpen: true,
    user: { email: 'test@example.invalid' }, navigation: { navigate: (...args) => calls.push(['navigate', ...args]) },
    OwnerAccountItem: item => module.exports.OwnerAccountItemView({ model: { kind: 'view1', props: item } }),
    toggleColorScheme: () => calls.push(['theme']), logout: { isPending: pending, mutate: () => calls.push(['logout']) },
  };
  function expand(element) {
    if (Array.isArray(element)) return element.flatMap(expand);
    if (!React.isValidElement(element)) return [];
    if (typeof element.type === 'function') return expand(element.type(element.props));
    return [element, ...expand(element.props.children)];
  }
  const tree = module.exports.PulseDashboardLayoutView({ model: { kind: 'view1', props } });
  const elements = expand(tree);
  const modal = elements.find(e => e.type === 'Modal');
  const item = label => elements.find(e => e.type === 'Pressable' && expand(e).some(child => child.type === 'Text' && child.props.children === label));
  return { calls, tree, elements, modal, item, expand };
}

test('web account menu has no nested buttons and dismissal is separate from its items', () => {
  const h = harness();
  function check(element, insideButton = false) {
    if (Array.isArray(element)) return element.forEach(child => check(child, insideButton));
    if (!React.isValidElement(element)) return;
    if (typeof element.type === 'function') return check(element.type(element.props), insideButton);
    const button = element.type === 'Pressable' && element.props.accessibilityRole === 'button';
    assert.ok(!(button && insideButton), 'HTML buttons must not contain other buttons');
    check(element.props.children, insideButton || button);
  }
  check(h.tree);
  const dismiss = h.elements.find(e => e.props.accessibilityLabel === 'Close account menu');
  assert.equal(h.expand(dismiss).length, 1);
  assert.equal(h.calls.length, 0);
  dismiss.props.onPress();
  assert.deepEqual(h.calls, [['open', false]]);
  h.modal.props.onRequestClose();
  assert.deepEqual(h.calls.at(-1), ['open', false]);
});

test('owner and trainer account items retain their exact destinations and close once', () => {
  for (const trainer of [false, true]) {
    for (const [label, route, params] of [
      ['My Profile', 'Profile'], ['Settings', trainer ? 'Profile' : 'Settings'],
      ['Notifications', 'Notifications'], ['Security', trainer ? 'Profile' : 'FeaturePlaceholder', trainer ? undefined : { title: 'Security' }],
    ]) {
      const h = harness({ trainer });
      h.item(label).props.onPress();
      assert.deepEqual(h.calls, [['open', false], ['navigate', route, ...(params ? [params] : [])]]);
    }
  }
});

test('theme stays open and logout retains confirmation and pending disabling', () => {
  const h = harness({ trainer: true });
  h.item('Theme: Light').props.onPress();
  assert.deepEqual(h.calls, [['theme']]);
  h.calls.length = 0;
  h.item('Log out').props.onPress();
  assert.equal(h.calls.length, 2);
  assert.deepEqual(h.calls[0], ['open', false]);
  assert.equal(h.calls[1][0], 'confirmation');
  h.calls[1][1]();
  assert.deepEqual(h.calls.at(-1), ['logout']);
  assert.equal(harness({ pending: true }).item('Logging out...').props.disabled, true);
});

test('web account modal respects reduced motion without disabling the preference', () => {
  assert.equal(harness({ reducedMotion: true }).modal.props.animationType, 'none');
  assert.equal(harness({ reducedMotion: false }).modal.props.animationType, 'fade');
});
