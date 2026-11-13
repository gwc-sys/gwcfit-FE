import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useDailySteps } from "../../../../hooks/useDailySteps";
import { useActivitySync } from "../../../../hooks/useActivitySync";
import {
  useCreateGoal,
  useMemberGoals,
  useUpdateGoal,
  useMemberActivity,
  useMemberNotifications,
  useSyncMemberActivity,
} from "../../../../hooks/useMember";
import type { MemberGoal } from "../../../../types/member";

interface DayOverview {
  dayName: string;
  dayNum: number;
  dateKey: string;
  status: "complete" | "partial" | "empty";
  percent: number;
  isSelected?: boolean;
}

export function MemberGoalsScreenView({
  model,
}: {
  model?: any;
}): React.JSX.Element {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isNarrow = width < 980;
  const isMobile = width < 720;

  // Real backend queries & mutations
  const hookQuery = useMemberGoals();
  const query = model?.props?.query ?? hookQuery;
  const goals = (query?.data as MemberGoal[]) ?? [];
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const activityQuery = useMemberActivity();
  const syncActivityMutation = useSyncMemberActivity();
  const unreadNotifications = useMemberNotifications(true).data ?? [];

  const activeGoal = goals.find((g) => g.status === "active") || goals[0];
  const activityData = activityQuery.data;
  const { steps: sensorSteps, hours: sensorHours, date: sensorDate, status: sensorStatus } = useDailySteps();

  // State
  const nowDate = new Date();
  const todayIso = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;
  const [search, setSearch] = useState("");
  const [selectedDayNum, setSelectedDayNum] = useState(nowDate.getDate());
  const [isGoalPaused, setIsGoalPaused] = useState(activeGoal?.status === "paused");
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [editGoalModalVisible, setEditGoalModalVisible] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(nowDate.getDate());

  // Daily target and current calories from real goal and activity data
  const realDailyTarget = activeGoal?.calories_goal ? Number(activeGoal.calories_goal) : (activityData?.today?.calories_target || 250);
  const [dailyTargetKcal, setDailyTargetKcal] = useState(realDailyTarget);
  const [tempTargetKcal, setTempTargetKcal] = useState(realDailyTarget);
  useActivitySync({
    date: sensorDate,
    hours: sensorHours,
    status: sensorStatus,
    calories: activityData?.today?.calories_completed ?? 0,
    target: dailyTargetKcal || 250,
  });

  // Compute 7 week days dynamically based on the current week and real activity logs
  const weekDays: DayOverview[] = useMemo(() => {
    const base = new Date();
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return names.map((dayName, idx) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + idx);
      const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const dayNum = dt.getDate();
      const matching =
        dateKey === activityData?.today?.activity_date
          ? activityData.today
          : activityData?.items?.find((item) => item.activity_date === dateKey);
      const daySteps = dateKey === todayIso ? Math.max(sensorSteps, matching?.steps ?? 0) : (matching?.steps ?? 0);
      const dayKcal = Math.max(matching?.calories_completed ?? 0, Math.round((daySteps * 0.75 / 1000) * 70 * 0.5));
      const target = matching?.calories_target || dailyTargetKcal || 250;
      const pct = target > 0 ? Math.round((dayKcal / target) * 100) : 0;
      return {
        dayName,
        dayNum,
        dateKey,
        percent: pct,
        status: pct >= 100 ? "complete" : pct > 0 ? "partial" : "empty",
        isSelected: dayNum === selectedDayNum,
      };
    });
  }, [activityData, selectedDayNum, sensorSteps, todayIso, dailyTargetKcal]);

  // Selected day activity details
  const selectedDayObj = weekDays.find((d) => d.dayNum === selectedDayNum);
  const selectedDateKey =
    selectedDayObj?.dateKey ??
    `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDayNum).padStart(2, "0")}`;
  const selectedDayActivity =
    selectedDateKey === activityData?.today?.activity_date
      ? activityData.today
      : activityData?.items?.find((i) => i.activity_date === selectedDateKey);

  const isSelectedToday = selectedDateKey === todayIso;

  const realHourlySteps = useMemo(() => {
    const saved = Array.isArray(selectedDayActivity?.hourly_steps) && selectedDayActivity.hourly_steps.length === 24
      ? selectedDayActivity.hourly_steps
      : Array(24).fill(0);
    if (isSelectedToday && Array.isArray(sensorHours) && sensorHours.length === 24) {
      return Array.from({ length: 24 }, (_, idx) => Math.max(saved[idx] ?? 0, sensorHours[idx] ?? 0));
    }
    return saved;
  }, [selectedDayActivity, isSelectedToday, sensorHours]);

  const todayHourlySteps = realHourlySteps.reduce((acc, v) => acc + v, 0);

  const totalSteps = Math.max(
    selectedDayActivity?.steps ?? 0,
    todayHourlySteps,
    isSelectedToday ? sensorSteps : 0
  );

  const currentKcal = Math.max(
    selectedDayActivity?.calories_completed ?? 0,
    Math.round(((totalSteps * 0.75) / 1000) * (selectedDayActivity?.calorie_estimate_weight_kg || 70) * 0.5)
  );

  // Selected Day Label
  const selectedDayLabel = useMemo(() => {
    const dt = new Date(`${selectedDateKey}T12:00:00`);
    if (Number.isNaN(dt.getTime())) return selectedDateKey;
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dt);
  }, [selectedDateKey]);

  // Daily target percentage
  const movePercentage = Math.min(
    100,
    Math.round((currentKcal / (dailyTargetKcal || 250)) * 100)
  );
  const kcalRemaining = Math.max(0, dailyTargetKcal - currentKcal);

  // Handle Save Goal from Modal
  const handleSaveDailyGoal = () => {
    setDailyTargetKcal(tempTargetKcal);
    setEditGoalModalVisible(false);

    // Call backend mutation if available
    const existingGoal = goals.find((g) => g.calories_goal != null);
    if (existingGoal) {
      updateGoal.mutate({
        goalUuid: existingGoal.goal_uuid,
        payload: { calories_goal: tempTargetKcal },
      });
    } else {
      createGoal.mutate({
        goal_name: "Daily Move goal",
        calories_goal: tempTargetKcal,
        target_weight: null,
        progress_percentage: movePercentage,
      });
    }
  };

  // Real Add quick log mutation
  const handleAddQuickLog = () => {
    const updated = [...realHourlySteps];
    const hour = new Date().getHours();
    updated[hour] = (updated[hour] || 0) + 120;
    syncActivityMutation.mutate({
      activity_date: selectedDateKey,
      utc_offset_minutes: -new Date().getTimezoneOffset(),
      device_id: "web-dashboard",
      hourly_steps: updated,
      source: "dashboard",
    });
  };

  const handleTogglePauseGoal = () => {
    const nextPaused = !isGoalPaused;
    setIsGoalPaused(nextPaused);
    if (activeGoal) {
      updateGoal.mutate({
        goalUuid: activeGoal.goal_uuid,
        payload: { status: nextPaused ? "paused" : "active" },
      });
    }
  };

  return (
    <Screen
      scroll
      maxWidth="none"
      style={styles.screenContainer}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => {
            void query.refetch();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR                                                   */}
      {/* =================================================================== */}
      <View style={[styles.headerRow, isNarrow && styles.headerRowNarrow]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleGroup}>
            <Ionicons
              name="flame"
              size={24}
              color="#E91E63"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.headerTitle}>Goals & Activity</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Track your daily movement and build a consistent routine.
          </Text>
        </View>

        <View style={[styles.headerRight, isNarrow && styles.headerRightNarrow]}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={15}
              color="#F2F2F7"
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search activity..."
              placeholderTextColor="#F2F2F7"
              style={styles.searchInput}
            />
          </View>

          {/* View Calendar Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View calendar"
            onPress={() => setCalendarModalVisible(true)}
            style={({ pressed }) => [
              styles.headerBtnPill,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#E91E63"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.headerBtnText}>View calendar</Text>
          </Pressable>

          {/* Edit Daily Goal Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit daily goal"
            onPress={() => {
              setTempTargetKcal(dailyTargetKcal);
              setEditGoalModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.editGoalBtnPill,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color="#E91E63"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.editGoalBtnText}>Edit daily goal</Text>
          </Pressable>

          {/* Notification Bell */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("MemberNotifications")}
            style={({ pressed }) => [
              styles.iconBtnCircle,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="notifications-outline" size={18} color="#F2F2F7" />
            {unreadNotifications.length > 0 ? (
              <View style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#E91E63" }} />
            ) : null}
          </Pressable>

          {/* Profile Avatar Circle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Member Profile"
            onPress={() => navigation.navigate("MemberProfileHome")}
            style={({ pressed }) => [
              styles.avatarCircle,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {(user?.full_name?.[0] || user?.email?.[0] || "M").toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 2. WEEKLY OVERVIEW CARD                                             */}
      {/* =================================================================== */}
      <View style={styles.weeklyCard}>
        <View style={styles.weeklyHeaderRow}>
          <View>
            <Text style={styles.weeklyTitle}>Weekly overview</Text>
            <Text style={styles.weeklySubtitle}>2 Nov – 8 Nov 2026</Text>
          </View>
          <View style={styles.weekNavGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              style={({ pressed }) => [
                styles.weekNavBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.weekNavText}>‹ Previous week</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next week"
              style={({ pressed }) => [
                styles.weekNavBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.weekNavText}>Next week ›</Text>
            </Pressable>
          </View>
        </View>

        {/* 7 Days Columns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {weekDays.map((day) => {
            const isSelected = selectedDayNum === day.dayNum;
            return (
              <Pressable
                key={day.dayNum}
                accessibilityRole="button"
                accessibilityLabel={`${day.dayName} ${day.dayNum}`}
                onPress={() => setSelectedDayNum(day.dayNum)}
                style={({ pressed }) => [
                  styles.dayColumnBox,
                  isSelected && styles.dayColumnBoxSelected,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayColName,
                    isSelected && styles.dayColNameSelected,
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text style={styles.dayColNum}>{day.dayNum}</Text>

                {/* Ring Indicator Mini */}
                <View style={styles.miniRingWrapper}>
                  <Svg width={30} height={30} viewBox="0 0 30 30">
                    <Circle
                      cx={15}
                      cy={15}
                      r={11}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth={3}
                      fill="none"
                    />
                    {day.status === "complete" ? (
                      <>
                        <Circle
                          cx={15}
                          cy={15}
                          r={11}
                          stroke="#E91E63"
                          strokeWidth={3}
                          strokeDasharray="69.1"
                          strokeDashoffset={69.1 * 0.2}
                          strokeLinecap="round"
                          fill="none"
                          transform="rotate(-90 15 15)"
                        />
                        <Circle
                          cx={15}
                          cy={15}
                          r={7}
                          stroke="#34C759"
                          strokeWidth={2.5}
                          strokeDasharray="44"
                          strokeDashoffset={44 * 0.3}
                          strokeLinecap="round"
                          fill="none"
                          transform="rotate(-90 15 15)"
                        />
                      </>
                    ) : day.status === "partial" ? (
                      <Circle
                        cx={15}
                        cy={15}
                        r={11}
                        stroke="#E91E63"
                        strokeWidth={3}
                        strokeDasharray="69.1"
                        strokeDashoffset={69.1 * 0.55}
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 15 15)"
                      />
                    ) : null}
                  </Svg>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* =================================================================== */}
      {/* 3. SELECTED DAY HEADER ROW                                          */}
      {/* =================================================================== */}
      <View style={styles.selectedDayHeaderRow}>
        <View style={styles.selectedDayLeft}>
          <Text style={styles.selectedDayTitle}>{selectedDayLabel}</Text>
          <View style={styles.activeDayPill}>
            <Text style={styles.activeDayPillText}>Active Selected Day</Text>
          </View>
        </View>

        <View style={styles.dayNavGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            onPress={() => setSelectedDayNum((prev) => Math.max(2, prev - 1))}
            style={({ pressed }) => [
              styles.dayNavBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.dayNavText}>‹ Previous day</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next day"
            onPress={() => setSelectedDayNum((prev) => Math.min(8, prev + 1))}
            style={({ pressed }) => [
              styles.dayNavBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.dayNavText}>Next day ›</Text>
          </Pressable>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 4. MIDDLE TWO CARDS: DAILY MOVE GOAL + ACTIVITY THROUGHOUT DAY       */}
      {/* =================================================================== */}
      <View style={[styles.middleRow, isNarrow && styles.middleRowNarrow]}>
        {/* Left Card: Daily Move goal */}
        <View style={styles.moveGoalCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleWithDot}>
              <View style={styles.redDot} />
              <Text style={styles.cardSectionTitle}>Daily Move goal</Text>
            </View>
            <View style={styles.activeStatusPill}>
              <Text style={styles.activeStatusText}>
                {isGoalPaused ? "Paused" : "Active"}
              </Text>
            </View>
          </View>

          {/* Activity Rings Concentric SVG */}
          <View style={styles.ringsSvgContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {/* Outer Track (Move - Red/Coral) */}
              <Circle
                cx={100}
                cy={100}
                r={78}
                stroke="rgba(233, 30, 99, 0.16)"
                strokeWidth={14}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={78}
                stroke="#E91E63"
                strokeWidth={14}
                strokeDasharray="490"
                strokeDashoffset={490 * (1 - Math.min(1, movePercentage / 100))}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 100 100)"
              />

              {/* Middle Track (Exercise - Neon Green) */}
              <Circle
                cx={100}
                cy={100}
                r={60}
                stroke="rgba(52, 199, 89, 0.16)"
                strokeWidth={14}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={60}
                stroke="#34C759"
                strokeWidth={14}
                strokeDasharray="377"
                strokeDashoffset={377 * (1 - Math.min(1, (movePercentage * 0.85) / 100))}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 100 100)"
              />

              {/* Inner Track (Stand - Cyan) */}
              <Circle
                cx={100}
                cy={100}
                r={42}
                stroke="rgba(0, 122, 255, 0.16)"
                strokeWidth={14}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={42}
                stroke="#007AFF"
                strokeWidth={14}
                strokeDasharray="264"
                strokeDashoffset={264 * (1 - Math.min(1, (movePercentage * 0.72) / 100))}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 100 100)"
              />
            </Svg>

            {/* Inner Center Content */}
            <View style={styles.ringsCenterBox}>
              <Text style={styles.ringsCenterPercent}>{movePercentage}%</Text>
              <Text style={styles.ringsCenterLabel}>DAILY TARGET</Text>
            </View>
          </View>

          {/* Bottom Move Stat */}
          <View style={styles.moveStatsBottom}>
            <Text style={styles.moveKcalLine}>
              <Text style={styles.moveKcalRed}>{currentKcal}</Text>
              <Text style={styles.moveKcalSlash}> / {dailyTargetKcal} kcal</Text>
            </Text>
            <Text style={styles.moveKcalRemaining}>
              {kcalRemaining} kcal remaining
            </Text>

            {/* Pause Goal Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isGoalPaused ? "Resume goal" : "Pause goal"}
              onPress={handleTogglePauseGoal}
              style={({ pressed }) => [
                styles.pauseGoalBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Ionicons
                name={isGoalPaused ? "play" : "pause"}
                size={14}
                color="#E91E63"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.pauseGoalText}>
                {isGoalPaused ? "Resume goal" : "Pause goal"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Right Card: Activity throughout the day */}
        <View style={styles.activityDayCard}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardSectionTitle}>
                Activity throughout the day
              </Text>
              <Text style={styles.cardSubtitle}>
                Hourly steps • {todayHourlySteps} total steps
              </Text>
            </View>
            <View style={styles.stepsLegendRow}>
              <View style={styles.redDot} />
              <Text style={styles.stepsLegendText}>Steps</Text>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.hourlyChartBox}>
            <View style={styles.barsContainer}>
              {realHourlySteps.map((val, idx) => {
                const heightPercent = val > 0 ? Math.min(100, (val / 110) * 100) : 0;
                return (
                  <View key={idx} style={styles.barCol}>
                    {val > 0 ? (
                      <View
                        style={[
                          styles.activeRedBar,
                          { height: `${Math.max(12, heightPercent)}%` },
                        ]}
                      />
                    ) : (
                      <View style={styles.idleDotIndicator} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* X-Axis Timeline */}
            <View style={styles.timelineLabelsRow}>
              <Text style={styles.timelineText}>00:00</Text>
              <Text style={styles.timelineText}>06:00</Text>
              <Text style={styles.timelineText}>12:00</Text>
              <Text style={styles.timelineText}>18:00</Text>
              <Text style={styles.timelineText}>24:00</Text>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.activityFooterRow}>
            <Text style={styles.recordedStepsText}>
              Recorded {todayHourlySteps} steps across active hours.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Quick Log"
              onPress={handleAddQuickLog}
              style={({ pressed }) => [
                styles.addQuickLogBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={15}
                color="#E91E63"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addQuickLogText}>Add Quick Log</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 5. BOTTOM ROW: 3 METRIC CARDS                                       */}
      {/* =================================================================== */}
      <View style={[styles.bottomMetricsRow, isNarrow && styles.bottomMetricsRowNarrow]}>
        {/* Card 1: Steps */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardTop}>
            <View style={styles.bottomCardTitleGroup}>
              <View
                style={[
                  styles.bottomSquircleIcon,
                  { backgroundColor: "rgba(233, 30, 99, 0.15)" },
                ]}
              >
                <Ionicons name="footsteps" size={17} color="#E91E63" />
              </View>
              <Text style={styles.bottomCardTitle}>Steps</Text>
            </View>
            <Ionicons name="trending-up" size={17} color="#34C759" />
          </View>

          <View style={styles.bottomCardBody}>
            <Text style={styles.bottomBigNumber}>
              {totalSteps.toLocaleString()}
            </Text>
            <Text style={styles.bottomSubtitle}>Total daily steps</Text>
          </View>

          <View style={styles.bottomProgressBarTrack}>
            <View
              style={[
                styles.bottomProgressBarFill,
                { width: "56%", backgroundColor: "#E91E63" },
              ]}
            />
          </View>
        </View>

        {/* Card 2: Distance */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardTop}>
            <View style={styles.bottomCardTitleGroup}>
              <View
                style={[
                  styles.bottomSquircleIcon,
                  { backgroundColor: "rgba(0, 122, 255, 0.15)" },
                ]}
              >
                <Ionicons name="navigate-outline" size={17} color="#007AFF" />
              </View>
              <Text style={styles.bottomCardTitle}>Distance</Text>
            </View>
            <Ionicons name="location-outline" size={17} color="#007AFF" />
          </View>

          <View style={styles.bottomCardBody}>
            <Text style={styles.bottomBigNumber}>
              4.2 <Text style={styles.bottomUnitText}>km</Text>
            </Text>
            <Text style={styles.bottomSubtitle}>Distance covered</Text>
          </View>

          <View style={styles.bottomProgressBarTrack}>
            <View
              style={[
                styles.bottomProgressBarFill,
                { width: "50%", backgroundColor: "#007AFF" },
              ]}
            />
          </View>
        </View>

        {/* Card 3: Stairs climbed */}
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardTop}>
            <View style={styles.bottomCardTitleGroup}>
              <View
                style={[
                  styles.bottomSquircleIcon,
                  { backgroundColor: "rgba(52, 199, 89, 0.15)" },
                ]}
              >
                <Ionicons name="layers-outline" size={17} color="#34C759" />
              </View>
              <Text style={styles.bottomCardTitle}>Stairs climbed</Text>
            </View>
            <Ionicons name="trending-up" size={17} color="#34C759" />
          </View>

          <View style={styles.bottomCardBody}>
            <Text style={styles.bottomBigNumber}>
              6 <Text style={styles.bottomUnitText}>flights</Text>
            </Text>
            <Text style={styles.bottomSubtitle}>18 meters elevation</Text>
          </View>

          <View style={styles.bottomProgressBarTrack}>
            <View
              style={[
                styles.bottomProgressBarFill,
                { width: "40%", backgroundColor: "#34C759" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Floating Subtle "Ask Gemini" Pill in Bottom Right */}
      <View style={styles.floatingGeminiPill}>
        <Text style={styles.floatingGeminiText}>Ask Gemini</Text>
      </View>

      {/* =================================================================== */}
      {/* 6. MODAL 1: VIEW CALENDAR                                           */}
      {/* =================================================================== */}
      <Modal
        visible={calendarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModalBox}>
            {/* Header */}
            <View style={styles.calendarModalHeader}>
              <View style={styles.calendarTitleNav}>
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.calendarModalTitle}>November 2026</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginLeft: 8 }}
                />
              </View>
              <Pressable
                onPress={() => setCalendarModalVisible(false)}
                style={styles.modalCloseCircle}
              >
                <Ionicons name="close" size={16} color="#F2F2F7" />
              </Pressable>
            </View>

            {/* Days of week */}
            <View style={styles.calendarWeekdaysRow}>
              {["M", "T", "W", "T", "F", "S", "S"].map((w, idx) => (
                <Text key={idx} style={styles.calendarWeekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            {/* 30 Days Grid */}
            <View style={styles.calendarDaysGrid}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNum) => {
                const isSelected = dayNum === selectedCalendarDay;
                const hasMoveLogged = dayNum <= 4 || dayNum === 5;
                return (
                  <Pressable
                    key={dayNum}
                    onPress={() => setSelectedCalendarDay(dayNum)}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayNum,
                        isSelected && styles.calendarDayNumSelected,
                      ]}
                    >
                      {dayNum}
                    </Text>
                    {/* Ring below day number */}
                    <View style={styles.calendarMiniRing}>
                      <Svg width={18} height={18} viewBox="0 0 18 18">
                        <Circle
                          cx={9}
                          cy={9}
                          r={6.5}
                          stroke={
                            hasMoveLogged
                              ? "#E91E63"
                              : "rgba(255, 255, 255, 0.08)"
                          }
                          strokeWidth={2}
                          strokeDasharray={hasMoveLogged && dayNum < 5 ? "40" : "40"}
                          strokeDashoffset={
                            dayNum < 5 ? "10" : dayNum === 5 ? "0" : "0"
                          }
                          fill="none"
                        />
                      </Svg>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.calendarModalFooter}>
              <View style={styles.calendarFooterLeft}>
                <View style={styles.redDot} />
                <Text style={styles.calendarFooterText}>Move Logged</Text>
              </View>
              <Pressable onPress={() => setCalendarModalVisible(false)}>
                <Text style={styles.calendarDoneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* 7. MODAL 2: EDIT DAILY GOAL                                         */}
      {/* =================================================================== */}
      <Modal
        visible={editGoalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditGoalModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editGoalModalBox}>
            {/* Header */}
            <View style={styles.editGoalHeader}>
              <Text style={styles.editGoalTitle}>Daily Move goal</Text>
              <Pressable
                onPress={() => setEditGoalModalVisible(false)}
                style={styles.modalCloseCircle}
              >
                <Ionicons name="close" size={16} color="#F2F2F7" />
              </Pressable>
            </View>

            <Text style={styles.editGoalSubtitle}>
              Set your daily active calories (kcal) target
            </Text>

            {/* Stepper */}
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease goal"
                onPress={() =>
                  setTempTargetKcal((prev) => Math.max(50, prev - 25))
                }
                style={({ pressed }) => [
                  styles.stepperCircleBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </Pressable>

              <View style={styles.stepperValueBox}>
                <Text style={styles.stepperBigValue}>{tempTargetKcal}</Text>
                <View style={styles.stepperUnderline} />
                <Text style={styles.stepperUnitText}>kcal / day</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase goal"
                onPress={() =>
                  setTempTargetKcal((prev) => Math.min(2000, prev + 25))
                }
                style={({ pressed }) => [
                  styles.stepperCircleBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Preset Pills */}
            <View style={styles.presetPillsRow}>
              {[250, 500, 750].map((preset) => (
                <Pressable
                  key={preset}
                  onPress={() => setTempTargetKcal(preset)}
                  style={[
                    styles.presetPill,
                    tempTargetKcal === preset && styles.presetPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      tempTargetKcal === preset && styles.presetPillTextActive,
                    ]}
                  >
                    {preset} kcal
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Save Goal Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Goal"
              onPress={handleSaveDailyGoal}
              style={({ pressed }) => [
                styles.saveGoalModalBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.saveGoalModalBtnText}>Save Goal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// --------------------------------------------------------------------------
// STYLESHEET (Cyberpunk Dark Glassmorphic Apple Fitness Theme)
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

  // 1. Header Bar
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 16,
  },
  headerRowNarrow: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 180,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 13,
    padding: 0,
  },
  headerBtnPill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  editGoalBtnPill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.35)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  editGoalBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  iconBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
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

  // 2. Weekly Overview Card
  weeklyCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    marginBottom: 20,
  },
  weeklyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  weeklySubtitle: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2,
  },
  weekNavGroup: {
    flexDirection: "row",
    gap: 8,
  },
  weekNavBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  weekNavText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },
  daysContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  dayColumnBox: {
    flex: 1,
    minWidth: 70,
    minHeight: 110,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayColumnBoxSelected: {
    borderWidth: 2,
    borderColor: "#E91E63",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dayColName: {
    fontSize: 12,
    color: "#F2F2F7",
    fontWeight: "500",
  },
  dayColNameSelected: {
    color: "#E91E63",
    fontWeight: "700",
  },
  dayColNum: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  miniRingWrapper: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // 3. Selected Day Header Row
  selectedDayHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectedDayLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedDayTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  activeDayPill: {
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDayPillText: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "700",
  },
  dayNavGroup: {
    flexDirection: "row",
    gap: 8,
  },
  dayNavBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayNavText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontWeight: "500",
  },

  // 4. Middle Two Cards Row
  middleRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  middleRowNarrow: {
    flexDirection: "column",
  },
  moveGoalCard: {
    flex: 0.85,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    justifyContent: "space-between",
  },
  activityDayCard: {
    flex: 1.15,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitleWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E91E63",
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2,
  },
  activeStatusPill: {
    backgroundColor: "rgba(233, 30, 99, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeStatusText: {
    color: "#E91E63",
    fontSize: 11,
    fontWeight: "700",
  },
  stepsLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepsLegendText: {
    fontSize: 12,
    color: "#F2F2F7",
  },

  // Rings SVG
  ringsSvgContainer: {
    width: 200,
    height: 200,
    alignSelf: "center",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  ringsCenterBox: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringsCenterPercent: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  ringsCenterLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#F2F2F7",
    marginTop: 2,
  },
  moveStatsBottom: {
    alignItems: "center",
    marginTop: 4,
  },
  moveKcalLine: {
    fontSize: 16,
    color: "#F2F2F7",
  },
  moveKcalRed: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E91E63",
  },
  moveKcalSlash: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F2F2F7",
  },
  moveKcalRemaining: {
    fontSize: 12.5,
    color: "#F2F2F7",
    marginTop: 4,
  },
  pauseGoalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: 9,
    width: "100%",
    marginTop: 14,
  },
  pauseGoalText: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "600",
  },

  // Bar Chart specifics
  hourlyChartBox: {
    marginVertical: 10,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    paddingBottom: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  activeRedBar: {
    width: 8,
    backgroundColor: "#E91E63",
    borderRadius: 4,
  },
  idleDotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  timelineLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  timelineText: {
    color: "#F2F2F7",
    fontSize: 11,
  },
  activityFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  recordedStepsText: {
    color: "#F2F2F7",
    fontSize: 12,
    fontStyle: "italic",
  },
  addQuickLogBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addQuickLogText: {
    color: "#E91E63",
    fontSize: 12,
    fontWeight: "700",
  },

  // 5. Bottom 3 Metric Cards
  bottomMetricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  bottomMetricsRowNarrow: {
    flexDirection: "column",
  },
  bottomCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    justifyContent: "space-between",
  },
  bottomCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomCardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bottomSquircleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomCardBody: {
    marginTop: 14,
    marginBottom: 10,
  },
  bottomBigNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  bottomUnitText: {
    fontSize: 13,
    color: "#F2F2F7",
    fontWeight: "500",
  },
  bottomSubtitle: {
    fontSize: 12,
    color: "#F2F2F7",
    marginTop: 2,
  },
  bottomProgressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },
  bottomProgressBarFill: {
    height: "100%",
    borderRadius: 2,
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

  // Modals Common
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },

  // Calendar Modal Box
  calendarModalBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
  },
  calendarModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarTitleNav: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  calendarWeekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  calendarWeekdayText: {
    fontSize: 12,
    color: "#F2F2F7",
    fontWeight: "600",
    width: 32,
    textAlign: "center",
  },
  calendarDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  calendarDayCell: {
    width: "12.5%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  calendarDayCellSelected: {
    borderWidth: 1.5,
    borderColor: "#E91E63",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  calendarDayNum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  calendarDayNumSelected: {
    color: "#E91E63",
  },
  calendarMiniRing: {
    marginTop: 1,
  },
  calendarModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  calendarFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  calendarFooterText: {
    color: "#F2F2F7",
    fontSize: 12,
  },
  calendarDoneText: {
    color: "#E91E63",
    fontSize: 13,
    fontWeight: "700",
  },

  // Edit Goal Modal Box
  editGoalModalBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 24,
    alignItems: "center",
  },
  editGoalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  editGoalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editGoalSubtitle: {
    fontSize: 13,
    color: "#F2F2F7",
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 20,
  },
  stepperCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValueBox: {
    alignItems: "center",
  },
  stepperBigValue: {
    fontSize: 38,
    fontWeight: "800",
    color: "#E91E63",
    fontVariant: ["tabular-nums"],
  },
  stepperUnderline: {
    width: 70,
    height: 2.5,
    backgroundColor: "#E91E63",
    marginVertical: 4,
    borderRadius: 1,
  },
  stepperUnitText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F2F2F7",
  },
  presetPillsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  presetPill: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  presetPillActive: {
    borderColor: "#E91E63",
    backgroundColor: "rgba(233, 30, 99, 0.15)",
  },
  presetPillText: {
    color: "#F2F2F7",
    fontSize: 12.5,
    fontWeight: "600",
  },
  presetPillTextActive: {
    color: "#E91E63",
  },
  saveGoalModalBtn: {
    width: "100%",
    backgroundColor: "#E91E63",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  saveGoalModalBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  btnPressed: {
    opacity: 0.82,
  },
});

