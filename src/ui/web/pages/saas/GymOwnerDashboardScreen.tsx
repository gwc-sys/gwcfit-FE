import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { PulseDashboardLayout } from "../../../../components/dashboard/PulseDashboardLayout";
import {
  CalendarSvg,
  CheckCircleSvg,
  ChevronRightSvg,
  PulseReferenceIcon,
  TrendingUpSvg,
  UserPlusSvg,
  UsersSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { formatCurrency, formatRelativeTime, initials } from "../../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { repdbExerciseLibrary } from "../../../../data/repdbExerciseLibrary";
import type * as React from "react";
import type {
  useGymOwnerDashboardScreenPresentation,
  useGymOwnerDashboardContentPresentation,
  useOwnerProfileMenuPresentation,
  useProfileMenuItemPresentation,
  useOwnerMetricPresentation,
  useDistributionRowPresentation,
  useSimpleChartPresentation,
  useStatusPanelPresentation,
  usePlansPanelPresentation,
  useRevenuePanelPresentation,
  useRecentMembersPanelPresentation,
} from "../../../../screens/saas/GymOwnerDashboardScreen";

export function GymOwnerDashboardScreenView({
  model,
}: {
  model: ReturnType<typeof useGymOwnerDashboardScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        GymOwnerDashboardContent,
        navigation,
        statsQuery,
        recentMembers,
        recentStaff,
        userCounts,
        plansQuery,
        paymentsQuery,
        attendanceQuery,
        workoutsQuery,
      } = model.props;
      return (
        <GymOwnerDashboardContent
          navigation={navigation}
          stats={statsQuery.data}
          members={recentMembers}
          staff={recentStaff}
          userCounts={userCounts}
          plans={plansQuery.data ?? []}
          payments={paymentsQuery.data ?? []}
          attendance={attendanceQuery.data ?? []}
          workouts={workoutsQuery.data ?? []}
        />
      );
    }
  }
}

export function GymOwnerDashboardContentView({
  model,
}: {
  model: ReturnType<typeof useGymOwnerDashboardContentPresentation>;
}): React.ReactNode {
  const [overviewPeriod, setOverviewPeriod] = useState<7 | 30>(7);
  const [exerciseFilter, setExerciseFilter] = useState<string>("All");
  const [hoveredExercise, setHoveredExercise] = useState<string | null>(null);
  const [hoveredQuickAction, setHoveredQuickAction] = useState<string | null>(null);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        styles: modelStyles,
        displayName,
        setCalendarOpen,
        colors,
        formattedSelectedDate,
        navigation,
        owner,
        calendarOpen,
        ownerCalendarStyles,
        setCalendarMonth,
        calendarMonth,
        calendarWeekdays,
        calendarDays,
        selectedDate,
        setSelectedDate,
        OwnerMetric,
        activeMembers,
        newMembersLast7,
        stats,
        revenue,
        userCounts,
        DistributionRow,
        workouts,
        pendingPayments,
        StatusPanel,
        statusCounts,
        PlansPanel,
        plans,
        planCounts,
        RevenuePanel,
        revenueValues,
        RecentMembersPanel,
        recent,
        members = [],
        attendance = [],
        OwnerProfileMenu,
        profileMenuOpen,
        logout,
        setProfileMenuOpen,
      } = model.props;
      const styles: any = modelStyles;

      const totalUsers = userCounts.total || (userCounts.member + userCounts.trainer + userCounts.receptionist + userCounts.sub_admin);
      const memberFrac = totalUsers > 0 ? (userCounts.member ?? 0) / totalUsers : 0;
      const trainerFrac = totalUsers > 0 ? (userCounts.trainer ?? 0) / totalUsers : 0;
      const staffFrac = totalUsers > 0 ? ((userCounts.receptionist ?? 0) + (userCounts.sub_admin ?? 0)) / totalUsers : 0;

      // Concentric Apple Fitness Activity Rings (3 rings: outer #E91E63, middle #34C759, inner #E91E63)
      const outerRadius = 58;
      const middleRadius = 45;
      const innerRadius = 32;
      const outerCirc = 2 * Math.PI * outerRadius;
      const middleCirc = 2 * Math.PI * middleRadius;
      const innerCirc = 2 * Math.PI * innerRadius;
      const outerDash = `${outerCirc * memberFrac} ${outerCirc}`;
      const middleDash = `${middleCirc * trainerFrac} ${middleCirc}`;
      const innerDash = `${innerCirc * staffFrac} ${innerCirc}`;
      const displayedTotalUsers = totalUsers;

      const memberPct = totalUsers > 0 ? Math.round(memberFrac * 100) : 0;
      const staffPct = totalUsers > 0 ? 100 - memberPct : 0;

      const todayKey = new Date().toISOString().slice(0, 10);
      const peakHour = (() => {
        const todayItems = (attendance || []).filter(
          (item: any) => String(item.check_in_at ?? "").slice(0, 10) === todayKey,
        );
        if (!todayItems.length) return null;
        const hourCounts: Record<number, number> = {};
        for (const item of todayItems) {
          if (item.check_in_at) {
            const h = new Date(item.check_in_at).getHours();
            hourCounts[h] = (hourCounts[h] ?? 0) + 1;
          }
        }
        let maxH = -1;
        let maxC = 0;
        for (const [hStr, cnt] of Object.entries(hourCounts)) {
          if (Number(cnt) > maxC) {
            maxC = Number(cnt);
            maxH = Number(hStr);
          }
        }
        if (maxH < 0 || maxC === 0) return null;
        const period = maxH >= 12 ? "PM" : "AM";
        const displayH = maxH % 12 === 0 ? 12 : maxH % 12;
        return `Peak: ${displayH} ${period}`;
      })();

      const newMembersInPeriod = (() => {
        const cutoff = Date.now() - overviewPeriod * 86400000;
        return (members || []).filter((m: any) => {
          const t = new Date(m.joined_at ?? m.created_at ?? 0).getTime();
          return t >= cutoff;
        }).length;
      })();

      const totalMembersCount = (members || []).length;
      const activeMembersCount = (members || []).filter((m: any) => m.status === "active" || m.is_active).length;
      const activeRatio = totalMembersCount > 0 ? Math.round((activeMembersCount / totalMembersCount) * 100) : null;

      return (
        <PulseDashboardLayout activeLabel="Dashboard" roleLabel="Gym Owner">
          <View style={[styles.header, styles.sharedHeaderReplacement]}>
            <View style={styles.headerCopy}>
              <Text style={styles.welcome}>Welcome back, {displayName}!</Text>
              <Text style={styles.headerSubtitle}>
                Here&apos;s what&apos;s happening at your gym today.
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.datePill}
                onPress={() => setCalendarOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel="Select dashboard date"
              >
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={colors.textSecondary}
                />
                <Text style={styles.dateText}>{formattedSelectedDate}</Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Modal
            visible={calendarOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setCalendarOpen(false)}
          >
            <Pressable
              accessibilityRole="button"
              style={ownerCalendarStyles.backdrop}
              onPress={() => setCalendarOpen(false)}
            >
              <Pressable
                accessibilityRole="button"
                style={ownerCalendarStyles.menu}
                onPress={(event) => event.stopPropagation()}
              >
                <View style={ownerCalendarStyles.monthHeader}>
                  <Pressable
                    accessibilityRole="button"
                    style={ownerCalendarStyles.arrowButton}
                    onPress={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    accessibilityLabel="Previous month"
                  >
                    <Ionicons name="arrow-back" size={16} color={colors.ink} />
                  </Pressable>
                  <Text style={ownerCalendarStyles.monthTitle}>
                    {calendarMonth.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    style={ownerCalendarStyles.arrowButton}
                    onPress={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    accessibilityLabel="Next month"
                  >
                    <Ionicons name="arrow-forward" size={16} color={colors.ink} />
                  </Pressable>
                </View>
                <View style={ownerCalendarStyles.weekRow}>
                  {calendarWeekdays.map((weekday, index) => (
                    <Text
                      key={`${weekday}-${index}`}
                      style={ownerCalendarStyles.weekday}
                    >
                      {weekday}
                    </Text>
                  ))}
                </View>
                <View style={ownerCalendarStyles.daysGrid}>
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={ownerCalendarStyles.dayCell}
                        />
                      );
                    }
                    const isSelected =
                      date.toDateString() === selectedDate.toDateString();
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={date.toISOString()}
                        style={[
                          ownerCalendarStyles.dayCell,
                          isSelected && ownerCalendarStyles.selectedDay,
                        ]}
                        onPress={() => {
                          setSelectedDate(date);
                          setCalendarOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            ownerCalendarStyles.dayText,
                            isSelected && ownerCalendarStyles.selectedDayText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={ownerCalendarStyles.todayButton}
                  onPress={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setCalendarMonth(
                      new Date(today.getFullYear(), today.getMonth(), 1),
                    );
                    setCalendarOpen(false);
                  }}
                >
                  <Text style={ownerCalendarStyles.today}>Today</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {/* Row 1: 4 KPI Metric Cards */}
          <View style={styles.metricGrid}>
            <OwnerMetric
              icon="people-outline"
              label="Active Members"
              value={String(activeMembers)}
              subtext="Active roster"
              tone="#E91E63"
              styles={styles}
            />
            <OwnerMetric
              icon="checkmark-done-outline"
              label="Check-ins Today"
              value={String(stats?.checkins_today ?? 0)}
              trend="Today"
              pill={peakHour ?? undefined}
              tone="#34C759"
              styles={styles}
            />
            <OwnerMetric
              icon="card-outline"
              label="Revenue (This Month)"
              value={formatCurrency(revenue)}
              subtext={revenue > 0 ? "Collected this month" : undefined}
              tone="#E91E63"
              styles={styles}
            />
            <OwnerMetric
              icon="barbell-outline"
              label="Trainers"
              value={String(stats?.trainers ?? userCounts.trainer ?? 0)}
              pill="Staff on duty"
              subtext={`${stats?.trainers ?? userCounts.trainer ?? 0} Assigned`}
              tone="#007AFF"
              styles={styles}
            />
          </View>

          {/* Row 2: Overview, Members Distribution, Today's Activity */}
          <View style={styles.dashboardGrid}>
            <View style={styles.overviewPanel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelTitle}>Overview</Text>
                  <Text style={styles.panelSubtitle}>
                    Key registration statistics
                  </Text>
                </View>
                <View style={styles.overviewTogglePills}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setOverviewPeriod(7)}
                    style={[
                      styles.periodPill,
                      overviewPeriod === 7 && styles.periodPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodPillText,
                        overviewPeriod === 7 && styles.periodPillTextActive,
                      ]}
                    >
                      7 Days
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setOverviewPeriod(30)}
                    style={[
                      styles.periodPill,
                      overviewPeriod === 30 && styles.periodPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodPillText,
                        overviewPeriod === 30 && styles.periodPillTextActive,
                      ]}
                    >
                      30 Days
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.overviewCardsRow}>
                <View style={styles.overviewSubCard}>
                  <View
                    style={[
                      styles.overviewSubCardIcon,
                      {
                        backgroundColor: "rgba(233, 30, 99, 0.14)",
                        borderColor: "rgba(233, 30, 99, 0.28)",
                      },
                    ]}
                  >
                    <UsersSvg size={17} color="#E91E63" />
                  </View>
                  <Text style={styles.overviewSubCardValue}>{activeMembers}</Text>
                  <Text style={styles.overviewSubCardLabel}>Active Members</Text>
                </View>

                <View style={styles.overviewSubCard}>
                  <View
                    style={[
                      styles.overviewSubCardIcon,
                      {
                        backgroundColor: "rgba(233, 30, 99, 0.14)",
                        borderColor: "rgba(233, 30, 99, 0.28)",
                      },
                    ]}
                  >
                    <UserPlusSvg size={17} color="#E91E63" />
                  </View>
                  <Text style={styles.overviewSubCardValue}>
                    {newMembersInPeriod}
                  </Text>
                  <Text style={styles.overviewSubCardLabel}>
                    New in {overviewPeriod} days
                  </Text>
                </View>

                <View style={styles.overviewSubCard}>
                  <View
                    style={[
                      styles.overviewSubCardIcon,
                      {
                        backgroundColor: "rgba(0, 122, 255, 0.14)",
                        borderColor: "rgba(0, 122, 255, 0.28)",
                      },
                    ]}
                  >
                    <CalendarSvg size={17} color="#007AFF" />
                  </View>
                  <Text style={styles.overviewSubCardValue}>
                    {overviewPeriod}
                  </Text>
                  <Text style={styles.overviewSubCardLabel}>Days selected</Text>
                </View>
              </View>

              <View style={styles.panelFooterRow}>
                <Text style={styles.panelFooterLabel}>Conversion status</Text>
                <View style={styles.conversionBadge}>
                  {activeRatio !== null ? (
                    <>
                      <CheckCircleSvg size={15} color="#34C759" />
                      <Text style={styles.conversionBadgeText}>
                        {activeRatio}% Active ratio
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.conversionBadgeText, { color: colors.textSecondary }]}>
                      No members enrolled
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.distributionPanel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.panelTitle}>Members Distribution</Text>
                  <Text style={styles.panelSubtitle}>User categorization</Text>
                </View>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.distributionBody}>
                <View style={styles.donutWrap}>
                  <Svg width={140} height={140} viewBox="0 0 140 140">
                    {/* Outer Ring: Members (#E91E63) */}
                    <Circle
                      cx="70"
                      cy="70"
                      r={outerRadius}
                      stroke="rgba(233, 30, 99, 0.18)"
                      strokeWidth="9"
                      fill="none"
                    />
                    <Circle
                      cx="70"
                      cy="70"
                      r={outerRadius}
                      stroke="#E91E63"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={outerDash}
                      strokeDashoffset={0}
                      transform="rotate(-90 70 70)"
                    />
                    {/* Middle Ring: Trainers (#34C759) */}
                    <Circle
                      cx="70"
                      cy="70"
                      r={middleRadius}
                      stroke="rgba(52, 199, 89, 0.18)"
                      strokeWidth="9"
                      fill="none"
                    />
                    <Circle
                      cx="70"
                      cy="70"
                      r={middleRadius}
                      stroke="#34C759"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={middleDash}
                      strokeDashoffset={0}
                      transform="rotate(-90 70 70)"
                    />
                    {/* Inner Ring: Reception (#E91E63) */}
                    <Circle
                      cx="70"
                      cy="70"
                      r={innerRadius}
                      stroke="rgba(233, 30, 99, 0.18)"
                      strokeWidth="9"
                      fill="none"
                    />
                    <Circle
                      cx="70"
                      cy="70"
                      r={innerRadius}
                      stroke="#E91E63"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={innerDash}
                      strokeDashoffset={0}
                      transform="rotate(-90 70 70)"
                    />
                  </Svg>
                  <View style={styles.donutHoleOverlay}>
                    <Text style={styles.donutValue}>{displayedTotalUsers}</Text>
                    <Text style={styles.donutLabel}>TOTAL USERS</Text>
                  </View>
                </View>
                <View style={styles.distributionLegend}>
                  <DistributionRow
                    label="Members"
                    value={userCounts.member ?? 0}
                    color="#E91E63"
                    styles={styles}
                  />
                  <DistributionRow
                    label="Trainers"
                    value={userCounts.trainer ?? 0}
                    color="#34C759"
                    styles={styles}
                  />
                  <DistributionRow
                    label="Reception"
                    value={userCounts.receptionist ?? 0}
                    color="#E91E63"
                    styles={styles}
                  />
                  <DistributionRow
                    label="Others"
                    value={userCounts.sub_admin ?? 0}
                    color="#007AFF"
                    styles={styles}
                  />
                </View>
              </View>
              <View style={styles.distributionFooterPill}>
                <Text style={styles.distributionFooterText}>
                  {totalUsers > 0
                    ? `${memberPct}% Members · ${staffPct}% Gym Staff`
                    : "No registered users yet"}
                </Text>
              </View>
            </View>

            <View style={styles.activityPanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Today&apos;s Activity</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate("Attendance")}
                >
                  <Text style={styles.viewAll}>View All</Text>
                </Pressable>
              </View>
              <View style={styles.activityList}>
                {[
                  [
                    "user-check",
                    "Check-ins",
                    stats?.checkins_today ?? 0,
                    "#34C759",
                  ],
                  [
                    "flame-outline",
                    "Workouts",
                    workouts.length,
                    "#E91E63",
                  ],
                  [
                    "people-outline",
                    "New Members",
                    (members || []).filter(
                      (m: any) =>
                        String(m.joined_at ?? m.created_at ?? "").slice(0, 10) === todayKey,
                    ).length,
                    "#E91E63",
                  ],
                  [
                    "card-outline",
                    "Payments Received",
                    formatCurrency(revenue),
                    "#007AFF",
                  ],
                  [
                    "alert-circle-outline",
                    "Pending Dues",
                    pendingPayments,
                    "#007AFF",
                  ],
                ].map(([icon, label, value, color], idx, arr) => (
                  <View
                    key={String(label)}
                    style={[
                      styles.activityRow,
                      idx < arr.length - 1 && styles.activityRowDivider,
                    ]}
                  >
                    <View
                      style={[
                        styles.activityIcon,
                        {
                          backgroundColor: `${color}18`,
                          borderColor: `${color}30`,
                        },
                      ]}
                    >
                      <PulseReferenceIcon
                        name={icon as string}
                        size={15}
                        color={color as string}
                      />
                    </View>
                    <Text style={styles.activityLabel}>{label}</Text>
                    <Text style={styles.activityValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.realtimeFooterRow}>
                <Text style={styles.realtimeText}>Updated in real-time</Text>
                <View style={styles.realtimeDot} />
              </View>
            </View>
          </View>

          {/* Row 3: Member Status, Top Plans, Revenue Overview, Recent Members */}
          <View style={styles.dashboardGrid}>
            <StatusPanel
              styles={styles}
              active={activeMembers}
              statusCounts={statusCounts}
            />
            <PlansPanel
              styles={styles}
              plans={plans}
              planCounts={planCounts}
              members={members}
              navigation={navigation}
            />
            <RevenuePanel
              styles={styles}
              revenue={revenue}
              values={revenueValues}
              navigation={navigation}
            />
            <RecentMembersPanel
              styles={styles}
              members={recent}
              navigation={navigation}
            />
          </View>

          {/* Row 4: Exercise Library */}
          <View style={styles.quickPanel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>Exercise Library</Text>
                <Text style={styles.panelSubtitle}>
                  {repdbExerciseLibrary.length} exercises grouped for workout
                  planning
                </Text>
              </View>
              <View style={styles.exerciseFilterPills}>
                {["All", "Strength", "Cardio", "Flexibility"].map((tab) => {
                  const isActive = exerciseFilter === tab;
                  return (
                    <Pressable
                      key={tab}
                      accessibilityRole="button"
                      onPress={() => setExerciseFilter(tab)}
                      style={[
                        styles.exerciseFilterPill,
                        isActive && styles.exerciseFilterPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.exerciseFilterPillText,
                          isActive && styles.exerciseFilterPillTextActive,
                        ]}
                      >
                        {tab}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.exerciseGrid}>
              {[
                {
                  group: "Chest",
                  count: 5,
                  icon: "flame-outline",
                  color: "#E91E63",
                },
                {
                  group: "Back",
                  count: 6,
                  icon: "barbell-outline",
                  color: "#E91E63",
                },
                {
                  group: "Shoulders",
                  count: 5,
                  icon: "flash-outline",
                  color: "#E91E63",
                },
                {
                  group: "Arms",
                  count: 1,
                  icon: "pulse-outline",
                  color: "#34C759",
                },
                {
                  group: "Legs & Glutes",
                  count: 7,
                  icon: "heart-outline",
                  color: "#007AFF",
                },
                {
                  group: "Core & Conditioning",
                  count: 2,
                  icon: "shield-checkmark-outline",
                  color: "#007AFF",
                },
              ].map(({ group, count, icon, color }) => {
                const isHovered = hoveredExercise === group;
                return (
                  <Pressable
                    key={group}
                    onHoverIn={() => setHoveredExercise(group)}
                    onHoverOut={() =>
                      setHoveredExercise((prev) =>
                        prev === group ? null : prev,
                      )
                    }
                    style={[
                      styles.exerciseCard,
                      isHovered && styles.cardHoverLift,
                    ]}
                    accessibilityRole="button"
                    onPress={() => navigation.navigate("WorkoutPlans")}
                  >
                    <View style={styles.exerciseCardTop}>
                      <View
                        style={[
                          styles.exerciseIconBox,
                          {
                            backgroundColor: `${color}16`,
                            borderColor: `${color}32`,
                          },
                        ]}
                      >
                        <PulseReferenceIcon
                          name={icon}
                          size={18}
                          color={color}
                        />
                      </View>
                      <ChevronRightSvg size={14} color={colors.textSecondary} />
                    </View>
                    <View style={styles.exerciseCardBottom}>
                      <Text style={styles.exerciseGroupTitle} numberOfLines={1}>
                        {group === "Core & Conditioning"
                          ? "Core & Cond..."
                          : group}
                      </Text>
                      <Text style={styles.exerciseCountSubtitle}>
                        {count} exercises
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Row 5: Quick Actions */}
          <View style={styles.quickPanel}>
            <View>
              <Text style={styles.panelTitle}>Quick Actions</Text>
              <Text style={styles.panelSubtitle}>
                Rapid operational triggers for gym management
              </Text>
            </View>
            <View style={styles.quickActionsGrid}>
              {[
                [
                  "people-outline",
                  "Add Member",
                  "New Member",
                  "#E91E63",
                  "Invitations",
                ],
                [
                  "user-check",
                  "Mark Attendance",
                  "Check-in Member",
                  "#34C759",
                  "Attendance",
                ],
                [
                  "barbell-outline",
                  "Add Trainer",
                  "New Trainer",
                  "#E91E63",
                  "Trainers",
                ],
                [
                  "card-outline",
                  "Record Payment",
                  "Collect Dues",
                  "#007AFF",
                  "Payments",
                ],
                [
                  "sparkles-outline",
                  "Create Plan",
                  "New Membership Plan",
                  "#007AFF",
                  "MembershipPlans",
                ],
                [
                  "trending-up-outline",
                  "View Reports",
                  "Analytics & Reports",
                  "#E91E63",
                  "Reports",
                ],
              ].map(([icon, title, subtitle, tone, route]) => {
                const isHovered = hoveredQuickAction === title;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={title}
                    onHoverIn={() => setHoveredQuickAction(title)}
                    onHoverOut={() =>
                      setHoveredQuickAction((prev) =>
                        prev === title ? null : prev,
                      )
                    }
                    style={[
                      styles.quickActionCard,
                      isHovered && styles.cardHoverLift,
                    ]}
                    onPress={() => navigation.navigate(route)}
                  >
                    <View
                      style={[
                        styles.quickActionIconBox,
                        {
                          backgroundColor: `${tone}16`,
                          borderColor: `${tone}32`,
                        },
                      ]}
                    >
                      <PulseReferenceIcon
                        name={icon as string}
                        size={18}
                        color={tone as string}
                      />
                    </View>
                    <View style={styles.quickActionCopy}>
                      <Text style={styles.quickActionTitle}>{title}</Text>
                      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <OwnerProfileMenu
            visible={profileMenuOpen}
            owner={owner}
            logout={logout}
            onClose={() => setProfileMenuOpen(false)}
            navigation={navigation}
            styles={styles}
          />
        </PulseDashboardLayout>
      );
    }
  }
}

export function OwnerProfileMenuView({
  model,
}: {
  model: ReturnType<typeof useOwnerProfileMenuPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        visible,
        onClose,
        ownerProfileStyles,
        owner,
        ProfileMenuItem,
        go,
        logout,
      } = model.props;
      return (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onClose}
        >
          <Pressable
            accessibilityRole="button"
            style={ownerProfileStyles.backdrop}
            onPress={onClose}
          >
            <Pressable
              accessibilityRole="button"
              style={ownerProfileStyles.menu}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={ownerProfileStyles.identity}>
                <View style={ownerProfileStyles.avatar}>
                  <Text style={ownerProfileStyles.avatarText}>
                    {owner?.full_name
                      ?.split(/\s+/)
                      .map((part: string) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "GG"}
                  </Text>
                </View>
                <View style={ownerProfileStyles.identityCopy}>
                  <Text numberOfLines={1} style={ownerProfileStyles.name}>
                    {owner?.full_name ?? "Gym Owner"}
                  </Text>
                  <Text numberOfLines={1} style={ownerProfileStyles.email}>
                    {owner?.email ?? "gymowner@gmail.com"}
                  </Text>
                </View>
              </View>
              <View style={ownerProfileStyles.divider} />
              <ProfileMenuItem
                icon="person-outline"
                label="My Profile"
                onPress={() => go("Profile")}
              />
              <ProfileMenuItem
                icon="settings-outline"
                label="Settings"
                onPress={() => go("Settings")}
              />
              <ProfileMenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => go("Notifications")}
              />
              <ProfileMenuItem
                icon="shield-checkmark-outline"
                label="Security"
                onPress={() => go("FeaturePlaceholder", { title: "Security" })}
              />
              <View style={ownerProfileStyles.divider} />
              <ProfileMenuItem
                icon="log-out-outline"
                label={logout.isPending ? "Logging out..." : "Log out"}
                danger
                disabled={logout.isPending}
                onPress={() => {
                  onClose();
                  requestLogoutConfirmation(() => logout.mutate());
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      );
    }
  }
}

export function ProfileMenuItemView({
  model,
}: {
  model: ReturnType<typeof useProfileMenuItemPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { disabled, onPress, ownerProfileStyles, icon, danger, label } =
        model.props;
      return (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [
            ownerProfileStyles.item,
            pressed && ownerProfileStyles.pressed,
            disabled && ownerProfileStyles.disabled,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? "#FF3B30" : "#E91E63"}
          />
          <Text
            style={[
              ownerProfileStyles.itemText,
              danger && ownerProfileStyles.danger,
            ]}
          >
            {label}
          </Text>
        </Pressable>
      );
    }
  }
}

export function OwnerMetricView({
  model,
}: {
  model: ReturnType<typeof useOwnerMetricPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value, trend, subtext, pill } =
        model.props;
      const webGlowStyle =
        Platform.OS === "web"
          ? ({
              backgroundImage: `radial-gradient(140px circle at 28px 28px, ${tone}22, transparent 72%)`,
            } as any)
          : undefined;
      const hasTrendArrow = typeof trend === "string" && trend.includes("↗");
      const cleanTrendText =
        typeof trend === "string" ? trend.replace(/^↗\s*/, "") : "";
      return (
        <View style={[styles.metric, webGlowStyle]}>
          <View style={styles.metricTopRow}>
            <View
              style={[
                styles.metricIcon,
                {
                  backgroundColor: `${tone}16`,
                  borderColor: `${tone}38`,
                },
              ]}
            >
              <PulseReferenceIcon
                name={label === "Check-ins Today" ? "user-check" : icon}
                size={19}
                color={tone}
              />
            </View>
            {trend ? (
              <View style={styles.metricTrendBadge}>
                {hasTrendArrow ? (
                  <TrendingUpSvg size={13} color="#34C759" />
                ) : null}
                <Text style={styles.metricTrendText}>{cleanTrendText}</Text>
              </View>
            ) : null}
            {pill && !trend ? (
              <View style={styles.metricDutyPill}>
                <Text style={styles.metricDutyPillText}>{pill}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.metricLabel} numberOfLines={1}>
            {label}
          </Text>
          <View style={styles.metricBottomRow}>
            <Text style={styles.metricValue}>{value}</Text>
            {pill && trend ? (
              <View style={styles.metricPeakPill}>
                <Text style={styles.metricPeakPillText}>{pill}</Text>
              </View>
            ) : subtext ? (
              <Text style={styles.metricSubtext}>{subtext}</Text>
            ) : null}
          </View>
        </View>
      );
    }
  }
}

export function DistributionRowView({
  model,
}: {
  model: ReturnType<typeof useDistributionRowPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, color, label, value } = model.props;
      return (
        <View style={styles.distributionRow}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.smallText}>{label}</Text>
          <Text
            style={[
              styles.distributionValue,
              Number(value) === 0 && { opacity: 0.38 },
            ]}
          >
            {value}
          </Text>
        </View>
      );
    }
  }
}

export function SimpleChartView({
  model,
}: {
  model: ReturnType<typeof useSimpleChartPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        styles,
        setOpen,
        range,
        open,
        setRange,
        chartValues,
        max,
        chartSecondaryValues,
      } = model.props;
      return (
        <View style={styles.chart}>
          <View style={styles.chartRangeWrap}>
            <Pressable
              accessibilityRole="button"
              style={styles.chartRangeButton}
              onPress={() => setOpen((current) => !current)}
            >
              <Text style={styles.smallText}>
                {range} {range === 1 ? "Day" : "Days"}
              </Text>
              <Ionicons
                name={open ? "chevron-up" : "chevron-down"}
                size={13}
                color={styles.smallText?.color || "#8E8E93"}
              />
            </Pressable>
            {open ? (
              <View style={styles.chartRangeMenu}>
                {[1, 2, 3, 5, 7].map((option) => (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    style={styles.chartRangeOption}
                    onPress={() => {
                      setRange(option);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.smallText,
                        option === range && styles.chartRangeSelected,
                      ]}
                    >
                      {option} {option === 1 ? "Day" : "Days"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.chartGrid}>
            {[0, 1, 2, 3, 4].map((line) => (
              <View key={line} style={styles.chartLine} />
            ))}
          </View>
          <View style={styles.chartBars}>
            {chartValues.map((value: number, index: number) => (
              <View key={index} style={styles.chartBarGroup}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max(5, (value / max) * 100)}%`,
                      backgroundColor: "#34C759",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max(5, ((chartSecondaryValues[index] ?? 0) / max) * 100)}%`,
                      backgroundColor: "#E91E63",
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.chartLabels}>
            {chartValues.map((_: number, index: number) => (
              <Text key={index} style={styles.chartLabel}>
                {index === chartValues.length - 1
                  ? "Today"
                  : `-${chartValues.length - index - 1}d`}
              </Text>
            ))}
          </View>
        </View>
      );
    }
  }
}

export function StatusPanelView({
  model,
}: {
  model: ReturnType<typeof useStatusPanelPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, active, DistributionRow, statusCounts } = model.props;
      const ringRadius = 46;
      const ringCircumference = 2 * Math.PI * ringRadius;
      const totalStatus = (statusCounts?.active ?? active ?? 0) + (statusCounts?.inactive ?? 0) + (statusCounts?.expired ?? 0);
      const activeFrac = totalStatus > 0 ? (statusCounts?.active ?? active ?? 0) / totalStatus : 0;
      const strokeDash = `${ringCircumference * activeFrac} ${ringCircumference}`;
      return (
        <View style={styles.smallPanel}>
          <View>
            <Text style={styles.panelTitle}>Member Status</Text>
            <Text style={styles.panelSubtitle}>
              Overview of member activity
            </Text>
          </View>
          <View style={styles.statusContent}>
            <View style={styles.statusRingWrap}>
              <Svg width={118} height={118} viewBox="0 0 118 118">
                <Circle
                  cx="59"
                  cy="59"
                  r={ringRadius}
                  stroke="rgba(52, 199, 89, 0.18)"
                  strokeWidth="12"
                  fill="none"
                />
                <Circle
                  cx="59"
                  cy="59"
                  r={ringRadius}
                  stroke="#34C759"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={strokeDash}
                  transform="rotate(-90 59 59)"
                />
              </Svg>
              <View style={styles.statusRingInner}>
                <UsersSvg size={18} color="#34C759" />
                <Text style={styles.statusRingValue}>{active}</Text>
                <Text style={styles.statusRingLabel}>ACTIVE</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusLegendList}>
            <DistributionRow
              label="Active"
              value={statusCounts.active ?? active}
              color="#34C759"
              styles={styles}
            />
            <DistributionRow
              label="Inactive"
              value={statusCounts.inactive ?? 0}
              color="#E91E63"
              styles={styles}
            />
            <DistributionRow
              label="Expired"
              value={statusCounts.expired ?? 0}
              color="#E91E63"
              styles={styles}
            />
          </View>
        </View>
      );
    }
  }
}

export function PlansPanelView({
  model,
}: {
  model: ReturnType<typeof usePlansPanelPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, rows = [], activeTiersCount = 0, navigation } = model.props;
      const maxCount = Math.max(1, ...rows.map((r: any) => r.count));
      return (
        <View style={styles.smallPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Top Plans</Text>
              <Text style={styles.panelSubtitle}>By active members</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate?.("MembershipPlans")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.plansList}>
            {rows.length > 0 ? (
              rows.slice(0, 4).map((plan: any, idx: number) => {
                const widthPercent =
                  plan.count > 0 ? `${Math.round((plan.count / maxCount) * 100)}%` : "0%";
                const barColor = idx === 0 ? "#34C759" : idx === 1 ? "#007AFF" : "#E91E63";
                return (
                  <View key={plan.id} style={styles.planItemBlock}>
                    <View style={styles.planLabelRow}>
                      <Text style={styles.planName} numberOfLines={1}>
                        {plan.name}
                      </Text>
                      <Text style={styles.planCount}>{plan.count}</Text>
                    </View>
                    <View style={styles.planTrack}>
                      {plan.count > 0 ? (
                        <View
                          style={[
                            styles.planFill,
                            {
                              width: widthPercent as any,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={[styles.planFooterText, { fontSize: 13 }]}>
                  No membership plans created yet.
                </Text>
              </View>
            )}
          </View>
          <View style={styles.planFooterPill}>
            <Text style={styles.planFooterText}>
              {activeTiersCount > 0
                ? `${activeTiersCount} Active Subscription ${activeTiersCount === 1 ? "Tier" : "Tiers"}`
                : "No active subscription tiers"}
            </Text>
          </View>
        </View>
      );
    }
  }
}

export function RevenuePanelView({
  model,
}: {
  model: ReturnType<typeof useRevenuePanelPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, revenue, values = [], max = 1, navigation } = model.props;
      const maxVal = Math.max(...values, 0);
      const peakIndex = maxVal > 0 ? values.lastIndexOf(maxVal) : -1;
      const peakWeek = peakIndex >= 0 ? `W${peakIndex + 1}` : null;
      return (
        <View style={styles.smallPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Revenue Overview</Text>
              <Text style={styles.revenueSubtitle}>Live paid revenue</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate?.("Reports")}
              style={styles.selectPill}
            >
              <Text style={styles.selectPillText}>This Month</Text>
            </Pressable>
          </View>
          <Text style={styles.revenueValue}>{formatCurrency(revenue)}</Text>
          <View style={styles.revenueBars}>
            {["W1", "W2", "W3", "W4", "W5"].map((week, index) => {
              const weekVal = values[index] ?? 0;
              const barHeight =
                maxVal > 0 && weekVal > 0
                  ? Math.max(6, Math.round((weekVal / max) * 70))
                  : 4;
              const isPeak = index === peakIndex;
              return (
                <View key={week} style={styles.revenueBarGroup}>
                  <View
                    style={[
                      styles.revenueBar,
                      { height: barHeight },
                      isPeak && styles.revenueBarPeak,
                    ]}
                  />
                  <Text
                    style={[
                      styles.chartLabel,
                      isPeak && styles.chartLabelPeak,
                    ]}
                  >
                    {week}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.revenueFooterRow}>
            <Text style={styles.revenueFooterLeft}>
              {peakWeek ? (
                <>
                  Peak Volume:{" "}
                  <Text style={styles.revenueFooterPeakText}>{peakWeek}</Text>
                </>
              ) : (
                "No weekly revenue recorded"
              )}
            </Text>
          </View>
        </View>
      );
    }
  }
}

export function RecentMembersPanelView({
  model,
}: {
  model: ReturnType<typeof useRecentMembersPanelPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, members = [], navigation } = model.props;
      const roster = members && members.length > 0 ? members.slice(0, 4) : [];

      return (
        <View style={styles.smallPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Recent Members</Text>
              <Text style={styles.panelSubtitle}>Newly registered roster</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate?.("MemberList")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.recentMembersList}>
            {roster.length > 0 ? (
              roster.map((member: any, idx: number) => {
                const fullName =
                  member.full_name ||
                  `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() ||
                  member.member_name ||
                  "Member";
                const memberInitials = initials(fullName) || "M";
                const plan =
                  member.membership_plan_name ??
                  member.membership_plan ??
                  member.plan_name ??
                  "No plan assigned";
                const timeAgo = formatRelativeTime(member.joined_at ?? member.created_at);
                const isSecond = idx % 2 === 1;
                return (
                  <View key={member.id ?? idx} style={styles.recentRow}>
                    <View
                      style={[
                        styles.recentAvatar,
                        isSecond && styles.recentAvatarSecondary,
                      ]}
                    >
                      <Text style={styles.recentAvatarText}>{memberInitials}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {fullName}
                      </Text>
                      <Text style={styles.recentPlanSubtitle} numberOfLines={1}>
                        {plan} · {timeAgo}
                      </Text>
                    </View>
                    <View style={styles.recentActiveHalo}>
                      <View style={styles.recentActiveDot} />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={[styles.planFooterText, { fontSize: 13 }]}>
                  No recent members registered yet.
                </Text>
              </View>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.registerMemberBtn}
            onPress={() => navigation?.navigate?.("Invitations")}
          >
            <Text style={styles.registerMemberBtnText}>
              + Register New Member
            </Text>
          </Pressable>
        </View>
      );
    }
  }
}
