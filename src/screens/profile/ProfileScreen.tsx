import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { InfoRow } from "../../components/InfoRow";
import { PhotoCard } from "../../components/PhotoCard";
import { QuickAction } from "../../components/QuickAction";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { images } from "../../data/media";
import { workoutPlans } from "../../data/workouts";
import { MemberProfilePanel } from "../../features/rbac/MemberProfilePanel";
import { useAuthStore } from "../../store/useAuthStore";
import { useFitnessStore } from "../../store/useFitnessStore";
import { colors, radius, spacing, typography } from "../../theme/theme";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const { profile, setSelectedPlan } = useFitnessStore();
  const savedPlan = workoutPlans[1] ?? workoutPlans[0];
  const displayName = user?.full_name ?? profile.name;

  const openSavedPlan = () => {
    setSelectedPlan(savedPlan.id);
    navigation.navigate("WorkoutPlan", { planId: savedPlan.id });
  };

  return (
    <Screen scroll noPadding>
      <ImageBackground source={images.trainerEmma} resizeMode="cover" style={styles.hero}>
        <LinearGradient colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0.78)"]} style={styles.heroOverlay}>
          <View style={styles.heroTop}>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Settings")} style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color={colors.white} />
            </Pressable>
          </View>
          <View>
            <StatusBadge label={(user?.role ?? "member").replace("_", " ")} tone="info" />
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.goal}>{profile.goal}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.heightCm}</Text>
            <Text style={styles.statLabel}>Height cm</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.weightKg}</Text>
            <Text style={styles.statLabel}>Weight kg</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.waterCups}</Text>
            <Text style={styles.statLabel}>Water cups</Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction icon="trophy-outline" title="Goal" subtitle={profile.goal} tone="primary" />
          <QuickAction icon="barbell-outline" title="Level" subtitle={profile.level} tone="info" />
        </View>

        <SurfacePanel title="Profile Details" icon="person-outline">
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? "Not set"} />
          <InfoRow icon="person-outline" label="Training level" value={profile.level} />
          <InfoRow icon="notifications-outline" label="Reminders" value="Enabled" onPress={() => navigation.navigate("Settings")} />
        </SurfacePanel>

        <MemberProfilePanel enabled={user?.role === "member"} />

        <Text style={styles.sectionTitle}>Saved Programs</Text>
        <PhotoCard
          image={savedPlan.heroImage}
          title={savedPlan.title}
          meta={`${savedPlan.durationWeeks} weeks - ${savedPlan.sessionsPerWeek}x/week`}
          buttonLabel="Resume"
          onPress={openSavedPlan}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 390,
    backgroundColor: colors.dark
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  heroTop: {
    alignItems: "flex-end"
  },
  iconButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  name: {
    ...typography.title,
    color: colors.white,
    marginTop: spacing.md
  },
  goal: {
    ...typography.body,
    color: "rgba(255,255,255,0.74)"
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 112,
    paddingTop: spacing.lg,
    backgroundColor: colors.background
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  stat: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  },
  statValue: {
    ...typography.h2,
    color: colors.ink
  },
  statLabel: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center"
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink
  }
});
