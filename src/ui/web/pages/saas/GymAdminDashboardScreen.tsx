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

export function GymOwnerDashboardContentView({ model }: { model: ReturnType<typeof useGymOwnerDashboardContentPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, displayName, setCalendarOpen, colors, formattedSelectedDate, navigation, owner, calendarOpen, ownerCalendarStyles, setCalendarMonth, calendarMonth, calendarWeekdays, calendarDays, selectedDate, setSelectedDate, OwnerMetric, activeMembers, stats, revenue, userCounts, SimpleChart, DistributionRow, workouts, pendingPayments, StatusPanel, statusCounts, PlansPanel, plans, planCounts, RevenuePanel, revenueValues, RecentMembersPanel, recent, exerciseGroupCounts, OwnerProfileMenu, profileMenuOpen, logout, setProfileMenuOpen } = model.props;
      return ((
    <PulseDashboardLayout activeLabel="Dashboard" roleLabel="Gym Owner">
      <View style={[styles.header, styles.sharedHeaderReplacement]}>
        <View style={styles.headerCopy}>
          <Text style={styles.welcome}>Welcome back, {displayName}! 👋</Text>
          <Text style={styles.headerSubtitle}>
            Here&apos;s what&apos;s happening at your gym today.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.datePill} onPress={() => setCalendarOpen((open) => !open)} accessibilityRole="button" accessibilityLabel="Select dashboard date">
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
          <Pressable style={styles.headerIcon} accessibilityRole="button" accessibilityLabel="Search members" onPress={() => navigation.navigate("MemberList")}>
            <Ionicons name="search-outline" size={21} color={colors.white} />
          </Pressable>
          <Pressable accessibilityRole="button"
            style={styles.headerIcon}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.white}
            />
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>3</Text>
            </View>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={styles.addButton}
            onPress={() => navigation.navigate("AddMember")}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add Member</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {owner?.full_name
                  ?.split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "GO"}
              </Text>
            </View>
            <View>
              <Text numberOfLines={1} style={styles.profileName}>
                {owner?.full_name ?? "Gym Owner"}
              </Text>
              <Text style={styles.profileRole}>Gym Owner</Text>
            </View>
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
        <Pressable accessibilityRole="button"
          style={ownerCalendarStyles.backdrop}
          onPress={() => setCalendarOpen(false)}
        >
          <Pressable accessibilityRole="button"
            style={ownerCalendarStyles.menu}
            onPress={(event) => event.stopPropagation()}
          >
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
                <Ionicons name="arrow-back" size={16} color="#D7E3F0" />
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
                <Ionicons name="arrow-forward" size={16} color="#D7E3F0" />
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
      <View style={styles.metricGrid}>
        <OwnerMetric
          icon="people-outline"
          label="Active Members"
          value={String(activeMembers)}
          trend="↑ 12% this month"
          tone="#0A84FF"
          styles={styles}
        />
        <OwnerMetric
          icon="walk-outline"
          label="Check-ins Today"
          value={String(stats?.checkins_today ?? 0)}
          trend="↑ Today"
          tone="#10BFA7"
          styles={styles}
        />
        <OwnerMetric
          icon="card-outline"
          label="Revenue (This Month)"
          value={formatCurrency(revenue)}
          trend="↑ 18.7% this month"
          tone="#F59E0B"
          styles={styles}
        />
        <OwnerMetric
          icon="barbell-outline"
          label="Trainers"
          value={String(stats?.trainers ?? userCounts.trainer)}
          trend="↑ Staff"
          tone="#0A84FF"
          styles={styles}
        />
      </View>
      <View style={styles.dashboardGrid}>
        <View style={styles.overviewPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Overview</Text>
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: "#18C77A" }]} />
            <Text style={styles.smallText}>Active Members</Text>
            <View style={[styles.legendDot, { backgroundColor: "#0A84FF" }]} />
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
                color="#18C77A"
                styles={styles}
              />
              <DistributionRow
                label="Trainers"
                value={userCounts.trainer}
                color="#1685F8"
                styles={styles}
              />
              <DistributionRow
                label="Reception"
                value={userCounts.receptionist}
                color="#F59E0B"
                styles={styles}
              />
              <DistributionRow
                label="Others"
                value={userCounts.sub_admin}
                color="#0A84FF"
                styles={styles}
              />
            </View>
          </View>
        </View>
        <View style={styles.activityPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Today&apos;s Activity</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          {[
            [
              "walk-outline",
              "Check-ins",
              stats?.checkins_today ?? 0,
              "#10BFA7",
            ],
            ["barbell-outline", "Workouts", workouts.length, "#0A84FF"],
            ["person-add-outline", "New Members", 0, "#1685F8"],
            [
              "cash-outline",
              "Payments Received",
              formatCurrency(revenue),
              "#18C77A",
            ],
            [
              "document-text-outline",
              "Pending Dues",
              pendingPayments,
              "#EF476F",
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
      </View>
      <View style={styles.dashboardGrid}>
        <StatusPanel
          styles={styles}
          active={activeMembers}
          statusCounts={statusCounts}
        />
        <PlansPanel styles={styles} plans={plans} planCounts={planCounts} />
        <RevenuePanel
          styles={styles}
          revenue={revenue}
          values={revenueValues}
        />
        <RecentMembersPanel styles={styles} members={recent} />
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
              <View style={[styles.quickIcon, { backgroundColor: "#0A84FF24" }]}>
                <Ionicons name="barbell-outline" size={20} color="#0A84FF" />
              </View>
              <View>
                <Text style={styles.quickTitle}>{group}</Text>
                <Text style={styles.quickSubtitle}>{count} exercises</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.quickPanel}>
        <Text style={styles.panelTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            [
              "person-add-outline",
              "Add Member",
              "New Member",
              "#0A84FF",
              "AddMember",
            ],
            [
              "qr-code-outline",
              "Mark Attendance",
              "Check-in Member",
              "#18C77A",
              "Attendance",
            ],
            [
              "person-add-outline",
              "Add Trainer",
              "New Trainer",
              "#1685F8",
              "Trainers",
            ],
            [
              "card-outline",
              "Record Payment",
              "Collect Dues",
              "#F59E0B",
              "Payments",
            ],
            [
              "pricetag-outline",
              "Create Plan",
              "New Membership Plan",
              "#10BFA7",
              "MembershipPlans",
            ],
            [
              "analytics-outline",
              "View Reports",
              "Analytics & Reports",
              "#0A84FF",
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
              <View>
                <Text style={styles.quickTitle}>{title}</Text>
                <Text style={styles.quickSubtitle}>{subtitle}</Text>
              </View>
            </Pressable>
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
    >
      <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#A9C9E9"} />
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
      <View>
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
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={13} color="#A9C9E9" />
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
          <View key={index} style={styles.chartBarGroup}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.max(5, (value / max) * 100)}%`,
                  backgroundColor: "#18C77A",
                },
              ]}
            />
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.max(5, ((chartSecondaryValues[index] ?? 0) / max) * 100)}%`,
                  backgroundColor: "#0A84FF",
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
        <View>
          <DistributionRow
            label="Active"
            value={statusCounts.active ?? active}
            color="#18C77A"
            styles={styles}
          />
          <DistributionRow
            label="Inactive"
            value={statusCounts.inactive ?? 0}
            color="#F59E0B"
            styles={styles}
          />
          <DistributionRow
            label="Expired"
            value={statusCounts.expired ?? 0}
            color="#EF476F"
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
                  backgroundColor: ["#0A84FF", "#18C77A", "#1685F8", "#F59E0B"][
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
