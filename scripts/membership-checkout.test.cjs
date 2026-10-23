const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(client = {}) {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/api/membershipCheckout.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: () => ({ apiClient: client }) });
  return module.exports;
}

test('UPI checkout encodes the recipient and name, uses INR and exact paise', () => {
  const { upiPaymentUri } = load();
  const uri = new URL(upiPaymentUri({ upi_id: 'gym@bank', payee_name: 'Gym & Fitness' }, 99950));
  assert.equal(uri.protocol, 'upi:');
  assert.equal(uri.searchParams.get('pa'), 'gym@bank');
  assert.equal(uri.searchParams.get('pn'), 'Gym & Fitness');
  assert.equal(uri.searchParams.get('cu'), 'INR');
  assert.equal(uri.searchParams.get('am'), '999.50');
  assert.equal(new URL(upiPaymentUri({ upi_id: 'gym@bank', payee_name: 'Gym' })).searchParams.has('am'), false);
});

test('checkout submits the selected plan and displayed quote without allowing a client-paid status', async () => {
  const calls = [];
  const { membershipCheckoutApi } = load({ post: async (url, body) => { calls.push({ url, body }); return { data: { status: 'pending', id: 'payment-1' } }; } });
  const payload = { plan_uuid: 'plan-1', method: 'manual_qr', quoted_amount_cents: 99900, quoted_currency: 'INR', transaction_reference: '123456789012' };
  const result = await membershipCheckoutApi.submit(payload);
  assert.equal(calls[0].url, '/membership-checkout/member');
  assert.equal(calls[0].body, payload);
  assert.equal('status' in calls[0].body, false);
  assert.equal(result.status, 'pending');
  await membershipCheckoutApi.check('payment-1');
  assert.equal(calls[1].url, '/membership-checkout/member/payment-1/check');
});

test('checkout errors propagate instead of reporting payment success', async () => {
  const failure = new Error('Plan price changed');
  const { membershipCheckoutApi } = load({ post: async () => { throw failure; } });
  await assert.rejects(membershipCheckoutApi.submit({ plan_uuid: 'plan-1', method: 'manual_qr', quoted_amount_cents: 99900, quoted_currency: 'INR' }), failure);
});

test('Google Pay, BHIM and PhonePe keep the exact recipient and amount', () => {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/upiApps.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports });
  const { upiApps, upiAppPaymentUrl } = module.exports;
  assert.deepEqual(Array.from(upiApps, app => app.name), ['Google Pay', 'BHIM', 'PhonePe']);
  const { upiPaymentUri } = load();
  const uri = upiPaymentUri({ upi_id: 'gym@bank', payee_name: 'Gym & Fitness' }, 199900);
  for (const app of upiApps) {
    const url = new URL(upiAppPaymentUrl(app, uri));
    assert.equal(url.protocol, app.iosScheme + ':');
    assert.equal(url.searchParams.get('pa'), 'gym@bank');
    assert.equal(url.searchParams.get('pn'), 'Gym & Fitness');
    assert.equal(url.searchParams.get('am'), '1999.00');
    assert.equal(url.searchParams.get('cu'), 'INR');
    assert.ok(app.androidPackage);
  }
  assert.throws(() => upiAppPaymentUrl(upiApps[0], 'https://example.com'), /Invalid UPI/);
});
