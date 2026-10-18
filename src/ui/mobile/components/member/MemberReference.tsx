import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import { Pressable } from "../NativePressable";
import { WeekCalendar } from "../WeekCalendar";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { MemberProgressLog } from "../../../../types/member";

export function useMemberReferenceColors() {
  const { isDark } = useAppTheme();
  return isDark
    ? { background: "#090F18", card: "#111D2B", border: "#24374B", text: "#F7FAFF", muted: "#A8BED8", blue: "#389BFF", button: "#0066E5", track: "#233B56" }
    : { background: "#F2F5FA", card: "#FFFFFF", border: "#D8E2EF", text: "#142238", muted: "#526681", blue: "#0066CC", button: "#0066CC", track: "#DCE7F4" };
}

export function MemberReferenceHeader({ gym, name, unread, onNotifications, onProfile }: {
  gym: string; name: string; unread: number; onNotifications: () => void; onProfile: () => void;
}) {
  const c = useMemberReferenceColors();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  return <View style={s.header}>
    <View style={s.identityRow}>
      <View style={s.identity}><Text style={[s.gym, { color: c.text }]}>{gym}</Text><View style={[s.memberBadge, { backgroundColor: c.track }]}><Text style={{ color: c.blue, fontSize: 10, fontWeight: "700" }}>MEMBER</Text></View></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ""}`} onPress={onNotifications} style={s.iconButton}>
        <Ionicons name="notifications-outline" size={23} color={c.muted} />{unread > 0 ? <View style={s.dot} /> : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Open my profile" onPress={onProfile} style={[s.avatar, { backgroundColor: c.track }]}><Text style={{ color: c.text, fontSize: 16, fontWeight: "600" }}>{name.trim().charAt(0).toUpperCase() || "M"}</Text></Pressable>
    </View>
    <Text accessibilityRole="header" style={[s.greeting, { color: c.text }]}>Hi, {name.trim().split(/\s+/)[0] || "there"}</Text>
    <Text style={[s.subtitle, { color: c.muted }]}>Ready to make it count today?</Text>
    <View style={{ marginTop: 10 }}>
      <WeekCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
    </View>
  </View>;
}

export function MemberReferenceHero({ loading, unavailable, onWorkout }: { loading: boolean; unavailable: boolean; onWorkout: () => void }) {
  return <LinearGradient colors={["#087AFF", "#0753C7", "#061C45"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
    <Image source={require("../../../../../assets/images/workout-upper.jpg")} style={s.heroImage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
    <LinearGradient colors={["rgba(5,68,168,0)", "#0648AE"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />
    <Text style={s.eyebrow}>YOUR NEXT MOVE</Text>
    <Text accessibilityRole="header" style={s.heroTitle}>{loading ? "Getting you ready…" : "Build your\nmomentum"}</Text>
    <Text style={s.heroDescription}>{unavailable ? "Your workouts are one tap away." : "Consistent effort creates\nreal change."}</Text>
    <Pressable accessibilityRole="button" onPress={onWorkout} style={({ pressed }) => [s.primary, s.heroButton, pressed && s.pressed]}><Text style={s.primaryText}>View workouts</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable>
  </LinearGradient>;
}

export function MemberProgressOverview({ logs, loading, failed }: { logs: MemberProgressLog[]; loading: boolean; failed: boolean }) {
  const c = useMemberReferenceColors();
  const [range, setRange] = useState<"Week" | "Month" | "Year">("Month");
  const days = range === "Week" ? 7 : range === "Month" ? 30 : 365;
  const now = Date.now();
  const points = logs.filter(log => typeof log.weight === "number" && Number.isFinite(log.weight) && Number.isFinite(Date.parse(log.logged_at)) && Date.parse(log.logged_at) >= now - days * 86400000 && Date.parse(log.logged_at) <= now)
    .sort((a, b) => Date.parse(a.logged_at) - Date.parse(b.logged_at));
  const latest = points.at(-1);
  const weights = points.map(p => p.weight!);
  const low = Math.floor(Math.min(...weights, weights.length ? weights[0] : 0) - 1);
  const high = Math.ceil(Math.max(...weights, weights.length ? weights[0] : 1) + 1);
  const start = now - days * 86400000;
  const x = (log: MemberProgressLog) => 34 + (Date.parse(log.logged_at) - start) / (now - start) * 270;
  const y = (value: number) => 150 - (value - low) / (high - low) * 126;
  const path = points.map((log, i) => `${i ? "L" : "M"}${x(log)} ${y(log.weight!)}`).join(" ");
  const latestGoal = [...logs].filter(log => Number.isFinite(Date.parse(log.logged_at))).sort((a, b) => Date.parse(b.logged_at) - Date.parse(a.logged_at))[0]?.goal_progress_percentage;
  const progress = latestGoal == null || !Number.isFinite(latestGoal) ? null : Math.max(0, Math.min(100, latestGoal));
  const dateLabel = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return <View style={{ gap: 16 }}>
    <View accessibilityRole="tablist" style={[s.segmented, { backgroundColor: c.card, borderColor: c.border }]}>{(["Week", "Month", "Year"] as const).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: range === item }} onPress={() => setRange(item)} style={[s.segment, range === item && { backgroundColor: c.button }]}><Text style={{ color: range === item ? "#FFFFFF" : c.muted, fontSize: 15, fontWeight: "500" }}>{item}</Text></Pressable>)}</View>
    <View style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={s.chartHeader}><Ionicons name="scale-outline" size={23} color={c.blue} /><Text style={[s.cardTitle, { color: c.text, flex: 1 }]}>Weight</Text><View style={{ alignItems: "flex-end", gap: 4 }}><Text style={[s.weight, { color: c.text }]}>{!loading && !failed && latest ? `${latest.weight} kg` : "—"}</Text><Text style={{ color: c.muted, fontSize: 12 }}>Last {days} days</Text></View></View>
      {loading || failed || !points.length ? <View style={s.chartEmpty}><Ionicons name="analytics-outline" size={32} color={c.blue} /><Text style={{ color: c.muted, textAlign: "center", lineHeight: 22 }}>{loading ? "Loading your progress…" : failed ? "Progress is unavailable. Use retry below." : "No weight recorded in this period.\nAdd your first log below."}</Text></View> : <View accessible accessibilityLabel={`Weight over the last ${days} days. ${points.map(log => `${dateLabel(Date.parse(log.logged_at))}: ${log.weight} kilograms`).join(". ")}`}>
        <Svg width="100%" height={200} viewBox="0 0 320 190" accessibilityElementsHidden>
          <Defs><SvgGradient id="memberWeightFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#1677FF" stopOpacity={0.25} /><Stop offset="1" stopColor="#1677FF" stopOpacity={0} /></SvgGradient></Defs>
          {[0, 1, 2, 3].map(i => { const value = low + (high - low) * i / 3; return <G key={i}><Line x1={34} x2={304} y1={y(value)} y2={y(value)} stroke={c.border} strokeDasharray="3 4" /><SvgText x={2} y={y(value) + 4} fontSize={10} fill={c.muted}>{value.toFixed(0)}</SvgText></G>; })}
          {points.length > 1 ? <><Path d={`${path} L${x(latest!)} 150 L${x(points[0])} 150 Z`} fill="url(#memberWeightFill)" /><Path d={path} fill="none" stroke={c.blue} strokeWidth={2.5} strokeLinejoin="round" /></> : null}
          {points.map(log => <Circle key={log.progress_uuid} cx={x(log)} cy={y(log.weight!)} r={3.5} fill="#FFFFFF" stroke={c.blue} strokeWidth={2} />)}
          {[0, 1, 2].map(i => <SvgText key={i} x={34 + i * 135} y={178} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} fill={c.muted} fontSize={10}>{dateLabel(start + i * (now - start) / 2)}</SvgText>)}
        </Svg>
      </View>}
    </View>
    {!loading && !failed ? <View style={[s.card, { backgroundColor: c.card, borderColor: c.border, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 18 }]}>
      <View accessible accessibilityLabel={progress === null ? "Goal progress not set" : `Goal progress ${Math.round(progress)} percent`} style={s.ring}>
        <Svg width={104} height={104}><Circle cx={52} cy={52} r={44} fill="none" stroke={c.track} strokeWidth={9} /><Circle cx={52} cy={52} r={44} fill="none" stroke={c.blue} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 44}`} strokeDashoffset={2 * Math.PI * 44 * (1 - (progress ?? 0) / 100)} rotation={-90} origin="52,52" /></Svg>
        <Text style={[s.ringText, { color: c.text }]}>{progress === null ? "—" : `${Math.round(progress)}%`}</Text>
      </View><View style={{ flex: 1, minWidth: 130, gap: 8 }}><Text style={[s.cardTitle, { color: c.text }]}>Your goal progress</Text><Text style={{ color: c.muted, fontSize: 14, lineHeight: 22 }}>{progress === null ? "Your recorded goal progress will appear here." : "Your latest recorded milestone. Keep building your routine."}</Text></View>
    </View> : null}
  </View>;
}

const s = StyleSheet.create({
  header: { gap: 6, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  identity: { flex: 1, minWidth: 0, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  gym: { fontSize: 18, fontWeight: "700", letterSpacing: -0.4 },
  memberBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  iconButton: { minHeight: 48, minWidth: 44, alignItems: "center", justifyContent: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF5B61", position: "absolute", top: 8, right: 8 },
  greeting: { fontSize: 28, lineHeight: 35, fontWeight: "700", letterSpacing: -0.7 },
  subtitle: { fontSize: 15, lineHeight: 23 },
  hero: { borderRadius: 18, padding: 20, gap: 12, overflow: "hidden", minHeight: 238, borderWidth: 1, borderColor: "#237EFF" },
  heroImage: { position: "absolute", right: 0, top: 0, width: "56%", height: "100%", opacity: 0.35 },
  eyebrow: { color: "#E6F0FF", fontSize: 11, fontWeight: "500", letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, lineHeight: 33, fontWeight: "700", letterSpacing: -0.6 },
  heroDescription: { color: "#E6EFFF", fontSize: 15, lineHeight: 22, maxWidth: "80%" },
  primary: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#0066E5" },
  heroButton: { alignSelf: "flex-start", marginTop: 4 },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  segmented: { flexDirection: "row", padding: 4, borderWidth: 1, borderRadius: 16, gap: 4 },
  segment: { flex: 1, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 16 },
  chartHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600", lineHeight: 23 },
  weight: { fontSize: 23, fontWeight: "700", fontVariant: ["tabular-nums"] },
  chartEmpty: { minHeight: 190, justifyContent: "center", alignItems: "center", gap: 12 },
  ring: { width: 104, height: 104, alignItems: "center", justifyContent: "center" },
  ringText: { position: "absolute", fontSize: 24, fontWeight: "700" },
  pressed: { opacity: 0.72 },
});
