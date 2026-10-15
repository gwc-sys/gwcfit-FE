const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

test("calendar resets on screen focus and app resume, then removes its listener", () => {
  let focus, listener, removed = false;
  const selections = [];
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/WeekCalendar.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const mockRequire = name => {
    if (name === "react") return { useCallback: fn => fn, useEffect: () => {}, useRef: value => ({ current: value }), useState: initial => [typeof initial === "function" ? initial() : initial, () => {}] };
    if (name === "@react-navigation/native") return { useFocusEffect: fn => { focus = fn; } };
    if (name === "react-native") return { View: "View", Text: "Text", ScrollView: "ScrollView", StyleSheet: { create: s => s }, AppState: { addEventListener: (_, fn) => { listener = fn; return { remove: () => { removed = true; } }; } } };
    if (name.includes("AppThemeProvider")) return { useAppTheme: () => ({ colors: {} }) };
    if (name.includes("NativePressable")) return { Pressable: "Pressable" };
    return require(name);
  };
  new Function("require", "module", "exports", output)(mockRequire, module, module.exports);
  module.exports.WeekCalendar({ selectedDate: new Date(2000, 0, 1), onSelect: date => selections.push(date) });
  const cleanup = focus();
  assert.equal(selections.length, 1);
  assert.equal(selections[0].toDateString(), new Date().toDateString());
  listener("background");
  assert.equal(selections.length, 1);
  listener("active");
  assert.equal(selections.length, 2);
  assert.equal(selections[1].toDateString(), new Date().toDateString());
  cleanup();
  assert.equal(removed, true);
  focus();
  assert.equal(selections.length, 3);
});
