import { InsightCarousel } from "../../components/InsightCarousel";
import { WeekCalendar } from "../../components/WeekCalendar";
import { Pressable } from "../../components/NativePressable";
import { OwnerMobileDataContext, OwnerMobileOverview } from "../../components/OwnerMobileOverview";
import { useMemo, useState } from "react";
import { PulseStat, pulseStyles } from "../../components/PulseReference";
import { Ionicons } from "@expo/vector-icons";
import { Modal, RefreshControl, StyleSheet, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardHeader, PulseDashboardLayout, getWelcomeTitle } from "../../../../components/dashboard/PulseDashboardLayout";
import { getApiErrorMessage } from "../../../../services/api/client";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatCurrency, formatDate, formatRole, initials, memberStatusTone } from "../../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { repdbExerciseLibrary } from "../../../../data/repdbExerciseLibrary";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { controlMetrics } from "../../theme/theme";
import { referenceDashboardStyles } from "../../styles/screens/saas/GymOwnerDashboardScreen.styles";
import { GymOwnerDashboardContentView as OwnerContentView } from "./GymOwnerDashboardScreen";
import type * as React from "react";
import type { useGymAdminDashboardScreenPresentation, useGymOwnerDashboardContentPresentation, useOwnerProfileMenuPresentation, useProfileMenuItemPresentation, useOwnerMetricPresentation, useDistributionRowPresentation, useSimpleChartPresentation, useStatusPanelPresentation, usePlansPanelPresentation, useRevenuePanelPresentation, useRecentMembersPanelPresentation } from "../../../../screens/saas/GymAdminDashboardScreen";

export function GymAdminDashboardScreenView({ model }: { model: ReturnType<typeof useGymAdminDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { GymOwnerDashboardContent, navigation, statsQuery, recentMembers, recentStaff, userCounts, plansQuery, paymentsQuery, attendanceQuery, workoutsQuery } = model.props;
      return ((
      <OwnerMobileDataContext.Provider value={{ members: recentMembers, payments: paymentsQuery.data ?? [], loading: statsQuery.isLoading || plansQuery.isLoading || paymentsQuery.isLoading, error: statsQuery.error ? getApiErrorMessage(statsQuery.error) : null }}>
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
      </OwnerMobileDataContext.Provider>
    ));
    }
    case "view2": {
      const { dashboardCopy, isRefreshing, statsQuery, membersQuery, paymentsQuery, plansQuery, staffQuery, userCountsQuery, attendanceQuery, user, navigation, canManageReports, styles, canManageStaff, userCounts, canManageMembers, canManageAttendance, canManagePayments, canManageMembershipPlans, canManageTrainers, paymentStats, recentMembers, recentStaff, roleTone } = model.props;
      if (dashboardCopy.headerTitle === "Reception Dashboard") {
        return (
          <ReceptionMobileDashboard
            attendanceQuery={attendanceQuery}
            canManageAttendance={canManageAttendance}
            canManageMembers={canManageMembers}
            canManageMembershipPlans={canManageMembershipPlans}
            canManagePayments={canManagePayments}
            canManageTrainers={canManageTrainers}
            membersQuery={membersQuery}
            navigation={navigation}
            paymentStats={paymentStats}
            paymentsQuery={paymentsQuery}
            recentMembers={recentMembers}
            statsQuery={statsQuery}
            user={user}
          />
        );
      }
      return ((
    <PulseDashboardLayout
      activeLabel="Dashboard"
      roleLabel={dashboardCopy.headerTitle.replace(" Dashboard", "")}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            statsQuery.refetch();
            membersQuery.refetch();
            paymentsQuery.refetch();
            plansQuery.refetch();
            staffQuery.refetch();
            userCountsQuery.refetch();
          }}
        />
      }
    >
      <PulseDashboardHeader
        title={getWelcomeTitle(user?.full_name)}
        subtitle={dashboardCopy.body}
        onNotifications={() => navigation.navigate("Notifications")}
        onMessages={() => navigation.navigate("Notifications")}
      />

      {canManageReports ? (
        <>
          <DataState
            loading={statsQuery.isLoading}
            error={
              statsQuery.error ? getApiErrorMessage(statsQuery.error) : null
            }
          />
          {statsQuery.data ? (
            <View style={styles.metrics}>
              <MetricCard
                label="Active Members"
                value={String(statsQuery.data.active_members)}
                icon="people-outline"
                trend="Current period"
                tone="success"
              />
              <MetricCard
                label="Check-ins"
                value={String(statsQuery.data.checkins_today)}
                icon="walk-outline"
                trend="Today"
                tone="info"
              />
              <MetricCard
                label="Revenue"
                value={formatCurrency(statsQuery.data.revenue_cents_this_month)}
                icon="card-outline"
                trend="This month"
                tone="warning"
              />
              <MetricCard
                label="Trainers"
                value={String(statsQuery.data.trainers)}
                icon="barbell-outline"
                trend="Staff"
                tone="primary"
              />
            </View>
          ) : null}
        </>
      ) : null}

      {canManageStaff ? (
        <>
          <DataState
            loading={userCountsQuery.isLoading}
            error={
              userCountsQuery.error
                ? getApiErrorMessage(userCountsQuery.error)
                : null
            }
          />
          {userCountsQuery.data ? (
            <View style={styles.metrics}>
              <MetricCard
                label="Total Users"
                value={String(userCounts.total)}
                icon="people-circle-outline"
                trend="This gym"
                tone="primary"
              />
              <MetricCard
                label="Members"
                value={String(userCounts.member)}
                icon="id-card-outline"
                trend="Member accounts"
                tone="success"
              />
              <MetricCard
                label="Trainers"
                value={String(userCounts.trainer)}
                icon="barbell-outline"
                trend="Coach accounts"
                tone="info"
              />
              <MetricCard
                label="Reception"
                value={String(userCounts.receptionist)}
                icon="headset-outline"
                trend="Front desk"
                tone="warning"
              />
              <MetricCard
                label="Sub Admins"
                value={String(userCounts.sub_admin)}
                icon="code-slash-outline"
                trend="Delegated admins"
                tone="primary"
              />
            </View>
          ) : null}
        </>
      ) : null}

      <SectionHeader title="Quick Actions" action="Customize" />
      <View style={styles.quickGrid}>
        {canManageMembers ? (
          <QuickAction
            icon="person-add-outline"
            title="Add Member"
            subtitle="New profile"
            tone="primary"
            onPress={() => navigation.navigate("AddMember")}
          />
        ) : null}
        {canManageAttendance ? (
          <QuickAction
            icon="qr-code-outline"
            title="Attendance"
            subtitle="Check-ins"
            tone="info"
            onPress={() => navigation.navigate("Attendance")}
          />
        ) : null}
        {canManagePayments ? (
          <QuickAction
            icon="card-outline"
            title="Payment"
            subtitle="Record dues"
            tone="accent"
            onPress={() => navigation.navigate("Payments")}
          />
        ) : null}
        {canManageTrainers ? (
          <QuickAction
            icon="barbell-outline"
            title="Trainers"
            subtitle="Staff"
            tone="info"
            onPress={() => navigation.navigate("Trainers")}
          />
        ) : null}
        {canManageStaff ? (
          <QuickAction
            icon="people-circle-outline"
            title="Gym Users"
            subtitle="All roles"
            tone="accent"
            onPress={() => navigation.navigate("Staff")}
          />
        ) : null}
        <QuickAction
          icon="time-outline"
          title={`${paymentStats.pending} pending`}
          subtitle="Payments"
          tone="info"
          onPress={() => navigation.navigate("Payments")}
        />
        <QuickAction
          icon="pricetag-outline"
          title={`${plansQuery.data?.length ?? 0} plans`}
          subtitle="Memberships"
          tone="primary"
          onPress={() => navigation.navigate("MembershipPlans")}
        />
      </View>

      {canManageMembers ? (
        <SurfacePanel
          title="Recent members"
          kicker="Members"
          icon="people-outline"
          actionLabel="View all"
          onAction={() => navigation.navigate("MemberList")}
        >
          <DataState
            loading={membersQuery.isLoading}
            error={
              membersQuery.error ? getApiErrorMessage(membersQuery.error) : null
            }
            empty={!membersQuery.isLoading && recentMembers.length === 0}
            emptyTitle="No members found"
            emptyMessage="Add the first member profile for this gym."
            emptyActionLabel="Add Member"
            onEmptyAction={() => navigation.navigate("AddMember")}
          />
          <View style={styles.memberList}>
            {recentMembers.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.first_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberBody}>
                  <Text style={styles.memberName}>
                    {member.first_name} {member.last_name}
                  </Text>
                  <Text style={styles.memberMeta}>
                    {member.member_code} - ends{" "}
                    {formatDate(member.membership_ends_at)}
                  </Text>
                  <Text style={styles.memberMeta}>
                    Plan:{" "}
                    {relatedDisplayName(
                      member.membership_plan_name,
                      "Not assigned",
                    )}
                  </Text>
                  <Text style={styles.memberMeta}>
                    Trainer:{" "}
                    {relatedDisplayName(member.trainer_name, "Not assigned")}
                  </Text>
                </View>
                <StatusBadge
                  label={member.status}
                  tone={memberStatusTone(member.status)}
                />
              </View>
            ))}
          </View>
        </SurfacePanel>
      ) : null}

      {canManageStaff ? (
        <SurfacePanel
          title="Recent gym users"
          kicker="Accounts"
          icon="people-circle-outline"
          actionLabel="View all"
          onAction={() => navigation.navigate("Staff")}
        >
          <DataState
            loading={staffQuery.isLoading}
            error={
              staffQuery.error ? getApiErrorMessage(staffQuery.error) : null
            }
            empty={!staffQuery.isLoading && recentStaff.length === 0}
            emptyTitle="No gym users found"
            emptyMessage="Member, trainer, reception, and admin signups will appear here."
          />
          <View style={styles.memberList}>
            {recentStaff.map((staffUser) => (
              <View key={staffUser.id} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {initials(staffUser.name)}
                  </Text>
                </View>
                <View style={styles.memberBody}>
                  <Text style={styles.memberName}>{staffUser.name}</Text>
                  <Text style={styles.memberMeta}>{staffUser.email}</Text>
                </View>
                <StatusBadge
                  label={formatRole(staffUser.role)}
                  tone={roleTone(staffUser.role)}
                />
              </View>
            ))}
          </View>
        </SurfacePanel>
      ) : null}
    </PulseDashboardLayout>
  ));
    }
  }
}

/** A focused, touch-first workspace for the receptionist role. It reuses the
 * existing permission gates, queries, and navigation destinations above. */
function ReceptionMobileDashboard({
  attendanceQuery,
  canManageAttendance,
  canManageMembers,
  canManageMembershipPlans,
  canManagePayments,
  canManageTrainers,
  membersQuery,
  navigation,
  paymentStats,
  paymentsQuery,
  recentMembers,
  statsQuery,
  user,
}: any) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createReceptionDashboardStyles(colors), [colors]);
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there";
  const todayKey = new Date().toISOString().slice(0, 10);
  const attendance = attendanceQuery.data ?? [];
  const arrivals = attendanceQuery.data
    ? attendance.filter((record: any) => String(record.check_in_at ?? "").slice(0, 10) === todayKey).length
    : statsQuery.data?.checkins_today;
  const memberCount = statsQuery.data?.active_members ?? (membersQuery.data ? membersQuery.data.length : undefined);
  const serviceDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const actions = [
    canManageMembers && { label: "Find a member", detail: "Search profiles", icon: "search-outline" as const, onPress: () => navigation.navigate("MemberList") },
    canManageMembers && { label: "Add member", detail: "Create a profile", icon: "person-add-outline" as const, onPress: () => navigation.navigate("AddMember") },
    canManageTrainers && { label: "Trainers", detail: "Manage coaching staff", icon: "barbell-outline" as const, onPress: () => navigation.navigate("Trainers") },
    canManageMembershipPlans && { label: "Membership plans", detail: "Manage available plans", icon: "pricetag-outline" as const, onPress: () => navigation.navigate("MembershipPlans") },
    canManagePayments && { label: "Record payment", detail: "Collect a membership due", icon: "card-outline" as const, onPress: () => navigation.navigate("Payments") },
    canManageAttendance && { label: "Attendance history", detail: "Review today’s visits", icon: "time-outline" as const, onPress: () => navigation.navigate("Attendance") },
  ].filter(Boolean) as Array<{ label: string; detail: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }>;

  return (
    <PulseDashboardLayout activeLabel="Dashboard" roleLabel="Reception" refreshControl={<RefreshControl refreshing={Boolean(attendanceQuery.isFetching || membersQuery.isFetching || paymentsQuery.isFetching || statsQuery.isFetching)} onRefresh={() => { void attendanceQuery.refetch(); void membersQuery.refetch(); void paymentsQuery.refetch(); void statsQuery.refetch(); }} />}>
      <View style={styles.screen}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>{serviceDate}</Text>
          <Text accessibilityRole="header" style={styles.title}>Hello, {firstName}</Text>
          <Text style={styles.subtitle}>Everything needed to keep the front desk moving.</Text>
        </View>

        {canManageAttendance ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Open member check-in" onPress={() => navigation.navigate("Attendance")} style={({ pressed }) => [styles.checkInCard, pressed && styles.pressed]}>
            <View style={styles.checkInIcon}><Ionicons name="qr-code-outline" size={27} color="#FFFFFF" /></View>
            <View style={styles.checkInCopy}>
              <Text style={styles.checkInKicker}>MEMBER ARRIVAL</Text>
              <Text style={styles.checkInTitle}>Open check-in</Text>
              <Text style={styles.checkInText}>Show the live QR code for a fast, secure visit.</Text>
            </View>
            <View style={styles.checkInArrow}><Ionicons name="arrow-forward" size={20} color={colors.primary} /></View>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Today at the desk</Text>
          {(attendanceQuery.isFetching || membersQuery.isFetching || paymentsQuery.isFetching) ? <Text style={styles.loadingLabel}>Updating</Text> : null}
        </View>
        <View style={styles.metricGrid}>
          <ReceptionMetric icon="walk-outline" label="Arrivals" value={arrivals} tone={colors.primary} styles={styles} />
          <ReceptionMetric icon="people-outline" label="Active members" value={memberCount} tone={colors.success} styles={styles} />
          <ReceptionMetric icon="time-outline" label="Payment follow-ups" value={canManagePayments ? paymentStats.pending : undefined} tone={colors.warning} styles={styles} />
        </View>

        {statsQuery.error || attendanceQuery.error ? <View accessibilityRole="alert" style={styles.notice}><Ionicons name="cloud-offline-outline" size={18} color={colors.warning} /><Text style={styles.noticeText}>Some desk totals could not be refreshed. You can still use available actions.</Text></View> : null}

        <View style={styles.sectionHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Desk actions</Text>
        </View>
        <View style={styles.group}>
          {actions.map((action, index) => <Pressable key={action.label} accessibilityRole="button" onPress={action.onPress} style={({ pressed }) => [styles.actionRow, index < actions.length - 1 && styles.actionDivider, pressed && styles.rowPressed]}>
            <View style={styles.actionIcon}><Ionicons name={action.icon} size={21} color={colors.primary} /></View>
            <View style={styles.actionCopy}><Text style={styles.actionTitle}>{action.label}</Text><Text style={styles.actionDetail}>{action.detail}</Text></View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>)}
        </View>

        {canManageMembers ? <View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.sectionTitle}>Recently added</Text><Pressable accessibilityRole="button" accessibilityLabel="View all members" onPress={() => navigation.navigate("MemberList")} style={styles.textButton}><Text style={styles.textButtonLabel}>See all</Text></Pressable></View> : null}
        {canManageMembers ? <View style={styles.group}>
          {recentMembers.slice(0, 3).map((member: any, index: number) => <Pressable key={member.id} accessibilityRole="button" accessibilityLabel={`Open ${member.first_name} ${member.last_name}`} onPress={() => navigation.navigate("MemberProfile", { memberId: member.id })} style={({ pressed }) => [styles.memberRow, index < Math.min(recentMembers.length, 3) - 1 && styles.actionDivider, pressed && styles.rowPressed]}>
            <View style={styles.avatar}><Text style={styles.avatarLabel}>{member.first_name?.charAt(0)?.toUpperCase() || "M"}</Text></View>
            <View style={styles.actionCopy}><Text style={styles.actionTitle}>{member.first_name} {member.last_name}</Text><Text numberOfLines={1} style={styles.actionDetail}>{member.membership_plan_name || "No membership plan"}</Text></View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>)}
          {!membersQuery.isLoading && recentMembers.length === 0 ? <View style={styles.emptyMembers}><Ionicons name="people-outline" size={22} color={colors.textSecondary} /><Text style={styles.emptyText}>New member profiles will appear here.</Text></View> : null}
        </View> : null}
      </View>
    </PulseDashboardLayout>
  );
}

function ReceptionMetric({ icon, label, value, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: number; tone: string; styles: any }) {
  return <View style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={20} color={tone} /></View><Text style={styles.metricValue}>{typeof value === "number" ? String(value) : "—"}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const createReceptionDashboardStyles = (colors: any) => StyleSheet.create({
  screen: { gap: 16, paddingTop: 8, paddingBottom: 32 },
  intro: { gap: 3, paddingTop: 4, paddingHorizontal: 2 },
  eyebrow: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  title: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.4 },
  subtitle: { color: colors.textSecondary, fontSize: 16, lineHeight: 22, marginTop: 2 },
  checkInCard: { minHeight: 142, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 20, padding: 18, backgroundColor: colors.primary },
  checkInIcon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)" },
  checkInCopy: { flex: 1, minWidth: 0, gap: 2 },
  checkInKicker: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  checkInTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 28, fontWeight: "700" },
  checkInText: { color: "rgba(255,255,255,0.86)", fontSize: 13, lineHeight: 18 },
  checkInArrow: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.86 },
  sectionHeader: { minHeight: controlMetrics.minimumTouchSize, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 },
  sectionTitle: { flex: 1, color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: "700", letterSpacing: -0.2 },
  loadingLabel: { color: colors.textSecondary, fontSize: 13 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { flexGrow: 1, flexBasis: "45%", minWidth: 128, minHeight: 122, justifyContent: "space-between", borderRadius: 16, padding: 14, backgroundColor: colors.card },
  metricIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  metricValue: { color: colors.ink, fontSize: 28, lineHeight: 33, fontWeight: "700", marginTop: 10 },
  metricLabel: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, marginTop: 2 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, padding: 13, backgroundColor: colors.warningSoft },
  noticeText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 18 },
  group: { overflow: "hidden", borderRadius: 16, backgroundColor: colors.card },
  actionRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  actionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  actionIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.primarySoft },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { color: colors.ink, fontSize: 16, lineHeight: 21, fontWeight: "600" },
  actionDetail: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 1 },
  textButton: { minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "flex-end", justifyContent: "center" },
  textButtonLabel: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  memberRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  avatar: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: colors.primarySoft },
  avatarLabel: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  emptyMembers: { minHeight: 86, alignItems: "center", justifyContent: "center", gap: 7, padding: 16 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: "center" },
});

export function GymOwnerDashboardContentView({ model }: { model: ReturnType<typeof useGymOwnerDashboardContentPresentation> }): React.ReactNode {
  const [showDetails, setShowDetails] = useState(false);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <OwnerContentView model={model as any} />;
      const { styles, displayName, setCalendarOpen, colors, formattedSelectedDate, navigation, owner, calendarOpen, ownerCalendarStyles, setCalendarMonth, calendarMonth, calendarWeekdays, calendarDays, selectedDate, setSelectedDate, OwnerMetric, activeMembers, stats, revenue, userCounts, SimpleChart, DistributionRow, workouts, pendingPayments, StatusPanel, statusCounts, PlansPanel, plans, planCounts, RevenuePanel, revenueValues, RecentMembersPanel, recent, exerciseGroupCounts, OwnerProfileMenu, profileMenuOpen, logout, setProfileMenuOpen } = model.props;
      return ((
    <PulseDashboardLayout activeLabel="Dashboard" roleLabel="Gym Owner">
      <WeekCalendar selectedDate={selectedDate} onSelect={date => { setSelectedDate(date); setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }} />
      <OwnerMobileOverview totalMembers={userCounts.member} activeMembers={activeMembers} revenue={revenue} onMembers={() => navigation.navigate("MemberList")} onReports={() => navigation.navigate("Reports")} onMember={id => navigation.navigate("MemberProfile", { memberId: id })} />
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showDetails }} onPress={() => setShowDetails(value => !value)} style={({ pressed }) => ({ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 })}>
        <Ionicons name="analytics-outline" size={22} color={colors.primary} />
        <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: colors.ink }}>{showDetails ? "Hide insights" : "More insights"}</Text>
        <Ionicons name={showDetails ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
      </Pressable>
      <Modal
        visible={calendarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarOpen(false)}
      >
        <Pressable accessibilityRole="button"
          style={ownerCalendarStyles.backdrop}
          onPress={() => setCalendarOpen(false)}
        >
          <Pressable accessibilityRole="button"
            style={ownerCalendarStyles.menu}
            onPress={(event) => event.stopPropagation()}
           accessible={false} importantForAccessibility="no">
            <View style={ownerCalendarStyles.monthHeader}>
              <Pressable accessibilityRole="button"
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
              <Pressable accessibilityRole="button"
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
                <Text key={`${weekday}-${index}`} style={ownerCalendarStyles.weekday}>
                  {weekday}
                </Text>
              ))}
            </View>
            <View style={ownerCalendarStyles.daysGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={ownerCalendarStyles.dayCell} />;
                }
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                return (
                  <Pressable accessibilityRole="button"
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
            <Pressable accessibilityRole="button"
              style={ownerCalendarStyles.todayButton}
              onPress={() => {
                const today = new Date();
                setSelectedDate(today);
                setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setCalendarOpen(false);
              }}
            >
              <Text style={ownerCalendarStyles.today}>Today</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      {showDetails && <View style={{ gap: 20 }}>
      <View style={{ gap: 4 }}><Text accessibilityRole="header" style={styles.panelTitle}>Gym insights</Text><Text style={styles.panelSubtitle}>Memberships, activity and tools for your gym</Text></View>
      <InsightCarousel label="Gym summary">
        <OwnerMetric
          icon="people-outline"
          label="Active Members"
          value={String(activeMembers)}
          trend="Current period"
          tone="#007AFF"
          styles={styles}
        />
        <OwnerMetric
          icon="walk-outline"
          label="Check-ins Today"
          value={String(stats?.checkins_today ?? 0)}
          trend="↑ Today"
          tone="#007AFF"
          styles={styles}
        />
        <OwnerMetric
          icon="card-outline"
          label="Revenue (This Month)"
          value={formatCurrency(revenue)}
          trend="Current period"
          tone="#E91E63"
          styles={styles}
        />
        <OwnerMetric
          icon="barbell-outline"
          label="Trainers"
          value={String(stats?.trainers ?? userCounts.trainer)}
          trend="↑ Staff"
          tone="#007AFF"
          styles={styles}
        />
      </InsightCarousel>
      <InsightCarousel label="Member overview">
        <View style={styles.overviewPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Overview</Text>
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
            <Text style={styles.smallText}>Active Members</Text>
            <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
            <Text style={styles.smallText}>New Members</Text>
          </View>
          <SimpleChart styles={styles} />
        </View>
        <View style={styles.distributionPanel}>
          <Text style={styles.panelTitle}>Members Distribution</Text>
          <View style={styles.distributionBody}>
            <View style={styles.donut}>
              <View style={styles.donutHole}>
                <Text style={styles.donutValue}>{userCounts.total}</Text>
                <Text style={styles.donutLabel}>Total Users</Text>
              </View>
            </View>
            <View style={styles.distributionLegend}>
              <DistributionRow
                label="Members"
                value={userCounts.member}
                color="#34C759"
                styles={styles}
              />
              <DistributionRow
                label="Trainers"
                value={userCounts.trainer}
                color="#007AFF"
                styles={styles}
              />
              <DistributionRow
                label="Reception"
                value={userCounts.receptionist}
                color="#E91E63"
                styles={styles}
              />
              <DistributionRow
                label="Others"
                value={userCounts.sub_admin}
                color="#007AFF"
                styles={styles}
              />
            </View>
          </View>
        </View>
        <StatusPanel
          styles={styles}
          active={activeMembers}
          statusCounts={statusCounts}
        />
        <RevenuePanel
          styles={styles}
          revenue={revenue}
          values={revenueValues}
        />
      </InsightCarousel>
        <View style={styles.activityPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Today&apos;s Activity</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="View attendance" onPress={() => navigation.navigate("Attendance")} style={{ minHeight: 44, justifyContent: "center" }}><Text style={[styles.viewAll, { color: colors.primary }]}>View attendance</Text></Pressable>
          </View>
          {[
            [
              "walk-outline",
              "Check-ins",
              stats?.checkins_today ?? 0,
              "#007AFF",
            ],
            ["barbell-outline", "Workouts", workouts.length, "#007AFF"],
            ["person-add-outline", "New Members", 0, "#007AFF"],
            [
              "cash-outline",
              "Payments Received",
              formatCurrency(revenue),
              "#34C759",
            ],
            [
              "document-text-outline",
              "Pending Dues",
              pendingPayments,
              "#E91E63",
            ],
          ].map(([icon, label, value, color]) => (
            <View key={String(label)} style={styles.activityRow}>
              <View
                style={[styles.activityIcon, { backgroundColor: `${color}24` }]}
              >
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={color as string}
                />
              </View>
              <Text style={styles.activityLabel}>{label}</Text>
              <Text style={styles.activityValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      <InsightCarousel label="Plans and recent members">
        <PlansPanel styles={styles} plans={plans} planCounts={planCounts} />
        <RecentMembersPanel styles={styles} members={recent} />
      </InsightCarousel>
      <View style={styles.quickPanel}>
        <Text style={styles.panelTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            [
              "person-add-outline",
              "Add Member",
              "New Member",
              "#007AFF",
              "AddMember",
            ],
            [
              "qr-code-outline",
              "Mark Attendance",
              "Check-in Member",
              "#34C759",
              "Attendance",
            ],
            [
              "person-add-outline",
              "Add Trainer",
              "New Trainer",
              "#007AFF",
              "Trainers",
            ],
            [
              "card-outline",
              "Record Payment",
              "Collect Dues",
              "#E91E63",
              "Payments",
            ],
            [
              "pricetag-outline",
              "Create Plan",
              "New Membership Plan",
              "#007AFF",
              "MembershipPlans",
            ],
            [
              "analytics-outline",
              "View Reports",
              "Analytics & Reports",
              "#007AFF",
              "Reports",
            ],
          ].map(([icon, title, subtitle, tone, route]) => (
            <Pressable accessibilityRole="button"
              key={title}
              style={styles.quickAction}
              onPress={() => navigation.navigate(route)}
            >
              <View
                style={[styles.quickIcon, { backgroundColor: `${tone}24` }]}
              >
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={tone as string}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.quickTitle}>{title}</Text>
                <Text style={styles.quickSubtitle}>{subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.quickPanel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Exercise Library</Text>
            <Text style={styles.panelSubtitle}>
              {repdbExerciseLibrary.length} exercises grouped for workout planning
            </Text>
          </View>
          <Text style={styles.viewAll}>Start / peak pairs combined</Text>
        </View>
        <View style={styles.quickActions}>
          {exerciseGroupCounts.map(({ group, count }) => (
            <View key={group} style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                <Ionicons name="barbell-outline" size={20} color="#007AFF" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.quickTitle}>{group}</Text>
                <Text style={styles.quickSubtitle}>{count} exercises</Text>
              </View>
            </View>
          ))}
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
      </View>}
    </PulseDashboardLayout>
  ));
    }
  }
}

export function OwnerProfileMenuView({ model }: { model: ReturnType<typeof useOwnerProfileMenuPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { visible, onClose, ownerProfileStyles, owner, ProfileMenuItem, go, logout } = model.props;
      return ((
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable accessibilityRole="button" style={ownerProfileStyles.backdrop} onPress={onClose}>
        <Pressable accessibilityRole="button"
          style={ownerProfileStyles.menu}
          onPress={(event) => event.stopPropagation()}
         accessible={false} importantForAccessibility="no">
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
  ));
    }
  }
}

export function ProfileMenuItemView({ model }: { model: ReturnType<typeof useProfileMenuItemPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { disabled, onPress, ownerProfileStyles, icon, danger, label } = model.props;
      return ((
    <Pressable accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ownerProfileStyles.item,
        pressed && ownerProfileStyles.pressed,
        disabled && ownerProfileStyles.disabled,
      ]}
     accessibilityState={{ disabled: disabled }}>
      <Ionicons name={icon} size={20} color={danger ? "#FF3B30" : ownerProfileStyles.itemText?.color || "#8E8E93"} />
      <Text
        style={[
          ownerProfileStyles.itemText,
          danger && ownerProfileStyles.danger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  ));
    }
  }
}

export function OwnerMetricView({ model }: { model: ReturnType<typeof useOwnerMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value, trend } = model.props;
      return ((
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${tone}24` }]}>
        <Ionicons name={icon} size={23} color={tone} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTrend}>{trend}</Text>
      </View>
    </View>
  ));
    }
  }
}

export function DistributionRowView({ model }: { model: ReturnType<typeof useDistributionRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, color, label, value } = model.props;
      return ((
    <View style={styles.distributionRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.smallText}>{label}</Text>
      <Text style={styles.distributionValue}>{value}</Text>
    </View>
  ));
    }
  }
}

export function SimpleChartView({ model }: { model: ReturnType<typeof useSimpleChartPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, setOpen, range, open, setRange, chartValues, max, chartSecondaryValues } = model.props;
      return ((
    <View style={styles.chart}>
      <View style={styles.chartRangeWrap}>
        <Pressable accessibilityRole="button" style={styles.chartRangeButton} onPress={() => setOpen((current) => !current)}>
          <Text style={styles.smallText}>{range} {range === 1 ? "Day" : "Days"}</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={13} color={styles.smallText?.color || "#8E8E93"} />
        </Pressable>
        {open ? <View style={styles.chartRangeMenu}>{[1, 2, 3, 5, 7].map((option) => <Pressable accessibilityRole="button" key={option} style={styles.chartRangeOption} onPress={() => { setRange(option); setOpen(false); }}><Text style={[styles.smallText, option === range && styles.chartRangeSelected]}>{option} {option === 1 ? "Day" : "Days"}</Text></Pressable>)}</View> : null}
      </View>
      <View style={styles.chartGrid}>
        {[0, 1, 2, 3, 4].map((line) => (
          <View key={line} style={styles.chartLine} />
        ))}
      </View>
      <View style={styles.chartBars}>
        {chartValues.map((value: number, index: number) => (
          <View key={index} accessible accessibilityLabel={`${index === chartValues.length - 1 ? "Today" : `${chartValues.length - index - 1} days ago`}: active members ${value}, new members ${chartSecondaryValues[index] ?? 0}`} style={styles.chartBarGroup}>
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
                  backgroundColor: "#007AFF",
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
  ));
    }
  }
}

export function StatusPanelView({ model }: { model: ReturnType<typeof useStatusPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, active, DistributionRow, statusCounts } = model.props;
      return ((
    <View style={styles.smallPanel}>
      <Text style={styles.panelTitle}>Member Status</Text>
      <Text style={styles.panelSubtitle}>Overview of member activity</Text>
      <View style={styles.statusContent}>
        <View style={styles.statusRing}>
          <Text style={styles.statusRingValue}>{active}</Text>
          <Text style={styles.statusRingLabel}>Active Members</Text>
        </View>
        <View style={styles.distributionLegend}>
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
    </View>
  ));
    }
  }
}

export function PlansPanelView({ model }: { model: ReturnType<typeof usePlansPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, rows, planCounts } = model.props;
      return ((
    <View style={styles.smallPanel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Top Plans</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
      <Text style={styles.panelSubtitle}>By active members</Text>
      {rows.map((plan: any, index: number) => (
        <View key={plan.id ?? plan.name} style={styles.planRow}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.planTrack}>
            <View
              style={[
                styles.planFill,
                {
                  width: `${Math.max(12, Number(planCounts[plan.name] ?? plan.count ?? 0) * 20)}%`,
                  backgroundColor: ["#007AFF", "#34C759", "#007AFF", "#E91E63"][
                    index
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.planCount}>
            {planCounts[plan.name] ?? plan.count ?? 0}
          </Text>
        </View>
      ))}
    </View>
  ));
    }
  }
}

export function RevenuePanelView({ model }: { model: ReturnType<typeof useRevenuePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, revenue, values, max } = model.props;
      return ((
    <View style={styles.smallPanel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Revenue Overview</Text>
          <Text style={styles.revenueValue}>{formatCurrency(revenue)}</Text>
          <Text style={styles.metricTrend}>Live paid revenue</Text>
        </View>
        <View style={styles.selectPill}>
          <Text style={styles.smallText}>This Month</Text>
        </View>
      </View>
      <View style={styles.revenueBars}>
        {values.map((value: number, index: number) => (
          <View key={index} style={styles.revenueBarGroup}>
            <View
              style={[
                styles.revenueBar,
                { height: `${Math.max(8, (value / max) * 100)}%` },
              ]}
            />
            <Text style={styles.chartLabel}>W{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  ));
    }
  }
}

export function RecentMembersPanelView({ model }: { model: ReturnType<typeof useRecentMembersPanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, members } = model.props;
      return ((
    <View style={styles.smallPanel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Recent Members</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
      {members.map((member: any) => (
        <View key={member.id} style={styles.recentRow}>
          <View style={styles.recentAvatar}>
            <Text style={styles.recentAvatarText}>
              {member.first_name?.charAt(0) ?? "M"}
            </Text>
          </View>
          <View>
            <Text style={styles.recentName}>
              {member.first_name} {member.last_name}
            </Text>
            <Text style={styles.panelSubtitle}>Joined recently</Text>
          </View>
        </View>
      ))}
    </View>
  ));
    }
  }
}
