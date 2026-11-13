import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { images } from "../../../../assets/images";
import { genderExerciseLibrary } from "../../../../data/genderExerciseLibrary";
import {
  useMemberActivity,
  useMemberAttendance,
  useMemberNotifications,
  useMemberProfile,
  useMemberProgress,
  useMemberWorkouts,
} from "../../../../hooks/useMember";
import { useAuthStore } from "../../../../store/useAuthStore";
import type {
  useButtonPresentation,
  useMemberWorkoutScreenPresentation,
  useMetricPresentation,
  useStatePresentation,
  useWorkoutCardPresentation,
} from "../../../../screens/member/MemberWorkoutScreen";
import type { MemberWorkout } from "../../../../types/member";

type FilterType = "all" | "completed" | "pending" | "not-started";

interface WorkoutDisplayItem {
  id: string;
  title: string;
  tag: string;
  tagType: "not-started" | "pending" | "completed";
  tagColor: string;
  tagBg: string;
  focus: string;
  subtitle: string;
  subtitleColor: string;
  duration: string;
  durationMinutes: number;
  thumbnail: any;
  iconBadgeBg: string;
  iconBadgeName: keyof typeof Ionicons.glyphMap;
  trainer: string;
  trainerInitial: string;
  trainerAvatarBg: string;
  target: string;
  exercises: string;
  status: "not-started" | "pending" | "completed";
  actionButtonLabel: string;
  actionButtonBg: string;
  actionButtonTextColor: string;
  actionButtonBorder?: string;
  scheduleLabel?: string;
  scheduleIconColor?: string;
  rawWorkout: MemberWorkout;
}

function readString(source: unknown, keys: string[], fallback = ""): string {
  if (!source || typeof source !== "object") return fallback;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const val = record[key];
    if ((typeof val === "string" || typeof val === "number") && String(val).trim()) {
      return String(val).trim();
    }
  }
  return fallback;
}

function readNumber(source: unknown, keys: string[], fallback = 0): number {
  const raw = readString(source, keys);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function extractExercisesFromWorkout(workout: MemberWorkout): Array<{
  name: string;
  group: string;
  gender: string;
  exerciseId: string;
  durationMinutes: number;
}> {
  const rawSessions = workout.sessions?.length
    ? workout.sessions
    : workout.weekly_plan ?? [];
  const results: Array<{
    name: string;
    group: string;
    gender: string;
    exerciseId: string;
    durationMinutes: number;
  }> = [];

  rawSessions.forEach((sessionItem, idx) => {
    if (!sessionItem || typeof sessionItem !== "object") return;
    const record = sessionItem as Record<string, unknown>;
    if (Array.isArray(record.exercises) && record.exercises.length > 0) {
      record.exercises.forEach((ex, exIdx) => {
        const name = readString(ex, ["name", "title", "exercise_name"], `Exercise ${exIdx + 1}`);
        const group = readString(ex, ["group", "category", "focus", "muscle_group"], workout.goal);
        const gender = readString(ex, ["gender"]);
        const exerciseId = readString(ex, ["exerciseId", "exercise_id", "slug"]);
        const durationMinutes = readNumber(ex, ["duration_minutes", "duration"], 0);
        results.push({ name, group, gender, exerciseId, durationMinutes });
      });
    } else {
      const name = readString(record, ["name", "title", "exercise_name"], "");
      const group = readString(record, ["group", "category", "focus", "muscle_group"], workout.goal);
      const gender = readString(record, ["gender"]);
      const exerciseId = readString(record, ["exerciseId", "exercise_id", "slug"]);
      const durationMinutes = readNumber(record, ["duration_minutes", "duration"], 0);
      if (name) {
        results.push({ name, group, gender, exerciseId, durationMinutes });
      } else if (idx === 0 && durationMinutes > 0) {
        results.push({ name: "", group, gender, exerciseId, durationMinutes });
      }
    }
  });

  return results;
}

function resolveWorkoutThumbnail(workout: MemberWorkout, exercises: ReturnType<typeof extractExercisesFromWorkout>) {
  const first = exercises[0];
  if (first) {
    const gender = first.gender;
    const id = first.exerciseId.toLowerCase();
    const name = first.name.toLowerCase();
    const libraries =
      gender === "Male" || gender === "Female"
        ? [genderExerciseLibrary[gender]]
        : [genderExerciseLibrary.Male, genderExerciseLibrary.Female];
    for (const library of libraries) {
      const match = library.find(
        (item) => (id && item.slug.toLowerCase() === id) || (name && item.title.toLowerCase() === name)
      );
      if (match?.image) return match.image;
    }
  }
  const goalLower = (workout.goal || workout.workout_plan_name || "").toLowerCase();
  if (goalLower.includes("leg") || goalLower.includes("lower") || goalLower.includes("strength")) {
    return images.strengthCategory || images.workoutFloor || images.gymDetail;
  }
  if (goalLower.includes("chest") || goalLower.includes("core") || goalLower.includes("hiit")) {
    return images.gymDetail || images.workoutFloor;
  }
  return images.workoutFloor || images.gymDetail;
}

function formatDurationLabel(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function formatScheduleLabel(startsAt?: string | null): string {
  if (!startsAt) return "Schedule pending";
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return "Schedule pending";
  const now = new Date();
  const isToday =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate();
  if (isToday) {
    const hasTime = parsed.getHours() !== 0 || parsed.getMinutes() !== 0;
    if (hasTime) {
      return `${parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} Today`;
    }
    return "Scheduled Today";
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MemberWorkoutScreenView({
  model,
}: {
  model?: any;
}): React.JSX.Element {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isNarrow = width < 980;

  const hookQuery = useMemberWorkouts();
  const query = model?.props?.query ?? hookQuery;
  const rawWorkouts = (query.data as MemberWorkout[]) ?? [];

  const activityQuery = useMemberActivity();
  const progressQuery = useMemberProgress();
  const attendanceQuery = useMemberAttendance();
  const profileQuery = useMemberProfile();
  const unreadNotificationsQuery = useMemberNotifications(true);

  const profile = profileQuery.data;
  const unreadNotifications = unreadNotificationsQuery.data ?? [];

  // Local filter & search state
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  // Formatted current date for header pill
  const formattedTodayDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    []
  );

  // Map real backend workouts to display items
  const displayPlans = useMemo(() => {
    return rawWorkouts.map((w): WorkoutDisplayItem => {
      const s = (w.completion_status || "").toLowerCase();
      let tType: "not-started" | "pending" | "completed" = "not-started";
      let tColor = "#E91E63";
      let tBg = "rgba(233, 30, 99, 0.15)";
      let tag = "Not Started";
      let actBg = "#E91E63";
      let actText = "#FFFFFF";

      if (s.includes("complete")) {
        tType = "completed";
        tColor = "#34C759";
        tBg = "rgba(52, 199, 89, 0.15)";
        tag = "Completed";
        actBg = "rgba(52, 199, 89, 0.12)";
        actText = "#34C759";
      } else if (s.includes("pending") || s.includes("progress")) {
        tType = "pending";
        tColor = "#007AFF";
        tBg = "rgba(0, 122, 255, 0.15)";
        tag = "Pending Today";
        actBg = "#E91E63";
        actText = "#FFFFFF";
      }

      const extractedExercises = extractExercisesFromWorkout(w);
      const validExerciseNames = extractedExercises.map((e) => e.name).filter(Boolean);
      const exercisesLabel =
        validExerciseNames.length > 0
          ? validExerciseNames.slice(0, 3).join(", ")
          : w.trainer_notes?.trim() || "Assigned trainer exercises";

      const explicitDuration =
        readNumber(w.today_workout, ["duration_minutes", "duration"], 0) ||
        extractedExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
      const durationMinutes =
        explicitDuration > 0
          ? explicitDuration
          : validExerciseNames.length > 0
            ? Math.max(30, validExerciseNames.length * 8)
            : 45;

      const focusLabel =
        extractedExercises[0]?.group ||
        w.category ||
        (w.goal ? `${w.goal} Focus` : "Full Body Focus");

      const rawTrainer = (w.trainer_name || "Assigned Coach").trim();
      const cleanTrainerName = rawTrainer.replace(/^trainer\s+/i, "").trim() || rawTrainer;
      const trainerInitial = (cleanTrainerName[0] || "T").toUpperCase();

      const targetCategory = w.category || w.goal || "Full Body";

      return {
        id: w.workout_plan_uuid,
        title: w.workout_plan_name,
        tag,
        tagType: tType,
        tagColor: tColor,
        tagBg: tBg,
        focus: focusLabel.toLowerCase().includes("focus") ? focusLabel : `${focusLabel} Focus`,
        subtitle: `${w.goal || "Fitness"} • ${w.level || "All Levels"}`,
        subtitleColor:
          tType === "completed" ? "#34C759" : tType === "pending" ? "#E91E63" : "#E91E63",
        duration: `${durationMinutes} Mins`,
        durationMinutes,
        thumbnail: resolveWorkoutThumbnail(w, extractedExercises),
        iconBadgeBg:
          tType === "completed" ? "#34C759" : tType === "pending" ? "#007AFF" : "#E91E63",
        iconBadgeName:
          tType === "completed" ? "checkmark" : tType === "pending" ? "flash" : "barbell",
        trainer: `Trainer: ${cleanTrainerName}`,
        trainerInitial,
        trainerAvatarBg: tType === "pending" ? "#007AFF" : "#E91E63",
        target: `Target: ${targetCategory}`,
        exercises: exercisesLabel,
        status: tType,
        actionButtonLabel: tType === "completed" ? "Completed" : "Start Workout",
        actionButtonBg: actBg,
        actionButtonTextColor: actText,
        actionButtonBorder: tType === "completed" ? "rgba(52, 199, 89, 0.4)" : undefined,
        scheduleLabel: formatScheduleLabel(w.starts_at),
        scheduleIconColor: tType === "pending" ? "#007AFF" : "#007AFF",
        rawWorkout: w,
      };
    });
  }, [rawWorkouts]);

  // Real Metrics Calculations
  const completedCount = useMemo(() => {
    return rawWorkouts.reduce((sum, item) => sum + (item.completed_workouts ?? 0), 0);
  }, [rawWorkouts]);

  const completedTrendText = useMemo(() => {
    if (completedCount > 0) {
      return `↗ +${completedCount} logged`;
    }
    return `${rawWorkouts.length} assigned`;
  }, [completedCount, rawWorkouts.length]);

  const completedProgressPct = useMemo(() => {
    const monthlyTarget = Math.max(4, rawWorkouts.length * 4);
    return Math.min(100, Math.round((completedCount / monthlyTarget) * 100));
  }, [completedCount, rawWorkouts.length]);

  const consistencyPct = useMemo(() => {
    if (rawWorkouts.length > 0) {
      const avg =
        rawWorkouts.reduce((sum, item) => sum + (item.weekly_consistency ?? 0), 0) /
        rawWorkouts.length;
      if (avg > 0) return Math.min(100, Math.round(avg));
    }
    if (attendanceQuery.data?.attendance_percentage) {
      return Math.min(100, Math.round(attendanceQuery.data.attendance_percentage));
    }
    return 0;
  }, [rawWorkouts, attendanceQuery.data]);

  const consistencyStatusLabel = useMemo(() => {
    if (consistencyPct >= 70) return "↗ Optimal";
    if (consistencyPct >= 40) return "↗ On Track";
    if (consistencyPct > 0) return "↗ Building";
    return "↗ Start Today";
  }, [consistencyPct]);

  const totalCalories = useMemo(() => {
    const workoutEstimatedCalories = completedCount * 180;
    const activityHistory = activityQuery.data?.items ?? [];
    const activityTotal =
      activityHistory.length > 0
        ? activityHistory.reduce((sum, day) => sum + (day.calories_completed ?? 0), 0)
        : (activityQuery.data?.today?.calories_completed ?? 0);
    const progressTotal = (progressQuery.data ?? []).reduce(
      (sum, log) => sum + (log.calories_burned ?? 0),
      0
    );
    return Math.round(Math.max(workoutEstimatedCalories, activityTotal, progressTotal));
  }, [completedCount, activityQuery.data, progressQuery.data]);

  const caloriesProgressPct = useMemo(() => {
    const dailyTarget = activityQuery.data?.today?.calories_target || 500;
    const weeklyTarget = dailyTarget * 7;
    return Math.min(100, Math.round((totalCalories / Math.max(1, weeklyTarget)) * 100));
  }, [totalCalories, activityQuery.data]);

  const totalDurationMinutes = useMemo(() => {
    if (displayPlans.length === 0) return 0;
    return displayPlans.reduce((sum, plan) => {
      const sessionsDone = Math.max(1, plan.rawWorkout.completed_workouts ?? 0);
      return sum + plan.durationMinutes * sessionsDone;
    }, 0);
  }, [displayPlans]);

  const durationProgressPct = useMemo(() => {
    const weeklyMinutesTarget = 300; // 5 hours weekly benchmark
    return Math.min(100, Math.round((totalDurationMinutes / weeklyMinutesTarget) * 100));
  }, [totalDurationMinutes]);

  // Filter & Search
  const filteredPlans = useMemo(() => {
    return displayPlans.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (search.trim()) {
        const queryLower = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(queryLower);
        const matchesFocus = item.focus.toLowerCase().includes(queryLower);
        const matchesTrainer = item.trainer.toLowerCase().includes(queryLower);
        const matchesExercises = item.exercises.toLowerCase().includes(queryLower);
        return matchesTitle || matchesFocus || matchesTrainer || matchesExercises;
      }
      return true;
    });
  }, [displayPlans, filter, search]);

  const handleStartWorkout = (item: WorkoutDisplayItem) => {
    if (item.rawWorkout?.workout_plan_uuid) {
      navigation.navigate("MemberWorkoutDetail", {
        workoutPlanUuid: item.rawWorkout.workout_plan_uuid,
      });
    }
  };

  const handleCardPress = (item: WorkoutDisplayItem) => {
    if (item.rawWorkout?.workout_plan_uuid) {
      navigation.navigate("MemberWorkoutDetail", {
        workoutPlanUuid: item.rawWorkout.workout_plan_uuid,
      });
    }
  };

  const handleRefreshAll = () => {
    void query.refetch();
    void activityQuery.refetch();
    void progressQuery.refetch();
    void attendanceQuery.refetch();
  };

  const avatarPhoto = profile?.profile_photo;
  const avatarInitial = (
    profile?.member_name?.[0] ||
    user?.full_name?.[0] ||
    user?.email?.[0] ||
    "M"
  ).toUpperCase();

  return (
    <Screen
      scroll
      maxWidth="none"
      style={styles.screenContainer}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={handleRefreshAll}
          tintColor="#E91E63"
        />
      }
    >
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR                                                   */}
      {/* =================================================================== */}
      <View style={[styles.headerRow, isNarrow ? styles.headerRowNarrow : null]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Workouts & Training</Text>
          <Text style={styles.headerSubtitle}>
            Track your workout plans, consistency, and active energy goals
          </Text>
        </View>

        <View style={[styles.headerRight, isNarrow ? styles.headerRightNarrow : null]}>
          {/* Search Bar with ⌘K Badge */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={15} color="#F2F2F7" style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search workouts..."
              placeholderTextColor="#F2F2F7"
              style={styles.searchInput}
            />
            <View style={styles.cmdKeyBadge}>
              <Text style={styles.cmdKeyText}>⌘K</Text>
            </View>
          </View>

          {/* Date Dropdown Pill */}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={15} color="#E91E63" style={{ marginRight: 6 }} />
            <Text style={styles.dateText}>{formattedTodayDate}</Text>
            <Ionicons name="chevron-down" size={13} color="#F2F2F7" style={{ marginLeft: 6 }} />
          </View>

          {/* Notification Bell Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("MemberNotifications")}
            style={({ pressed }) => [styles.iconBtn, pressed ? styles.btnPressed : null]}
          >
            <Ionicons name="notifications-outline" size={18} color="#F2F2F7" />
            {unreadNotifications.length > 0 ? <View style={styles.notificationDot} /> : null}
          </Pressable>

          {/* Profile Avatar Circle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Member Profile"
            onPress={() => navigation.navigate("MemberProfileHome")}
            style={({ pressed }) => [
              styles.avatarCircle,
              { overflow: "hidden" },
              pressed ? styles.btnPressed : null,
            ]}
          >
            {avatarPhoto ? (
              <Image
                source={{ uri: avatarPhoto }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 2. TOP 4 METRIC CARDS ROW                                           */}
      {/* =================================================================== */}
      <View style={[styles.metricsRow, isNarrow ? styles.metricsRowNarrow : null]}>
        {/* Card 1: Completed Workouts */}
        <View style={[styles.metricCard, isNarrow ? styles.metricCardNarrow : null]}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.squircleBadge, { backgroundColor: "rgba(233, 30, 99, 0.15)", borderColor: "rgba(233, 30, 99, 0.3)" }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#E91E63" />
            </View>
            <View style={[styles.metricPillBadge, { backgroundColor: "rgba(233, 30, 99, 0.12)" }]}>
              <Text style={[styles.metricPillBadgeText, { color: "#E91E63" }]}>This Month</Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>COMPLETED WORKOUTS</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>{completedCount}</Text>
              <Text style={[styles.metricTrendText, { color: "#34C759" }]}>
                {completedTrendText}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completedProgressPct}%`, backgroundColor: "#E91E63" },
              ]}
            />
          </View>
        </View>

        {/* Card 2: Consistency Target */}
        <View style={[styles.metricCard, isNarrow ? styles.metricCardNarrow : null]}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.squircleBadge, { backgroundColor: "rgba(52, 199, 89, 0.15)", borderColor: "rgba(52, 199, 89, 0.3)" }]}>
              <Ionicons name="pulse" size={18} color="#34C759" />
            </View>
            <View style={[styles.metricPillBadge, { backgroundColor: "rgba(52, 199, 89, 0.12)" }]}>
              <Text style={[styles.metricPillBadgeText, { color: "#34C759" }]}>This Week</Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>CONSISTENCY TARGET</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>{consistencyPct}%</Text>
              <Text style={[styles.metricTrendText, { color: "#34C759" }]}>
                {consistencyStatusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${consistencyPct}%`, backgroundColor: "#34C759" },
              ]}
            />
          </View>
        </View>

        {/* Card 3: Total Calories */}
        <View style={[styles.metricCard, isNarrow ? styles.metricCardNarrow : null]}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.squircleBadge, { backgroundColor: "rgba(233, 30, 99, 0.15)", borderColor: "rgba(233, 30, 99, 0.3)" }]}>
              <Ionicons name="flame" size={18} color="#E91E63" />
            </View>
            <View style={[styles.metricPillBadge, { backgroundColor: "rgba(233, 30, 99, 0.12)" }]}>
              <Text style={[styles.metricPillBadgeText, { color: "#E91E63" }]}>Active Energy</Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>TOTAL CALORIES</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {totalCalories.toLocaleString("en-US")}
              </Text>
              <Text style={styles.metricUnitText}> kcal</Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${caloriesProgressPct}%`, backgroundColor: "#E91E63" },
              ]}
            />
          </View>
        </View>

        {/* Card 4: Total Duration */}
        <View style={[styles.metricCard, isNarrow ? styles.metricCardNarrow : null]}>
          <View style={styles.metricCardHeader}>
            <View style={[styles.squircleBadge, { backgroundColor: "rgba(0, 122, 255, 0.15)", borderColor: "rgba(0, 122, 255, 0.3)" }]}>
              <Ionicons name="time-outline" size={18} color="#007AFF" />
            </View>
            <View style={[styles.metricPillBadge, { backgroundColor: "rgba(0, 122, 255, 0.12)" }]}>
              <Text style={[styles.metricPillBadgeText, { color: "#007AFF" }]}>This Week</Text>
            </View>
          </View>

          <View style={styles.metricCardBody}>
            <Text style={styles.metricLabel}>TOTAL DURATION</Text>
            <View style={styles.metricValueLine}>
              <Text style={styles.metricBigNumber}>
                {formatDurationLabel(totalDurationMinutes)}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${durationProgressPct}%`, backgroundColor: "#007AFF" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 3. SECTION HEADER: "Your Assigned Workout Plans"                    */}
      {/* =================================================================== */}
      <View style={[styles.sectionHeaderRow, isNarrow ? styles.sectionHeaderRowNarrow : null]}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionTitle}>Your Assigned Workout Plans</Text>
          <Text style={styles.sectionSubtitle}>
            Select a workout to begin tracking reps, timer, and calories
          </Text>
        </View>

        <View style={[styles.sectionHeaderRight, isNarrow ? styles.sectionHeaderRightNarrow : null]}>
          {/* Filter Pills Container */}
          <View style={styles.filterGroup}>
            {(
              [
                ["all", "All"],
                ["completed", "Completed"],
                ["pending", "Pending"],
                ["not-started", "Not started"],
              ] as Array<[FilterType, string]>
            ).map(([key, label]) => {
              const active = filter === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} filter`}
                  onPress={() => setFilter(key)}
                  style={({ pressed }) => [
                    styles.filterTab,
                    active ? styles.filterTabActive : null,
                    pressed ? styles.btnPressed : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      active ? styles.filterTabTextActive : null,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* "+ New workout" Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create New Workout"
            onPress={() => navigation.navigate("AIWorkoutGenerator")}
            style={({ pressed }) => [
              styles.newWorkoutBtn,
              pressed ? styles.btnPressed : null,
            ]}
          >
            <Ionicons name="add" size={17} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={styles.newWorkoutBtnText}>New workout</Text>
          </Pressable>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 4. WORKOUT PLAN CARDS LIST                                          */}
      {/* =================================================================== */}
      <View style={styles.plansList}>
        {query.isLoading && rawWorkouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.emptyTitle}>Loading workout plans...</Text>
          </View>
        ) : filteredPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={40} color="#F2F2F7" />
            <Text style={styles.emptyTitle}>
              {rawWorkouts.length === 0 ? "No workout plans assigned yet" : "No workouts found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {rawWorkouts.length === 0
                ? "Create a new workout or ask your trainer to assign a plan."
                : "Try changing your filter or search query."}
            </Text>
          </View>
        ) : (
          filteredPlans.map((item) => {
            const isCompleted = item.status === "completed";
            const safeThumbnail = item.thumbnail ?? images.gymDetail;
            return (
              <View
                key={item.id}
                style={[
                  styles.workoutCard,
                  isNarrow ? styles.workoutCardNarrow : null,
                ]}
              >
                {/* Left & Middle: Thumbnail + Details (Clickable) */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => handleCardPress(item)}
                  style={({ pressed }) => [
                    styles.cardMainPressable,
                    isNarrow ? styles.cardMainPressableNarrow : null,
                    pressed ? styles.cardPressed : null,
                  ]}
                >
                  {/* Left Side: Thumbnail + Badge + Duration */}
                  <View style={styles.thumbWrapper}>
                    {safeThumbnail ? (
                      <Image
                        source={safeThumbnail}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.thumbImage, { backgroundColor: "#1C1C1E" }]} />
                    )}
                    {/* Top-Left Floating Squircle Badge */}
                    <View
                      style={[
                        styles.thumbTopBadge,
                        { backgroundColor: item.iconBadgeBg ?? "#E91E63" },
                      ]}
                    >
                      <Ionicons
                        name={item.iconBadgeName}
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                    {/* Bottom-Right Pill Badge */}
                    <View style={styles.thumbBottomBadge}>
                      <Text style={styles.thumbDurationText}>{item.duration}</Text>
                    </View>
                  </View>

                  {/* Middle Content */}
                  <View style={styles.cardInfoCol}>
                    {/* Tag line: Pill Badge + Dot + Focus Text */}
                    <View style={styles.cardTagRow}>
                      <View
                        style={[
                          styles.statusTagPill,
                          { backgroundColor: item.tagBg ?? "rgba(233, 30, 99, 0.15)" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            { color: item.tagColor ?? "#E91E63" },
                          ]}
                        >
                          {item.tag}
                        </Text>
                      </View>
                      <Text style={styles.tagDot}>•</Text>
                      <Text style={styles.focusText}>{item.focus}</Text>
                    </View>

                    {/* Workout Title */}
                    <Text style={styles.workoutPlanTitle}>{item.title}</Text>

                    {/* Subtitle / Level */}
                    <Text
                      style={[
                        styles.workoutPlanSubtitle,
                        { color: item.subtitleColor ?? "#E91E63" },
                      ]}
                    >
                      {item.subtitle}
                    </Text>

                    {/* Trainer & Target Exercises Row */}
                    <View style={styles.trainerMetaRow}>
                      <View
                        style={[
                          styles.trainerAvatar,
                          { backgroundColor: item.trainerAvatarBg ?? "#E91E63" },
                        ]}
                      >
                        <Text style={styles.trainerAvatarText}>{item.trainerInitial}</Text>
                      </View>
                      <Text numberOfLines={1} style={styles.trainerMetaText}>
                        <Text style={styles.trainerMetaHighlight}>
                          {item.trainer}
                        </Text>
                        {"   •   "}
                        {item.target}
                        {"   •   "}
                        {item.exercises}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* Right Side Action Buttons (Sibling, not nested) */}
                <View
                  style={[
                    styles.cardActionsRow,
                    isNarrow ? styles.cardActionsRowNarrow : null,
                  ]}
                >
                  {isCompleted ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Completed workout"
                      onPress={() => handleStartWorkout(item)}
                      style={({ pressed }) => [
                        styles.completedPillBtn,
                        pressed ? styles.btnPressed : null,
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={17}
                        color="#34C759"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.completedPillText}>Completed</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Start Workout"
                        onPress={() => handleStartWorkout(item)}
                        style={({ pressed }) => [
                          styles.startWorkoutBtn,
                          { backgroundColor: item.actionButtonBg ?? "#E91E63" },
                          pressed ? styles.btnPressed : null,
                        ]}
                      >
                        <Ionicons
                          name="play"
                          size={13}
                          color="#FFFFFF"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.startWorkoutBtnText}>
                          Start Workout
                        </Text>
                      </Pressable>

                      {item.scheduleLabel ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={item.scheduleLabel}
                          onPress={() => navigation.navigate("MemberClasses")}
                          style={({ pressed }) => [
                            styles.schedulePillBtn,
                            pressed ? styles.btnPressed : null,
                          ]}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={item.scheduleIconColor ?? "#007AFF"}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.schedulePillText}>
                            {item.scheduleLabel}
                          </Text>
                        </Pressable>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Floating Subtle "Ask Gemini" Pill in Bottom Right (Matching screenshot) */}
      <View style={styles.floatingGeminiPill}>
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// BACKWARDS-COMPATIBLE PRESENTATION EXPORTS
// --------------------------------------------------------------------------
export function ButtonView({
  model,
}: {
  model: ReturnType<typeof useButtonPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  const { onPress, ui, secondary, colors, icon, label } = model.props;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        {
          backgroundColor: secondary ? colors.surface : colors.primary,
          borderColor: secondary ? colors.border : colors.primary,
        },
        pressed && ui.pressed,
      ]}
    >
      <Ionicons name={icon} size={19} color={secondary ? colors.ink : "#FFFFFF"} />
      <Text style={[ui.buttonText, { color: secondary ? colors.ink : "#FFFFFF" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MetricView({
  model,
}: {
  model: ReturnType<typeof useMetricPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  const { ui, colors, tone, icon, label, value, sub } = model.props;
  return (
    <View
      style={[
        ui.metric,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[ui.metricIcon, { backgroundColor: tone }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={ui.metricCopy}>
        <Text style={[ui.metricLabel, { color: colors.ink }]}>{label}</Text>
        <Text style={[ui.metricValue, { color: colors.ink }]}>{value}</Text>
        <Text style={[ui.metricSub, { color: colors.muted }]}>{sub}</Text>
      </View>
    </View>
  );
}

export function WorkoutCardView({
  model,
}: {
  model: ReturnType<typeof useWorkoutCardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  const { styles, onOpen, imageOf, workout, tone, status, category, exercise, label, colors } =
    model.props;
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.thumbWrap}>
        <Image source={imageOf(workout)} style={styles.thumb} resizeMode="cover" />
        <View style={[styles.thumbBadge, { backgroundColor: tone }]}>
          <Ionicons
            name={status === "completed" ? "checkmark" : "barbell"}
            size={20}
            color="#FFFFFF"
          />
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{workout.workout_plan_name}</Text>
        <Text style={[styles.cardCategory, { color: tone }]}>
          {workout.goal} · {workout.level}
        </Text>
        <Text numberOfLines={2} style={styles.cardMeta}>
          Trainer: {workout.trainer_name ?? "Not assigned"} · {category} · {exercise}
        </Text>
      </Pressable>
      <View style={styles.cardActions}>
        <View style={[styles.status, { backgroundColor: `${tone}18` }]}>
          <Text style={[styles.statusText, { color: tone }]}>{label}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpen} style={styles.start}>
          <Ionicons name="play" size={14} color="#FFFFFF" />
          <Text style={styles.startText}>
            {status === "pending" ? "Continue" : "Start Workout"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function StateView({
  model,
}: {
  model: ReturnType<typeof useStatePresentation>;
}): React.ReactNode {
  if (model == null) return null;
  const { ui, colors, loading, icon, title, message } = model.props;
  return (
    <View
      style={[
        ui.state,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={32} color={colors.primary} />
      {title ? <Text style={[ui.stateTitle, { color: colors.ink }]}>{title}</Text> : null}
      <Text style={[ui.stateText, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

// --------------------------------------------------------------------------
// STYLESHEET (Apple Fitness Cyberpunk Dark Theme matching reference)
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 48,
  },

  // 1. Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  headerRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4,
    fontWeight: "400",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "nowrap",
  },
  headerRightNarrow: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingLeft: 14,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 13,
    padding: 0,
    marginRight: 6,
  },
  cmdKeyBadge: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cmdKeyText: {
    fontSize: 11,
    color: "#F2F2F7",
    fontWeight: "600",
  },
  datePill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E91E63",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // 2. Metrics Row
  metricsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  metricsRowNarrow: {
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    justifyContent: "space-between",
  },
  metricCardNarrow: {
    flexBasis: "47%",
  },
  metricCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  squircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricPillBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metricPillBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricCardBody: {
    marginTop: 14,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#F2F2F7",
  },
  metricValueLine: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  metricBigNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  metricUnitText: {
    fontSize: 13,
    color: "#F2F2F7",
    fontWeight: "500",
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  // 3. Section Header
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 16,
  },
  sectionHeaderRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4,
    fontWeight: "400",
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionHeaderRightNarrow: {
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 3,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterTabActive: {
    backgroundColor: "#1C1C1E",
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#F2F2F7",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  newWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newWorkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // 4. Workout Plan Cards
  plansList: {
    gap: 16,
  },
  workoutCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  workoutCardNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
  },
  cardMainPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  cardMainPressableNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
  },
  cardPressed: {
    opacity: 0.92,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },

  // Thumbnail
  thumbWrapper: {
    width: 150,
    height: 96,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1C1C1E",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbTopBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbBottomBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  thumbDurationText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "600",
  },

  // Info Column
  cardInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  cardTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusTagPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tagDot: {
    color: "#F2F2F7",
    fontSize: 12,
  },
  focusText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  workoutPlanTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  workoutPlanSubtitle: {
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 3,
  },
  trainerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  trainerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  trainerMetaText: {
    fontSize: 12,
    color: "#F2F2F7",
    flex: 1,
  },
  trainerMetaHighlight: {
    color: "#F2F2F7",
    fontWeight: "500",
  },

  // Action Buttons
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardActionsRowNarrow: {
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 4,
  },
  startWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startWorkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  schedulePillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  schedulePillText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "500",
  },
  completedPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.4)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  completedPillText: {
    color: "#34C759",
    fontSize: 13,
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginTop: 4,
  },

  // Floating Gemini Pill
  floatingGeminiPill: {
    position: "absolute",
    bottom: 16,
    right: 24,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingGeminiText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },

  btnPressed: {
    opacity: 0.82,
  },
});
