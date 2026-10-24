const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const React = require('react');
const ts = require('typescript');

function renderer(platform) {
  const file = path.resolve(__dirname, `../src/ui/${platform}/${platform === 'web' ? 'pages' : 'screens'}/saas/InvitationManagementScreen.tsx`);
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stub = new Proxy({}, { get: (_, name) => name });
  const requireMock = name => name === 'react/jsx-runtime' ? require(name) : name === '@expo/vector-icons' ? { Ionicons: 'Icon' } : name.includes('controlMetrics') ? { controlMetrics: { minimumTouchSize: 44 } } : name.includes('theme/theme') ? { controlMetrics: { minimumTouchSize: 44 } } : stub;
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`, { filename: file })(requireMock, module, module.exports);
  return module.exports.InvitationManagementScreenView;
}

function nodes(value) {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  if (value.type === 'Modal' && !value.props.visible) return [];
  return [value, ...nodes(value.props.children)];
}
function text(value) {
  if (Array.isArray(value)) return value.map(text).join(' ');
  if (React.isValidElement(value)) return text(value.props.children);
  return typeof value === 'string' ? value : '';
}

for (const platform of ['web', 'mobile']) {
  test(`${platform} enquiry opens every submitted field and can close without inviting`, () => {
    const View = renderer(platform);
    const enquiry = { id: 'request-1', gym_name: 'Test gym', full_name: 'Test owner', email: 'owner@example.com', phone: '+919876543210', active_members_range: '100-300', interested_plan_name: 'Launch', status: 'new', source: 'owner_site', notes: 'Call in the afternoon', created_at: '2026-10-24T06:00:00Z', updated_at: '2026-10-24T07:00:00Z', invitation_id: null, gym_id: null };
    let selected = null;
    let invited = false;
    const props = { styles: new Proxy({}, { get: () => ({}) }), colors: {}, section: 'enquiry', setSection: () => {}, user: { role: 'super_admin' }, registrations: { data: [enquiry] }, newEnquiries: [enquiry], inviteRegistration: { mutate: () => { invited = true; } }, historyInputRef: { current: null }, navigation: {}, selectedEnquiry: null, setSelectedEnquiry: value => { selected = value; } };
    let tree = nodes(View({ model: { kind: 'view1', props } }));
    tree.find(node => node.props.accessibilityLabel === 'View full enquiry from Test gym').props.onPress();
    assert.equal(selected, enquiry);
    tree = nodes(View({ model: { kind: 'view1', props: { ...props, selectedEnquiry: selected } } }));
    const sheet = tree.find(node => node.props.accessibilityViewIsModal);
    const content = text(sheet);
    for (const field of ['Test gym', 'Test owner', 'owner@example.com', '+919876543210', '100-300', 'Launch', 'owner_site', 'Call in the afternoon', 'request-1']) assert.ok(content.includes(field), field);
    tree.find(node => node.props.accessibilityLabel === 'Close enquiry details').props.onPress();
    assert.equal(selected, null);
    assert.equal(invited, false);
  });
}
