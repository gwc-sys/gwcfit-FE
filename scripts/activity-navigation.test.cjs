const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const mod = { exports: {} };
const source = fs.readFileSync(path.resolve(__dirname, '../src/utils/activityNavigation.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: mod.exports });
const { activitySwipeDirection: direction, shiftActivityDate: shift } = mod.exports;

test('activity swipes distinguish day direction from taps and vertical scrolling', () => {
  assert.equal(direction(-90, 12), 1);
  assert.equal(direction(90, -12), -1);
  assert.equal(direction(20, 0), 0);
  assert.equal(direction(50, 80), 0);
  assert.equal(direction(-60, -60), 0);
});
test('day and week navigation cross month, leap-day and year boundaries', () => {
  const today = '2026-10-19';
  assert.equal(shift('2026-10-01', -1, today), '2026-09-30');
  assert.equal(shift('2026-01-03', -7, today), '2025-12-27');
  assert.equal(shift('2024-03-01', -1, today), '2024-02-29');
  assert.equal(shift('2026-09-27', 7, today), '2026-10-04');
});
test('forward swipes stop at today and repeated backward swipes retain date order', () => {
  const today = '2026-10-19';
  assert.equal(shift(today, 1, today), today);
  assert.equal(shift('2026-10-18', 7, today), today);
  let selected = today;
  for (let i=0;i<60;i++) selected = shift(selected, -1, today);
  assert.equal(selected, '2026-08-20');
});

test('ring changes days, row changes weeks, and older history loads automatically', () => {
  const React = require('react');
  const state = []; let cursor = 0; let effects = []; let olderLoads = 0;
  const now = new Date();
  const key = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate()-1);
  const today = {activity_date:key(now), calories_completed:110, calories_target:250, steps:2200, distance_km:1.65, source:'ios_pedometer', hourly_steps:[]};
  const past = {...today,activity_date:key(yesterday),calories_completed:75,steps:1500,distance_km:1.12};
  const query = {data:{pages:[{today,items:[today,past],total:2}]},hasNextPage:false,isFetching:false,refetch(){},fetchNextPage(){olderLoads++}};
  const screenModule = {exports:{}};
  const screen = fs.readFileSync(path.resolve(__dirname,'../src/components/member/MemberMoveScreen.tsx'),'utf8');
  const stub = () => ({});
  vm.runInNewContext(ts.transpileModule(screen,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{
    exports:screenModule.exports,
    require(name){
      if(name.includes('AppThemeProvider'))return {useAppTheme:()=>({isDark:true,colors:{primary:'#318DFF',text:'#FFFFFF',textMuted:'#8E8E93',background:'#0B1119',surface:'#17212D',border:'#263241',danger:'#FF453A'}})};
      if(name==='react')return {useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value}]},useCallback:fn=>fn,useMemo:fn=>fn(),useEffect(fn){effects.push(fn)}};
      if(name==='react/jsx-runtime')return require(name);
      if(name==='react-native')return {Platform:{OS:'ios'},View:'View',Text:'Text',Pressable:'Pressable',ScrollView:'ScrollView',Modal:'Modal',RefreshControl:'RefreshControl',TextInput:'TextInput',PanResponder:{create:handlers=>({panHandlers:handlers})},StyleSheet:{create:s=>s},useWindowDimensions:()=>({width:390})};
      if(name==='react-native-gesture-handler')return {
        GestureDetector:'GestureDetector',GestureHandlerRootView:'GestureRoot',
        Gesture:{Pan:()=>({activeOffsetX(v){this.x=v;return this},failOffsetY(v){this.y=v;return this},runOnJS(v){this.js=v;return this},onEnd(fn){this.end=fn;return this}})}
      };
      if(name==='react-native-safe-area-context')return {SafeAreaView:'SafeAreaView'};
      if(name==='@expo/vector-icons')return {Ionicons:'Icon'};
      if(name==='@react-navigation/native')return {useNavigation:()=>({goBack(){}})};
      if(name==='@tanstack/react-query')return {useInfiniteQuery:()=>query};
      if(name==='react-native-svg')return {default:'Svg',Circle:'Circle',Line:'Line',Rect:'Rect'};
      if(name.includes('activityNavigation'))return mod.exports;
      if(name.includes('useMember'))return {useMemberGoals:()=>({data:[]}),useCreateGoal:stub,useUpdateGoal:stub};
      if(name.includes('api/client'))return {getApiErrorMessage:String};
      if(name.includes('api/member'))return {memberApi:{}};
      if(name==='./MemberMoveDashboard')return {MemberMoveDashboard:'WebDashboard'};
      if(name.includes('MemberActivityCalendar'))return {MemberActivityCalendar:'Calendar'};
      throw Error(name);
    }
  });
  const render=()=>{cursor=0;effects=[];const tree=screenModule.exports.MemberMoveScreen();effects.forEach(fn=>fn());return tree};
  const nodes=root=>{const out=[];function walk(v){if(!React.isValidElement(v))return;out.push(v);React.Children.forEach(v.props.children,walk)}walk(root);return out};
  let tree=render();
  const hero=nodes(tree).find(n=>n.props.testID==='activity-day-pager');
  assert.ok(hero);
  assert.ok(!nodes(hero).some(n=>n.props.accessibilityLabel==='Previous week'));
  const weekPager=nodes(tree).find(n=>n.props.testID==='activity-week-pager');
  assert.ok(weekPager);
  assert.ok(nodes(tree).some(n=>n.props.accessibilityLabel==='Previous week'));
  assert.ok(nodes(hero).some(n=>n.props.accessible&&n.props.accessibilityLabel.startsWith('Activity for ')));
  assert.equal(tree.type,'GestureRoot');
  const detector=id=>nodes(render()).find(n=>n.type==='GestureDetector'&&n.props.children.props.testID===id).props.gesture;
  const ringGesture=detector('activity-day-pager');
  const rowGesture=detector('activity-week-pager');
  assert.equal(ringGesture.x[0],-16);
  assert.equal(ringGesture.x[1],16);
  assert.equal(ringGesture.y[0],-20);
  assert.equal(ringGesture.y[1],20);
  assert.equal(ringGesture.js,true);
  ringGesture.end({translationX:90,translationY:3},false);
  assert.equal(state[0],today.activity_date);
  ringGesture.end({translationX:3,translationY:90},true);
  assert.equal(state[0],today.activity_date);
  ringGesture.end({translationX:90,translationY:3},true);
  tree=render();
  assert.equal(state[0],past.activity_date);
  assert.ok(nodes(tree).some(n=>n.props.accessibilityLabel===`Activity for ${past.activity_date}`&&n.props.accessibilityState?.selected));
  const texts=nodes(tree).filter(n=>n.type==='Text').flatMap(n=>React.Children.toArray(n.props.children));
  assert.ok(texts.includes(75));
  assert.ok(texts.includes('1,500'));
  assert.ok(texts.includes('1.12'));
  const previousHero=nodes(tree).find(n=>n.props.testID==='activity-day-pager');
  detector('activity-day-pager').end({translationX:-90,translationY:3},true);
  assert.equal(state[0],today.activity_date);
  rowGesture.end({translationX:90,translationY:3},true);
  assert.equal(state[0],shift(today.activity_date,-7,today.activity_date));
  query.hasNextPage=true;
  render();
  assert.equal(olderLoads,1);
  query.isFetching=true;
  render();
  assert.equal(olderLoads,1);
  query.isFetching=false;
  query.error=Error('offline');
  render();
  assert.equal(olderLoads,1);
  rowGesture.end({translationX:-90,translationY:3},true);
  assert.equal(state[0],today.activity_date);
});

test('dashboard history opens the swipe screen and preserves its close action', () => {
  const wrapper = {exports:{}};
  const source = fs.readFileSync(path.resolve(__dirname,'../src/components/member/MemberActivityHistory.tsx'),'utf8');
  const Move = () => null;
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{
    exports:wrapper.exports,
    require(name){
      if(name==='react/jsx-runtime')return require(name);
      if(name==='react-native')return {Modal:'Modal'};
      if(name==='./MemberMoveScreen')return {MemberMoveScreen:Move};
      throw Error(name);
    }
  });
  let closed = false;
  const close=()=>{closed=true};
  const modal=wrapper.exports.MemberActivityHistory({onClose:close,onGoal(){}});
  assert.equal(modal.props.visible,true);
  assert.equal(modal.props.children.type,Move);
  modal.props.children.props.onClose();
  assert.equal(closed,true);
  assert.equal(modal.props.onRequestClose,close);
});
