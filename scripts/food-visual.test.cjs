const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(relative) {
  const file = path.resolve(__dirname, relative);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'exports', output)(name => load(path.relative(__dirname, path.resolve(path.dirname(file), name + '.ts'))), exports);
  return exports;
}
const { foodVisual } = load('../src/utils/foodVisual.ts');
const { foodDisplayCatalog } = load('../src/utils/foodDisplayCatalog.ts');
const { foodNutritionCatalog } = load('../src/data/foodNutritionCatalog.ts');
test('every distinct food has a distinct visual, with valid SVG or an exact emoji', () => {
  const seen = new Map();
  for (const food of foodDisplayCatalog(foodNutritionCatalog)) {
    const visual = foodVisual(food.name, food.mainCategory, food.subcategory);
    const signature = visual.kind === 'emoji' ? visual.emoji : visual.svg;
    assert.ok(signature && !signature.includes('??'), food.name);
    assert.ok(!seen.has(signature), `${food.name} repeats ${seen.get(signature)}`);
    seen.set(signature, food.name);
    if (visual.kind === 'illustration') {
      assert.ok(visual.svg.startsWith('<svg '), food.name);
      assert.ok(visual.svg.endsWith('</svg>'), food.name);
    }
  }
  assert.equal(seen.size, 226);
});
test('foods in the screenshots never use another ingredient emoji', () => {
  for (const name of ['Fig', 'Guava', 'Jackfruit', 'Papaya', 'Dragon Fruit', 'Dates', 'Cauliflower', 'Almonds', 'Chia Seeds', 'Bottle Gourd', 'Asparagus', 'Black Rice', 'Blue Cheese', 'Goat Milk', 'Chicken Breast']) {
    assert.equal(foodVisual(name).kind, 'illustration', name);
  }
  assert.notDeepEqual(foodVisual('Lemon'), foodVisual('Lime'));
  assert.notDeepEqual(foodVisual('Mushroom'), foodVisual('Broccoli'));
});
test('display duplicates merge without modifying catalog IDs, saved foods or filter categories', () => {
  const before = JSON.stringify(foodNutritionCatalog);
  const foods = foodDisplayCatalog(foodNutritionCatalog);
  assert.equal(foods.filter(food => food.name === 'Cabbage').length, 1);
  assert.equal(foods.filter(food => food.name === 'Corn').length, 1);
  assert.ok(foods.find(food => food.name === 'Corn').categories.includes('Grains'));
  assert.ok(foods.find(food => food.name === 'Corn').categories.includes('Vegetables'));
  assert.equal(foods.find(food => food.name === 'Cabbage').id, 'F0043');
  assert.equal(JSON.stringify(foodNutritionCatalog), before);
});
if (process.env.FOOD_VISUAL_PREVIEW) {
  const out = path.resolve(__dirname, '../../output/food-visual-review.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(foodDisplayCatalog(foodNutritionCatalog).map(food => ({ name: food.name, ...foodVisual(food.name, food.mainCategory, food.subcategory) }))));
}
