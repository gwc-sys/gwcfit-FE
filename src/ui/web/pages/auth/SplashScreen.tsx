import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppLogo } from "../../../../components/AppLogo";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { useSplashScreenPresentation } from "../../../../screens/auth/SplashScreen";

type GoalType = "fat_loss" | "muscle_gain" | "endurance" | "flexibility";

export function SplashScreenView({
  model,
}: {
  model: ReturnType<typeof useSplashScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const { onSkip } = model.props;
  const { width } = useWindowDimensions();
  const appTheme = useAppTheme();

  // Mode: "dark" (Vision Dark) | "light" (Vision Light)
  const [localThemeMode, setLocalThemeMode] = useState<"dark" | "light">("dark");
  const isDark = appTheme != null ? appTheme.isDark : localThemeMode === "dark";

  // Active step: 1 (Welcome), 2 (Goal), 3 (Hardware)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 2: selected goal
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("fat_loss");

  // Step 3: hardware toggles
  const [appleWatch, setAppleWatch] = useState(true);
  const [healthKit, setHealthKit] = useState(true);
  const [smartScale, setSmartScale] = useState(false);

  const toggleTheme = () => {
    if (appTheme?.toggleColorScheme) {
      appTheme.toggleColorScheme();
    }
    setLocalThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onSkip?.();
    }
  };

  // Color mappings
  const bgColors = isDark
    ? (["#000000", "#000000", "#1C1C1E"] as const)
    : (["rgba(0, 122, 255, 0.14)", "#F2F2F7", "#F2F2F7"] as const);

  const cardBg = isDark ? "#000000" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const titleColor = isDark ? "#FFFFFF" : "#000000";
  const subtitleColor = isDark ? "rgba(242, 242, 247, 0.70)" : "rgba(0, 0, 0, 0.60)";
  const footerColor = isDark ? "rgba(242, 242, 247, 0.45)" : "rgba(0, 0, 0, 0.45)";

  const pillBg = isDark ? "#1C1C1E" : "#F2F2F7";
  const pillBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const pillTextColor = isDark ? "#FFFFFF" : "#000000";

  const itemCardBg = isDark ? "#1C1C1E" : "#F2F2F7";
  const itemCardBorder = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.05)";

  return (
    <LinearGradient
      colors={bgColors as any}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.9, y: 0.9 }}
      style={styles.container}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Atmospheric ambient halos (Apple Vision Pro style) */}
      <View
        pointerEvents="none"
        style={[
          styles.glowTopLeft,
          {
            backgroundColor: isDark
              ? "rgba(0, 122, 255, 0.45)"
              : "rgba(0, 122, 255, 0.5)",
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glowBottomRight,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.45)"
              : "rgba(233, 30, 99, 0.45)",
          },
        ]}
      />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        {/* Vision Dark / Vision Light Pill */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Theme Mode"
          onPress={toggleTheme}
          style={[
            styles.topPill,
            { backgroundColor: pillBg, borderColor: pillBorder },
          ]}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={14}
            color={isDark ? "#E91E63" : "#007AFF"}
          />
          <Text style={[styles.topPillText, { color: pillTextColor }]}>
            {isDark ? "Vision Dark" : "Vision Light"}
          </Text>
        </Pressable>

        {/* Skip > Pill */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip intro"
          onPress={onSkip}
          style={[
            styles.topPill,
            { backgroundColor: pillBg, borderColor: pillBorder },
          ]}
        >
          <Text style={[styles.topPillText, { color: pillTextColor }]}>
            Skip &gt;
          </Text>
        </Pressable>
      </View>

      {/* ── Main Center Card ── */}
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              shadowColor: isDark ? "#000000" : "#1C1C1E",
              shadowOpacity: isDark ? 0.6 : 0.08,
            },
          ]}
        >
          {/* ═════════ STEP 1: WELCOME & OVERVIEW ═════════ */}
          {step === 1 && (
            <View style={styles.stepContent}>
              {/* App Icon with halo glow */}
              <View style={styles.appIconWrapper}>
                <View style={styles.appIconAmbientGlow} />
                <AppLogo size={88} chromeless />
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.cardTitle, { color: titleColor }]}>
                Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
              </Text>
              <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
                Your gym, beautifully organized.
              </Text>

              {/* 3 Feature Pills Row */}
              <View style={styles.featuresRow}>
                {/* 1. Activity */}
                <View
                  style={[
                    styles.featureItem,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                  ]}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                    <Ionicons name="pulse" size={15} color="#E91E63" />
                  </View>
                  <View>
                    <Text style={[styles.featureTitle, { color: titleColor }]}>Activity</Text>
                    <Text style={[styles.featureSub, { color: subtitleColor }]}>Ring metrics</Text>
                  </View>
                </View>

                {/* 2. Workouts */}
                <View
                  style={[
                    styles.featureItem,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                  ]}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="barbell" size={15} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={[styles.featureTitle, { color: titleColor }]}>Workouts</Text>
                    <Text style={[styles.featureSub, { color: subtitleColor }]}>Trainer plans</Text>
                  </View>
                </View>

                {/* 3. Nutrition */}
                <View
                  style={[
                    styles.featureItem,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                  ]}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: "rgba(52, 199, 89, 0.15)" }]}>
                    <Ionicons name="restaurant" size={15} color="#34C759" />
                  </View>
                  <View>
                    <Text style={[styles.featureTitle, { color: titleColor }]}>Nutrition</Text>
                    <Text style={[styles.featureSub, { color: subtitleColor }]}>Macro tracking</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ═════════ STEP 2: SELECT YOUR PRIMARY GOAL ═════════ */}
          {step === 2 && (
            <View style={styles.stepContent}>
              {/* Blue glowing target icon */}
              <View style={styles.stepIconWrapper}>
                <View style={[styles.stepIconAura, { backgroundColor: "rgba(0, 122, 255, 0.25)" }]} />
                <View style={[styles.stepIconCircle, { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7", borderColor: "rgba(0, 122, 255, 0.5)" }]}>
                  <Ionicons name="radio-button-on" size={24} color="#007AFF" />
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.cardTitle, { color: titleColor }]}>Select Your Primary Goal</Text>
              <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
                We'll tailor your dashboard and workout recommendations.
              </Text>

              {/* 4 Goals 2x2 Grid */}
              <View style={styles.goalsGrid}>
                {/* 1. Fat Loss */}
                <Pressable
                  onPress={() => setSelectedGoal("fat_loss")}
                  style={[
                    styles.goalCard,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                    selectedGoal === "fat_loss" && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIconBox, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                    <Ionicons name="flame" size={16} color="#E91E63" />
                  </View>
                  <View style={styles.goalTextCol}>
                    <Text style={[styles.goalTitle, { color: titleColor }]}>Fat Loss</Text>
                    <Text style={[styles.goalSub, { color: subtitleColor }]}>Burn calories &amp; lean</Text>
                  </View>
                </Pressable>

                {/* 2. Muscle Gain */}
                <Pressable
                  onPress={() => setSelectedGoal("muscle_gain")}
                  style={[
                    styles.goalCard,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                    selectedGoal === "muscle_gain" && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="barbell" size={16} color="#007AFF" />
                  </View>
                  <View style={styles.goalTextCol}>
                    <Text style={[styles.goalTitle, { color: titleColor }]}>Muscle Gain</Text>
                    <Text style={[styles.goalSub, { color: subtitleColor }]}>Hypertrophy &amp; power</Text>
                  </View>
                </Pressable>

                {/* 3. Endurance */}
                <Pressable
                  onPress={() => setSelectedGoal("endurance")}
                  style={[
                    styles.goalCard,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                    selectedGoal === "endurance" && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="heart" size={16} color="#007AFF" />
                  </View>
                  <View style={styles.goalTextCol}>
                    <Text style={[styles.goalTitle, { color: titleColor }]}>Endurance</Text>
                    <Text style={[styles.goalSub, { color: subtitleColor }]}>Stamina &amp; cardio</Text>
                  </View>
                </Pressable>

                {/* 4. Flexibility */}
                <Pressable
                  onPress={() => setSelectedGoal("flexibility")}
                  style={[
                    styles.goalCard,
                    { backgroundColor: itemCardBg, borderColor: itemCardBorder },
                    selectedGoal === "flexibility" && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIconBox, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                    <Ionicons name="sparkles" size={16} color="#E91E63" />
                  </View>
                  <View style={styles.goalTextCol}>
                    <Text style={[styles.goalTitle, { color: titleColor }]}>Flexibility</Text>
                    <Text style={[styles.goalSub, { color: subtitleColor }]}>Mobility &amp; balance</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* ═════════ STEP 3: SYNC FITNESS HARDWARE ═════════ */}
          {step === 3 && (
            <View style={styles.stepContent}>
              {/* Green glowing device icon */}
              <View style={styles.stepIconWrapper}>
                <View style={[styles.stepIconAura, { backgroundColor: "rgba(52, 199, 89, 0.25)" }]} />
                <View style={[styles.stepIconCircle, { backgroundColor: "rgba(52, 199, 89, 0.14)", borderColor: "rgba(52, 199, 89, 0.5)" }]}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#34C759" />
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.cardTitle, { color: titleColor }]}>Sync Fitness Hardware</Text>
              <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
                Connect your Apple Watch or smart accessories for real-time ring sync.
              </Text>

              {/* 3 Hardware Toggle Rows */}
              <View style={styles.hardwareList}>
                {/* Row 1: Apple Watch Sync */}
                <View style={[styles.hardwareRow, { backgroundColor: itemCardBg, borderColor: itemCardBorder }]}>
                  <View style={[styles.hardwareIconBox, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                    <Ionicons name="watch-outline" size={18} color="#E91E63" />
                  </View>
                  <View style={styles.hardwareTextCol}>
                    <Text style={[styles.hardwareTitle, { color: titleColor }]}>Apple Watch Sync</Text>
                    <Text style={[styles.hardwareSub, { color: subtitleColor }]}>Live heart rate &amp; calories</Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: appleWatch }}
                    onPress={() => setAppleWatch(!appleWatch)}
                    style={[
                      styles.toggleTrack,
                      { backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA" },
                      appleWatch && styles.toggleTrackActive,
                    ]}
                  >
                    <View style={[styles.toggleThumb, appleWatch && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                {/* Row 2: Apple HealthKit */}
                <View style={[styles.hardwareRow, { backgroundColor: itemCardBg, borderColor: itemCardBorder }]}>
                  <View style={[styles.hardwareIconBox, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                    <Ionicons name="heart-outline" size={18} color="#E91E63" />
                  </View>
                  <View style={styles.hardwareTextCol}>
                    <Text style={[styles.hardwareTitle, { color: titleColor }]}>Apple HealthKit</Text>
                    <Text style={[styles.hardwareSub, { color: subtitleColor }]}>Steps, distance &amp; sleep data</Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: healthKit }}
                    onPress={() => setHealthKit(!healthKit)}
                    style={[
                      styles.toggleTrack,
                      { backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA" },
                      healthKit && styles.toggleTrackActive,
                    ]}
                  >
                    <View style={[styles.toggleThumb, healthKit && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                {/* Row 3: Smart Weight Scale */}
                <View style={[styles.hardwareRow, { backgroundColor: itemCardBg, borderColor: itemCardBorder }]}>
                  <View style={[styles.hardwareIconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="scale-outline" size={18} color="#007AFF" />
                  </View>
                  <View style={styles.hardwareTextCol}>
                    <Text style={[styles.hardwareTitle, { color: titleColor }]}>Smart Weight Scale</Text>
                    <Text style={[styles.hardwareSub, { color: subtitleColor }]}>Automatic weight logging</Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: smartScale }}
                    onPress={() => setSmartScale(!smartScale)}
                    style={[
                      styles.toggleTrack,
                      { backgroundColor: isDark ? "#1C1C1E" : "#E5E5EA" },
                      smartScale && styles.toggleTrackActive,
                    ]}
                  >
                    <View style={[styles.toggleThumb, smartScale && styles.toggleThumbActive]} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* ── Main Action Button ── */}
          <Pressable
            accessibilityRole="button"
            onPress={handleNext}
            style={({ pressed }) => [
              styles.actionBtnWrap,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
          >
            <LinearGradient
              colors={["#E91E63", "#E91E63"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              <Text style={styles.actionBtnText}>
                {step === 1
                  ? "Get Started →"
                  : step === 2
                  ? "Continue to Devices →"
                  : "Complete Setup →"}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* ── 3 Pager Indicators ── */}
          <View style={styles.paginationRow}>
            <Pressable
              onPress={() => setStep(1)}
              style={[
                styles.dotInactive,
                { backgroundColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.20)" },
                step === 1 && styles.dotActiveBar,
              ]}
            />
            <Pressable
              onPress={() => setStep(2)}
              style={[
                styles.dotInactive,
                { backgroundColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.20)" },
                step === 2 && styles.dotActiveBar,
              ]}
            />
            <Pressable
              onPress={() => setStep(3)}
              style={[
                styles.dotInactive,
                { backgroundColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.20)" },
                step === 3 && styles.dotActiveBar,
              ]}
            />
          </View>

          {/* ── Footer Tagline ── */}
          <Text style={[styles.footerTagline, { color: footerColor }]}>
            SMARTER FITNESS MANAGEMENT
          </Text>
        </View>
      </View>

      {/* ── Floating Ask Gemini Pill ── */}
      <View
        style={[
          styles.floatingGeminiPill,
          {
            backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
            borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
            shadowColor: isDark ? "#000000" : "#1C1C1E",
            shadowOpacity: isDark ? 0.4 : 0.12,
          },
        ]}
      >
        <Ionicons name="sparkles" size={13} color="#007AFF" />
        <Text style={[styles.floatingGeminiText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
          Ask Gemini
        </Text>
      </View>
    </LinearGradient>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "space-between",
    padding: 24,
    overflow: "hidden",
  },

  // ── Ambient Glowing Lights
  glowTopLeft: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -120,
    right: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
  },

  // ── Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 10,
  },
  topPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    ...(Platform.OS === "web"
      ? ({ cursor: "pointer", backdropFilter: "blur(12px)" } as any)
      : {}),
  },
  topPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Center Container
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  mainCard: {
    width: "100%",
    maxWidth: 510,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 36,
    alignItems: "center",
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 36,
    elevation: 20,
    ...(Platform.OS === "web"
      ? ({ backdropFilter: "blur(24px)" } as any)
      : {}),
  },
  stepContent: {
    width: "100%",
    alignItems: "center",
  },

  // ── Step 1 App Icon
  appIconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appIconAmbientGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(233, 30, 99, 0.12)",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
  },
  appIconSquircle: {
    width: 86,
    height: 86,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  appIconLetter: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },

  // ── Step 2 & 3 Top Glowing Icons
  stepIconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepIconAura: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  stepIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Card Titles
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 380,
    marginBottom: 26,
  },

  // ── Features Row (Step 1)
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginBottom: 28,
    flexWrap: "wrap",
  },
  featureItem: {
    flex: 1,
    minWidth: 125,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  featureSub: {
    fontSize: 10,
    marginTop: 1,
  },

  // ── Goals Grid (Step 2)
  goalsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  goalCard: {
    flex: 1,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  goalCardSelected: {
    borderColor: "#E91E63",
    backgroundColor: "rgba(233, 30, 99, 0.08)",
  },
  goalIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  goalTextCol: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  goalSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Hardware List (Step 3)
  hardwareList: {
    width: "100%",
    gap: 10,
    marginBottom: 28,
  },
  hardwareRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  hardwareIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hardwareTextCol: {
    flex: 1,
  },
  hardwareTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  hardwareSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Toggle Switch
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    paddingHorizontal: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  toggleTrackActive: {
    backgroundColor: "#34C759",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // ── Action Button
  actionBtnWrap: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    marginBottom: 20,
  },
  actionBtnGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // ── Pagination Indicators
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F2F2F7",
  },
  dotActiveBar: {
    width: 26,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E91E63",
  },

  // ── Footer Tagline
  footerTagline: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── Floating Gemini Pill
  floatingGeminiPill: {
    position: "absolute",
    bottom: 24,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingGeminiText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
