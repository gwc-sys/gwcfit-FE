import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import type * as React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable } from "../../components/NativePressable";
import { AppLogo } from "../../../../components/AppLogo";
import { getMobileViewportMetrics } from "../../theme/theme";

import type { useMemberWorkoutScreenPresentation } from "../../../../screens/member/MemberWorkoutScreen";
import type { MemberClass, MemberWorkout } from "../../../../types/member";

export {
  ButtonView,
  MetricView,
  WorkoutCardView,
  StateView,
} from "../../../web/pages/member/MemberWorkoutScreen";

type WorkoutTabSegment = "plans" | "classes";

type ExerciseLineItem = {
  name: string;
  setsReps: string;
};

function getInitials(name?: string | null, fallback = "GR"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function clampPercent(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDurationMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hrs = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

function extractExercises(workout: MemberWorkout): ExerciseLineItem[] {
  const candidates: unknown[] = [];
  const todayObj = workout.today_workout as Record<string, unknown> | null | undefined;
  if (todayObj && Array.isArray(todayObj.exercises)) {
    candidates.push(...todayObj.exercises);
  }
  const workoutRecord = workout as unknown as Record<string, unknown>;
  if (!candidates.length && Array.isArray(workoutRecord.exercises) && workoutRecord.exercises.length) {
    candidates.push(...workoutRecord.exercises);
  }
  if (!candidates.length && Array.isArray(workout.sessions) && workout.sessions.length) {
    const firstSession = workout.sessions[0] as Record<string, unknown> | undefined;
    if (firstSession && Array.isArray(firstSession.exercises)) {
      candidates.push(...firstSession.exercises);
    }
  }
  if (!candidates.length && Array.isArray(workout.weekly_plan) && workout.weekly_plan.length) {
    const firstDay = workout.weekly_plan[0] as Record<string, unknown> | undefined;
    if (firstDay && Array.isArray(firstDay.exercises)) {
      candidates.push(...firstDay.exercises);
    }
  }

  const parsed: ExerciseLineItem[] = candidates
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Record<string, unknown>;
      const name = String(
        item.name ?? item.title ?? item.exercise_name ?? item.exercise ?? "",
      ).trim();
      if (!name) return null;
      const sets = item.sets ?? item.target_sets ?? 3;
      const reps = item.reps ?? item.target_reps ?? 12;
      const repsText = String(reps).toLowerCase().includes("rep")
        ? String(reps)
        : `${reps} reps`;
      return {
        name,
        setsReps: `${sets} sets x ${repsText}`,
      };
    })
    .filter((item): item is ExerciseLineItem => item !== null);

  if (parsed.length > 0) {
    return parsed.slice(0, 5);
  }

  return [];
}

function getWorkoutDurationMins(workout: MemberWorkout): number | null {
  const todayObj = workout.today_workout as Record<string, unknown> | null | undefined;
  const rawDuration = Number(
    todayObj?.duration_minutes ?? todayObj?.duration ?? (workout as any)?.duration_minutes ?? 0,
  );
  if (rawDuration > 0) return Math.round(rawDuration);
  return null;
}

function getClassCategoryBadgeStyle(classType: string, index: number) {
  const lower = classType.toLowerCase();
  if (lower.includes("yoga") || lower.includes("flex") || lower.includes("pilates") || index === 1) {
    return {
      bg: "rgba(52, 199, 89, 0.14)",
      border: "rgba(52, 199, 89, 0.35)",
      text: "#34C759",
    };
  }
  if (lower.includes("spin") || lower.includes("cycl") || lower.includes("aqua") || index >= 2) {
    return {
      bg: "rgba(0, 122, 255, 0.15)",
      border: "rgba(0, 122, 255, 0.35)",
      text: "#007AFF",
    };
  }
  return {
    bg: "rgba(233, 30, 99, 0.15)",
    border: "rgba(233, 30, 99, 0.35)",
    text: "#E91E63",
  };
}

export function MemberWorkoutScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberWorkoutScreenPresentation> | any;
}): React.ReactNode {
  const { width = 390, height = 844 } = useWindowDimensions();
  const rawInsets = typeof useSafeAreaInsets === "function" ? useSafeAreaInsets() : null;
  const vp = getMobileViewportMetrics(width, height, rawInsets);
  const rawRouteParams =
    model && typeof model === "object" && "props" in model
      ? (model.props?.routeParams ?? model.props?.route?.params ?? null)
      : null;
  const initialSegment: WorkoutTabSegment =
    rawRouteParams?.tab === "classes" || rawRouteParams?.tab === "schedule"
      ? "classes"
      : "plans";

  const [activeSegment, setActiveSegment] = useState<WorkoutTabSegment>(initialSegment);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    rawRouteParams?.workoutPlanUuid ?? null,
  );
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(24 * 60 + 18);

  useEffect(() => {
    if (!rawRouteParams) return;
    if (rawRouteParams.tab === "classes" || rawRouteParams.tab === "schedule") {
      setActiveSegment("classes");
    } else if (rawRouteParams.tab === "plans") {
      setActiveSegment("plans");
    }
    if (rawRouteParams.workoutPlanUuid) {
      setExpandedWorkoutId(rawRouteParams.workoutPlanUuid);
    }
  }, [rawRouteParams?.tab, rawRouteParams?.workoutPlanUuid]);

  useEffect(() => {
    if (!isLiveTracking) return;
    const interval = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveTracking]);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  const props = model.props as any;
  const query = props.query;
  const classesQuery = props.classesQuery;
  const workouts: MemberWorkout[] = props.workouts ?? query?.data ?? [];
  const classes: MemberClass[] = props.classes ?? classesQuery?.data ?? [];
  const bookClass = props.bookClass;
  const cancelClass = props.cancelClass;
  const navigation = props.navigation;
  const unreadNotifications = props.unreadNotifications ?? [];
  const user = props.user;
  const profile = props.profile;
  const trainer = props.trainer;

  const completed: number =
    typeof props.completed === "number"
      ? props.completed
      : workouts.reduce((sum, w) => sum + (w.completed_workouts ?? 0), 0);
  const consistency: number =
    typeof props.consistency === "number"
      ? props.consistency
      : workouts.length
        ? Math.round(
            workouts.reduce((sum, w) => sum + (w.weekly_consistency ?? 0), 0) /
              workouts.length,
          )
        : 0;
  const calories: number =
    typeof props.calories === "number" ? props.calories : completed * 180;
  const duration: number =
    typeof props.duration === "number" ? props.duration : completed * 48;

  const isRefreshing = Boolean(query?.isRefetching || classesQuery?.isRefetching);
  const onRefresh = () => {
    query?.refetch?.();
    classesQuery?.refetch?.();
  };

  const memberDisplayName = profile?.full_name ?? user?.full_name ?? "Member";
  const userInitials = getInitials(memberDisplayName, "GR");
  const unreadCount = Array.isArray(unreadNotifications)
    ? unreadNotifications.length
    : 0;

  const primaryWorkout = workouts[0] ?? null;
  const activeExpandedId = expandedWorkoutId ?? primaryWorkout?.workout_plan_uuid ?? null;
  const liveWorkoutName = primaryWorkout?.workout_plan_name ?? "Live Workout";

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
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#E91E63"
          />
        }
      >
        {/* Dynamic Island Status Capsule */}
        <View style={styles.islandRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isLiveTracking ? "Stop Live Track timer" : "PulseFit status"
            }
            onPress={() => setIsLiveTracking((prev) => !prev)}
            style={[
              styles.dynamicIsland,
              isLiveTracking && styles.dynamicIslandLive,
            ]}
          >
            {isLiveTracking ? (
              <>
                <Ionicons name="barbell-outline" size={14} color="#E91E63" />
                <Text style={styles.islandLiveText} numberOfLines={1}>
                  {`${liveWorkoutName} • ${formatTimer(liveSeconds)}`}
                </Text>
              </>
            ) : (
              <>
                <AppLogo size={16} chromeless />
                <Text style={styles.islandText}>PulseFit</Text>
                <View style={styles.islandGreenRing}>
                  <View style={styles.islandGreenDot} />
                </View>
              </>
            )}
          </Pressable>
        </View>

        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topKicker} numberOfLines={1}>
            TRAINING PLANS & CLASSES
          </Text>
          <View style={styles.topHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation?.navigate?.("MemberNotifications")}
              style={styles.bellButton}
            >
              <Ionicons name="notifications-outline" size={21} color="#F2F2F7" />
              {unreadCount >= 0 ? <View style={styles.bellBadgeDot} /> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member Profile"
              onPress={() => navigation?.navigate?.("MemberProfileHome")}
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

        {/* Hero Row: TRAINING & PROGRAMS / Workouts + Live Track Button */}
        <View style={styles.heroRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.heroKicker} numberOfLines={1}>
              TRAINING & PROGRAMS
            </Text>
            <Text
              style={[styles.heroTitle, { fontSize: vp.heroTitleSize }]}
              numberOfLines={1}
            >
              Workouts
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Live Track"
            onPress={() => setIsLiveTracking((prev) => !prev)}
            style={[
              styles.liveTrackButton,
              isLiveTracking && styles.liveTrackButtonActive,
            ]}
          >
            <Ionicons
              name={isLiveTracking ? "pause" : "play"}
              size={13}
              color="#FFFFFF"
            />
            <Text style={styles.liveTrackButtonText}>Live Track</Text>
          </Pressable>
        </View>

        {/* 2x2 Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsGridRow}>
            {/* COMPLETED */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#E91E63" }]}>
                COMPLETED
              </Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{completed}</Text>
                <Text style={[styles.metricSubInline, { color: "#34C759" }]}>
                  {`+${completed} logged`}
                </Text>
              </View>
              <View style={styles.metricBarTrack}>
                <View
                  style={[
                    styles.metricBarFill,
                    {
                      width: `${clampPercent(completed > 0 ? completed * 22 : 12, 12, 100)}%`,
                      backgroundColor: "#E91E63",
                    },
                  ]}
                />
              </View>
            </View>

            {/* CONSISTENCY */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#34C759" }]}>
                CONSISTENCY
              </Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{`${consistency}%`}</Text>
                <Text style={[styles.metricSubInline, { color: "#F2F2F7" }]}>
                  {consistency >= 30 ? "On Track" : "Building"}
                </Text>
              </View>
              <View style={styles.metricBarTrack}>
                <View
                  style={[
                    styles.metricBarFill,
                    {
                      width: `${clampPercent(consistency, 12, 100)}%`,
                      backgroundColor: "#34C759",
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.metricsGridRow}>
            {/* ACTIVE ENERGY */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#E91E63" }]}>
                ACTIVE ENERGY
              </Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {calories.toLocaleString("en-US")}
                </Text>
                <Text style={[styles.metricSubInline, { color: "#F2F2F7" }]}>
                  kcal
                </Text>
              </View>
              <View style={styles.metricBarTrack}>
                <View
                  style={[
                    styles.metricBarFill,
                    {
                      width: `${clampPercent((calories / 2000) * 100, 12, 100)}%`,
                      backgroundColor: "#E91E63",
                    },
                  ]}
                />
              </View>
            </View>

            {/* TOTAL DURATION */}
            <View style={styles.metricCard}>
              <Text style={[styles.metricLabel, { color: "#007AFF" }]}>
                TOTAL DURATION
              </Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {props.durationText
                    ? props.durationText(duration)
                    : formatDurationMinutes(duration)}
                </Text>
              </View>
              <View style={styles.metricBarTrack}>
                <View
                  style={[
                    styles.metricBarFill,
                    {
                      width: `${clampPercent((duration / 180) * 100, 12, 100)}%`,
                      backgroundColor: "#007AFF",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Segmented Switcher: Assigned Plans | Gym Classes */}
        <View style={styles.segmentedTrack}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeSegment === "plans" }}
            onPress={() => setActiveSegment("plans")}
            style={[
              styles.segmentedOption,
              activeSegment === "plans" && styles.segmentedOptionActive,
            ]}
          >
            <Text
              style={[
                styles.segmentedOptionText,
                activeSegment === "plans" && styles.segmentedOptionTextActive,
              ]}
            >
              Assigned Plans
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeSegment === "classes" }}
            onPress={() => setActiveSegment("classes")}
            style={[
              styles.segmentedOption,
              activeSegment === "classes" && styles.segmentedOptionActive,
            ]}
          >
            <Text
              style={[
                styles.segmentedOptionText,
                activeSegment === "classes" && styles.segmentedOptionTextActive,
              ]}
            >
              Gym Classes
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: ASSIGNED PLANS */}
        {activeSegment === "plans" ? (
          query?.isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color="#E91E63" size="small" />
              <Text style={styles.stateSub}>Loading assigned workout plans...</Text>
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.stateBox}>
              <Ionicons name="barbell-outline" size={28} color="#F2F2F7" />
              <Text style={styles.stateTitle}>No Assigned Plans Yet</Text>
              <Text style={styles.stateSub}>
                Workout plans assigned by your trainer will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsColumn}>
              {workouts.map((workout, index) => {
                const isExpanded = workout.workout_plan_uuid === activeExpandedId;
                const isCompleted = workout.completion_status
                  ?.toLowerCase()
                  .includes("complete");
                const focusTag = workout.goal?.trim() || "General Training";
                const levelTag = workout.level?.trim() || `Level ${index + 1}`;
                const rawTrainer = workout.trainer_name ?? trainer?.trainer_name ?? null;
                const trainerDisplay = rawTrainer
                  ? rawTrainer.startsWith("Trainer")
                    ? rawTrainer
                    : `Trainer ${rawTrainer}`
                  : "Coach";
                const durationMins = getWorkoutDurationMins(workout);
                const durationText = durationMins ? ` • ${durationMins} Mins` : "";
                const exercises = extractExercises(workout);

                if (isExpanded) {
                  return (
                    <View
                      key={workout.workout_plan_uuid}
                      style={styles.expandedPlanCard}
                    >
                      <View style={styles.expandedTopRow}>
                        <View style={styles.expandedTopLeft}>
                          <View style={styles.tagPillsRow}>
                            <View style={styles.pinkFocusPill}>
                              <Text style={styles.pinkFocusPillText}>
                                {focusTag}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.statusPill,
                                isCompleted
                                  ? styles.statusPillCompleted
                                  : styles.statusPillPending,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusPillText,
                                  isCompleted
                                    ? styles.statusPillTextCompleted
                                    : styles.statusPillTextPending,
                                ]}
                              >
                                {isCompleted ? "Completed" : "Assigned"}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.expandedPlanTitle}>
                            {`${workout.workout_plan_name} • ${levelTag}`}
                          </Text>
                          <Text style={styles.expandedPlanSubtitle}>
                            {`Assigned by ${trainerDisplay}${durationText}`}
                          </Text>
                        </View>

                        <View style={styles.dumbbellIconBox}>
                          <Ionicons
                            name="barbell-outline"
                            size={22}
                            color="#E91E63"
                          />
                        </View>
                      </View>

                      {/* Inner Dark Exercise Checklist */}
                      <View style={styles.exerciseChecklistBox}>
                        {exercises.length > 0 ? (
                          exercises.map((ex, exIndex) => (
                            <View
                              key={`${workout.workout_plan_uuid}-ex-${exIndex}`}
                              style={styles.exerciseRow}
                            >
                              <View style={styles.exerciseLeft}>
                                <Ionicons
                                  name="checkmark-circle-outline"
                                  size={18}
                                  color="#34C759"
                                />
                                <Text
                                  style={styles.exerciseName}
                                  numberOfLines={1}
                                >
                                  {ex.name}
                                </Text>
                              </View>
                              <Text style={styles.exerciseSetsReps}>
                                {ex.setsReps}
                              </Text>
                            </View>
                          ))
                        ) : (
                          <View style={styles.exerciseRow}>
                            <Text style={styles.exerciseName}>
                              Session details will guide your workout.
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Bottom Action Buttons */}
                      <View style={styles.expandedActionsRow}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            isCompleted ? "Repeat Workout" : "Start Workout"
                          }
                          onPress={() =>
                            navigation?.navigate?.("MemberWorkoutSession", {
                              workoutPlanUuid: workout.workout_plan_uuid,
                            })
                          }
                          style={styles.repeatWorkoutBtn}
                        >
                          <Ionicons
                            name={isCompleted ? "repeat-outline" : "play"}
                            size={17}
                            color="#FFFFFF"
                          />
                          <Text style={styles.repeatWorkoutBtnText}>
                            {isCompleted ? "Repeat Workout" : "Start Workout"}
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Workout Summary"
                          onPress={() =>
                            navigation?.navigate?.("MemberWorkoutDetail", {
                              workoutPlanUuid: workout.workout_plan_uuid,
                            })
                          }
                          style={styles.summaryBtn}
                        >
                          <Text style={styles.summaryBtnText}>Summary</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                // Compact Workout Card
                return (
                  <Pressable
                    key={workout.workout_plan_uuid}
                    accessibilityRole="button"
                    onPress={() => setExpandedWorkoutId(workout.workout_plan_uuid)}
                    style={styles.compactPlanCard}
                  >
                    <View style={styles.compactPlanLeft}>
                      <View style={styles.purpleFocusPill}>
                        <Text style={styles.purpleFocusPillText}>{focusTag}</Text>
                      </View>
                      <Text style={styles.compactPlanTitle} numberOfLines={1}>
                        {workout.workout_plan_name}
                      </Text>
                      <Text style={styles.compactPlanSubtitle} numberOfLines={1}>
                        {`${trainerDisplay}${durationMins ? ` • ${durationMins} Mins` : ""}${exercises.length ? ` • ${exercises.length} Exercises` : ""}`}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Start ${workout.workout_plan_name}`}
                      onPress={() =>
                        navigation?.navigate?.("MemberWorkoutSession", {
                          workoutPlanUuid: workout.workout_plan_uuid,
                        })
                      }
                      style={styles.compactStartBtn}
                    >
                      <Text style={styles.compactStartBtnText}>Start</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )
        ) : /* TAB 2: GYM CLASSES */
        classesQuery?.isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#E91E63" size="small" />
            <Text style={styles.stateSub}>Loading gym classes...</Text>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="calendar-outline" size={28} color="#F2F2F7" />
            <Text style={styles.stateTitle}>No Gym Classes Scheduled</Text>
            <Text style={styles.stateSub}>
              Upcoming group classes from your gym will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.cardsColumn}>
            {classes.map((cls, index) => {
              const badgeColors = getClassCategoryBadgeStyle(
                cls.class_type || cls.class_name,
                index,
              );
              const seatsLeft = Math.max(0, cls.available_seats ?? 0);
              const isBooked =
                cls.booking_status === "booked" ||
                cls.booking_status === "waiting_list";
              const isPrimaryBtn = index === 0 && !isBooked;
              const coachName = cls.trainer_name
                ? cls.trainer_name.startsWith("Coach")
                  ? cls.trainer_name
                  : `Coach ${cls.trainer_name.split(" ")[0]}`
                : null;
              const classDuration = (cls as any)?.duration_minutes
                ? `${(cls as any).duration_minutes}m`
                : null;
              const studioRoom = (cls as any)?.room || (cls as any)?.location || null;
              const subtitleParts = [
                coachName,
                cls.time
                  ? `${cls.time}${classDuration ? ` (${classDuration})` : ""}`
                  : classDuration,
                studioRoom,
              ].filter(Boolean);

              return (
                <View key={cls.class_uuid} style={styles.classCard}>
                  <View style={styles.classCardTopRow}>
                    <View
                      style={[
                        styles.classCategoryPill,
                        {
                          backgroundColor: badgeColors.bg,
                          borderColor: badgeColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.classCategoryPillText,
                          { color: badgeColors.text },
                        ]}
                      >
                        {cls.class_type || "Group Class"}
                      </Text>
                    </View>

                    {seatsLeft <= 1 ? (
                      <View style={styles.spotsBadgeRow}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={14}
                          color="#E91E63"
                        />
                        <Text
                          style={[styles.spotsBadgeText, { color: "#E91E63" }]}
                        >
                          {seatsLeft === 0 ? "Full" : "1 spot left!"}
                        </Text>
                      </View>
                    ) : seatsLeft <= 4 ? (
                      <View style={styles.spotsBadgeRow}>
                        <Ionicons
                          name="flame-outline"
                          size={14}
                          color="#E91E63"
                        />
                        <Text
                          style={[styles.spotsBadgeText, { color: "#E91E63" }]}
                        >
                          {`${seatsLeft} spots left`}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.spotsNeutralText}>
                        {`${seatsLeft} spots left`}
                      </Text>
                    )}
                  </View>

                  <View style={styles.classInfoBlock}>
                    <Text style={styles.classTitle}>{cls.class_name}</Text>
                    <Text style={styles.classSubtitle}>
                      {subtitleParts.length > 0
                        ? subtitleParts.join(" • ")
                        : (cls.class_type || "Group Class")}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isBooked
                        ? `Cancel ${cls.class_name}`
                        : `Book Spot for ${cls.class_name}`
                    }
                    disabled={
                      Boolean(bookClass?.isPending || cancelClass?.isPending)
                    }
                    onPress={() => {
                      if (isBooked) {
                        cancelClass?.mutate?.(cls.class_uuid);
                      } else {
                        bookClass?.mutate?.(cls.class_uuid);
                      }
                    }}
                    style={[
                      styles.bookSpotBtn,
                      isPrimaryBtn
                        ? styles.bookSpotBtnPrimary
                        : styles.bookSpotBtnSecondary,
                    ]}
                  >
                    <Text style={styles.bookSpotBtnText}>
                      {isBooked ? "Booked • Cancel Spot" : "Book Spot"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  dynamicIslandLive: {
    borderColor: "rgba(233, 30, 99, 0.35)",
    backgroundColor: "#000000",
    paddingHorizontal: 16,
  },
  islandLiveText: {
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.2,
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
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  heroKicker: {
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
  liveTrackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#E91E63",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  liveTrackButtonActive: {
    backgroundColor: "#E91E63",
  },
  liveTrackButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  metricsGrid: {
    gap: 10,
  },
  metricsGridRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 15,
    gap: 6,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  metricSubInline: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricBarTrack: {
    height: 4,
    backgroundColor: "#1C1C1E",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  segmentedTrack: {
    flexDirection: "row",
    backgroundColor: "#000000",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedOptionActive: {
    backgroundColor: "#1C1C1E",
  },
  segmentedOptionText: {
    color: "#F2F2F7",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentedOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cardsColumn: {
    gap: 14,
  },
  expandedPlanCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 16,
  },
  expandedTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  expandedTopLeft: {
    flex: 1,
    gap: 4,
  },
  tagPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  pinkFocusPill: {
    backgroundColor: "rgba(233, 30, 99, 0.14)",
    borderColor: "rgba(233, 30, 99, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  pinkFocusPillText: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "700",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillCompleted: {
    backgroundColor: "rgba(52, 199, 89, 0.14)",
    borderColor: "rgba(52, 199, 89, 0.35)",
  },
  statusPillPending: {
    backgroundColor: "rgba(233, 30, 99, 0.14)",
    borderColor: "rgba(233, 30, 99, 0.35)",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillTextCompleted: {
    color: "#34C759",
  },
  statusPillTextPending: {
    color: "#E91E63",
  },
  expandedPlanTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  expandedPlanSubtitle: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "500",
  },
  dumbbellIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseChecklistBox: {
    backgroundColor: "#000000",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    padding: 14,
    gap: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  exerciseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  exerciseName: {
    color: "#F2F2F7",
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
  exerciseSetsReps: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "600",
  },
  expandedActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  repeatWorkoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 13,
  },
  repeatWorkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  summaryBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  compactPlanCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 12,
  },
  compactPlanLeft: {
    flex: 1,
    alignItems: "flex-start",
    gap: 4,
  },
  purpleFocusPill: {
    backgroundColor: "rgba(0, 122, 255, 0.14)",
    borderColor: "rgba(0, 122, 255, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    marginBottom: 2,
  },
  purpleFocusPillText: {
    color: "#007AFF",
    fontSize: 11,
    fontWeight: "700",
  },
  compactPlanTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  compactPlanSubtitle: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  compactStartBtn: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  compactStartBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  classCard: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 18,
    gap: 12,
  },
  classCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  classCategoryPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  spotsBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  spotsBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  spotsNeutralText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "600",
  },
  classInfoBlock: {
    gap: 3,
  },
  classTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  classSubtitle: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "500",
  },
  bookSpotBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  bookSpotBtnPrimary: {
    backgroundColor: "#E91E63",
  },
  bookSpotBtnSecondary: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bookSpotBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  stateBox: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  stateSub: {
    color: "#F2F2F7",
    fontSize: 13,
    textAlign: "center",
  },
});
