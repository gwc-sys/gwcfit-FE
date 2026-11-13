import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { ALPHA } from "../../theme/colors";

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
  const { colors } = useAppTheme();

  return (
    <View style={[s.hero, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
      <View style={[s.orbit, { borderColor: colors.separator, pointerEvents: "none" }]} />
      <View style={s.top}>
        <View style={[s.badge, { backgroundColor: ALPHA.accent10 }]}>
          <Ionicons name="flash" size={13} color={colors.primary} />
          <Text style={[s.eyebrow, { color: colors.primary }]}>YOUR NEXT MOVE</Text>
        </View>
        <Ionicons name="barbell-outline" size={28} color={colors.primary} />
      </View>
      <Text accessibilityRole="header" style={[s.title, { color: colors.text }]}>
        {loading ? "Getting you ready…" : unavailable ? "Your fitness workspace" : workoutTitle || "Make time for yourself."}
      </Text>
      <Text style={[s.description, { color: colors.textMuted }]}>
        {loading ? "Loading your latest training details." : unavailable ? "Refresh the dashboard to see your latest training details." : workoutTitle ? "Your plan is ready. Take it one session at a time." : "Explore your workouts and build a routine that works for you."}
      </Text>
      <View style={s.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel="View my workouts" onPress={onWorkout}
          style={({ pressed }) => [s.button, { backgroundColor: colors.primary }, pressed && s.pressed]}>
          <Text style={[s.buttonText, { color: colors.textOnPrimary }]}>View workouts</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.textOnPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="View monthly workout progress" onPress={onProgress}
          style={({ pressed }) => [s.progress, pressed && s.pressed]}>
          <Text style={[s.progressValue, { color: colors.text }]}>{loading || unavailable ? "—" : target > 0 ? `${completed} / ${target}` : String(completed)}</Text>
          <Text style={[s.progressLabel, { color: colors.textMuted }]}>workouts this month <Ionicons name="chevron-forward" size={11} /></Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 24, padding: 24, gap: 16, overflow: "hidden", minHeight: 240 },
  orbit: { position: "absolute", width: 280, height: 280, borderRadius: 140, borderWidth: 45, right: -90, top: -80 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  title: { fontSize: 28, lineHeight: 35, fontWeight: "700", letterSpacing: -0.7, maxWidth: 700 },
  description: { fontSize: 14, lineHeight: 22, maxWidth: 520 },
  footer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 4 },
  button: { minHeight: 48, borderRadius: 14, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonText: { fontSize: 14, fontWeight: "700" },
  progress: { minHeight: 48, justifyContent: "center", gap: 4 },
  progressValue: { fontSize: 20, fontWeight: "700" },
  progressLabel: { fontSize: 11 },
  pressed: { opacity: 0.75 },
});
