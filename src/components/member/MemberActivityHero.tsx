import type { MemberActivityDay } from "../../types/member";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { MemberActivityHistory } from "./MemberActivityHistory";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useAppTheme } from "../../theme/AppThemeProvider";

type Props = { activity?: MemberActivityDay; calories: number; target: number; loading: boolean; unavailable: boolean; onGoal: () => void; onWorkout: () => void };
export function MemberActivityHero({ activity, calories, target, loading, unavailable, onGoal, onWorkout }: Props) {
  const { isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const [historyOpen, setHistoryOpen] = useState(false);
  const inline = width >= 1100;
  const ready = !loading && !unavailable;
  const hasSteps = ready && Boolean(activity?.source);
  const hasGoal = Number.isFinite(target) && target > 0;
  const percent = hasGoal ? Math.floor(calories / target * 100) : 0;
  const closed = hasGoal && calories >= target;
  const text = isDark ? "#FFFFFF" : "#17212C";
  const muted = isDark ? "#A7B0BF" : "#5A6675";
  const accent = isDark ? "#FFFFFF" : "#111111";
  const number = (value: number) => value.toLocaleString("en-US");
  const status = loading ? "Loading today's activity…" : unavailable ? "Activity unavailable. Pull to refresh." : !hasGoal ? "Set a daily target to close your ring." : closed ? `Goal complete · ${number(calories - target)} kcal over target` : `${number(target - calories)} kcal to close your ring`;
  return <View style={[s.card, { backgroundColor: isDark ? "#131B26" : "#FFFFFF", borderColor: isDark ? "#2A3443" : "#E2E7EE" }]}>
    <View style={s.header}><Text style={[s.eyebrow, { color: accent }]}>ACTIVITY</Text><Text style={{ color: muted }}>Today</Text></View>
    <View style={[s.activityLayout, inline && s.activityLayoutInline]}>
    <View style={[s.body, width >= 760 && s.wide, inline && s.energyInline]}>
      <Pressable onPress={() => setHistoryOpen(true)} accessibilityRole="button" style={s.ring} accessibilityLabel={ready ? hasGoal ? `${calories} of ${target} active kilocalories, ${percent} percent complete` : `${calories} active kilocalories. No daily goal set.` : status}>
        <Svg width={172} height={172} viewBox="0 0 172 172">
          <Circle cx={86} cy={86} r={70} fill="none" stroke={isDark ? "#3C3C40" : "#E1E1E6"} strokeWidth={19} />
          {ready && hasGoal && calories > 0 ? <Circle cx={86} cy={86} r={70} fill="none" stroke={accent} strokeWidth={19} strokeLinecap="round" strokeDasharray="439.823 439.823" strokeDashoffset={439.823 * (1 - Math.min(calories / target, 1))} rotation={-90} origin="86, 86" /> : null}
        </Svg>
        <View style={s.center}><Ionicons name={closed && ready ? "checkmark" : "arrow-forward"} size={23} color={accent} /><Text style={[s.percent, { color: text }]}>{ready && hasGoal ? `${percent}%` : "—"}</Text><Text style={[s.ringLabel, { color: muted }]}>{closed && ready ? "GOAL CLOSED" : "DAILY GOAL"}</Text></View>
      </Pressable>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={[s.title, { color: text }]}>Active Energy</Text>
        <Text style={[s.energy, { color: accent }]}>{ready ? number(calories) : "—"}<Text style={[s.unit, { color: muted }]}> / {ready && hasGoal ? number(target) : "—"} kcal</Text></Text>
        <Text style={[s.caption, { color: muted }]}>Completed / daily target</Text>
        <Text style={[s.status, { color: closed && ready ? accent : muted }]}>{status}</Text>
      </View>
    </View>
    <View style={[s.stepCards, width < 480 && s.stepCardsStacked, inline && s.stepCardsInline]}>
      {([
        { title: "Step Count", value: hasSteps ? number(activity!.steps) : "\u2014", unit: "steps", color: isDark ? "#B49AF2" : "#7650C8", icon: "footsteps-outline" as const },
        { title: "Step Distance", value: hasSteps ? activity!.distance_km.toFixed(2) : "\u2014", unit: "km", color: isDark ? "#00BCEF" : "#007EA6", icon: "walk-outline" as const }
      ]).map(item => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={`${item.title}, today, ${item.value} ${item.unit}. View daily activity history`}
        onPress={() => setHistoryOpen(true)} style={({ pressed }) => [s.stepCard, { backgroundColor: isDark ? "#1B2533" : "#F5F6FA" }, pressed && s.pressed]}>
        <View style={s.header}><Text style={[s.stepTitle, { color: text }]}>{item.title}</Text><Ionicons name={item.icon} size={20} color={item.color} /></View>
        <Text style={[s.caption, { color: muted }]}>Today</Text>
        <Text style={[s.stepValue, { color: item.color }]}>{item.value}<Text style={s.stepUnit}> {item.unit}</Text></Text>
        <Text style={[s.caption, { color: muted }]}>{loading ? "Loading activity..." : unavailable ? "Could not load activity" : !hasSteps ? "Sync steps from the mobile app" : item.unit === "km" ? "Estimated walking distance" : "Synced from your phone"}</Text>
      </Pressable>)}
    </View>
    </View>
    <View style={[s.footer, { borderTopColor: isDark ? "#293240" : "#E7EBF0" }]}>
      <Pressable accessibilityRole="button" onPress={onGoal} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={[s.action, { color: accent }]}>{hasGoal ? "Change goal" : "Set daily goal"}</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onWorkout} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={[s.action, { color: text }]}>View workouts</Text><Ionicons name="arrow-forward" size={17} color={text} /></Pressable>
    </View>
    <Text style={[s.source, { color: muted }]}>{activity?.calories_source === "steps" ? activity.calorie_estimate_uses_default_weight ? "Estimated from steps using 70 kg. Set your weight in Progress for a personalised estimate." : "Active kcal estimated from steps and your saved weight." : "Based on logged active calories and step estimates."} Tap ring for history</Text>
    {historyOpen ? <MemberActivityHistory onClose={() => setHistoryOpen(false)} onGoal={onGoal} /> : null}
  </View>;
}
const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 26, padding: 20, gap: 16, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1.8 },
  activityLayout: { gap: 18 }, activityLayoutInline: { flexDirection: "row", alignItems: "stretch" },
  energyInline: { flex: 1.35, minWidth: 0, gap: 18 }, stepCardsInline: { flex: 1.2, minWidth: 0 },
  body: { alignItems: "center", gap: 14 }, wide: { flexDirection: "row", justifyContent: "center", gap: 40, paddingVertical: 10 },
  ring: { width: 172, height: 172, flexShrink: 0 },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", gap: 3 },
  percent: { fontSize: 29, fontWeight: "700", fontVariant: ["tabular-nums"] },
  ringLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  copy: { alignItems: "center", flexShrink: 1 }, title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  energy: { fontSize: 36, fontWeight: "700", letterSpacing: -1, marginTop: 7, fontVariant: ["tabular-nums"], textAlign: "center" },
  unit: { fontSize: 19, fontWeight: "500", letterSpacing: 0 }, caption: { fontSize: 12, marginTop: 3 },
  status: { fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: "center" },
  stepCards: { flexDirection: "row", gap: 14 }, stepCardsStacked: { flexDirection: "column" },
  stepCard: { flex: 1, minWidth: 0, padding: 18, borderRadius: 20, gap: 7, justifyContent: "center" },
  stepTitle: { fontSize: 17, fontWeight: "600" },
  stepValue: { fontSize: 34, fontWeight: "600", fontVariant: ["tabular-nums"] }, stepUnit: { fontSize: 17, fontWeight: "500" },
  footer: { borderTopWidth: 1, paddingTop: 6, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  button: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 2 },
  action: { fontSize: 14, fontWeight: "600" }, source: { fontSize: 11, textAlign: "center", marginTop: -10 }, pressed: { opacity: 0.65 }
});

