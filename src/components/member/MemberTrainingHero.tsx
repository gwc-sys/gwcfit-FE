import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  workoutTitle?: string;
  completed: number;
  target: number;
  loading: boolean;
  unavailable: boolean;
  onWorkout: () => void;
  onProgress: () => void;
};

/** A visual entry point into existing member routes; no data or training logic. */
export function MemberTrainingHero({ workoutTitle, completed, target, loading, unavailable, onWorkout, onProgress }: Props) {
  return <LinearGradient colors={["#1468E8", "#1044A0", "#122D58"]}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
    <View pointerEvents="none" style={s.orbit} />
    <View style={s.top}>
      <View style={s.badge}><Ionicons name="flash" size={13} color="#DCEAFF" /><Text style={s.eyebrow}>YOUR NEXT MOVE</Text></View>
      <Ionicons name="barbell-outline" size={28} color="#DCEAFF" />
    </View>
    <Text accessibilityRole="header" style={s.title}>{loading ? "Getting you ready…" : unavailable ? "Your fitness workspace" : workoutTitle || "Make time for yourself."}</Text>
    <Text style={s.description}>{loading ? "Loading your latest training details." : unavailable ? "Refresh the dashboard to see your latest training details." : workoutTitle ? "Your plan is ready. Take it one session at a time." : "Explore your workouts and build a routine that works for you."}</Text>
    <View style={s.footer}>
      <Pressable accessibilityRole="button" accessibilityLabel="View my workouts" onPress={onWorkout}
        style={({ pressed }) => [s.button, pressed && s.pressed]}>
        <Text style={s.buttonText}>View workouts</Text><Ionicons name="arrow-forward" size={17} color="#124AA1" />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="View monthly workout progress" onPress={onProgress}
        style={({ pressed }) => [s.progress, pressed && s.pressed]}>
        <Text style={s.progressValue}>{loading || unavailable ? "—" : target > 0 ? `${completed} / ${target}` : String(completed)}</Text>
        <Text style={s.progressLabel}>workouts this month <Ionicons name="chevron-forward" size={11} /></Text>
      </Pressable>
    </View>
  </LinearGradient>;
}

const s = StyleSheet.create({
  hero: { borderRadius: 24, padding: 24, gap: 16, overflow: "hidden", minHeight: 240 },
  orbit: { position: "absolute", width: 280, height: 280, borderRadius: 140, borderWidth: 45, borderColor: "rgba(255,255,255,0.045)", right: -90, top: -80 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "rgba(255,255,255,0.12)" },
  eyebrow: { color: "#E4EEFF", fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  title: { color: "#FFFFFF", fontSize: 28, lineHeight: 35, fontWeight: "700", letterSpacing: -0.7, maxWidth: 700 },
  description: { color: "#D8E6FF", fontSize: 14, lineHeight: 22, maxWidth: 520 },
  footer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 4 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: "#FFFFFF", paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonText: { color: "#124AA1", fontSize: 14, fontWeight: "700" },
  progress: { minHeight: 48, justifyContent: "center", gap: 4 },
  progressValue: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  progressLabel: { color: "#D8E6FF", fontSize: 11 },
  pressed: { opacity: 0.75 },
});
