const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const compile = file => ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
const settle = async () => { for(let i=0;i<5;i++) await new Promise(r => setImmediate(r)); };
function syncHarness(store = new Map()) {
  let failureStatus, offline = true, cursor = 0, intervals = [], calls = [], state = [], effects = [], pending = [], refs = [];
  const mod = { exports: {} };
  const auth = f => f({ user: { id: 'member-a' } }); auth.getState = () => ({ user: { id: 'member-a' } });
  vm.runInNewContext(compile('hooks/useActivitySync.ts'), { module: mod, exports: mod.exports, setInterval: cb => { intervals.push(cb); return cb; }, clearInterval: cb => { intervals = intervals.filter(x=>x!==cb); }, require(name) {
    if(name === 'react') return {
      useRef: value => { const i = cursor++; return refs[i] ??= { current: value }; },
      useState: value => { const i = cursor++; if(!(i in state)) state[i] = value; return [state[i], v => { state[i] = v; }]; },
      useEffect: (fn,deps) => { const i = cursor++; if (!effects[i] || deps.some((d,j)=>!Object.is(d,effects[i].deps[j]))) pending.push(()=> { effects[i]?.cleanup?.(); effects[i] = { deps, cleanup: fn() }; }); }
    };
    if(name === 'react-native') return { Platform: { OS:'android' }, AppState: { currentState:'active', addEventListener: () => ({remove(){}}) } };
    if(name === 'expo-secure-store') return { getItemAsync: async key => store.get(key), setItemAsync: async (key,value) => { store.set(key,value); } };
    if(name.includes('react-query')) return { useQueryClient: () => queryClient };
    if(name.includes('useAuthStore')) return { useAuthStore: auth };
    if(name.includes('api/client')) return { getApiStatus: e => e.status, getApiErrorMessage: e => e.message };
    if(name.includes('api/member')) return { memberApi: { syncActivity: async data => { calls.push(data); if(offline) { const error = Error('request failed'); error.status = failureStatus; throw error; } return data; } } };
    throw Error(name);
  } });
  const queryClient = { invalidateQueries: async () => {} };
  return {
    render(snapshot) { cursor=0; const result=mod.exports.useActivitySync(snapshot); const run=pending; pending=[]; run.forEach(f=>f()); return result; },
    serverError(status) { offline=true; failureStatus=status; },
    online() { offline=false; }, tick() { intervals.forEach(f=>f()); }, calls, store,
    cleanup() { effects.forEach(e=>e?.cleanup?.()); }
  };
}
function snapshot(steps=8, day=new Date()) { return { date:day.toDateString(), hours:Array.from({length:24},(_,i)=>i===10?steps:0), status:'tracking', calories:100, target:250 }; }
test('offline steps remain queued, newer readings replace the pending snapshot, and reconnect persists the latest total', async () => {
  const h=syncHarness(); h.render(snapshot(8)); await settle();
  assert.match(h.store.get('activity-queue-member-a'), /hourly_steps/);
  h.render(snapshot(12)); await settle(); h.online(); h.tick(); await settle();
  assert.equal(h.calls.at(-1).hourly_steps.reduce((a,b)=>a+b),12);
  assert.deepEqual(JSON.parse(h.store.get('activity-queue-member-a')),{});
  h.cleanup();
});
test('queued prior days survive restarting the app and sync separately from today', async () => {
  const stored=new Map(); const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
  const old=syncHarness(stored); old.render(snapshot(60,yesterday)); await settle(); old.cleanup();
  const next=syncHarness(stored); next.online(); next.render(snapshot(20)); await settle();
  assert.equal(next.calls.length,2);
  assert.deepEqual(next.calls.map(call=>call.hourly_steps.reduce((a,b)=>a+b)),[60,20]); next.cleanup();
});
test('mobile ring follows the theme and opens daily history when pressed', () => {
  for(const dark of [true,false]) {
    let opened=false;
    const mod={exports:{}};
    vm.runInNewContext(compile('ui/mobile/components/member/MemberMobileActivity.tsx'), {module:mod,exports:mod.exports,require(name) {
      if(name==='react') return {...React,useState:()=>[false,value=>{opened=value;}]};
      if(name==='react/jsx-runtime') return require(name);
      if(name==='react-native') return Object.assign(Object.fromEntries(['Pressable','Text','View'].map(n=>[n,n])), {StyleSheet:{create:s=>s},useWindowDimensions:()=>({width:390}),Platform:{OS:'android'},Linking:{}});
      if(name==='react-native-svg') return {default:'Svg',Circle:'Circle'};
      if(name==='@expo/vector-icons') return {Ionicons:'Icon'};
      if(name.includes('AppThemeProvider')) return {useAppTheme:()=>({isDark:dark})};
      if(name.includes('useDailySteps')) return {useDailySteps:()=>({...snapshot(),steps:8,enable(){}})};
      if(name.includes('useActivitySync')) return {useActivitySync:()=> ({status:'saved',retry(){}})};
      if(name.includes('useMember')) return {useMemberActivity:()=>({})};
      if(name.includes('MemberActivityHistory')) return {MemberActivityHistory:'History'};
      throw Error(name);
    }});
    const root=mod.exports.MemberMobileActivity({calories:100,target:250,loading:false,unavailable:false,onGoal(){},onWorkout(){}});
    const nodes=[]; const visit=n=>{if(Array.isArray(n))n.forEach(visit);else if(n&&typeof n==='object'){nodes.push(n);visit(n.props?.children);}};visit(root);
    const fill=nodes.find(n=>n.type==='Circle'&&n.props.r===15);
    assert.equal(fill.props.fill,dark?'#FFFFFF':'#111111');
    const ring=nodes.find(n=>n.props?.accessibilityLabel==='Activity Ring. View daily activity history');ring.props.onPress(); assert.equal(opened,true);
  }
});
test('calorie-only progress logs are valid and invalid calorie amounts are rejected', () => {
  const mod = { exports: {} };
  vm.runInNewContext(compile('ui/mobile/components/member/formValidation.ts'), { exports: mod.exports, module: mod });
  const validate = mod.exports.progressFormError;
  assert.equal(validate('', '', '', '125'), undefined);
  assert.equal(validate('', '', '', '0'), undefined);
  assert.ok(validate('', '', '', '-2'));
  assert.ok(validate('', '', '', '2.5'));
  assert.ok(validate('', '', '', '100001'));
});

test('missing backend routes surface a server error and keep readings queued for retry', async () => {
  const h=syncHarness(); h.serverError(404); h.render(snapshot(50)); await settle();
  const result=h.render(snapshot(50));
  assert.equal(result.status,'server-error');
  assert.match(result.error,/backend/);
  assert.match(h.store.get('activity-queue-member-a'),/hourly_steps/);
  h.online(); await result.retry(); await settle();
  assert.deepEqual(JSON.parse(h.store.get('activity-queue-member-a')),{});
  h.cleanup();
});
test('web step cards show backend totals, preserve zero readings, and open daily history', () => {
  for (const dark of [true, false]) {
    for (const mode of ['recorded', 'zero', 'loading', 'error', 'not-synced']) {
      let opened = false;
      const mod = { exports: {} };
      vm.runInNewContext(compile('components/member/MemberActivityHero.tsx'), { module: mod, exports: mod.exports, require(name) {
        if (name === 'react') return { ...React, useState: () => [false, value => { opened = value; }] };
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react-native') return { Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: { create: s => s }, useWindowDimensions: () => ({ width: 1280 }) };
        if (name === 'react-native-svg') return { default: 'Svg', Circle: 'Circle' };
        if (name === '@expo/vector-icons') return { Ionicons: 'Icon' };
        if (name.includes('AppThemeProvider')) return { useAppTheme: () => ({ isDark: dark }) };
        if (name.includes('MemberActivityHistory')) return { MemberActivityHistory: 'History' };
        throw Error(name);
      } });
      const activity = { steps: mode === 'zero' ? 0 : 1234, distance_km: mode === 'zero' ? 0 : .9255, source: mode === 'not-synced' ? null : 'android_foreground' };
      const root = mod.exports.MemberActivityHero({ activity, calories: 100, target: 250, loading: mode === 'loading', unavailable: mode === 'error', onGoal() {}, onWorkout() {} });
      const nodes = []; const visit = n => { if (Array.isArray(n)) n.forEach(visit); else if (n && typeof n === 'object') { nodes.push(n); visit(n.props?.children); } }; visit(root);
      const count = nodes.find(n => n.props?.accessibilityLabel?.startsWith('Step Count,'));
      const distance = nodes.find(n => n.props?.accessibilityLabel?.startsWith('Step Distance,'));
      const expectedSteps = mode === 'recorded' ? '1,234' : mode === 'zero' ? '0' : '\u2014';
      const expectedKm = mode === 'recorded' ? '0.93' : mode === 'zero' ? '0.00' : '\u2014';
      assert.ok(count.props.accessibilityLabel.includes(`${expectedSteps} steps`), mode);
      assert.ok(distance.props.accessibilityLabel.includes(`${expectedKm} km`), mode);
      count.props.onPress(); assert.equal(opened, true);
    }
  }
});
