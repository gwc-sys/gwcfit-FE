const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/utils/appAlert.ts');
const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function load({ platform = 'web', confirm, alert, nativeAlert = () => {} } = {}) {
  const context = { exports: {}, confirm, alert, require: () => ({ Platform: { OS: platform }, Alert: { alert: nativeAlert } }) };
  vm.runInNewContext(outputText, context, { filename });
  return context.exports.showAlert;
}

test('web deletion only executes after explicit confirmation', () => {
  let deleted = 0;
  const showAlert = load({ confirm: (message) => { assert.equal(message, 'Delete member\n\nAlex'); return true; } });
  showAlert('Delete member', 'Alex', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleted++ }]);
  assert.equal(deleted, 1);
});

test('web cancellation never executes the action and invokes cancellation callback', () => {
  let deleted = 0;
  let cancelled = 0;
  load({ confirm: () => false })('Delete', undefined, [{ text: 'Delete', style: 'destructive', onPress: () => deleted++ }, { text: 'Cancel', style: 'cancel', onPress: () => cancelled++ }]);
  assert.equal(deleted, 0);
  assert.equal(cancelled, 1);
});

test('missing browser dialogs do not authorize destructive actions', () => {
  let deleted = 0;
  load()('Delete', undefined, [{ text: 'Delete', style: 'destructive', onPress: () => deleted++ }]);
  assert.equal(deleted, 0);
});

test('web workout completion follows acknowledgement with its navigation callback', () => {
  const events = [];
  load({ alert: (message) => events.push(message) })('Workout complete', 'Saved.', [{ text: 'View plan', onPress: () => events.push('navigate') }]);
  assert.deepEqual(events, ['Workout complete\n\nSaved.', 'navigate']);
});

test('non-destructive actions with a cancel option still require confirmation', () => {
  let saved = 0;
  load({ confirm: () => false })('Finish workout?', undefined, [{ text: 'Not yet', style: 'cancel' }, { text: 'Finish', onPress: () => saved++ }]);
  assert.equal(saved, 0);
});

test('native dialogs retain original buttons and callbacks', () => {
  const buttons = [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress() {} }];
  let received;
  load({ platform: 'ios', nativeAlert: (...args) => { received = args; } })('Delete', 'Alex', buttons);
  assert.equal(received[0], 'Delete');
  assert.equal(received[1], 'Alex');
  assert.equal(received[2], buttons);
});
