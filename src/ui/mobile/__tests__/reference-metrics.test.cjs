const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const now = new Date(2026, 9, 15, 12);
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
  static now() { return now.getTime(); }
}
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const requireLocal = request => load(path.resolve(path.dirname(file), request + '.ts'));
  vm.runInNewContext(`(function(require,module,exports){${source}\n})`, { Date: FixedDate }, { filename: file })(requireLocal, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const metrics = load(path.resolve(__dirname, '../data/referenceMetrics.ts'));

test('revenue ranges preserve cents, exclude non-paid/future/invalid records, and handle period boundaries', () => {
  const start = metrics.rangeStart('7D', now);
  const previousStart = new Date(start.getTime() - (now - start));
  const payment = (paid_at, amount_cents, status = 'paid') => ({ paid_at: typeof paid_at === 'string' ? paid_at : paid_at.toISOString(), amount_cents, status });
  const summary = metrics.summarizeRevenue([
    payment(start, 12345), payment(now, 555), payment(previousStart, 10000),
    payment(now, 9999, 'pending'), payment(now, 9999, 'refunded'),
    payment(new Date(now.getTime() + 1000), 9999), payment('bad date', 9999),
  ], '7D', now);
  assert.equal(summary.total, 12900);
  assert.equal(summary.count, 2);
  assert.equal(summary.values.reduce((sum, value) => sum + value, 0), 12900);
  assert.equal(summary.values[0], 12345);
  assert.equal(summary.values[6], 555);
  assert.ok(Math.abs(summary.change - 29) < 1e-9);
});

test('month and year ranges clamp month ends and leap days', () => {
  const quarter = metrics.rangeStart('3M', new Date(2026, 4, 31, 12));
  assert.equal(quarter.getMonth(), 1);
  assert.equal(quarter.getDate(), 28);
  const year = metrics.rangeStart('1Y', new Date(2024, 1, 29, 12));
  assert.equal(year.getFullYear(), 2023);
  assert.equal(year.getMonth(), 1);
  assert.equal(year.getDate(), 28);
});

test('missing comparison data yields no invented growth percentage', () => {
  assert.equal(metrics.percentageChange(10, 0), null);
  assert.equal(metrics.summarizeRevenue([], '30D', now).change, null);
  assert.equal(metrics.summarizeMembers([], metrics.rangeStart('30D', now), now).growth, null);
});

test('expiring uses the existing seven-day rule and excludes invalid, expired and undated memberships', () => {
  const end = days => { const date = new Date(now); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
  for (const days of [0, 1, 7]) assert.equal(metrics.isExpiringMember({ membership_ends_at: end(days) }), true);
  for (const date of [null, 'bad date', '2026-02-30', end(-1), end(8)]) assert.equal(metrics.isExpiringMember({ membership_ends_at: date }), false);
});

test('member growth uses join dates and keeps current and previous periods separate', () => {
  const start = metrics.rangeStart('30D', now);
  const member = joined_at => ({ joined_at: joined_at.toISOString(), membership_ends_at: null });
  const summary = metrics.summarizeMembers([member(start), member(now), member(new Date(start.getTime() - 86400000)), member(new Date(now.getTime() + 86400000))], start, now);
  assert.equal(summary.newMembers, 2);
  assert.equal(summary.newMemberChange, 100);
  assert.equal(summary.growth, 200);
});

test('relative timestamps handle minutes, singular hours, days and invalid dates', () => {
  const ago = minutes => new Date(now.getTime() - minutes * 60000).toISOString();
  assert.equal(metrics.relativeTime(ago(0), now), 'Just now');
  assert.equal(metrics.relativeTime(ago(2), now), '2 minutes ago');
  assert.equal(metrics.relativeTime(ago(60), now), '1 hour ago');
  assert.equal(metrics.relativeTime(ago(1440), now), '1 day ago');
  assert.equal(metrics.relativeTime('bad date', now), 'Date unavailable');
});
