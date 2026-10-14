const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');

const root = path.resolve(__dirname, '../src');
function resolveSource(owner, request, platform) {
  const base = path.resolve(path.dirname(owner), request);
  const suffix = platform === 'web' ? '.web' : '.native';
  return [base + suffix + '.tsx', base + suffix + '.ts', base + '.tsx', base + '.ts',
    path.join(base, 'index' + suffix + '.tsx'), path.join(base, 'index.tsx'), base]
    .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
}

function harness(platform, role, { width = 1280, authenticated = true, hydrated = true, permissions = [] } = {}) {
  const cache = new Map();
  let hydrationCalls = 0;
  const state = {
    user: role ? { id: 'user-1', role, full_name: 'Test User', permissions } : null,
    isAuthenticated: authenticated, hasHydrated: hydrated, isHydrating: !hydrated,
    hydrateSession: async () => { hydrationCalls++; },
    hasPermission: permission => permissions.includes(permission),
  };
  const platformIO = {
    Platform: { OS: platform === 'web' ? 'web' : 'ios', select: options => options.ios ?? options.default },
    StyleSheet: { create: styles => styles, hairlineWidth: 1 },
    useWindowDimensions: () => ({ width, height: 900 }), View: 'View', Text: 'Text', Pressable: 'Pressable', Image: 'Image',
  };
  const uiStub = new Proxy({}, { get: (_object, name) => name === '__esModule' ? true : function Stub(props) { return React.createElement(String(name), props); } });
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} }; cache.set(file, module.exports);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const mockRequire = request => {
      if (request === 'react') return { ...React, useMemo: fn => fn(), useEffect: fn => fn(), useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] };
      if (request === 'react/jsx-runtime') return require(request);
      if (request === 'react-native') return platformIO;
      if (request === '@expo/vector-icons') return { Ionicons: 'Icon' };
      if (request === 'react-hook-form') return { Controller: ({ name, render }) => render({ field: { name, value: '', onBlur: () => {}, onChange: () => {}, ref: () => {} } }) };
      if (request === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({ top: 20, bottom: 24, left: 0, right: 0 }) };
      if (request === '@react-navigation/native') return { NavigationContainer: 'NavigationContainer', DefaultTheme: { colors: {} }, DarkTheme: { colors: {} } };
      if (request === '@react-navigation/native-stack') return { createNativeStackNavigator: () => ({ Navigator: 'StackNavigator', Screen: 'StackScreen' }) };
      if (request === '@react-navigation/bottom-tabs') return { BottomTabBar: 'BottomTabBar', createBottomTabNavigator: () => ({ Navigator: 'TabNavigator', Screen: 'TabScreen' }) };
      if (!request.startsWith('.')) return require(request);
      const target = resolveSource(file, request, platform);
      assert.ok(target, `Cannot resolve ${request} from ${file}`);
      const rel = path.relative(root, target).replaceAll('\\', '/');
      if (rel === 'store/useAuthStore.ts') return { useAuthStore: selector => selector(state) };
      if (rel === 'data/media.ts') return { images: { gymHero: 1 } };
      if (rel === 'services/api/client.ts') return { getApiErrorMessage: error => error.message };
      if (rel.startsWith('services/') || rel.startsWith('hooks/')) return uiStub;
      if (rel === 'theme/AppThemeProvider.tsx') {
        const tokens = load(path.join(root, `ui/${platform === 'web' ? 'web' : 'mobile'}/theme/theme.ts`));
        return { useAppTheme: () => ({ colors: tokens.getThemeColors('light'), colorScheme: 'light' }) };
      }
      if (rel.startsWith('screens/') || rel.startsWith('components/') || /^ui\/[^/]+\/components\//.test(rel)) return uiStub;
      return load(target);
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(mockRequire, module, module.exports);
    cache.set(file, module.exports); return module.exports;
  }
  return { load, get hydrationCalls() { return hydrationCalls; } };
}

function expand(element) {
  if (Array.isArray(element)) return element.flatMap(expand);
  if (!React.isValidElement(element)) return [];
  if (typeof element.type === 'function') return expand(element.type(element.props));
  return [element, ...expand(element.props.children)];
}

test('auth, loading and every role keep the same stack routes across native and web', () => {
  const authRoutes = ['Login', 'SignUp', 'Onboarding', 'AccountRecovery'];
  for (const role of [null, 'member', 'gym_owner', 'super_admin', 'sub_admin', 'trainer', 'receptionist']) {
    const routes = [];
    for (const platform of ['native', 'web']) {
      const h = harness(platform, role, { authenticated: Boolean(role) });
      const module = h.load(path.join(root, 'navigation/RootNavigator.tsx'));
      const elements = expand(module.RootNavigator());
      routes.push(elements.filter(element => element.type === 'StackScreen').map(element => element.props.name));
      if (!role) assert.deepEqual(routes.at(-1), authRoutes);
      else {
        assert.ok(routes.at(-1).includes('AppTabs'));
        assert.ok(routes.at(-1).includes('AccessDenied'));
        if (role === 'member') {
          assert.ok(routes.at(-1).includes('MemberWorkoutSession'));
          assert.ok(!routes.at(-1).includes('ManageGyms'));
        } else assert.ok(routes.at(-1).includes('EditMember'));
      }
    }
    assert.deepEqual(routes[0], routes[1], role ?? 'guest');
  }
  for (const platform of ['native', 'web']) {
    const h = harness(platform, null, { authenticated: false, hydrated: false });
    const module = h.load(path.join(root, 'navigation/RootNavigator.tsx'));
    assert.deepEqual(expand(module.RootNavigator()).filter(e => e.type === 'StackScreen').map(e => e.props.name), ['Splash']);
    assert.equal(h.hydrationCalls, 1);
  }
});

test('both sign-in designs preserve submit, recovery, registration and pending behavior', () => {
  for (const platform of ['native', 'web']) {
    const h = harness(platform, null, { authenticated: false });
    const module = h.load(path.join(root, `ui/${platform === 'web' ? 'web/pages' : 'mobile/screens'}/auth/LoginScreen.tsx`));
    const navigations = []; let submissions = 0, prevented = 0;
    const model = { kind: 'view1', props: {
      navigation: { navigate: route => navigations.push(route), goBack: () => {} }, canGoBack: false,
      control: {}, errors: {}, passwordVisible: false, setPasswordVisible: () => {},
      colors: { primary: '#007aff', primarySoft: '#eaf2ff', surface: '#fff', border: '#ddd', ink: '#111', muted: '#666' },
      loginMutation: { isPending: true, error: null }, submit: () => { submissions++; },
    } };
    const elements = expand(module.LoginScreenView({ model }));
    const content = element => {
      const children = element?.props?.children;
      return (Array.isArray(children) ? children : [children]).map(child => typeof child === 'string' ? child : child?.props ? content(child) : '').join('');
    };
    for (const title of ['Forgot password?', 'Create account']) {
      const button = elements.find(e => ['button', 'Pressable'].includes(e.type) && content(e).includes(title));
      assert.ok(button, `${platform}: ${title}`);
      (button.props.onClick ?? button.props.onPress)();
    }
    assert.deepEqual(navigations, ['AccountRecovery', 'SignUp']);
    if (platform === 'web') {
      const form = elements.find(e => e.type === 'form');
      assert.equal(form.props.noValidate, true); // Existing Zod validation remains authoritative.
      form.props.onSubmit({ preventDefault: () => { prevented++; } });
      assert.equal(prevented, 1);
      assert.equal(elements.find(e => e.type === 'button' && e.props.type === 'submit').props.disabled, true);
      assert.deepEqual(elements.filter(e => e.type === 'input').map(e => e.props.name), ['email', 'password']);
    } else {
      const button = elements.find(e => e.type === 'PrimaryButton');
      assert.equal(button.props.loading, true); button.props.onPress();
      assert.deepEqual(elements.filter(e => e.type === 'FormTextField').map(e => e.props.label), ['Email', 'Password']);
    }
    assert.equal(submissions, 1);
  }
});

test('member payment, workout and reward summaries retain their existing arithmetic', () => {
  const h = harness('native', 'member');
  const module = h.load(path.join(root, 'screens/member/MemberFeatureScreens.tsx'));
  assert.deepEqual(module.getMemberPaymentTotals([{ paid_amount_cents: 1055, due_amount_cents: 50 }, { paid_amount_cents: 20, due_amount_cents: 75 }]), { paid: 1075, due: 125 });
  assert.deepEqual(module.getMemberPaymentTotals([]), { paid: 0, due: 0 });
  assert.equal(module.getCompletedWorkoutCount([{ completed_workouts: 2 }, { completed_workouts: 3 }]), 5);
  assert.equal(module.getRewardPoints([{ points: 10 }, { points: 15 }]), 25);
  assert.equal(module.getRewardBadgeCount([{ badge: 'Consistency' }, { badge: null }, { badge: '' }]), 1);
});

test('native tablet tabs remain visible while desktop web uses its sidebar', () => {
  for (const role of ['gym_owner', 'super_admin', 'sub_admin', 'trainer']) {
    const tabNames = [];
    for (const platform of ['native', 'web']) {
      const h = harness(platform, role, { width: 1280 });
      const controller = h.load(path.join(root, 'navigation/RootNavigator.tsx'));
      const ui = h.load(path.join(root, `ui/${platform === 'web' ? 'web' : 'mobile'}/navigation/RootNavigator.tsx`));
      const elements = expand(ui.MainTabsView({ model: controller.useMainTabsPresentation() }));
      tabNames.push(elements.filter(e => e.type === 'TabScreen').map(e => e.props.name));
      const nav = elements.find(e => e.type === 'TabNavigator');
      const options = nav.props.screenOptions({ route: { name: 'Dashboard' } });
      assert.equal(options.tabBarStyle.display === 'none', platform === 'web');
    }
    assert.deepEqual(tabNames[0], tabNames[1], role);
  }
});

test('platform resolution includes only the intended UI tree and UI files contain no server query implementations', () => {
  for (const platform of ['native', 'web']) {
    const seen = new Set();
    function walk(file) {
      if (seen.has(file) || !/\.(tsx?|jsx)$/.test(file)) return;
      seen.add(file);
      const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      for (const statement of sf.statements) {
        if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
        if (statement.isTypeOnly || statement.importClause?.isTypeOnly || !statement.moduleSpecifier) continue;
        const request = statement.moduleSpecifier.text;
        if (!request.startsWith('.')) continue;
        const next = resolveSource(file, request, platform); if (next) walk(next);
      }
    }
    walk(path.resolve(root, '../App.tsx'));
    const paths = [...seen].map(file => path.relative(root, file).replaceAll('\\', '/'));
    assert.ok(paths.some(file => file.startsWith(`ui/${platform === 'web' ? 'web' : 'mobile'}/`)));
    assert.ok(!paths.some(file => file.startsWith(`ui/${platform === 'web' ? 'mobile' : 'web'}/`)), paths.filter(file => file.startsWith('ui/')).join('\n'));
  }
  for (const rel of fs.readdirSync(path.join(root, 'ui'), { recursive: true }).filter(file => /\.tsx?$/.test(file))) {
    const file = path.join(root, 'ui', rel);
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function inspect(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) assert.ok(!['useQuery', 'useMutation', 'useInfiniteQuery', 'useCrudResource'].includes(node.expression.text), `Functional query duplicated in ${rel}`);
      ts.forEachChild(node, inspect);
    }
    inspect(sf);
  }
});
