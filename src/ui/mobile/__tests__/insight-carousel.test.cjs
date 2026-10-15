const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

for (const reduced of [false, true]) test(`insight rotation respects focus, background and Reduce Motion (${reduced})`, () => {
  let focus, tick, cleared = false, stateIndex = 0;
  const scrolls = [];
  const app = { currentState: "active" };
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/InsightCarousel.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const mockRequire = name => {
    if (name === "react") return { ...React, useCallback: fn => fn, useEffect: () => {}, useRef: value => ({ current: value === null ? { scrollTo: options => scrolls.push(options) } : value }), useState: initial => [stateIndex++ === 0 ? 320 : initial, () => {}] };
    if (name === "@react-navigation/native") return { useFocusEffect: fn => { focus = fn; } };
    if (name === "react-native-reanimated") return { useReducedMotion: () => reduced };
    if (name === "react-native") return { AppState: app, ScrollView: "ScrollView", Text: "Text", View: "View" };
    if (name.includes("AppThemeProvider")) return { useAppTheme: () => ({ colors: {} }) };
    if (name.includes("NativePressable")) return { Pressable: "Pressable" };
    return require(name);
  };
  new Function("require", "module", "exports", "setInterval", "clearInterval", output)(mockRequire, module, module.exports, (fn, delay) => { assert.equal(delay, 5000); tick = fn; return 1; }, () => { cleared = true; });
  module.exports.InsightCarousel({ label: "Summary", children: [React.createElement("View", { key: 1 }), React.createElement("View", { key: 2 })] });
  const cleanup = focus();
  if (reduced) { assert.equal(tick, undefined); return; }
  tick(); assert.equal(scrolls.at(-1).x, 320);
  app.currentState = "background";
  tick(); assert.equal(scrolls.length, 1);
  app.currentState = "active";
  tick(); assert.equal(scrolls.at(-1).x, 0);
  cleanup(); assert.equal(cleared, true);
});
