import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, RefreshControl, Text, View } from "react-native";
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
import type * as React from "react";
import type { useGymAdminDashboardScreenPresentation, useGymOwnerDashboardContentPresentation, useOwnerProfileMenuPresentation, useProfileMenuItemPresentation, useOwnerMetricPresentation, useDistributionRowPresentation, useSimpleChartPresentation, useStatusPanelPresentation, usePlansPanelPresentation, useRevenuePanelPresentation, useRecentMembersPanelPresentation } from "../../../../screens/saas/GymAdminDashboardScreen";

export function GymAdminDashboardScreenView({ model }: { model: ReturnType<typeof useGymAdminDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { GymOwnerDashboardContent, navigation, statsQuery, recentMembers, recentStaff, userCounts, plansQuery, paymentsQuery, attendanceQuery, workoutsQuery } = model.props;
      return ((
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
    ));
    }
    case "view2": {
      const { dashboardCopy, isRefreshing, statsQuery, membersQuery, paymentsQuery, plansQuery, staffQuery, userCountsQuery, user, navigation, canManageReports, styles, canManageStaff, userCounts, canManageMembers, canManageAttendance, canManagePayments, canManageTrainers, paymentStats, recentMembers, recentStaff, roleTone } = model.props;
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
                trend="+12% this month"
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

export {
  GymOwnerDashboardContentView,
  OwnerProfileMenuView,
  ProfileMenuItemView,
  OwnerMetricView,
  DistributionRowView,
  SimpleChartView,
  StatusPanelView,
  PlansPanelView,
  RevenuePanelView,
  RecentMembersPanelView,
} from "./GymOwnerDashboardScreen";

