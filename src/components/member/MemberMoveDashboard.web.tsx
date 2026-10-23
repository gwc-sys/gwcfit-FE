import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { useAppTheme } from '../../theme/AppThemeProvider';
import type { MemberMoveDashboardProps } from './MemberMoveDashboard';

const parseDate = (value: string) => new Date(`${value}T12:00:00`);
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

export function MemberMoveDashboard(p: MemberMoveDashboardProps) {
  const { colors: c } = useAppTheme();
  const s = StyleSheet.create({
    page: { gap: 24 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    heading: { color: c.text, fontSize: 30, fontWeight: '700', letterSpacing: -.8 },
    muted: { color: c.textMuted, fontSize: 13, lineHeight: 21 },
    title: { color: c.text, fontSize: 17, fontWeight: '600' },
    card: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 20, padding: 24, gap: 20 },
    button: { borderWidth: 1, borderColor: c.border, borderRadius: 10, minHeight: 42, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    buttonText: { color: c.text, fontSize: 13, fontWeight: '600' },
    blue: { color: c.primary },
    day: { flex: 1, minWidth: 24, alignItems: 'center', gap: 10, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    value: { color: c.text, fontSize: 30, fontWeight: '700', letterSpacing: -.8 },
    metric: { flex: 1, minWidth: 180 },
  });
  const completed = p.day?.calories_completed ?? 0;
  const target = p.day?.calories_target ?? 0;
  const progress = target > 0 ? Math.min(1, Math.max(0, completed / target)) : 0;
  const hours = p.day?.hourly_steps ?? [];
  const max = Math.max(1, ...hours);
  const button = (label: string, icon: keyof typeof Ionicons.glyphMap, onPress: () => void, disabled = false) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, disabled && { opacity: .4 }]}>
      <Ionicons name={icon} size={17} color={c.text} /><Text style={s.buttonText}>{label}</Text>
    </Pressable>
  );
  return <View style={s.page}>
    {p.onClose && <View style={s.row}>{button('Back to dashboard', 'arrow-back', p.onClose)}</View>}
    <View style={[s.row, { justifyContent: 'space-between' }]}>
      <View style={{ gap: 5 }}><Text style={s.heading}>Goals & activity</Text><Text style={s.muted}>Track your daily movement and build a consistent routine.</Text></View>
      <View style={s.row}>{button('View calendar', 'calendar-outline', p.onCalendar)}{button('Edit daily goal', 'create-outline', p.onGoal)}</View>
    </View>
    {p.loading && <Text accessibilityLiveRegion="polite" style={s.muted}>Loading activity…</Text>}
    {!!p.error && <View style={[s.card, s.row]}><Text style={{ color: c.danger, flex: 1 }}>{p.error}</Text>{button('Retry', 'refresh-outline', p.onRefresh)}</View>}
    <View style={s.card}>
      <View style={[s.row, { justifyContent: 'space-between' }]}><View><Text style={s.title}>Weekly overview</Text><Text style={s.muted}>{parseDate(p.week[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {parseDate(p.week[6]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></View>
        <View style={s.row}>{button('Previous week', 'chevron-back', () => p.onWeek(-1))}{button('Next week', 'chevron-forward', () => p.onWeek(1), p.week.includes(localToday()))}</View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>{p.week.map(d => {
        const item = d === p.today?.activity_date ? p.today : p.days.find(a => a.activity_date === d);
        const ratio = item?.calories_target ? Math.min(1, Math.max(0, item.calories_completed / item.calories_target)) : 0;
        return <Pressable key={d} accessibilityRole="button" accessibilityLabel={`Activity for ${d}`} accessibilityState={{ selected: d === p.selected }} onPress={() => p.onSelect(d)} style={[s.day, d === p.selected && { backgroundColor: c.background, borderColor: c.primary }]}>
          <Text style={s.muted}>{parseDate(d).toLocaleDateString('en-GB', { weekday: 'short' })}</Text>
          <Text style={[s.title, d === p.selected && s.blue]}>{parseDate(d).getDate()}</Text>
          <Svg width={32} height={32}><Circle cx={16} cy={16} r={12} fill="none" stroke={c.border} strokeWidth={4}/><Circle cx={16} cy={16} r={12} fill="none" stroke={c.primary} strokeWidth={4} strokeDasharray={`${75.4 * ratio} 75.4`} rotation={-90} origin="16, 16" strokeLinecap="round" opacity={ratio > 0 ? 1 : 0}/></Svg>
        </Pressable>;
      })}</View>
    </View>
    <View style={[s.row, { justifyContent: 'space-between' }]}>
      <Text style={s.title} accessibilityLiveRegion="polite">{parseDate(p.selected).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <View style={s.row}>{button('Previous day', 'chevron-back', () => p.onDay(-1))}{button('Next day', 'chevron-forward', () => p.onDay(1), p.selected === localToday())}</View>
    </View>
    <View style={[s.row, { alignItems: 'stretch' }]}>
      <View style={[s.card, { flexGrow: 1, flexShrink: 1, flexBasis: 300 }]}>
        <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.title}>Daily Move goal</Text><Text style={[s.muted, s.blue]}>{p.paused ? 'Paused' : p.hasGoal ? 'Active' : 'No goal set'}</Text></View>
        <View style={{ alignItems: 'center', paddingVertical: 6 }} accessibilityLabel={`${completed} of ${target} kilocalories`}>
          <Svg width={190} height={190}><Circle cx={95} cy={95} r={79} fill="none" stroke={c.border} strokeWidth={14}/><Circle cx={95} cy={95} r={79} fill="none" stroke={c.primary} strokeWidth={14} strokeDasharray={`${496.4 * progress} 496.4`} rotation={-90} origin="95, 95" strokeLinecap="round" opacity={progress > 0 ? 1 : 0}/></Svg>
          <View style={{ position: 'absolute', top: 70, alignItems: 'center' }}><Text style={s.value}>{Math.round(progress * 100)}%</Text><Text style={s.muted}>of daily target</Text></View>
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}><Text style={[s.value, s.blue]}>{p.day ? completed.toLocaleString() : '—'} <Text style={{ fontSize: 15, color: c.textMuted }}>/ {target || '—'} kcal</Text></Text><Text style={s.muted}>{p.day ? `${Math.max(0, target - completed).toLocaleString()} kcal remaining` : 'No saved activity for this date'}</Text></View>
        {button(p.paused ? 'Resume goal' : 'Pause goal', p.paused ? 'play-outline' : 'pause-outline', p.onPause, !p.hasGoal || p.pending)}
      </View>
      <View style={[s.card, { flexGrow: 2, flexShrink: 1, flexBasis: 400 }]}>
        <View><Text style={s.title}>Activity throughout the day</Text><Text style={s.muted}>Hourly steps · {p.day?.steps.toLocaleString() ?? '—'} total steps</Text></View>
        <View style={{ flex: 1, minHeight: 190, justifyContent: 'center' }}>
          <Svg width="100%" height={190} viewBox="0 0 480 190" preserveAspectRatio="none">{[15,65,115,165].map(y => <Line key={y} x1={0} x2={480} y1={y} y2={y} stroke={c.border} strokeDasharray="3 5"/>)}{hours.map((v,i) => <Rect key={i} x={i*20+5} y={165-v/max*145} width={10} height={v/max*145} rx={3} fill={c.primary}/>)}</Svg>
          <View style={[s.row, { justifyContent: 'space-between' }]}>{['00:00','06:00','12:00','18:00','24:00'].map(t => <Text key={t} style={s.muted}>{t}</Text>)}</View>
        </View>
        <Text style={s.muted}>{hours.some(v => v > 0) ? 'Your movement distribution across the selected day.' : 'No hourly movement recorded for this date.'}</Text>
      </View>
    </View>
    <View style={[s.row, { alignItems: 'stretch' }]}>
      {[{ label: 'Steps', icon: 'footsteps-outline' as const, value: p.day?.source ? p.day.steps.toLocaleString() : '—', note: 'Total daily steps' }, { label: 'Distance', icon: 'navigate-outline' as const, value: p.day?.source ? `${p.day.distance_km.toFixed(2)} km` : '—', note: 'Distance covered' }, { label: 'Stairs climbed', icon: 'trending-up-outline' as const, value: '—', note: 'Not recorded by your activity source' }].map(m => <View key={m.label} style={[s.card, s.metric]}><View style={s.row}><Ionicons name={m.icon} size={19} color={c.primary}/><Text style={s.muted}>{m.label}</Text></View><Text style={s.value}>{m.value}</Text><Text style={s.muted}>{m.note}</Text></View>)}
    </View>
    {p.day?.calories_source === 'steps' && <Text style={s.muted}>Move calories and distance are estimated from steps.</Text>}
  </View>;
}
