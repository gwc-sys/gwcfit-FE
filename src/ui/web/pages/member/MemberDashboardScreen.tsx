import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Screen } from "../../components/Screen";
import { images } from "../../../../assets/images";
import type {
  useDashboardStatePresentation,
  useMemberDashboardScreenPresentation,
  usePanelPresentation,
  useProgressCirclePresentation,
  useQuickActionTilePresentation,
  useScheduleRowPresentation,
  useStatTilePresentation,
  useStatusPillPresentation
} from "../../../../screens/member/MemberDashboardScreen";

// Export legacy presentation views for backwards compatibility
export function PanelView({ model }: { model: ReturnType<typeof usePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, style, title, action, onAction, children } = model.props;
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        {action ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.panelAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function StatTileView({ model }: { model: ReturnType<typeof useStatTilePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, softColor, icon, color, value, label, subtitle, trend, isDown, ui } = model.props;
  return (
    <View style={styles.statTile}>
      <View style={styles.statTopRow}>
        <View style={[styles.statIconBox, { backgroundColor: softColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>
          {value}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
      <Text numberOfLines={1} style={styles.statSubtitle}>
        {subtitle}
      </Text>
      {trend ? (
        <View style={styles.trendRow}>
          <Ionicons name={isDown ? "arrow-down-outline" : "arrow-up-outline"} size={13} color={isDown ? ui.danger : ui.success} />
          <Text style={[styles.trendText, isDown && styles.trendDown]}>{trend}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function QuickActionTileView({ model }: { model: ReturnType<typeof useQuickActionTilePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { onPress, styles, action, ui } = model.props;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressedLift]}>
      <View style={[styles.quickIconBox, { backgroundColor: action.softColor }]}>
        <Ionicons name={action.icon} size={20} color={action.color} />
      </View>
      <View style={styles.flex}>
        <Text numberOfLines={1} style={styles.quickTitle}>
          {action.title}
        </Text>
        <Text numberOfLines={1} style={styles.quickSubtitle}>
          {action.subtitle}
        </Text>
      </View>
      <View style={styles.chevronButton}>
        <Ionicons name="chevron-forward" size={14} color={ui.subtle} />
      </View>
    </Pressable>
  );
}

export function StatusPillView({ model }: { model: ReturnType<typeof useStatusPillPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, done, label, ui } = model.props;
  return (
    <View style={[styles.statusPill, done ? styles.statusDone : styles.statusUpcoming]}>
      <Text style={[styles.statusText, done ? styles.statusDoneText : styles.statusUpcomingText]}>{label}</Text>
      {done ? <Ionicons name="checkmark-circle-outline" size={13} color={ui.success} /> : null}
    </View>
  );
}

export function ScheduleRowView({ model }: { model: ReturnType<typeof useScheduleRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, item, isLast, StatusPill } = model.props;
  return (
    <View style={styles.scheduleRow}>
      <Text numberOfLines={1} style={styles.scheduleTime}>{item.time}</Text>
      <View style={styles.timeline}>
        {!isLast ? <View style={styles.timelineLine} /> : null}
        <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
      </View>
      <View style={[styles.scheduleIcon, { backgroundColor: item.softColor }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.scheduleCopy}>
        <Text numberOfLines={1} style={styles.scheduleTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.scheduleSubtitle}>
          {item.subtitle}
        </Text>
      </View>
      <StatusPill label={item.status} done={item.done} />
    </View>
  );
}

export function ProgressCircleView({ model }: { model: ReturnType<typeof useProgressCirclePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, size, radius, ui, strokeWidth, circumference, offset, progress } = model.props;
  return (
    <View style={styles.progressCircle}>
      <Svg width={96} height={96} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={ui.ringTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ui.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressPercent}>{progress}%</Text>
        <Text style={styles.progressLabel}>Goal Completed</Text>
      </View>
    </View>
  );
}

export function DashboardStateView({ model }: { model: ReturnType<typeof useDashboardStatePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;
  const { styles, icon, ui, title, message, onRetry } = model.props;
  return (
    <View style={styles.stateBanner}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={22} color={ui.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateMessage}>{message}</Text>
      </View>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// --------------------------------------------------------------------------
// HELPER: BUILD DYNAMIC SMOOTH SPARKLINE FROM REAL ACTIVITY DATA
// --------------------------------------------------------------------------
function buildSparkline(data: number[] | undefined, width = 280, height = 38): { path: string; area: string } {
  const points: number[] = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...points, 10);
  const min = 0;
  const count = points.length;
  const stepX = width / Math.max(1, count - 1);

  const coords = points.map((val, idx) => {
    const x = idx * stepX;
    const normalized = (val - min) / (max - min || 1);
    const y = Math.round(height - 6 - normalized * (height - 12));
    return { x: Math.round(x), y: Math.max(4, Math.min(height - 4, y)) };
  });

  if (coords.length === 0) {
    return {
      path: `M 0,${height - 6} L ${width},${height - 6}`,
      area: `M 0,${height - 6} L ${width},${height - 6} L ${width},${height} L 0,${height} Z`
    };
  }

  let pathStr = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const midX = Math.round((prev.x + curr.x) / 2);
    const midY = Math.round((prev.y + curr.y) / 2);
    pathStr += ` Q ${prev.x},${prev.y} ${midX},${midY} T ${curr.x},${curr.y}`;
  }

  const areaStr = `${pathStr} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;
  return { path: pathStr, area: areaStr };
}

// --------------------------------------------------------------------------
// MAIN MEMBER DASHBOARD SCREEN VIEW (Same-to-same design as reference image)
// --------------------------------------------------------------------------

export function MemberDashboardScreenView({
  model
}: {
  model: ReturnType<typeof useMemberDashboardScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model as any;

  const {
    styles: baseStyles,
    isRefreshing,
    refreshAll,
    ui,
    memberName,
    navigateTo,
    unreadNotifications,
    dailyActivity,
    todayCalories,
    caloriesTarget,
    completedWorkouts,
    workoutsTarget,
    monthlyCalories,
    formatNumber,
    workouts,
    attendance,
    rewards,
    profile,
    classes,
    goals,
    todayWorkout,
    todayMeal,
    upcomingClass,
    workoutDone,
    activityHistory,
    scheduleItems,
    dashboard,
    sensorSteps = 0,
    sensorHours,
    sensorStatus = "checking",
    enableSensor,
    addSensorSteps,
    syncStatus = "pending",
    retrySync
  } = model.props;

  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 860;
  const isMobile = width < 768;

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Name calculation
  const rawName = memberName?.trim() || dashboard?.member_name || profile?.member_name || "Member";
  const firstName = rawName.split(/\s+/)[0] || "Member";
  const avatarUrl = profile?.profile_photo || dashboard?.profile_photo;

  // Dynamic Dates formatted exactly as in reference
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const formattedFullDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const formattedPillDate = `Today, ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(now)}`;
  const formattedMonthYear = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(now);

  // Merge live device sensor steps & hourly buckets with backend dailyActivity
  const savedSteps = dailyActivity?.steps ?? 0;
  const steps = Math.max(sensorSteps ?? 0, savedSteps);
  const hourlyStepsData = Array.from({ length: 24 }, (_, idx) => {
    const savedVal = Array.isArray(dailyActivity?.hourly_steps) ? (dailyActivity.hourly_steps[idx] ?? 0) : 0;
    const liveVal = Array.isArray(sensorHours) ? (sensorHours[idx] ?? 0) : 0;
    return Math.max(savedVal, liveVal);
  });

  // Real Rings Calculations
  // 1. Move (Active Energy) — combines logged calories + real sensor step calories (ACSM 0.5 kcal/kg/km)
  const memberWeightKg = Number(profile?.weight || dailyActivity?.calorie_estimate_weight_kg || 70) || 70;
  const liveStepCalories = Math.round(((steps * 0.75) / 1000) * memberWeightKg * 0.5);
  const moveCompleted = Math.max(dailyActivity?.calories_completed ?? 0, todayCalories ?? 0, liveStepCalories);
  const moveTarget = dailyActivity?.calories_target || caloriesTarget || 250;
  const moveRatio = moveTarget > 0 ? moveCompleted / moveTarget : 0;
  const movePercent = Math.round(moveRatio * 100);

  // 2. Exercise (Minutes) — combines today's workout completion, gym check-in duration, and active walking cadence
  const exerciseTarget = 30;
  const todayWorkoutDuration: number =
    (todayWorkout?.today_workout as any)?.duration_minutes ?? 30;
  const todayAttendanceMinutes = (attendance?.history ?? []).reduce((sum, rec) => {
    if (!rec.check_in_at || rec.check_in_at.slice(0, 10) !== todayIso) return sum;
    const inMs = new Date(rec.check_in_at).getTime();
    const outMs = rec.check_out_at ? new Date(rec.check_out_at).getTime() : Date.now();
    if (Number.isNaN(inMs) || Number.isNaN(outMs) || outMs <= inMs) return sum;
    return sum + Math.min(120, Math.round((outMs - inMs) / 60000));
  }, 0);
  const stepExerciseMinutes = Math.round(steps / 100);
  const exerciseCompleted =
    (workoutDone ? todayWorkoutDuration : 0) +
    Math.max(todayAttendanceMinutes, stepExerciseMinutes);
  const exerciseRatio = exerciseTarget > 0 ? exerciseCompleted / exerciseTarget : 0;
  const exercisePercent = Math.round(exerciseRatio * 100);

  // 3. Stand Hours — count distinct hours today with active steps or gym check-in
  const standTarget = 12;
  const standHoursSet = new Set<number>();
  hourlyStepsData.forEach((count, hr) => {
    if (count > 0) standHoursSet.add(hr);
  });
  (attendance?.history ?? []).forEach((rec) => {
    if (rec.check_in_at && rec.check_in_at.slice(0, 10) === todayIso) {
      const dt = new Date(rec.check_in_at);
      if (!Number.isNaN(dt.getTime())) standHoursSet.add(dt.getHours());
    }
  });
  const standCompleted = standHoursSet.size > 0 ? standHoursSet.size : (steps > 0 ? 1 : 0);
  const standRatio = standTarget > 0 ? standCompleted / standTarget : 0;
  const standPercent = Math.round(standRatio * 100);

  // Overall Ring Closure Percentage
  const overallPercent = Math.round(
    ((Math.min(1, moveRatio) + Math.min(1, exerciseRatio) + Math.min(1, standRatio)) / 3) * 100
  );

  // Rings Re-animation state
  const [animationKey, setAnimationKey] = useState(0);
  const [animProgress, setAnimProgress] = useState({
    move: Math.min(1.2, moveRatio),
    exercise: Math.min(1.2, exerciseRatio),
    stand: Math.min(1.2, standRatio)
  });

  useEffect(() => {
    setAnimProgress({
      move: Math.min(1.2, moveRatio),
      exercise: Math.min(1.2, exerciseRatio),
      stand: Math.min(1.2, standRatio)
    });
  }, [moveRatio, exerciseRatio, standRatio]);

  const handleReanimate = () => {
    setAnimationKey((prev) => prev + 1);
    setAnimProgress({ move: 0, exercise: 0, stand: 0 });
    setTimeout(() => {
      setAnimProgress({
        move: Math.min(1.2, moveRatio),
        exercise: Math.min(1.2, exerciseRatio),
        stand: Math.min(1.2, standRatio)
      });
    }, 50);
  };

  // Concentric Rings Geometry
  const center = 95;
  // Move: Outer
  const rMove = 78;
  const cMove = 2 * Math.PI * rMove;
  const offMove = cMove * (1 - Math.min(1, animProgress.move));

  // Exercise: Middle
  const rExercise = 61;
  const cExercise = 2 * Math.PI * rExercise;
  const offExercise = cExercise * (1 - Math.min(1, animProgress.exercise));

  // Stand: Inner
  const rStand = 44;
  const cStand = 2 * Math.PI * rStand;
  const offStand = cStand * (1 - Math.min(1, animProgress.stand));

  // Real Steps and Distance
  const yesterdayRecord = (activityHistory ?? []).find((item) => item.activity_date !== todayIso);
  const yesterdaySteps = yesterdayRecord?.steps ?? 0;
  let stepTrendBadge = "Active today";
  if (yesterdaySteps > 0 && steps > 0) {
    const diff = Math.round(((steps - yesterdaySteps) / yesterdaySteps) * 100);
    stepTrendBadge = `${diff >= 0 ? "+" : ""}${diff}% vs yesterday`;
  } else if (steps > 0) {
    stepTrendBadge = "Active today";
  } else {
    stepTrendBadge = "0% vs yesterday";
  }

  const stepsSparkline = buildSparkline(hourlyStepsData, 280, 38);

  const distanceKm =
    dailyActivity?.distance_km != null && savedSteps >= steps && savedSteps > 0
      ? Number(dailyActivity.distance_km)
      : Number(((steps * 0.75) / 1000).toFixed(2));
  const avgPace =
    steps > 0
      ? `${Math.max(1, Math.round(steps / 100))} min active • ${(steps * 0.75).toFixed(0)} m`
      : "No pace recorded";
  const distanceSparkline = buildSparkline(
    hourlyStepsData.map((_, i) => hourlyStepsData.slice(0, i + 1).reduce((a, b) => a + b, 0)),
    280,
    38
  );

  const stepSourceSubtitle =
    sensorStatus === "tracking"
      ? "Live from Device Motion Sensor"
      : dailyActivity?.source === "ios_pedometer"
        ? "Synced from iPhone Motion Sensor"
        : dailyActivity?.source === "android_foreground"
          ? "Synced from Android Step Sensor"
          : "Synced from Activity Tracker";

  // Real Today's Schedule & Trainer
  const trainerName = dashboard?.assigned_trainer_name || profile?.trainer_name || "Rohit Sharma";
  const displaySchedule = (scheduleItems && scheduleItems.length > 0) ? scheduleItems : [];

  // Real Progress Overview
  const realCompletedWorkouts = completedWorkouts ?? 0;
  const realTargetWorkouts = workoutsTarget > 0 ? workoutsTarget : 20;
  const workoutProgressPct = Math.min(100, Math.round((realCompletedWorkouts / realTargetWorkouts) * 100));

  const targetMonthlyCalories = caloriesTarget && caloriesTarget > 0 ? caloriesTarget * 20 : 10000;
  const currentMonthlyCalories = monthlyCalories || 0;
  const caloriesProgressPct = Math.min(100, Math.round((currentMonthlyCalories / targetMonthlyCalories) * 100));

  const progressBannerText = realCompletedWorkouts >= realTargetWorkouts
    ? `Goal reached! Outstanding consistency with ${realCompletedWorkouts} workouts this month!`
    : (workoutProgressPct >= 50
        ? `On track to reach your monthly ${realTargetWorkouts}-workout goal!`
        : `${realCompletedWorkouts} of ${realTargetWorkouts} workouts completed. Keep pushing!`);

  // Real Recommended Workout
  const recWorkout = todayWorkout || (workouts && workouts.length > 0 ? workouts[0] : null);
  const recLevel = recWorkout?.level ? `Level ${recWorkout.level}` : "Level 2";
  const recTitle = recWorkout?.workout_plan_name || "Back Workout - Hypertrophy Phase";
  let recDesc = `Targeted routines designed to build strength and endurance by Coach ${trainerName}.`;
  // sessions is a JsonObject[] — safely extract exercise names from first session
  if (recWorkout?.sessions && recWorkout.sessions.length > 0) {
    const sessionExercises = (recWorkout.sessions[0] as any)?.exercises;
    if (Array.isArray(sessionExercises) && sessionExercises.length > 0) {
      const names = sessionExercises
        .slice(0, 3)
        .map((e: any) => e.exercise_name || e.name)
        .filter(Boolean)
        .join(", ");
      if (names) {
        recDesc = `Targeted ${names} designed by Coach ${trainerName}.`;
      }
    }
  }
  // duration_minutes may live inside today_workout JSON blob or first session
  const recDuration: number =
    (recWorkout?.today_workout as any)?.duration_minutes ??
    (recWorkout?.sessions?.[0] as any)?.duration_minutes ??
    45;
  const recCalories = Math.round(recDuration * 8);

  // Real Achievements & Badges
  let badge1Title = "30-Day Streak";
  let badge1Sub = "Perfect Month";
  let badge1Icon = "flame" as const;
  let badge1Bg = "#E91E63";

  if (rewards && rewards.length > 0) {
    badge1Title = rewards[0].title;
    badge1Sub = `${rewards[0].points} PTS • ${rewards[0].status || "Unlocked"}`;
  } else if (attendance) {
    const visitCount = attendance?.monthly_attendance_count ?? 0;
    badge1Title = `${visitCount}-Day Active`;
    badge1Sub = visitCount >= 7 ? "Consistent Active" : "Monthly Visits";
  }

  let badge2Title = "Strength Master";
  let badge2Sub = "50 Workouts";
  let badge2Icon = "flash" as const;
  let badge2Bg = "#007AFF";

  if (rewards && rewards.length > 1) {
    badge2Title = rewards[1].title;
    badge2Sub = `${rewards[1].points} PTS • ${rewards[1].status || "Active"}`;
  } else {
    badge2Title = `${realCompletedWorkouts} Workouts`;
    badge2Sub = currentMonthlyCalories > 0 ? `${formatNumber(currentMonthlyCalories)} kcal` : "Monthly Target";
  }

  let nextAwardTitle = "7-Day Move Goal";
  let nextAwardDetail = "(2 days remaining)";
  if (rewards && rewards.length > 2) {
    nextAwardTitle = rewards[2].title;
    nextAwardDetail = `(${rewards[2].points} PTS needed)`;
  } else {
    const streak = attendance?.monthly_attendance_count ?? 0;
    const targetStreak = streak < 7 ? 7 : (streak < 14 ? 14 : (streak < 30 ? 30 : streak + 10));
    const daysLeft = Math.max(1, targetStreak - streak);
    nextAwardTitle = `${targetStreak}-Day Streak`;
    nextAwardDetail = `(${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining)`;
  }

  return (
    <Screen
      scroll
      noPadding
      style={cStyles.screen}
      contentContainerStyle={cStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} tintColor="#007AFF" />}
    >
      <View style={cStyles.container}>
        {/* ================================================================= */}
        {/* 1. TOP HEADER BAR                                                 */}
        {/* ================================================================= */}
        <View style={cStyles.headerBar}>
          <View style={cStyles.headerLeft}>
            <Text style={cStyles.headerTitle}>
              {firstName}'s Fitness{" "}
              <Text style={cStyles.headerSubtitle}>| Daily Activity Overview</Text>
            </Text>
            <Text style={cStyles.headerMotivation}>
              {overallPercent >= 100
                ? `${formattedFullDate} • Awesome! You've closed all 3 rings today!`
                : `${formattedFullDate} • You're on track to close all 3 rings!`}
            </Text>
          </View>

          <View style={cStyles.headerRight}>
            {/* Search Input */}
            <View style={cStyles.searchBox}>
              <Ionicons name="search" size={15} color="#F2F2F7" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search metrics..."
                placeholderTextColor="#F2F2F7"
                style={cStyles.searchInput}
              />
            </View>

            {/* Date Pill Dropdown */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select date"
              style={({ pressed }) => [cStyles.datePill, pressed && cStyles.pressedOpacity]}
            >
              <Ionicons name="calendar-outline" size={15} color="#007AFF" />
              <Text style={cStyles.datePillText}>{formattedPillDate}</Text>
              <Ionicons name="chevron-down" size={13} color="#F2F2F7" />
            </Pressable>

            {/* Notification Bell */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigateTo("MemberNotifications")}
              style={({ pressed }) => [cStyles.iconCircleBtn, pressed && cStyles.pressedOpacity]}
            >
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
              {unreadNotifications && unreadNotifications.length > 0 ? <View style={cStyles.bellDot} /> : null}
            </Pressable>

            {/* User Profile Avatar */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={() => navigateTo("MemberProfileHome")}
              style={({ pressed }) => [cStyles.avatarBtn, pressed && cStyles.pressedOpacity]}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={cStyles.avatarImage}
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                    {firstName[0]?.toUpperCase() || "M"}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. TOP ROW: ACTIVITY RINGS + STEP COUNT & STEP DISTANCE           */}
        {/* ================================================================= */}
        <View style={[cStyles.topRow, isMobile && cStyles.columnLayout]}>
          {/* Card: ACTIVITY RINGS */}
          <View style={[cStyles.card, cStyles.ringsCard]}>
            <View style={cStyles.cardHeaderRow}>
              <Text style={cStyles.cardEyebrow}>ACTIVITY RINGS</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Re-animate activity rings"
                onPress={handleReanimate}
                style={({ pressed }) => pressed && cStyles.pressedOpacity}
              >
                <Text style={cStyles.reanimateLink}>Re-animate</Text>
              </Pressable>
            </View>

            <View style={[cStyles.ringsBody, isMobile && cStyles.ringsBodyMobile]}>
              {/* Concentric 3-Ring SVG */}
              <View style={cStyles.svgWrapper}>
                <Svg key={`rings-${animationKey}`} width={190} height={190} viewBox="0 0 190 190">
                  {/* Outer Ring: Move */}
                  <Circle cx={center} cy={center} r={rMove} stroke="rgba(255, 59, 48, 0.14)" strokeWidth={13} fill="none" />
                  <Circle
                    cx={center}
                    cy={center}
                    r={rMove}
                    stroke="#E91E63"
                    strokeWidth={13}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${cMove} ${cMove}`}
                    strokeDashoffset={offMove}
                    transform={`rotate(-90 ${center} ${center})`}
                  />

                  {/* Middle Ring: Exercise */}
                  <Circle cx={center} cy={center} r={rExercise} stroke="rgba(52, 199, 89, 0.14)" strokeWidth={13} fill="none" />
                  <Circle
                    cx={center}
                    cy={center}
                    r={rExercise}
                    stroke="#34C759"
                    strokeWidth={13}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${cExercise} ${cExercise}`}
                    strokeDashoffset={offExercise}
                    transform={`rotate(-90 ${center} ${center})`}
                  />

                  {/* Inner Ring: Stand */}
                  <Circle cx={center} cy={center} r={rStand} stroke="rgba(0, 122, 255, 0.14)" strokeWidth={13} fill="none" />
                  <Circle
                    cx={center}
                    cy={center}
                    r={rStand}
                    stroke="#007AFF"
                    strokeWidth={13}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${cStand} ${cStand}`}
                    strokeDashoffset={offStand}
                    transform={`rotate(-90 ${center} ${center})`}
                  />
                </Svg>

                {/* Center Label */}
                <View style={cStyles.ringCenterOverlay}>
                  <Ionicons name="flame" size={18} color="#E91E63" />
                  <Text style={cStyles.ringCenterPercent}>{overallPercent}%</Text>
                  <Text style={cStyles.ringCenterClosed}>CLOSED</Text>
                </View>
              </View>

              {/* Stat rows on the right of the rings */}
              <View style={cStyles.ringsStatsCol}>
                {/* Move Row */}
                <View style={cStyles.ringStatPill}>
                  <View style={cStyles.statPillLeft}>
                    <View style={[cStyles.statPillIconBox, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                      <Ionicons name="flame" size={17} color="#E91E63" />
                    </View>
                    <View>
                      <Text style={cStyles.statPillTitle}>Move (Active Energy)</Text>
                      <Text style={cStyles.statPillValue}>
                        {Math.round(moveCompleted)} <Text style={cStyles.statPillUnit}>/ {moveTarget} CAL</Text>
                      </Text>
                    </View>
                  </View>
                  <Text style={[cStyles.statPillPercent, { color: "#E91E63" }]}>{movePercent}%</Text>
                </View>

                {/* Exercise Row */}
                <View style={cStyles.ringStatPill}>
                  <View style={cStyles.statPillLeft}>
                    <View style={[cStyles.statPillIconBox, { backgroundColor: "rgba(52, 199, 89, 0.15)" }]}>
                      <Ionicons name="flash" size={17} color="#34C759" />
                    </View>
                    <View>
                      <Text style={cStyles.statPillTitle}>Exercise (Minutes)</Text>
                      <Text style={cStyles.statPillValue}>
                        {Math.round(exerciseCompleted)} <Text style={cStyles.statPillUnit}>/ {exerciseTarget} MIN</Text>
                      </Text>
                    </View>
                  </View>
                  <Text style={[cStyles.statPillPercent, { color: "#34C759" }]}>{exercisePercent}%</Text>
                </View>

                {/* Stand Row */}
                <View style={cStyles.ringStatPill}>
                  <View style={cStyles.statPillLeft}>
                    <View style={[cStyles.statPillIconBox, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                      <Ionicons name="arrow-up" size={17} color="#007AFF" />
                    </View>
                    <View>
                      <Text style={cStyles.statPillTitle}>Stand Hours</Text>
                      <Text style={cStyles.statPillValue}>
                        {Math.round(standCompleted)} <Text style={cStyles.statPillUnit}>/ {standTarget} HRS</Text>
                      </Text>
                    </View>
                  </View>
                  <Text style={[cStyles.statPillPercent, { color: "#007AFF" }]}>{standPercent}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stacked Cards: Step Count & Step Distance */}
          <View style={cStyles.stepCardsCol}>
            {/* Card 1: Step Count */}
            <View style={[cStyles.card, cStyles.stepCard]}>
              <View style={cStyles.stepCardTop}>
                <View style={cStyles.stepCardIconAndTitle}>
                  <View style={[cStyles.stepIconSquircle, { backgroundColor: "rgba(0, 122, 255, 0.18)" }]}>
                    <Ionicons name="footsteps" size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={cStyles.stepCardTitle}>Step Count</Text>
                    <Text style={cStyles.stepCardSubtitle}>{stepSourceSubtitle}</Text>
                  </View>
                </View>
                {sensorStatus === "permission" || sensorStatus === "denied" || sensorStatus === "error" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Enable motion sensor"
                    onPress={() => enableSensor?.()}
                    style={[cStyles.badgePill, { backgroundColor: "rgba(0, 122, 255, 0.28)" }]}
                  >
                    <Text style={[cStyles.badgeText, { color: "#007AFF" }]}>Enable Sensor</Text>
                  </Pressable>
                ) : (
                  <View style={[cStyles.badgePill, { backgroundColor: "rgba(0, 122, 255, 0.2)" }]}>
                    <Text style={[cStyles.badgeText, { color: "#007AFF" }]}>{stepTrendBadge}</Text>
                  </View>
                )}
              </View>

              <View style={cStyles.stepCardMiddle}>
                <Text style={cStyles.stepBigValue}>
                  {steps.toLocaleString("en-US")} <Text style={cStyles.stepUnitText}>steps</Text>
                </Text>
                <Text style={cStyles.stepGoalText}>Goal: 10,000</Text>
              </View>

              {/* Smooth Purple Glowing Sparkline */}
              <View style={cStyles.sparklineBox}>
                <Svg width="100%" height={38} viewBox="0 0 280 38" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#007AFF" stopOpacity={0.35} />
                      <Stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d={stepsSparkline.area}
                    fill="url(#purpleGlow)"
                  />
                  <Path
                    d={stepsSparkline.path}
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </View>

            {/* Card 2: Step Distance */}
            <View style={[cStyles.card, cStyles.stepCard]}>
              <View style={cStyles.stepCardTop}>
                <View style={cStyles.stepCardIconAndTitle}>
                  <View style={[cStyles.stepIconSquircle, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="navigate" size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={cStyles.stepCardTitle}>Step Distance</Text>
                    <Text style={cStyles.stepCardSubtitle}>Outdoor Walking & Running</Text>
                  </View>
                </View>
                <View style={[cStyles.badgePill, { backgroundColor: "rgba(0, 122, 255, 0.2)" }]}>
                  <Text style={[cStyles.badgeText, { color: "#007AFF" }]}>{steps > 0 ? "Active" : "Idle"}</Text>
                </View>
              </View>

              <View style={cStyles.stepCardMiddle}>
                <Text style={cStyles.stepBigValue}>
                  {distanceKm.toFixed(2)} <Text style={cStyles.stepUnitText}>km</Text>
                </Text>
                <Text style={cStyles.stepGoalText}>{avgPace}</Text>
              </View>

              {/* Smooth Cyan Glowing Sparkline */}
              <View style={cStyles.sparklineBox}>
                <Svg width="100%" height={38} viewBox="0 0 280 38" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#007AFF" stopOpacity={0.35} />
                      <Stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d={distanceSparkline.area}
                    fill="url(#cyanGlow)"
                  />
                  <Path
                    d={distanceSparkline.path}
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 3. QUICK ACTIONS SECTION                                          */}
        {/* ================================================================= */}
        <View style={cStyles.quickSection}>
          <View style={cStyles.quickHeader}>
            <Ionicons name="sparkles" size={15} color="#E91E63" />
            <Text style={cStyles.quickSectionTitle}>QUICK ACTIONS</Text>
          </View>

          <View style={[cStyles.quickActionsGrid, isMobile && cStyles.quickGridMobile]}>
            {/* Action 1: Start Workout */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start Workout"
              onPress={() => navigateTo("MemberWorkout")}
              style={({ pressed }) => [cStyles.quickActionCard, pressed && cStyles.quickActionPressed]}
            >
              <View style={[cStyles.quickIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.15)" }]}>
                <Ionicons name="play" size={20} color="#E91E63" style={{ marginLeft: 2 }} />
              </View>
              <Text style={cStyles.quickCardTitle}>Start Workout</Text>
              <Text style={cStyles.quickCardSubtitle}>Begin active tracking</Text>
            </Pressable>

            {/* Action 2: Meal Plan */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Meal Plan"
              onPress={() => navigateTo("MemberMealPlan")}
              style={({ pressed }) => [cStyles.quickActionCard, pressed && cStyles.quickActionPressed]}
            >
              <View style={[cStyles.quickIconCircle, { backgroundColor: "rgba(52, 199, 89, 0.15)" }]}>
                <Ionicons name="nutrition" size={20} color="#34C759" />
              </View>
              <Text style={cStyles.quickCardTitle}>Meal Plan</Text>
              <Text style={cStyles.quickCardSubtitle}>View nutrition macros</Text>
            </Pressable>

            {/* Action 3: Log Progress */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log Progress"
              onPress={() => navigateTo("MemberProgress")}
              style={({ pressed }) => [cStyles.quickActionCard, pressed && cStyles.quickActionPressed]}
            >
              <View style={[cStyles.quickIconCircle, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                <Ionicons name="trending-up" size={20} color="#007AFF" />
              </View>
              <Text style={cStyles.quickCardTitle}>Log Progress</Text>
              <Text style={cStyles.quickCardSubtitle}>Update health metrics</Text>
            </Pressable>

            {/* Action 4: Book Session */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Book Session"
              onPress={() => navigateTo("MemberClasses")}
              style={({ pressed }) => [cStyles.quickActionCard, pressed && cStyles.quickActionPressed]}
            >
              <View style={[cStyles.quickIconCircle, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                <Ionicons name="calendar" size={20} color="#007AFF" />
              </View>
              <Text style={cStyles.quickCardTitle}>Book Session</Text>
              <Text style={cStyles.quickCardSubtitle}>Schedule with trainer</Text>
            </Pressable>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 4. MIDDLE ROW: TODAY'S SCHEDULE + PROGRESS OVERVIEW               */}
        {/* ================================================================= */}
        <View style={[cStyles.middleRow, isMobile && cStyles.columnLayout]}>
          {/* Card: Today's Schedule */}
          <View style={[cStyles.card, cStyles.flexCard]}>
            <View style={cStyles.cardHeaderRow}>
              <View style={cStyles.headerWithIcon}>
                <Ionicons name="time-outline" size={18} color="#007AFF" />
                <View>
                  <Text style={cStyles.cardMainTitle}>Today's Schedule</Text>
                  <Text style={cStyles.cardSubtitleMuted}>
                    {displaySchedule.length} {displaySchedule.length === 1 ? "event" : "events"} planned for today
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View Full Schedule"
                onPress={() => navigateTo("MemberClasses")}
                style={({ pressed }) => pressed && cStyles.pressedOpacity}
              >
                <Text style={cStyles.cyanActionLink}>View Full Schedule →</Text>
              </Pressable>
            </View>

            {displaySchedule.length === 0 ? (
              <View style={cStyles.scheduleItemBox}>
                <View style={cStyles.scheduleItemLeft}>
                  <View style={[cStyles.scheduleSquircle, { backgroundColor: "rgba(0, 122, 255, 0.15)" }]}>
                    <Ionicons name="barbell" size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={cStyles.scheduleItemTitle}>No scheduled sessions today</Text>
                    <Text style={cStyles.scheduleItemDetails}>Take rest or start an open workout</Text>
                  </View>
                </View>
                <View style={[cStyles.scheduleBadge, { backgroundColor: "rgba(0, 122, 255, 0.12)", borderColor: "rgba(0, 122, 255, 0.3)" }]}>
                  <Text style={[cStyles.scheduleBadgeText, { color: "#007AFF" }]}>Rest Day</Text>
                </View>
              </View>
            ) : (
              displaySchedule.slice(0, 2).map((item, idx) => (
                <View key={`sched-${idx}`} style={[cStyles.scheduleItemBox, idx > 0 && { marginTop: 10 }]}>
                  <View style={cStyles.scheduleItemLeft}>
                    <View style={[cStyles.scheduleSquircle, { backgroundColor: item.softColor || "rgba(233, 30, 99, 0.15)" }]}>
                      <Ionicons name={item.icon} size={18} color={item.color || "#E91E63"} />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text numberOfLines={1} style={cStyles.scheduleItemTitle}>
                        {item.title}
                      </Text>
                      <Text numberOfLines={1} style={cStyles.scheduleItemDetails}>
                        {item.time} • {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      cStyles.scheduleBadge,
                      item.done
                        ? { backgroundColor: "rgba(52, 199, 89, 0.12)", borderColor: "rgba(52, 199, 89, 0.3)" }
                        : { backgroundColor: "rgba(233, 30, 99, 0.12)", borderColor: "rgba(233, 30, 99, 0.3)" }
                    ]}
                  >
                    <Text style={[cStyles.scheduleBadgeText, { color: item.done ? "#34C759" : "#E91E63" }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {/* Footer with Coach */}
            <View style={cStyles.scheduleFooter}>
              <Text style={cStyles.trainerLabel}>
                Trainer: <Text style={cStyles.trainerName}>{trainerName}</Text>
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Message Coach"
                onPress={() => navigateTo("MemberTrainer")}
                style={({ pressed }) => pressed && cStyles.pressedOpacity}
              >
                <Text style={cStyles.cyanActionLink}>Message Coach</Text>
              </Pressable>
            </View>
          </View>

          {/* Card: Progress Overview */}
          <View style={[cStyles.card, cStyles.flexCard]}>
            <View style={cStyles.cardHeaderRow}>
              <View style={cStyles.headerWithIcon}>
                <Ionicons name="trending-up" size={18} color="#34C759" />
                <View>
                  <Text style={cStyles.cardMainTitle}>Progress Overview</Text>
                  <Text style={cStyles.cardSubtitleMuted}>Monthly goals progress tracker</Text>
                </View>
              </View>
              <View style={cStyles.monthBadge}>
                <Text style={cStyles.monthBadgeText}>{formattedMonthYear}</Text>
              </View>
            </View>

            {/* 2 Metric Columns */}
            <View style={cStyles.progressColumnsRow}>
              {/* Column 1: Workouts Completed */}
              <View style={cStyles.progressCol}>
                <Text style={cStyles.progressColLabel}>Workouts Completed</Text>
                <View style={cStyles.progressValueRow}>
                  <Text style={cStyles.progressBigNum}>
                    {realCompletedWorkouts} <Text style={cStyles.progressSlashNum}>/ {realTargetWorkouts}</Text>
                  </Text>
                  <Text style={[cStyles.progressPercentVal, { color: "#34C759" }]}>{workoutProgressPct}%</Text>
                </View>
                <View style={cStyles.barTrack}>
                  <View style={[cStyles.barFill, { width: `${workoutProgressPct}%`, backgroundColor: "#34C759" }]} />
                </View>
              </View>

              {/* Column 2: Total Calories Burned */}
              <View style={cStyles.progressCol}>
                <Text style={cStyles.progressColLabel}>Total Calories Burned</Text>
                <View style={cStyles.progressValueRow}>
                  <Text style={cStyles.progressBigNum}>
                    {formatNumber(currentMonthlyCalories)} <Text style={cStyles.progressSlashNum}>kcal</Text>
                  </Text>
                  <Text style={[cStyles.progressPercentVal, { color: "#E91E63" }]}>{caloriesProgressPct}%</Text>
                </View>
                <View style={cStyles.barTrack}>
                  <View style={[cStyles.barFill, { width: `${caloriesProgressPct}%`, backgroundColor: "#E91E63" }]} />
                </View>
              </View>
            </View>

            {/* Bottom Info Banner */}
            <View style={cStyles.progressInfoBanner}>
              <Ionicons name="information-circle-outline" size={17} color="#007AFF" />
              <Text style={cStyles.progressInfoText}>
                {progressBannerText}
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 5. BOTTOM ROW: RECOMMENDED WORKOUT + ACHIEVEMENTS & BADGES         */}
        {/* ================================================================= */}
        <View style={[cStyles.bottomRow, isMobile && cStyles.columnLayout]}>
          {/* Card: RECOMMENDED WORKOUT */}
          <View style={[cStyles.card, cStyles.recommendedCard, isMobile && cStyles.recommendedCardMobile]}>
            {/* Workout Image with Level Badge */}
            <View style={cStyles.workoutImageWrapper}>
              <Image
                source={images.workoutFloor || images.gymDetail}
                style={cStyles.workoutCoverImage}
                defaultSource={images.gymDetail}
                resizeMode="cover"
              />
              <View style={cStyles.levelBadge}>
                <Text style={cStyles.levelBadgeText}>{recLevel}</Text>
              </View>
            </View>

            {/* Content Details */}
            <View style={cStyles.recommendedContent}>
              <View>
                <Text style={cStyles.recommendedEyebrow}>RECOMMENDED WORKOUT</Text>
                <Text style={cStyles.recommendedTitle}>{recTitle}</Text>
                <Text numberOfLines={2} style={cStyles.recommendedDesc}>
                  {recDesc}
                </Text>
              </View>

              <View style={cStyles.recommendedBottomBar}>
                <View style={cStyles.durationRow}>
                  <Ionicons name="time-outline" size={14} color="#F2F2F7" />
                  <Text style={cStyles.durationText}>{recDuration} Mins • {recCalories} kcal</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start Recommended Workout"
                  onPress={() => navigateTo("MemberWorkout")}
                  style={({ pressed }) => [cStyles.startWorkoutBtn, pressed && cStyles.pressedOpacity]}
                >
                  <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={cStyles.startWorkoutBtnText}>Start</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Card: Achievements & Badges */}
          <View style={[cStyles.card, cStyles.achievementsCard]}>
            <View style={cStyles.cardHeaderRow}>
              <View style={cStyles.headerWithIcon}>
                <Ionicons name="ribbon-outline" size={18} color="#E91E63" />
                <Text style={cStyles.cardMainTitle}>Achievements & Badges</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View All Achievements"
                onPress={() => navigateTo("MemberRewards")}
                style={({ pressed }) => pressed && cStyles.pressedOpacity}
              >
                <Text style={cStyles.cyanActionLink}>View All</Text>
              </Pressable>
            </View>

            {/* Badges Row */}
            <View style={cStyles.badgesRow}>
              {/* Badge 1: Streak / Reward */}
              <View style={cStyles.badgeItemCard}>
                <View style={[cStyles.badgeIconSquare, { backgroundColor: badge1Bg }]}>
                  <Ionicons name={badge1Icon} size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={cStyles.badgeItemTitle}>{badge1Title}</Text>
                  <Text numberOfLines={1} style={cStyles.badgeItemSub}>{badge1Sub}</Text>
                </View>
              </View>

              {/* Badge 2: Workouts / Reward */}
              <View style={cStyles.badgeItemCard}>
                <View style={[cStyles.badgeIconSquare, { backgroundColor: badge2Bg }]}>
                  <Ionicons name={badge2Icon} size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={cStyles.badgeItemTitle}>{badge2Title}</Text>
                  <Text numberOfLines={1} style={cStyles.badgeItemSub}>{badge2Sub}</Text>
                </View>
              </View>
            </View>

            {/* Next Award Footer */}
            <View style={cStyles.nextAwardBanner}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>🏆</Text>
              <Text style={cStyles.nextAwardText}>
                Next Award: <Text style={cStyles.nextAwardHighlight}>{nextAwardTitle}</Text> {nextAwardDetail}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// EXACT STYLES (Cyberpunk dark, Apple Fitness luxury aesthetics)
// --------------------------------------------------------------------------

const cStyles = StyleSheet.create({
  screen: {
    backgroundColor: "#000000",
    flex: 1
  },
  scrollContent: {
    minHeight: "100%",
    backgroundColor: "#000000",
    paddingBottom: 40
  },
  container: {
    width: "100%",
    maxWidth: 1380,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20
  },

  // 1. Header Bar
  headerBar: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 16
  },
  headerLeft: {
    flex: 1,
    minWidth: 260
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  headerMotivation: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  searchBox: {
    height: 38,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 180
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    padding: 0
  },
  datePill: {
    height: 38,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  datePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  bellDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E91E63",
    position: "absolute",
    top: 7,
    right: 8
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    backgroundColor: "#1C1C1E"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },

  // Generic Card
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 22
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  cardEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#F2F2F7"
  },
  reanimateLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF"
  },
  headerWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardMainTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  cardSubtitleMuted: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2
  },
  cyanActionLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF"
  },

  // 2. Top Row
  topRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20
  },
  columnLayout: {
    flexDirection: "column"
  },
  ringsCard: {
    flex: 1.35,
    borderRadius: 24
  },
  ringsBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20
  },
  ringsBodyMobile: {
    flexDirection: "column"
  },
  svgWrapper: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  ringCenterOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 1
  },
  ringCenterPercent: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"]
  },
  ringCenterClosed: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#F2F2F7"
  },
  ringsStatsCol: {
    flex: 1,
    gap: 10
  },
  ringStatPill: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statPillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  statPillIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  statPillTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F2F2F7"
  },
  statPillValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2
  },
  statPillUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  statPillPercent: {
    fontSize: 14,
    fontWeight: "700"
  },

  // Step cards
  stepCardsCol: {
    flex: 1,
    gap: 16
  },
  stepCard: {
    justifyContent: "space-between",
    padding: 18
  },
  stepCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  stepCardIconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  stepIconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  stepCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  stepCardSubtitle: {
    fontSize: 11,
    color: "#F2F2F7",
    marginTop: 2
  },
  badgePill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600"
  },
  stepCardMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 10
  },
  stepBigValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"]
  },
  stepUnitText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  stepGoalText: {
    fontSize: 12,
    color: "#F2F2F7",
    fontWeight: "500"
  },
  sparklineBox: {
    height: 38,
    marginTop: 8,
    overflow: "hidden"
  },

  // 3. Quick Actions
  quickSection: {
    marginBottom: 20
  },
  quickHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12
  },
  quickSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#F2F2F7"
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 16
  },
  quickGridMobile: {
    flexWrap: "wrap"
  },
  quickActionCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18
  },
  quickActionPressed: {
    opacity: 0.8,
    transform: [{ translateY: 2 }]
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  quickCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  quickCardSubtitle: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 4
  },

  // 4. Middle Row
  middleRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20
  },
  flexCard: {
    flex: 1,
    justifyContent: "space-between"
  },
  scheduleItemBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  scheduleItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  scheduleSquircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  scheduleItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  scheduleItemDetails: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2
  },
  scheduleBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  scheduleBadgeText: {
    fontSize: 11,
    fontWeight: "600"
  },
  scheduleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)"
  },
  trainerLabel: {
    fontSize: 13,
    color: "#F2F2F7"
  },
  trainerName: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  monthBadge: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  monthBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500"
  },
  progressColumnsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
    marginBottom: 18
  },
  progressCol: {
    flex: 1
  },
  progressColLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F2F2F7"
  },
  progressValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 6,
    marginBottom: 8
  },
  progressBigNum: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"]
  },
  progressSlashNum: {
    fontSize: 14,
    fontWeight: "400",
    color: "#F2F2F7"
  },
  progressPercentVal: {
    fontSize: 14,
    fontWeight: "700"
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1C1C1E",
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 4
  },
  progressInfoBanner: {
    backgroundColor: "rgba(0, 122, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  progressInfoText: {
    color: "#007AFF",
    fontSize: 12.5,
    fontWeight: "600"
  },

  // 5. Bottom Row
  bottomRow: {
    flexDirection: "row",
    gap: 20
  },
  recommendedCard: {
    flex: 1.35,
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },
  recommendedCardMobile: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  workoutImageWrapper: {
    width: 150,
    height: 135,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative"
  },
  workoutCoverImage: {
    width: "100%",
    height: "100%"
  },
  levelBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#E91E63",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  levelBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  },
  recommendedContent: {
    flex: 1,
    height: 135,
    justifyContent: "space-between"
  },
  recommendedEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#E91E63"
  },
  recommendedTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4
  },
  recommendedDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: "#F2F2F7",
    marginTop: 4
  },
  recommendedBottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  durationText: {
    fontSize: 12,
    color: "#F2F2F7",
    fontWeight: "500"
  },
  startWorkoutBtn: {
    backgroundColor: "#E91E63",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center"
  },
  startWorkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  achievementsCard: {
    flex: 1,
    justifyContent: "space-between"
  },
  badgesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    marginBottom: 12
  },
  badgeItemCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  badgeIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  badgeItemSub: {
    fontSize: 11,
    color: "#F2F2F7",
    marginTop: 2
  },
  nextAwardBanner: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  nextAwardText: {
    color: "#F2F2F7",
    fontSize: 11.5
  },
  nextAwardHighlight: {
    color: "#FFFFFF",
    fontWeight: "600"
  },

  // Interactions
  pressedOpacity: {
    opacity: 0.72
  }
});
