const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/utils/formatters.ts');
const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const sourceModule = { exports: {} };
vm.runInThisContext(`(function(exports){${outputText}\n})`, { filename })(sourceModule.exports);
const { formatCurrency, formatDate, getMembershipState } = sourceModule.exports;

test('payment amounts retain paise and cents without adding decimals to whole amounts', () => {
  assert.equal(formatCurrency(1050), '₹10.5');
  assert.equal(formatCurrency(1055), '₹10.55');
  assert.equal(formatCurrency(1000), '₹10');
  assert.equal(formatCurrency(1055, 'USD'), '$10.55');
  assert.equal(formatCurrency(1055, 'rs.'), '₹10.55');
});

test('calendar dates and membership expiry stay on the correct day across time zones', () => {
  const previousTZ = process.env.TZ;
  try {
    for (const timeZone of ['Asia/Kolkata', 'America/Los_Angeles', 'UTC']) {
      process.env.TZ = timeZone;
      assert.equal(formatDate('2026-10-11'), 'Oct 11, 2026', timeZone);
      const today = new Date();
      const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      assert.equal(getMembershipState(dateKey(today)).label, '0 days left', timeZone);
      assert.equal(getMembershipState(dateKey(tomorrow)).label, '1 days left', timeZone);
      assert.equal(getMembershipState(dateKey(yesterday)).label, 'Expired', timeZone);
    }
  } finally {
    if (previousTZ === undefined) delete process.env.TZ;
    else process.env.TZ = previousTZ;
  }
});

test('impossible calendar dates require review instead of silently rolling forward', () => {
  assert.equal(getMembershipState('2026-02-30').label, 'Review date');
});
