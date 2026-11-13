import React, { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Pressable } from "../../components/NativePressable";
import { Screen } from "../../components/Screen";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { useSplashScreenPresentation } from "../../../../screens/auth/SplashScreen";

export function SplashScreenView({
  model,
}: {
  model: ReturnType<typeof useSplashScreenPresentation>;
}): React.ReactNode {
  const { colors, isDark, toggleColorScheme } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const { width, height } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const { onSkip } = model.props;

  // Active step: 0 (Welcome), 1 (Goal Selection), 2 (Hardware Sync)
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Selected goal in Step 2
  const [selectedGoal, setSelectedGoal] = useState<string>("muscle-gain");

  // Hardware sync toggles in Step 3
  const [hardwareSync, setHardwareSync] = useState<Record<string, boolean>>({
    appleWatch: false,
    healthKit: true,
    smartScale: false,
  });

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      onSkip?.();
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleHardwareToggle = (key: string) => {
    setHardwareSync((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const goals = [
    {
      id: "fat-loss",
      title: "Fat Loss",
      subtext: "Burn calories & lean",
    },
    {
      id: "muscle-gain",
      title: "Muscle Gain",
      subtext: "Hypertrophy & power",
    },
    {
      id: "endurance",
      title: "Endurance",
      subtext: "Stamina & cardio",
    },
    {
      id: "flexibility",
      title: "Flexibility",
      subtext: "Mobility & balance",
    },
  ];

  const hardwareOptions = [
    {
      key: "appleWatch",
      title: "Apple Watch Sync",
      subtext: "Live heart rate & calories",
    },
    {
      key: "healthKit",
      title: "Apple HealthKit",
      subtext: "Steps, distance & sleep data",
    },
    {
      key: "smartScale",
      title: "Smart Weight Scale",
      subtext: "Automatic weight logging",
    },
  ];

  return (
    <Screen
      scroll
      noPadding
      reference={false}
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: vp.horizontalPadding,
          paddingBottom: Math.max(vp.safeBottomPadding, 24),
        },
      ]}
    >
      {/* ── Top Navigation Bar ── */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Theme Mode"
          onPress={toggleColorScheme}
          style={styles.themeBadge}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={15}
            color={isDark ? "#E91E63" : "#007AFF"}
          />
          <Text style={styles.themeBadgeText}>
            {isDark ? "Vision Dark" : "Vision Light"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip Onboarding"
          onPress={() => onSkip?.()}
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.skipButtonText}>Skip &gt;</Text>
        </Pressable>
      </View>

      {/* ── Middle Step Content ── */}
      <View style={styles.stepContentWrap}>
        {/* STEP 1: Welcome Screen (PulseFit) */}
        {step === 0 && (
          <View style={styles.stepWrapper}>
            {/* Centered Brand Icon */}
            <AppLogo size={84} chromeless />

            {/* Title Block */}
            <View style={styles.titleBlock}>
              <Text style={styles.mainTitle}>
                Pulse<Text style={{ color: "#E91E63" }}>Fit</Text>
              </Text>
              <Text style={styles.mainSubtitle}>Your gym, beautifully organized.</Text>
            </View>

            {/* Feature Pills */}
            <View style={styles.featurePillsRow}>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>Activity</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>Workouts</Text>
              </View>
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>Nutrition</Text>
              </View>
            </View>

            {/* Primary CTA Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={handleNext}
              style={({ pressed }) => [styles.primaryCtaButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryCtaText}>Get Started →</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 2: Goal Selection Screen */}
        {step === 1 && (
          <View style={styles.stepWrapper}>
            {/* Header Icon: Target Concentric Ring */}
            <View style={styles.targetIconContainer}>
              <Ionicons name="disc-outline" size={26} color="#007AFF" />
            </View>

            {/* Title Block */}
            <View style={styles.titleBlock}>
              <Text style={styles.stepHeading}>Select Your Primary Goal</Text>
              <Text style={styles.stepSubheading}>We'll tailor your rings and training routines.</Text>
            </View>

            {/* 2x2 Goal Cards Grid */}
            <View style={styles.goalsGrid}>
              {goals.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                return (
                  <Pressable
                    key={goal.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${goal.title}, ${goal.subtext}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleGoalSelect(goal.id)}
                    style={({ pressed }) => [
                      styles.goalCard,
                      isSelected ? styles.goalCardSelected : styles.goalCardNormal,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.goalCardTitle,
                        isSelected && styles.goalCardTitleSelected,
                      ]}
                    >
                      {goal.title}
                    </Text>
                    <Text style={styles.goalCardSubtext}>{goal.subtext}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Primary CTA Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue to Devices"
              onPress={handleNext}
              style={({ pressed }) => [styles.primaryCtaButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryCtaText}>Continue to Devices →</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 3: Hardware Sync Screen */}
        {step === 2 && (
          <View style={styles.stepWrapper}>
            {/* Header Icon: Green Device Container */}
            <View style={styles.hardwareIconContainer}>
              <Ionicons name="phone-portrait-outline" size={24} color="#34C759" />
            </View>

            {/* Title Block */}
            <View style={styles.titleBlock}>
              <Text style={styles.stepHeading}>Sync Fitness Hardware</Text>
              <Text style={styles.stepSubheading}>Connect your Apple Watch or smart gym accessories.</Text>
            </View>

            {/* Device Selection Cards Container */}
            <View style={styles.hardwareCardContainer}>
              {hardwareOptions.map((opt, i) => {
                const isChecked = !!hardwareSync?.[opt.key];
                return (
                  <View key={opt.key}>
                    {i > 0 && <View style={styles.hardwareDivider} />}
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${opt.title}, ${opt.subtext}`}
                      accessibilityState={{ checked: isChecked }}
                      onPress={() => handleHardwareToggle(opt.key)}
                      style={({ pressed }) => [
                        styles.hardwareRow,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View style={styles.hardwareTextCol}>
                        <Text style={styles.hardwareTitle}>{opt.title}</Text>
                        <Text style={styles.hardwareSubtext}>{opt.subtext}</Text>
                      </View>

                      {/* Checkbox */}
                      <View
                        style={[
                          styles.checkboxBase,
                          isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
                        ]}
                      >
                        {isChecked && (
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Primary CTA Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Complete Setup"
              onPress={() => onSkip?.()}
              style={({ pressed }) => [styles.primaryCtaButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryCtaText}>Complete Setup →</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Bottom Navigation Indicator (Pagination Dots) ── */}
      <View style={styles.paginationDots}>
        {[0, 1, 2].map((stepIdx) => {
          const isActive = stepIdx === step;
          return (
            <View
              key={stepIdx}
              style={[
                styles.dot,
                isActive ? styles.activeDotPill : styles.inactiveDotCircle,
              ]}
            />
          );
        })}
      </View>
    </Screen>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      maxWidth: 480,
      alignSelf: "center",
      width: "100%",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      marginBottom: 16,
    },
    themeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 16,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    themeBadgeText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.ink,
    },
    skipButton: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    skipButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#E91E63",
    },
    stepContentWrap: {
      flex: 1,
      justifyContent: "center",
      paddingVertical: 20,
    },
    stepWrapper: {
      alignItems: "center",
      gap: 20,
    },
    brandIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.55,
      shadowRadius: 18,
      elevation: 8,
    },
    brandIconText: {
      fontSize: 34,
      fontWeight: "900",
      color: "#FFFFFF",
    },
    titleBlock: {
      alignItems: "center",
      gap: 4,
    },
    mainTitle: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.ink,
      letterSpacing: -0.5,
    },
    mainSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    stepHeading: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.ink,
      letterSpacing: -0.3,
      textAlign: "center",
    },
    stepSubheading: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 320,
    },
    featurePillsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 2,
      marginBottom: 8,
    },
    featurePill: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featurePillText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.ink,
    },
    primaryCtaButton: {
      width: "100%",
      backgroundColor: "#E91E63",
      height: 50,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 6,
      marginTop: 8,
    },
    primaryCtaText: {
      fontSize: 15,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    targetIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: "rgba(0, 122, 255, 0.35)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    goalsGrid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
    },
    goalCard: {
      width: "48%",
      padding: 16,
      borderRadius: 18,
      minHeight: 96,
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center",
      gap: 4,
    },
    goalCardNormal: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalCardSelected: {
      borderWidth: 1.5,
      borderColor: "#E91E63",
    },
    goalCardTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.ink,
    },
    goalCardTitleSelected: {
      color: "#E91E63",
    },
    goalCardSubtext: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    hardwareIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: "rgba(52, 199, 89, 0.35)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#34C759",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    hardwareCardContainer: {
      width: "100%",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    hardwareRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    hardwareDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    hardwareTextCol: {
      gap: 3,
      flex: 1,
      marginRight: 12,
    },
    hardwareTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.ink,
    },
    hardwareSubtext: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    checkboxBase: {
      width: 20,
      height: 20,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: "#E91E63",
    },
    checkboxUnchecked: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    paginationDots: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
    },
    dot: {
      borderRadius: 2,
    },
    activeDotPill: {
      width: 24,
      height: 4,
      backgroundColor: "#E91E63",
    },
    inactiveDotCircle: {
      width: 5,
      height: 4,
      backgroundColor: isDark ? "#2C2C2E" : "#D1D1D6",
    },
  });
