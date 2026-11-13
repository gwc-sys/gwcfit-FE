import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import type * as React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { Pressable } from "../../components/NativePressable";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";

import type { useMemberDashboardScreenPresentation } from "../../../../screens/member/MemberDashboardScreen";

export {
  PanelView,
  StatTileView,
  QuickActionTileView,
  StatusPillView,
  ScheduleRowView,
  ProgressCircleView,
  DashboardStateView,
} from "../../../web/pages/member/MemberDashboardScreen";

function getInitials(name?: string | null, fallback = "MB"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function formatHeaderDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function formatCompactTime(value?: string | null, fallback = "08:00 AM"): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function clampValue(val: number, min = 0, max = 100): number {
  return Math.min(Math.max(val, min), max);
}

export function MemberDashboardScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberDashboardScreenPresentation>;
}): React.ReactNode {
  const { width = 390, height = 844 } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  const [ringScale, setRingScale] = useState(1);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => {
      setRingScale(1);
      setCelebrating(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [celebrating]);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const {
    dailyActivity,
    todayCalories,
    isRefreshing,
    refreshAll,
    memberName,
    navigateTo,
    unreadNotifications,
    completedWorkouts,
    caloriesTarget,
    formatNumber,
    monthlyCalories,
    workouts,
    attendance,
    trainer,
    meals,
    todayWorkout,
    todayMeal,
    upcomingClass,
    workoutDone,
    sensorSteps,
    sensorHours,
  } = model.props as any;

  const triggerReanimate = () => {
    setRingScale(0.15);
    setCelebrating(true);
    refreshAll?.();
  };

  // Ring 1: Move (Calories)
  const moveGoal = Math.max(1, Math.round(caloriesTarget > 0 ? caloriesTarget : 250));
  const rawMoveCalories =
    todayCalories > 0
      ? Math.round(todayCalories)
      : monthlyCalories > 0
        ? Math.round(monthlyCalories)
        : completedWorkouts > 0
          ? completedWorkouts * 180
          : 0;
  const movePercent = Math.round((rawMoveCalories / moveGoal) * 100);

  // Ring 2: Exercise (Minutes)
  const exerciseGoal = 30;
  const workoutDuration =
    Number((todayWorkout?.today_workout as any)?.duration_minutes) ||
    (workoutDone ? 30 : Math.min(30, (completedWorkouts ?? 0) * 15));
  const exerciseMinutes = Math.max(0, Math.round(workoutDuration));
  const exercisePercent = Math.round((exerciseMinutes / exerciseGoal) * 100);

  // Ring 3: Stand (Hours)
  const standGoal = Math.max(1, dailyActivity?.active_hours_target ?? 12);
  const standHours = Math.max(
    0,
    dailyActivity?.active_hours_completed ??
      (Array.isArray(sensorHours) && sensorHours.length > 0
        ? sensorHours.length
        : (attendance?.monthly_attendance_count ?? 0) > 0
          ? Math.min(12, Math.max(1, (attendance?.monthly_attendance_count ?? 0) * 2))
          : 0),
  );
  const standPercent = Math.round((standHours / standGoal) * 100);

  // Overall Closed %
  const overallClosedPercent = Math.round(
    (clampValue(movePercent, 0, 100) +
      clampValue(exercisePercent, 0, 100) +
      clampValue(standPercent, 0, 100)) /
      3,
  );

  // SVG Ring geometry (fluidly scaled for 320px - 440px+ viewports)
  const svgSize = vp.isUltraCompact ? 124 : vp.isCompact ? 138 : vp.isLargePhone ? 158 : 152;
  const center = svgSize / 2;
  const strokeWidth = vp.isUltraCompact ? 11 : 13;
  const rMove = Math.round(svgSize * 0.408);
  const rExercise = Math.round(svgSize * 0.296);
  const rStand = Math.round(svgSize * 0.184);

  const cMove = 2 * Math.PI * rMove;
  const cExercise = 2 * Math.PI * rExercise;
  const cStand = 2 * Math.PI * rStand;

  const moveDashOffset =
    cMove - (clampValue(movePercent * ringScale, 4, 100) / 100) * cMove;
  const exerciseDashOffset =
    cExercise - (clampValue(exercisePercent * ringScale, 4, 100) / 100) * cExercise;
  const standDashOffset =
    cStand - (clampValue(standPercent * ringScale, 4, 100) / 100) * cStand;

  // Steps & Distance
  const stepsCount =
    typeof sensorSteps === "number" && sensorSteps >= 0
      ? sensorSteps
      : typeof (dailyActivity as any)?.steps === "number" && (dailyActivity as any).steps >= 0
        ? (dailyActivity as any).steps
        : 0;
  const stepsGoal = 10000;
  const stepsProgress = clampValue(Math.round((stepsCount / stepsGoal) * 100), 0, 100);

  const distanceKm = (stepsCount * 0.0006542).toFixed(2);
  const flightsClimbed = Math.max(0, Math.round(stepsCount / 1070));
  const distanceProgress = clampValue(Math.round((Number(distanceKm) / 6.5) * 100), 0, 100);

  // Today's Schedule items
  const primaryWorkout = todayWorkout ?? workouts?.[0] ?? null;
  const primaryMeal = todayMeal ?? meals?.[0] ?? null;
  const resolvedTrainerName =
    trainer?.trainer_name ??
    primaryWorkout?.trainer_name ??
    workouts?.[0]?.trainer_name ??
    null;
  const shortCoachName = resolvedTrainerName
    ? resolvedTrainerName.startsWith("Trainer ")
      ? `Coach ${resolvedTrainerName.replace(/^Trainer\s+/i, "")}`
      : resolvedTrainerName.startsWith("Coach ")
        ? resolvedTrainerName
        : `Coach ${resolvedTrainerName.split(" ")[0]}`
    : null;

  const userInitials = getInitials(memberName, "MB");
  const trainerInitials = resolvedTrainerName
    ? getInitials(resolvedTrainerName, "TR")
    : "TR";
  const unreadCount = Array.isArray(unreadNotifications) ? unreadNotifications.length : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingHorizontal: vp.horizontalPadding,
            paddingBottom: vp.safeBottomPadding,
            gap: vp.gridGap + 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isRefreshing)}
            onRefresh={refreshAll}
            tintColor="#E91E63"
          />
        }
      >
        {/* Dynamic Island Status Capsule */}
        <View style={styles.islandRow}>
          <View style={styles.dynamicIsland}>
            <AppLogo size={16} chromeless />
            <Text style={styles.islandText}>PulseFit</Text>
            <View style={styles.islandGreenRing}>
              <View style={styles.islandGreenDot} />
            </View>
          </View>
        </View>

        {/* Top Bar: APPLE FITNESS RINGS & TODAY + Bell + Avatar */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topKicker} numberOfLines={1}>
            APPLE FITNESS RINGS & TODAY
          </Text>
          <View style={styles.topHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigateTo?.("MemberNotifications")}
              style={styles.bellButton}
            >
              <Ionicons name="notifications-outline" size={21} color="#F2F2F7" />
              {unreadCount >= 0 ? <View style={styles.bellBadgeDot} /> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member Profile"
              onPress={() => navigateTo?.("MemberProfileHome")}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.headerDivider,
            { marginHorizontal: -vp.horizontalPadding },
          ]}
        />

        {/* Date + Summary Hero Row */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.dateLabel} numberOfLines={1}>
              {formatHeaderDate(new Date())}
            </Text>
            <Text
              style={[styles.heroTitle, { fontSize: vp.heroTitleSize }]}
              numberOfLines={1}
            >
              Summary
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Re-animate rings"
            onPress={triggerReanimate}
            style={styles.reanimateButton}
          >
            <Ionicons name="refresh" size={15} color="#E91E63" />
            <Text style={styles.reanimateText}>Re-animate</Text>
          </Pressable>
        </View>

        {/* Apple Fitness Rings Card */}
        <View style={[styles.ringsCard, { padding: vp.cardPadding }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Goals and Activity"
            onPress={() => navigateTo?.("MemberGoals")}
            style={[styles.ringsMainRow, { gap: vp.isUltraCompact ? 10 : 16 }]}
          >
            {/* Concentric SVG Rings */}
            <View
              style={[
                styles.ringsSvgContainer,
                { width: svgSize, height: svgSize },
              ]}
            >
              <Svg width={svgSize} height={svgSize}>
                {/* Track Circles */}
                <Circle
                  cx={center}
                  cy={center}
                  r={rMove}
                  stroke="rgba(233, 30, 99, 0.18)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={center}
                  cy={center}
                  r={rExercise}
                  stroke="rgba(52, 199, 89, 0.18)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={center}
                  cy={center}
                  r={rStand}
                  stroke="rgba(0, 122, 255, 0.18)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Progress Circles */}
                <Circle
                  cx={center}
                  cy={center}
                  r={rMove}
                  stroke="#E91E63"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${cMove} ${cMove}`}
                  strokeDashoffset={moveDashOffset}
                  rotation="-90"
                  origin={`${center}, ${center}`}
                  fill="none"
                />
                <Circle
                  cx={center}
                  cy={center}
                  r={rExercise}
                  stroke="#34C759"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${cExercise} ${cExercise}`}
                  strokeDashoffset={exerciseDashOffset}
                  rotation="-90"
                  origin={`${center}, ${center}`}
                  fill="none"
                />
                <Circle
                  cx={center}
                  cy={center}
                  r={rStand}
                  stroke="#007AFF"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${cStand} ${cStand}`}
                  strokeDashoffset={standDashOffset}
                  rotation="-90"
                  origin={`${center}, ${center}`}
                  fill="none"
                />
              </Svg>
              <View style={styles.ringsCenterOverlay}>
                <Text style={styles.ringsCenterPercent}>{overallClosedPercent}%</Text>
                <Text style={styles.ringsCenterSub}>CLOSED</Text>
              </View>
            </View>

            {/* Right Metrics Column */}
            <View style={styles.ringsStatsCol}>
              {/* Move */}
              <View style={styles.ringStatBlock}>
                <View style={styles.ringStatHeader}>
                  <View style={styles.ringStatTitleRow}>
                    <View style={[styles.ringDot, { backgroundColor: "#E91E63" }]} />
                    <Text style={styles.ringStatName}>Move</Text>
                  </View>
                  <Text style={[styles.ringStatPercent, { color: "#E91E63" }]}>
                    {movePercent}%
                  </Text>
                </View>
                <Text style={styles.ringStatValueLine}>
                  <Text style={styles.ringStatValueStrong}>{rawMoveCalories}</Text>
                  <Text style={styles.ringStatUnit}> / {moveGoal} CAL</Text>
                </Text>
              </View>

              {/* Exercise */}
              <View style={styles.ringStatBlock}>
                <View style={styles.ringStatHeader}>
                  <View style={styles.ringStatTitleRow}>
                    <View style={[styles.ringDot, { backgroundColor: "#34C759" }]} />
                    <Text style={styles.ringStatName}>Exercise</Text>
                  </View>
                  <Text style={[styles.ringStatPercent, { color: "#34C759" }]}>
                    {exercisePercent}%
                  </Text>
                </View>
                <Text style={styles.ringStatValueLine}>
                  <Text style={styles.ringStatValueStrong}>{exerciseMinutes}</Text>
                  <Text style={styles.ringStatUnit}> / {exerciseGoal} MIN</Text>
                </Text>
              </View>

              {/* Stand */}
              <View style={styles.ringStatBlock}>
                <View style={styles.ringStatHeader}>
                  <View style={styles.ringStatTitleRow}>
                    <View style={[styles.ringDot, { backgroundColor: "#007AFF" }]} />
                    <Text style={styles.ringStatName}>Stand</Text>
                  </View>
                  <Text style={[styles.ringStatPercent, { color: "#007AFF" }]}>
                    {standPercent}%
                  </Text>
                </View>
                <Text style={styles.ringStatValueLine}>
                  <Text style={styles.ringStatValueStrong}>{standHours}</Text>
                  <Text style={styles.ringStatUnit}> / {standGoal} HRS</Text>
                </Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.ringsCardDivider} />

          <View style={styles.ringsFooterRow}>
            <View style={styles.ringsFooterLeft}>
              <Ionicons name="checkmark-done" size={16} color="#34C759" />
              <Text style={styles.ringsFooterText}>
                {overallClosedPercent >= 100
                  ? "All 3 rings closed today!"
                  : "On track to close all 3 rings today"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Celebrate"
              onPress={triggerReanimate}
            >
              <Text style={styles.celebrateLink}>Celebrate</Text>
            </Pressable>
          </View>
        </View>

        {/* 4 Quick Action Square Tiles */}
        <View style={styles.quickActionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Workout"
            onPress={() => navigateTo?.("MemberWorkout")}
            style={styles.quickActionTile}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: "rgba(233, 30, 99, 0.16)" },
              ]}
            >
              <Ionicons name="play" size={18} color="#E91E63" />
            </View>
            <Text style={styles.quickActionLabel}>{"Start\nWorkout"}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Meal Plan"
            onPress={() => navigateTo?.("MemberMealPlan")}
            style={styles.quickActionTile}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: "rgba(52, 199, 89, 0.15)" },
              ]}
            >
              <Ionicons name="nutrition-outline" size={19} color="#34C759" />
            </View>
            <Text style={styles.quickActionLabel}>Meal Plan</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log Weight"
            onPress={() => navigateTo?.("MemberProgress")}
            style={styles.quickActionTile}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: "rgba(0, 122, 255, 0.16)" },
              ]}
            >
              <Ionicons name="scale-outline" size={18} color="#007AFF" />
            </View>
            <Text style={styles.quickActionLabel}>Log Weight</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Book Class"
            onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
            style={styles.quickActionTile}
          >
            <View
              style={[
                styles.quickActionIconCircle,
                { backgroundColor: "rgba(0, 122, 255, 0.16)" },
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color="#007AFF" />
            </View>
            <Text style={styles.quickActionLabel}>Book Class</Text>
          </Pressable>
        </View>

        {/* Steps & Distance Side-by-Side Cards */}
        <View style={styles.metricsDuoRow}>
          {/* Steps Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Goals and Activity from Steps"
            onPress={() => navigateTo?.("MemberGoals")}
            style={styles.metricDuoCard}
          >
            <View style={styles.metricDuoHeader}>
              <View style={styles.metricDuoTitleWrap}>
                <Ionicons name="footsteps-outline" size={14} color="#007AFF" />
                <Text style={[styles.metricDuoTitle, { color: "#007AFF" }]}>Steps</Text>
              </View>
              <Text style={styles.metricDuoRightMeta}>Goal: 10,000</Text>
            </View>
            <Text style={styles.metricDuoBigValue}>
              {formatNumber ? formatNumber(stepsCount) : stepsCount.toLocaleString()}
            </Text>
            <Text style={styles.metricDuoSubtext}>Synced from Apple Watch</Text>
            <View style={styles.metricBarTrack}>
              <View
                style={[
                  styles.metricBarFill,
                  {
                    width: `${Math.max(8, stepsProgress)}%`,
                    backgroundColor: "#007AFF",
                  },
                ]}
              />
            </View>
          </Pressable>

          {/* Distance Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Goals and Activity from Distance"
            onPress={() => navigateTo?.("MemberGoals")}
            style={styles.metricDuoCard}
          >
            <View style={styles.metricDuoHeader}>
              <View style={styles.metricDuoTitleWrap}>
                <Ionicons name="navigate-outline" size={14} color="#007AFF" />
                <Text style={[styles.metricDuoTitle, { color: "#007AFF" }]}>
                  Distance
                </Text>
              </View>
              <Text style={styles.metricDuoRightMeta}>Today</Text>
            </View>
            <Text style={styles.metricDuoBigValue}>
              {distanceKm}
              <Text style={styles.metricDuoUnit}> km</Text>
            </Text>
            <Text style={styles.metricDuoSubtext}>{flightsClimbed} Flights climbed</Text>
            <View style={styles.metricBarTrack}>
              <View
                style={[
                  styles.metricBarFill,
                  {
                    width: `${Math.max(8, distanceProgress)}%`,
                    backgroundColor: "#007AFF",
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* TODAY'S SCHEDULE Card */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeaderRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Today's Schedule"
              onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
              style={styles.scheduleHeaderLeft}
            >
              <Ionicons name="time-outline" size={15} color="#E91E63" />
              <Text style={styles.scheduleHeaderTitle}>{"TODAY'S SCHEDULE"}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View All Schedule"
              onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.scheduleList}>
            {primaryWorkout || primaryMeal || upcomingClass ? (
              <>
                {primaryWorkout ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      navigateTo?.("MemberWorkout", {
                        tab: "plans",
                        workoutPlanUuid: primaryWorkout.workout_plan_uuid,
                      })
                    }
                    style={styles.scheduleItemCard}
                  >
                    <View
                      style={[
                        styles.scheduleItemIconWrap,
                        { backgroundColor: "rgba(52, 199, 89, 0.14)" },
                      ]}
                    >
                      <Ionicons name="barbell-outline" size={18} color="#34C759" />
                    </View>
                    <View style={styles.scheduleItemInfo}>
                      <Text style={styles.scheduleItemTitle} numberOfLines={1}>
                        {primaryWorkout.workout_plan_name}
                      </Text>
                      <Text style={styles.scheduleItemSub} numberOfLines={1}>
                        {`${formatCompactTime(primaryWorkout.starts_at, "Scheduled")} • ${rawMoveCalories > 0 ? `${rawMoveCalories} kcal` : "Workout"} • ${shortCoachName ?? "Assigned Plan"}`}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scheduleStatusPill,
                        workoutDone ||
                        primaryWorkout?.completion_status?.toLowerCase() === "completed"
                          ? styles.scheduleStatusCompleted
                          : styles.scheduleStatusUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scheduleStatusText,
                          workoutDone ||
                          primaryWorkout?.completion_status?.toLowerCase() === "completed"
                            ? styles.scheduleStatusTextCompleted
                            : styles.scheduleStatusTextUpcoming,
                        ]}
                      >
                        {workoutDone ||
                        primaryWorkout?.completion_status?.toLowerCase() === "completed"
                          ? "Completed"
                          : "Upcoming"}
                      </Text>
                    </View>
                  </Pressable>
                ) : null}

                {primaryMeal ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigateTo?.("MemberMealPlan")}
                    style={styles.scheduleItemCard}
                  >
                    <View
                      style={[
                        styles.scheduleItemIconWrap,
                        { backgroundColor: "rgba(233, 30, 99, 0.14)" },
                      ]}
                    >
                      <Ionicons name="restaurant-outline" size={18} color="#E91E63" />
                    </View>
                    <View style={styles.scheduleItemInfo}>
                      <Text style={styles.scheduleItemTitle} numberOfLines={1}>
                        {primaryMeal.meal_plan_name}
                      </Text>
                      <Text style={styles.scheduleItemSub} numberOfLines={1}>
                        {`${formatCompactTime(primaryMeal.starts_at, "Today")} • ${primaryMeal.calories_per_day ? `${primaryMeal.calories_per_day} kcal` : "Custom"} • Nutrition`}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scheduleStatusPill,
                        primaryMeal?.completion_status?.toLowerCase() === "completed"
                          ? styles.scheduleStatusCompleted
                          : styles.scheduleStatusUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scheduleStatusText,
                          primaryMeal?.completion_status?.toLowerCase() === "completed"
                            ? styles.scheduleStatusTextCompleted
                            : styles.scheduleStatusTextUpcoming,
                        ]}
                      >
                        {primaryMeal?.completion_status?.toLowerCase() === "completed"
                          ? "Completed"
                          : "Upcoming"}
                      </Text>
                    </View>
                  </Pressable>
                ) : null}

                {upcomingClass ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
                    style={styles.scheduleItemCard}
                  >
                    <View
                      style={[
                        styles.scheduleItemIconWrap,
                        { backgroundColor: "rgba(0, 122, 255, 0.14)" },
                      ]}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#007AFF" />
                    </View>
                    <View style={styles.scheduleItemInfo}>
                      <Text style={styles.scheduleItemTitle} numberOfLines={1}>
                        {upcomingClass.class_name}
                      </Text>
                      <Text style={styles.scheduleItemSub} numberOfLines={1}>
                        {`${upcomingClass.time ?? "Scheduled"} • ${upcomingClass.class_type} • ${upcomingClass.trainer_name ?? shortCoachName ?? "Instructor"}`}
                      </Text>
                    </View>
                    <View style={[styles.scheduleStatusPill, styles.scheduleStatusUpcoming]}>
                      <Text
                        style={[
                          styles.scheduleStatusText,
                          styles.scheduleStatusTextUpcoming,
                        ]}
                      >
                        Upcoming
                      </Text>
                    </View>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Today's Schedule"
                onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
                style={styles.scheduleEmptyBox}
              >
                <Ionicons name="calendar-outline" size={22} color="#F2F2F7" />
                <Text style={styles.scheduleEmptyText}>
                  No activities scheduled for today. Start a workout anytime!
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Bottom Assigned Trainer Card */}
        {resolvedTrainerName ? (
          <View style={styles.trainerCard}>
            <View style={styles.trainerLeft}>
              <View style={styles.trainerAvatarRing}>
                <LinearGradient
                  colors={["#007AFF", "#E91E63"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.trainerAvatarInner}
                >
                  <Text style={styles.trainerAvatarText}>{trainerInitials}</Text>
                </LinearGradient>
              </View>
              <View style={styles.trainerTextWrap}>
                <View style={styles.trainerNameRow}>
                  <Text style={styles.trainerName} numberOfLines={1}>
                    {resolvedTrainerName.startsWith("Trainer")
                      ? resolvedTrainerName
                      : `Trainer ${resolvedTrainerName}`}
                  </Text>
                  <View style={styles.headCoachBadge}>
                    <Text style={styles.headCoachBadgeText}>
                      {trainer?.specialization || "Coach"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.trainerSlotText} numberOfLines={1}>
                  {trainer?.email ? trainer.email : "Personal Trainer"}
                </Text>
              </View>
            </View>

            <View style={styles.trainerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Message Trainer"
                onPress={() => navigateTo?.("MemberTrainer")}
                style={styles.messageTrainerBtn}
              >
                <Text style={styles.messageTrainerBtnText}>Message</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Schedule with Trainer"
                onPress={() => navigateTo?.("MemberWorkout", { tab: "classes" })}
                style={styles.trainerCalendarBtn}
              >
                <Ionicons name="calendar-outline" size={16} color="#F2F2F7" />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find Trainer"
            onPress={() => navigateTo?.("MemberTrainer")}
            style={styles.trainerCard}
          >
            <View style={styles.trainerLeft}>
              <View style={styles.trainerAvatarRing}>
                <View style={[styles.trainerAvatarInner, { backgroundColor: "#1C1C1E" }]}>
                  <Ionicons name="person-outline" size={20} color="#F2F2F7" />
                </View>
              </View>
              <View style={styles.trainerTextWrap}>
                <Text style={styles.trainerName}>No Trainer Assigned</Text>
                <Text style={styles.trainerSlotText}>
                  Connect with a trainer for personal guidance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#F2F2F7" />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 14,
  },
  islandRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dynamicIsland: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  islandRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E91E63",
  },
  islandText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  islandGreenRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  islandGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  topKicker: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    flexShrink: 1,
    paddingRight: 8,
  },
  topHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadgeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E91E63",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: -16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 2,
  },
  dateLabel: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  reanimateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  reanimateText: {
    color: "#E91E63",
    fontSize: 13,
    fontWeight: "600",
  },
  ringsCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
  },
  ringsMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  ringsSvgContainer: {
    width: 152,
    height: 152,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringsCenterOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringsCenterPercent: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  ringsCenterSub: {
    color: "#F2F2F7",
    fontSize: 8.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  ringsStatsCol: {
    flex: 1,
    gap: 12,
  },
  ringStatBlock: {
    gap: 2,
  },
  ringStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ringStatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  ringDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  ringStatName: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "600",
  },
  ringStatPercent: {
    fontSize: 13,
    fontWeight: "800",
  },
  ringStatValueLine: {
    marginLeft: 16,
  },
  ringStatValueStrong: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  ringStatUnit: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "600",
  },
  ringsCardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 14,
  },
  ringsFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ringsFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  ringsFooterText: {
    color: "#34C759",
    fontSize: 12.5,
    fontWeight: "600",
  },
  celebrateLink: {
    color: "#E91E63",
    fontSize: 12.5,
    fontWeight: "700",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  quickActionTile: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 102,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 15,
  },
  metricsDuoRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricDuoCard: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 16,
    gap: 6,
  },
  metricDuoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricDuoTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metricDuoTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  metricDuoRightMeta: {
    color: "#F2F2F7",
    fontSize: 10.5,
    fontWeight: "600",
  },
  metricDuoBigValue: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  metricDuoUnit: {
    color: "#F2F2F7",
    fontSize: 14,
    fontWeight: "600",
  },
  metricDuoSubtext: {
    color: "#F2F2F7",
    fontSize: 11,
    fontWeight: "500",
  },
  metricBarTrack: {
    height: 6,
    backgroundColor: "#1C1C1E",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scheduleCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 16,
    gap: 14,
  },
  scheduleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  scheduleHeaderTitle: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  viewAllLink: {
    color: "#E91E63",
    fontSize: 12.5,
    fontWeight: "700",
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 13,
    gap: 12,
  },
  scheduleItemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleItemInfo: {
    flex: 1,
    gap: 3,
  },
  scheduleItemTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  scheduleItemSub: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  scheduleStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  scheduleStatusCompleted: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    borderColor: "rgba(52, 199, 89, 0.35)",
  },
  scheduleStatusUpcoming: {
    backgroundColor: "rgba(233, 30, 99, 0.12)",
    borderColor: "rgba(233, 30, 99, 0.35)",
  },
  scheduleStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scheduleStatusTextCompleted: {
    color: "#34C759",
  },
  scheduleStatusTextUpcoming: {
    color: "#E91E63",
  },
  trainerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 15,
    gap: 10,
  },
  trainerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  trainerAvatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  trainerTextWrap: {
    flex: 1,
    gap: 3,
  },
  trainerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  trainerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  headCoachBadge: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  headCoachBadgeText: {
    color: "#F2F2F7",
    fontSize: 10,
    fontWeight: "700",
  },
  trainerSlotText: {
    color: "#F2F2F7",
    fontSize: 11.5,
    fontWeight: "500",
  },
  trainerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageTrainerBtn: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  messageTrainerBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  trainerCalendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleEmptyBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scheduleEmptyText: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
