const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/utils/foodEmoji.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const exported = {};
new Function('exports', output)(exported);

test('only exact food emoji are returned, with a neutral fallback for unsupported foods', () => {
  assert.equal(exported.foodEmoji('Peanuts'), String.fromCodePoint(0x1F95C));
  assert.equal(exported.foodEmoji('Apple'), String.fromCodePoint(0x1F34E));
  for (const name of ['Almonds', 'Fig', 'Cauliflower', 'Guava', 'Jackfruit', 'Dragon Fruit']) {
    assert.equal(exported.exactFoodEmoji(name), undefined, name);
    assert.ok(!exported.foodEmoji(name).includes('?'), name);
  }
});
test('exact matches preserve emoji through encoding and normalize case', () => {
  for (const name of ['Apple', 'Eggplant', 'Peach', 'Peanuts', 'Coconut', 'Pineapple', 'Sweet Potato', 'Potato', 'Strawberry', 'Blueberry', 'Lemon', 'Lime']) {
    assert.ok(exported.exactFoodEmoji(name), name);
    assert.equal(exported.exactFoodEmoji(name), exported.exactFoodEmoji(`  ${name.toUpperCase()} `));
  }
  assert.notEqual(exported.foodEmoji('Lemon'), exported.foodEmoji('Lime'));
});
