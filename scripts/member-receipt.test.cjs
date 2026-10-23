const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleStub = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/memberReceipt.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(code, { exports: moduleStub.exports, module: moduleStub });
const { memberReceiptHtml, receiptAmount, receiptRows } = moduleStub.exports;
const receipt = { receipt_number: 'RCP-123', payment_uuid: '123', gym_name: 'Gym & Fitness', member_name: '<script>bad()</script>', member_code: 'MBR-123', plan_name: 'Standard Plan', amount_cents: 199950, currency: 'INR', paid_at: '2026-10-20T10:00:00Z', payment_method: 'manual_qr', transaction_reference: '123456789012', start_date: '2026-10-20', expiry_date: '2027-01-17' };

test('receipt PDF HTML uses exact amount and escapes member and gym text', () => {
  const html = memberReceiptHtml(receipt);
  assert.equal(receiptAmount(receipt), 'INR 1999.50');
  assert.match(html, /INR 1999\.50/);
  assert.match(html, /Gym &amp; Fitness/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /123456789012/);
  assert.match(html, /2027-01-17/);
});

test('receipt keeps server receipt number and falls back to payment ID without a UTR', () => {
  const rows = receiptRows({ ...receipt, transaction_reference: null });
  assert.equal(rows.find(([name]) => name === 'Receipt number')[1], 'RCP-123');
  assert.equal(rows.find(([name]) => name === 'Transaction reference')[1], '123');
});
