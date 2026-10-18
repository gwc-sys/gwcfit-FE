import { useState } from "react";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { useActivitySync } from "../../../../hooks/useActivitySync";
import { useMemberActivity } from "../../../../hooks/useMember";
import { MemberActivityHistory } from "../../../../components/member/MemberActivityHistory";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useDailySteps } from "../../../../hooks/useDailySteps";
import { Platform } from "react-native";

type Props = { calories: number; target: number; loading: boolean; unavailable: boolean; onGoal: () => void; onWorkout: () => void };
export function MemberMobileActivity({ calories, target, loading, unavailable, onGoal }: Props) {
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const [historyOpen, setHistoryOpen] = useState(false);
  const ink = isDark ? "#FFFFFF" : "#111111";
  const muted = isDark ? "#B9B9BD" : "#5A5A64";
  const surface = { backgroundColor: isDark ? "#202020" : "#FFFFFF" };
  const saved = useMemberActivity().data?.today;
  const { steps, hours, date, status, enable } = useDailySteps();
  const sync = useActivitySync({ date, hours, status, calories, target });
  const syncStatus = sync.status;
  const displaySteps = Math.max(steps, saved?.steps ?? 0);
  const displayHours = (saved?.steps ?? 0) > steps ? saved!.hourly_steps : hours;
  const ready = !loading && !unavailable;
  const size = Math.min(150, Math.max(108, (width - 110) * 0.46));
  const hasGoal = target > 0;
  const progress = ready && hasGoal ? Math.min(calories / target, 1) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const angle = -Math.PI / 2 + progress * 2 * Math.PI;
  const known = status === "tracking" || Boolean(saved?.source);
  // Distance is a step-length estimate, not a GPS measurement.
  const km = displaySteps * 0.75 / 1000;
  return <View style={s.section}>
    <Pressable accessibilityRole="button" accessibilityLabel="Activity Ring. View daily activity history" onPress={() => { void sync.retry(); setHistoryOpen(true); }} style={({ pressed }) => [s.moveCard, surface, pressed && s.pressed]}>
      <Text accessibilityRole="header" style={[s.heading, { color: ink }]}>Activity Ring</Text>
      <View style={s.moveRow}>
        <View accessible accessibilityLabel={ready ? `${calories} of ${hasGoal ? target : 'no target set'} kilocalories` : 'Loading activity'}>
          <Svg width={size} height={size} viewBox="0 0 160 160">
            <Circle cx={80} cy={80} r={radius} stroke={isDark ? "#3C3C40" : "#E1E1E6"} strokeWidth={30} fill="none" />
            {progress > 0 ? <Circle cx={80} cy={80} r={radius} stroke={ink} strokeWidth={30} strokeLinecap="round" fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress)} rotation={-90} origin="80, 80" /> : null}
            <Circle cx={80 + radius * Math.cos(angle)} cy={80 + radius * Math.sin(angle)} r={15} fill={ink} />
          </Svg>
          <View style={[s.arrow, { left: size * (80 + radius * Math.cos(angle)) / 160 - 11, top: size * (80 + radius * Math.sin(angle)) / 160 - 11 }]}><Ionicons name="arrow-forward" size={22} color={isDark ? "#080808" : "#FFFFFF"} /></View>
        </View>
        <View style={s.moveCopy}><Text style={[s.moveLabel, { color: ink }]}>Move</Text><Text adjustsFontSizeToFit numberOfLines={1} style={[s.kcal, { color: ink }]}>{ready ? calories.toLocaleString() : '—'}/{ready && hasGoal ? target.toLocaleString() : '—'}<Text style={s.kcalUnit}> KCAL</Text></Text>
          {!ready ? <Text style={[s.note, { color: muted }]}>{loading ? 'Loading activity…' : 'Activity unavailable'}</Text> : !hasGoal ? <Text style={[s.note, { color: muted }]}>No daily goal set</Text> : calories >= target ? <Text style={[s.note, { color: muted }]}>{Math.floor(calories / target * 100)}% · Goal complete</Text> : <Text style={[s.note, { color: muted }]}>{Math.max(0, target - calories)} kcal remaining | {Math.floor(calories / target * 100)}%</Text>}
        </View>
      </View>
    </Pressable>
    <View style={s.actions}>
      <Pressable accessibilityRole="button" onPress={onGoal} style={s.permission}><Text style={[s.permissionText, { color: ink }]}>{hasGoal ? "Change daily goal" : "Set daily goal"}</Text></Pressable>
      <Text style={[s.note, { color: muted }]}>{syncStatus === "saved" ? "Saved" : syncStatus === "offline" ? "Offline - will sync when connected" : syncStatus === "server-error" ? "Could not save to server" : syncStatus === "local-error" ? "Unable to save on this device" : "Waiting to sync..."}</Text>
    </View>
    {sync.error ? <Pressable accessibilityRole="button" onPress={() => void sync.retry()} style={s.permission}>
      <Text style={[s.note, { color: muted }]}>{sync.error} Tap to retry saving.</Text>
    </Pressable> : null}
    <Text style={[s.footnote, { color: muted }]}>{saved?.calories_source === "steps" ? saved.calorie_estimate_uses_default_weight ? "Active kcal estimated from steps using 70 kg. Set your weight in Progress for a personalised estimate." : "Active kcal estimated from steps and your saved weight." : "Active kcal uses the higher of logged calories or the step estimate."}</Text>
    <View style={s.tiles}>
      <StepTile title="Step Count" value={known ? displaySteps.toLocaleString() : '—'} color={isDark ? "#B49AF2" : "#7650C8"} hours={displayHours} dark={isDark} />
      <StepTile title="Step Distance" value={known ? km.toFixed(2) : '—'} unit="KM" color={isDark ? "#00BCEF" : "#007EA6"} hours={displayHours} dark={isDark} />
    </View>
    {status === 'permission' || status === 'denied' || status === 'error' ? <Pressable accessibilityRole="button" onPress={status === 'denied' ? () => void Linking.openSettings() : enable} style={s.permission}><Text style={s.permissionText}>{status === 'denied' ? 'Allow Motion & Fitness in Settings' : status === 'error' ? 'Step sensor error · Tap to retry' : 'Enable motion access for step counting'}</Text></Pressable> : <Text style={s.footnote}>{status === 'checking' ? 'Checking motion sensor…' : status === 'unavailable' ? 'Step sensor unavailable on this device.' : Platform.OS === 'android' ? 'Steps recorded while app is active · Distance estimated at 0.75 m/step' : 'Today’s sensor steps · Distance estimated at 0.75 m/step'}</Text>}
    {historyOpen ? <MemberActivityHistory onClose={() => setHistoryOpen(false)} onGoal={onGoal} /> : null}
  </View>;
}
function StepTile({ title, value, unit, color, hours, dark }: { dark: boolean; title: string; value: string; unit?: string; color: string; hours: number[] }) {
  const max = Math.max(...hours, 1);
  return <View style={[s.tile, { backgroundColor: dark ? "#202020" : "#FFFFFF" }]} accessible accessibilityLabel={`${title}, today, ${value} ${unit ?? 'steps'}`}>
    <Text numberOfLines={1} adjustsFontSizeToFit style={[s.tileHeading, { color: dark ? "#FFFFFF" : "#111111" }]}>{title}</Text>
    <Text style={[s.today, { color: dark ? "#EFEFF0" : "#5A5A64" }]}>Today</Text><Text numberOfLines={1} adjustsFontSizeToFit style={[s.value, { color }]}>{value}<Text style={s.distanceUnit}>{unit}</Text></Text>
    <View style={s.chart}>{hours.map((count, index) => <View key={index} style={s.track}>{count > 0 ? <View style={{ width: 2, backgroundColor: color, height: `${Math.max(4, count / max * 100)}%`, borderRadius: 2 }} /> : null}</View>)}</View>
    <View style={s.times}>{['12 AM', '6 AM', '12 PM', '6 PM'].map(time => <Text key={time} style={s.time}>{time}</Text>)}</View>
  </View>;
}
const s = StyleSheet.create({
  section: { gap: 10 }, actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }, moveCard: { backgroundColor: '#202020', borderRadius: 24, padding: 18, gap: 16 },
  heading: { color: '#FFF', fontSize: 22, fontWeight: '600' }, moveRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingBottom: 2 },
  arrow: { position: 'absolute', width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }, moveCopy: { flex: 1 },
  moveLabel: { color: '#FFF', fontSize: 22 }, kcal: { color: '#FFFFFF', fontSize: 28, fontWeight: '600' }, kcalUnit: { fontSize: 19 },
  note: { color: '#B9B9BD', fontSize: 11, marginTop: 6 }, tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, minWidth: 0, backgroundColor: '#202020', borderRadius: 24, padding: 15 },
  tileHeading: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 12 }, today: { color: '#EFEFF0', fontSize: 16 },
  value: { fontSize: 36, fontWeight: '500', marginTop: 2, fontVariant: ['tabular-nums'] }, distanceUnit: { fontSize: 21 },
  chart: { height: 48, flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  track: { width: 2, height: '100%', backgroundColor: '#3D3D3F', justifyContent: 'flex-end' },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }, time: { fontSize: 8, color: '#8E8E93' },
  permission: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, permissionText: { color: '#007AFF', fontSize: 13 },
  footnote: { fontSize: 10, color: '#8E8E93', lineHeight: 15, paddingHorizontal: 4 }, pressed: { opacity: 0.75 }
});
