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
  const calorieValue = Number.isFinite(calories) && calories > 0 ? calories : 0;
  const targetValue = Number.isFinite(target) && target > 0 ? target : 0;
  const hasGoal = targetValue > 0;
  const percent = hasGoal ? Math.floor(calorieValue / targetValue * 100) : 0;
  const closed = hasGoal && calorieValue >= targetValue;
  const text = isDark ? "#FFFFFF" : "#000000";
  const muted = isDark ? "#F2F2F7" : "#1C1C1E";
  const accent = "#E91E63";
  const ringAccent = closed ? "#34C759" : accent;
  const trackColor = isDark ? "rgba(0, 122, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const number = (value: number) => value.toLocaleString("en-US");
  const status = loading ? "Loading today's activity…" : unavailable ? "Activity unavailable. Pull to refresh." : !hasGoal ? "Set a daily target to close your ring." : closed ? `Goal complete · ${number(calorieValue - targetValue)} kcal over target` : `${number(targetValue - calorieValue)} kcal to close your ring`;
  const ringCircumference = 351.86; // 2 * PI * 56

  return <View style={[s.card, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" }]}>
    <View style={s.header}><Text style={[s.eyebrow, { color: muted }]}>ACTIVITY</Text><Text style={{ color: muted, fontSize: 12, fontWeight: "500" }}>Today</Text></View>
    <View style={[s.activityLayout, inline && s.activityLayoutInline]}>
    <View style={[s.body, width >= 760 && s.wide, inline && s.energyInline]}>
      <Pressable onPress={() => setHistoryOpen(true)} accessibilityRole="button" style={s.ring} accessibilityLabel={ready ? hasGoal ? `${calorieValue} of ${targetValue} active kilocalories, ${percent} percent complete` : `${calorieValue} active kilocalories. No daily goal set.` : status}>
        <Svg width={144} height={144} viewBox="0 0 144 144">
          <Circle cx={72} cy={72} r={56} fill="none" stroke={trackColor} strokeWidth={15} />
          {ready && hasGoal && calorieValue > 0 ? (
            <Circle
              cx={72}
              cy={72}
              r={56}
              fill="none"
              stroke={ringAccent}
              strokeWidth={15}
              strokeLinecap="round"
              strokeDasharray={`${ringCircumference} ${ringCircumference}`}
              strokeDashoffset={ringCircumference * (1 - Math.min(calorieValue / targetValue, 1))}
              transform="rotate(-90 72 72)"
            />
          ) : null}
        </Svg>
        <View style={s.center}>
          <Ionicons name={closed && ready ? "checkmark-sharp" : "flame-sharp"} size={20} color={ringAccent} />
          <Text style={[s.percent, { color: text }]}>{ready && hasGoal ? `${percent}%` : "—"}</Text>
          <Text style={[s.ringLabel, { color: muted }]}>{closed && ready ? "GOAL CLOSED" : "DAILY GOAL"}</Text>
        </View>
      </Pressable>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={[s.title, { color: text }]}>Active Energy</Text>
        <Text style={[s.energy, { color: text }]}>{ready ? number(calorieValue) : "—"}<Text style={[s.unit, { color: muted }]}> / {ready && hasGoal ? number(targetValue) : "—"} kcal</Text></Text>
        <Text style={[s.caption, { color: muted }]}>Completed / daily target</Text>
        <View style={[s.statusPill, { backgroundColor: isDark ? "rgba(0, 122, 255, 0.1)" : "rgba(0, 122, 255, 0.08)", borderColor: "rgba(0, 122, 255, 0.2)" }]}>
          <Text style={[s.status, { color: closed && ready ? "#34C759" : "#007AFF" }]}>{status}</Text>
        </View>
      </View>
    </View>
    <View style={[s.stepCards, width < 480 && s.stepCardsStacked, inline && s.stepCardsInline]}>
      {([
        { title: "Step Count", value: hasSteps ? number(activity!.steps) : "\u2014", unit: "steps", color: "#007AFF", softBg: "rgba(0, 122, 255, 0.12)", icon: "footsteps-outline" as const },
        { title: "Step Distance", value: hasSteps ? activity!.distance_km.toFixed(2) : "\u2014", unit: "km", color: "#E91E63", softBg: isDark ? "rgba(233,30,99,0.15)" : "rgba(233,30,99,0.08)", icon: "walk-outline" as const }
      ]).map(item => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={`${item.title}, today, ${item.value} ${item.unit}. View daily activity history`}
        onPress={() => setHistoryOpen(true)} style={({ pressed }) => [s.stepCard, { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" }, pressed && s.pressed]}>
        <View style={s.header}>
          <Text style={[s.stepTitle, { color: text }]}>{item.title}</Text>
          <View style={[s.stepIconBox, { backgroundColor: item.softBg }]}>
            <Ionicons name={item.icon} size={16} color={item.color} />
          </View>
        </View>
        <Text style={[s.caption, { color: muted }]}>Today</Text>
        <Text style={[s.stepValue, { color: item.color }]}>{item.value}<Text style={s.stepUnit}> {item.unit}</Text></Text>
        <Text numberOfLines={1} style={[s.stepHint, { color: muted }]}>{loading ? "Loading activity..." : unavailable ? "Could not load activity" : !hasSteps ? "Sync steps from the mobile app" : item.unit === "km" ? "Estimated walking distance" : "Synced from your phone"}</Text>
      </Pressable>)}
    </View>
    </View>
    <View style={s.footer}>
      <Pressable accessibilityRole="button" onPress={onGoal} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={[s.action, { color: accent }]}>{hasGoal ? "Change goal" : "Set daily goal"}</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onWorkout} style={({ pressed }) => [s.button, pressed && s.pressed]}><Text style={[s.action, { color: text }]}>View workouts</Text><Ionicons name="arrow-forward" size={14} color={text} /></Pressable>
    </View>
    <Text style={[s.source, { color: muted }]}>{activity?.calories_source === "steps" ? activity.calorie_estimate_uses_default_weight ? "Estimated from steps using 70 kg. Set your weight in Progress for a personalised estimate." : "Active kcal estimated from steps and your saved weight." : "Based on logged active calories and step estimates."} Tap ring for history</Text>
    {historyOpen ? <MemberActivityHistory onClose={() => setHistoryOpen(false)} onGoal={onGoal} /> : null}
  </View>;
}
const s = StyleSheet.create({
  card: { borderWidth: 0, borderRadius: 20, padding: 20, gap: 14, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  activityLayout: { gap: 16 },
  activityLayoutInline: { flexDirection: "row", alignItems: "stretch" },
  energyInline: { flex: 1.35, minWidth: 0, gap: 16 },
  stepCardsInline: { flex: 1.2, minWidth: 0 },
  body: { alignItems: "center", gap: 14 },
  wide: { flexDirection: "row", justifyContent: "center", gap: 28, paddingVertical: 4 },
  ring: { width: 144, height: 144, flexShrink: 0 },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", gap: 2 },
  percent: { fontSize: 24, fontWeight: "700", fontVariant: ["tabular-nums"] },
  ringLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },
  copy: { alignItems: "center", flexShrink: 1 },
  title: { fontSize: 18, fontWeight: "600", letterSpacing: -0.3 },
  energy: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5, marginTop: 4, fontVariant: ["tabular-nums"], textAlign: "center" },
  unit: { fontSize: 15, fontWeight: "500", letterSpacing: 0 },
  caption: { fontSize: 11.5, marginTop: 2 },
  statusPill: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 0 },
  status: { fontSize: 12, lineHeight: 16, textAlign: "center", fontWeight: "600" },
  stepCards: { flexDirection: "row", gap: 12 },
  stepCardsStacked: { flexDirection: "column" },
  stepCard: { flex: 1, minWidth: 0, padding: 14, borderRadius: 16, borderWidth: 0, gap: 6, justifyContent: "center" },
  stepIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 13.5, fontWeight: "600" },
  stepValue: { fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] },
  stepUnit: { fontSize: 13, fontWeight: "500" },
  stepHint: { fontSize: 11, marginTop: 1 },
  footer: { borderTopWidth: 0, paddingTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  button: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  action: { fontSize: 13, fontWeight: "600" },
  source: { fontSize: 11, textAlign: "center", marginTop: -4 },
  pressed: { opacity: 0.72 }
});

