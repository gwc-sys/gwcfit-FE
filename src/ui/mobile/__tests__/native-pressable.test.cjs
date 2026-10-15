const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const React = require('react');
const ts = require('typescript');

const mobile = path.resolve(__dirname, '..');
const nativeMock = { Pressable: 'NativePressable', Platform: { OS: 'ios' }, StyleSheet: { flatten: value => Array.isArray(value) ? Object.assign({}, ...value.filter(Boolean).map(item => nativeMock.StyleSheet.flatten(item))) : value } };
const interop = path.dirname(require.resolve('react-native-css-interop/package.json'));
function compile(source, requireMock, globals = {}) {
  const module = { exports: {} };
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${js}\n})`, globals)(requireMock, module, module.exports);
  return module.exports;
}
const { Pressable } = compile(fs.readFileSync(path.join(mobile, 'components/NativePressable.tsx'), 'utf8'), request => request === 'react' ? React : nativeMock);

test('installed CSS interop reproduces the video failure by flattening a style callback', () => {
  // Exercise the actual installed inline-rule functions, not a guessed mock of
  // the behavior. Their object spread loses every property of the callback.
  const file = path.join(interop, 'src/runtime/native/native-interop.ts');
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const functions = source.statements.filter(node => ts.isFunctionDeclaration(node) && ['collectInlineRules', 'applyRules'].includes(node.name?.text)).map(node => node.getText(source)).join('\n');
  const { collectInlineRules, applyRules } = compile(functions + '\nmodule.exports = { collectInlineRules, applyRules };', () => {}, {
    StyleRuleSetSymbol: Symbol('rules'), getOpaqueStyles: target => [target],
    assignToTarget: (props, value) => { props.style = value; },
  });
  const callback = ({ pressed }) => [{ flexDirection: 'row', padding: 16, minHeight: 52 }, pressed && { opacity: 0.7 }];
  const normal = [];
  const state = { props: {}, config: { target: ['style'] } };
  collectInlineRules(state, {}, callback, {}, normal, []);
  applyRules(state, {}, normal, []);
  assert.equal(Object.keys(state.props.style).length, 0);
  const element = Pressable({ style: callback });
  assert.equal(typeof element.props.style, "function");
  const styles = nativeMock.StyleSheet.flatten(element.props.style({ pressed: true }));
  assert.equal(styles.flexDirection, 'row');
  assert.equal(styles.padding, 16);
  assert.equal(styles.opacity, 0.7);
});

test('the real NativeWind JSX wrapper cannot intercept the native Pressable boundary', () => {
  const registrations = new Map([['NativePressable', 'CssInteropPressable']]);
  const source = fs.readFileSync(path.join(interop, 'src/runtime/wrap-jsx.ts'), 'utf8');
  const { default: wrapJSX } = compile(source, request => request.endsWith('/api') ? { interopComponents: registrations } : { maybeHijackSafeAreaProvider: type => type }, { process: { env: { NODE_ENV: 'test' } } });
  const jsx = wrapJSX(React.createElement);
  const style = ({ pressed }) => ({ minHeight: 44, opacity: pressed ? 0.6 : 1 });
  assert.equal(jsx('NativePressable', { style }).type, 'CssInteropPressable');
  const wrapped = jsx(Pressable, { style });
  assert.equal(wrapped.type, Pressable);
  const native = wrapped.type(wrapped.props);
  assert.equal(native.type, 'NativePressable');
  assert.equal(typeof native.props.style, "function");
});

test('native touch boundary preserves refs, callbacks, children and disabled accessibility', () => {
  const ref = { current: null };
  const onPress = () => {};
  const onLongPress = () => {};
  const onPressIn = () => {};
  const child = React.createElement('Text', null, 'Save');
  const props = { ref, onPress, onLongPress, onPressIn, disabled: true, accessibilityState: { disabled: true, busy: true }, children: child };
  const element = Pressable(props);
  for (const key of Object.keys(props)) assert.equal(element.props[key], props[key], key);
});

test('native presentation files cannot silently reintroduce intercepted Pressables', () => {
  function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
  for (const file of walk(mobile).filter(file => file.endsWith('.tsx') && !file.endsWith('NativePressable.tsx'))) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== 'react-native') continue;
      const elements = node.importClause?.namedBindings?.elements ?? [];
      assert.ok(!elements.some(element => (element.propertyName ?? element.name).text === 'Pressable'), path.relative(mobile, file));
    }
  }
});


test('Metro Babel development and production transforms preserve native press styles', () => {
  const babel = require('@babel/core');
  const file = path.join(mobile, 'components/NativePressable.tsx');
  const registrations = new Map([['NativePressable', 'CssInteropPressable']]);
  const { default: wrapJSX } = compile(fs.readFileSync(path.join(interop, 'src/runtime/wrap-jsx.ts'), 'utf8'), request => request.endsWith('/api') ? { interopComponents: registrations } : { maybeHijackSafeAreaProvider: type => type }, { process: { env: { NODE_ENV: 'test' } } });
  for (const envName of ['development', 'production']) {
    const { code } = babel.transformFileSync(file, { cwd: path.resolve(mobile, "../../.."), configFile: path.resolve(mobile, "../../../babel.config.js"), envName, caller: { name: 'metro', platform: 'ios', supportsStaticESM: false } });
    const module = { exports: {} };
    const requireMock = request => request === 'react' ? React : request === 'react-native' ? nativeMock : request === 'react-native-css-interop' ? { createInteropElement: wrapJSX(React.createElement) } : require(request);
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`)(requireMock, module, module.exports);
    const style = ({ pressed }) => ({ flexDirection: 'row', minHeight: 52, padding: 16, opacity: pressed ? 0.6 : 1 });
    const element = module.exports.Pressable({ style, accessibilityLabel: 'Save member' });
    assert.equal(element.type, 'NativePressable', envName);
    assert.equal(typeof element.props.style, "function", envName);
    assert.equal(element.props.cssInterop, undefined, 'interop opt-out must be consumed before the native component');
    assert.equal(nativeMock.StyleSheet.flatten(element.props.style({ pressed: true })).opacity, 0.6);
    assert.equal(element.props.accessibilityLabel, 'Save member');
  }
});


test('native targets keep small icons tappable and allow labels to grow', () => {
  const element = Pressable({ style: { width: 24, height: 24 } });
  const style = nativeMock.StyleSheet.flatten(element.props.style);
  assert.equal(style.minWidth, 44);
  assert.equal(style.minHeight, 44);
  assert.equal(style.height, undefined);
  const large = nativeMock.StyleSheet.flatten(Pressable({ style: { minHeight: 80, height: 60 } }).props.style);
  assert.equal(large.minHeight, 80);
});
