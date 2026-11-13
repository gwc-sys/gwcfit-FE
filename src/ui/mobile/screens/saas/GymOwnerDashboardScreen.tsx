import { InsightCarousel } from "../../components/InsightCarousel";
import { WeekCalendar } from "../../components/WeekCalendar";
import { Pressable } from "../../components/NativePressable";
import { OwnerMobileDataContext, OwnerMobileOverview } from "../../components/OwnerMobileOverview";
import { useEffect, useMemo, useRef, useState } from "react";
import { PulseStat, pulseStyles } from "../../components/PulseReference";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardHeader, PulseDashboardLayout, getWelcomeTitle } from "../../../../components/dashboard/PulseDashboardLayout";
import { useMyGym } from "../../../../hooks/useOperations";
import { getApiErrorMessage } from "../../../../services/api/client";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatCurrency, formatDate, formatRole, initials, memberStatusTone } from "../../../../utils/formatters";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { repdbExerciseLibrary } from "../../../../data/repdbExerciseLibrary";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { controlMetrics } from "../../theme/theme";
import { createReferenceDashboardStyles, referenceDashboardStyles } from "../../styles/screens/saas/GymOwnerDashboardScreen.styles";
import type * as React from "react";
import type { useGymOwnerDashboardScreenPresentation, useGymOwnerDashboardContentPresentation, useOwnerProfileMenuPresentation, useProfileMenuItemPresentation, useOwnerMetricPresentation, useDistributionRowPresentation, useSimpleChartPresentation, useStatusPanelPresentation, usePlansPanelPresentation, useRevenuePanelPresentation, useRecentMembersPanelPresentation } from "../../../../screens/saas/GymOwnerDashboardScreen";

export function GymOwnerDashboardScreenView({ model }: { model: ReturnType<typeof useGymOwnerDashboardScreenPresentation> }): React.ReactNode {
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
    default:
      return null;
  }
}

export function GymOwnerDashboardContentView({ model }: { model: ReturnType<typeof useGymOwnerDashboardContentPresentation> }): React.ReactNode {
  const [searchQuery, setSearchQuery] = useState("");
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, displayName, setCalendarOpen, colors, formattedSelectedDate, navigation, owner, calendarOpen, ownerCalendarStyles, setCalendarMonth, calendarMonth, calendarWeekdays, calendarDays, selectedDate, setSelectedDate, OwnerMetric, activeMembers, stats, revenue, userCounts, SimpleChart, DistributionRow, workouts, pendingPayments, StatusPanel, statusCounts, PlansPanel, plans, planCounts, RevenuePanel, revenueValues, RecentMembersPanel, recent, attendance = [], exerciseGroupCounts, gymFeedbackQuery, OwnerProfileMenu, profileMenuOpen, logout, setProfileMenuOpen } = model.props;

      const { isSmallPhone, isLargeFont, width } = useResponsiveLayout();
      const s = useMemo(() => createReferenceDashboardStyles(colors), [colors]);
      const gymName = owner?.gym_name?.trim() || "ZD Fitness";
      const displayActive = activeMembers ?? 0;
      const displayCheckins = stats?.checkins_today ?? 0;
      const displayRevenue = revenue ? formatCurrency(revenue) : "₹0";
      const displayTrainers = stats?.trainers ?? userCounts.trainer ?? 0;

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

      const totalUsers = userCounts.total ?? (displayActive + (userCounts.trainer ?? 0) + (userCounts.receptionist ?? 0) + (userCounts.sub_admin ?? 0));
      const memberUsers = userCounts.member ?? displayActive;
      const trainerUsers = userCounts.trainer ?? (stats?.trainers ?? 0);
      const receptionUsers = userCounts.receptionist ?? 0;
      const otherUsers = userCounts.sub_admin ?? 0;

      const memberPct = totalUsers > 0 ? Math.round((memberUsers / totalUsers) * 100) : 0;
      const trainerPct = totalUsers > 0 ? Math.round((trainerUsers / totalUsers) * 100) : 0;
      const receptionPct = totalUsers > 0 ? Math.round((receptionUsers / totalUsers) * 100) : 0;
      const otherPct = totalUsers > 0 ? Math.max(0, 100 - memberPct - trainerPct - receptionPct) : 0;

      const expiringMembers = (recent && recent.length > 0)
        ? recent.filter((m: any) => m.membership_ends_at || m.status === "active").slice(0, 2)
        : [];

      const myGymQuery = useMyGym(Boolean(owner?.gym_id));
      const gymSettings = (myGymQuery.data?.settings ?? {}) as Record<string, any>;
      const rawGrace =
        gymSettings?.payment_grace_ends_at ||
        (myGymQuery.data as any)?.subscription?.current_period_ends_at ||
        (owner as any)?.payment_grace_ends_at ||
        (owner as any)?.subscription?.current_period_ends_at ||
        (owner as any)?.settings?.payment_grace_ends_at;

      let daysRemaining: number | null = null;
      let isExpired = false;

      if (rawGrace) {
        const deadline = Date.parse(String(rawGrace));
        if (Number.isFinite(deadline)) {
          daysRemaining = Math.ceil((deadline - Date.now()) / 86400000);
          if (daysRemaining <= 0) {
            isExpired = true;
          }
        }
      } else if (myGymQuery.data?.status === "suspended") {
        isExpired = true;
        daysRemaining = 0;
      } else {
        daysRemaining = null;
      }

      // ONLY show when expired or when <= 5 days remaining
      const shouldShowNotice = isExpired || (daysRemaining !== null && daysRemaining <= 5);

      const [showNoticeModal, setShowNoticeModal] = useState(false);
      const hasAutoOpenedModal = useRef(false);

      useEffect(() => {
        if (shouldShowNotice && !hasAutoOpenedModal.current) {
          hasAutoOpenedModal.current = true;
          setShowNoticeModal(true);
        }
      }, [shouldShowNotice]);

      return (
        <PulseDashboardLayout activeLabel="Dashboard" roleLabel="Gym Owner" hideDefaultHeader={true} contentStyle={{ paddingBottom: 140 }}>
          {/* Top Header / Action Row: Real PulseFit Logo, Search bar with ⌘K, Notifications button, Orange ZF avatar with green dot */}
          <View style={[s.topActionRow, isSmallPhone && { paddingHorizontal: 12, gap: 6 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => setProfileMenuOpen?.(true)}
              style={[s.pinkAvatarButton, isSmallPhone && { width: 36, height: 36, borderRadius: 18 }]}
            >
              <Image
                source={require("../../../../../assets/images/pulsefit-logo.png")}
                style={isSmallPhone ? { width: 22, height: 22 } : s.headerLogoImage}
                resizeMode="contain"
              />
            </Pressable>

            <View style={[s.searchBar, isSmallPhone && { paddingHorizontal: 8, height: 38 }]}>
              <Ionicons name="search-outline" size={isSmallPhone ? 15 : 17} color={colors.textSecondary} />
              <TextInput
                accessibilityLabel="Search members..."
                style={[s.searchInput, isSmallPhone && { fontSize: 12 }]}
                placeholder={isSmallPhone ? "Search..." : "Search members..."}
                placeholderTextColor={colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {width >= 410 && !isLargeFont ? (
                <View style={s.cmdBadge}>
                  <Text style={s.cmdBadgeText}>⌘K</Text>
                </View>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              onPress={() => navigation.navigate("Notifications")}
              style={[s.qrCircleButton, isSmallPhone && { width: 36, height: 36, borderRadius: 18 }]}
            >
              <Ionicons name="notifications-outline" size={isSmallPhone ? 18 : 20} color={colors.ink} />
            </Pressable>

            <View style={s.orangeAvatarContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open gym details"
                onPress={() => setProfileMenuOpen?.(true)}
                style={[s.orangeAvatarButton, isSmallPhone && { width: 36, height: 36, borderRadius: 18 }]}
              >
                <Text style={[s.orangeAvatarText, isSmallPhone && { fontSize: 12 }]}>ZF</Text>
              </Pressable>
              <View style={s.avatarOnlineDot} />
            </View>
          </View>

          {/* Notice / Alert Strip Banner: ONLY shown when expired or <= 5 days remaining */}
          {shouldShowNotice ? (
            <View style={s.noticeBanner}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View payment expiration details"
                onPress={() => setShowNoticeModal(true)}
                style={s.noticeTextGroup}
              >
                <Text style={s.noticeText}>
                  {isExpired
                    ? "Platform subscription expired"
                    : daysRemaining === 0
                    ? "Payment due today"
                    : `Payment due in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View platform plans"
                onPress={() => navigation.navigate("MembershipPlans")}
              >
                <Text style={s.noticeDetails}>Details</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Key Performance (2x2 Grid) */}
          <View style={[s.kpiGrid, isSmallPhone && { paddingHorizontal: 12, rowGap: 8 }]}>
            {/* KPI Card 1: Active Members */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Active Members"
              onPress={() => navigation.navigate("MemberList")}
              style={[s.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}
            >
              <View style={s.kpiTopRow}>
                <View style={[s.kpiIconBox, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                  <Ionicons name="people" size={18} color="#E91E63" />
                </View>
                <View style={[s.kpiBadge, { backgroundColor: "rgba(52, 199, 89, 0.14)" }]}>
                  <Text style={[s.kpiBadgeText, { color: "#34C759" }]}>↗ Active</Text>
                </View>
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.kpiValue}>{displayActive}</Text>
              <Text style={s.kpiTitle}>Active Members</Text>
              <Text numberOfLines={1} style={s.kpiSubtitle}>vs last month</Text>
            </Pressable>

            {/* KPI Card 2: Check-ins Today (Value is Neon Green #34C759) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Check-ins Today"
              onPress={() => navigation.navigate("Attendance")}
              style={[s.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}
            >
              <View style={s.kpiTopRow}>
                <View style={[s.kpiIconBox, { backgroundColor: "rgba(52, 199, 89, 0.14)" }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                </View>
                {peakHour ? (
                  <View style={[s.kpiBadge, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                    <Text style={[s.kpiBadgeText, { color: "#007AFF" }]}>{peakHour}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.kpiValueGreen}>{displayCheckins}</Text>
              <Text style={s.kpiTitle}>Check-ins Today</Text>
              <Text numberOfLines={1} style={s.kpiSubtitle}>Live turnstile feed</Text>
            </Pressable>

            {/* KPI Card 3: Revenue (Month) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Revenue (Month)"
              onPress={() => navigation.navigate("Reports")}
              style={[s.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}
            >
              <View style={s.kpiTopRow}>
                <View style={[s.kpiIconBox, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                  <Ionicons name="card" size={18} color="#E91E63" />
                </View>
                <View style={[s.kpiBadge, { backgroundColor: "rgba(52, 199, 89, 0.14)" }]}>
                  <Text style={[s.kpiBadgeText, { color: "#34C759" }]}>Tracked</Text>
                </View>
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.kpiValue}>{displayRevenue}</Text>
              <Text style={s.kpiTitle}>Revenue (Month)</Text>
              <Text numberOfLines={1} style={s.kpiSubtitle}>Current billing period</Text>
            </Pressable>

            {/* KPI Card 4: Trainers Assigned */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trainers Assigned"
              onPress={() => navigation.navigate("Trainers")}
              style={[s.kpiCard, (isSmallPhone || isLargeFont) && { width: "100%", padding: 12 }]}
            >
              <View style={s.kpiTopRow}>
                <View style={[s.kpiIconBox, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                  <Ionicons name="person" size={18} color="#007AFF" />
                </View>
                <View style={[s.kpiBadge, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                  <Text style={[s.kpiBadgeText, { color: "#007AFF" }]}>Staff</Text>
                </View>
              </View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.kpiValue}>{displayTrainers}</Text>
              <Text style={s.kpiTitle}>Trainers Assigned</Text>
              <Text numberOfLines={1} style={s.kpiSubtitle}>{trainerUsers > 0 ? `${trainerUsers} on roster` : "Roster open"}</Text>
            </Pressable>
          </View>

          {/* Members Distribution Section */}
          <View style={s.distributionCard}>
            <View style={s.distributionHeader}>
              <View>
                <Text style={s.distributionTitle}>MEMBERS DISTRIBUTION</Text>
                <Text style={s.distributionSubtitle}>User Categorization</Text>
              </View>
              <View style={s.totalBadge}>
                <Text style={s.totalBadgeText}>{totalUsers} Total Users</Text>
              </View>
            </View>

            {/* Segmented Horizontal Progress Bar */}
            <View style={s.segmentedBar}>
              {totalUsers > 0 ? (
                <>
                  <View style={[s.segmentPink, { flex: Math.max(1, memberPct) }]} />
                  <View style={[s.segmentGreen, { flex: Math.max(1, trainerPct) }]} />
                  <View style={[s.segmentYellow, { flex: Math.max(1, receptionPct) }]} />
                  <View style={[s.segmentBlue, { flex: Math.max(1, otherPct) }]} />
                </>
              ) : (
                <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0.12)", borderRadius: 4 }} />
              )}
            </View>

            {/* 2x2 Category Legend Grid (Stack on small screens) */}
            <View style={s.distributionGrid}>
              <View style={s.distributionRow}>
                {/* Members */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Members distribution"
                  onPress={() => navigation.navigate("MemberList")}
                  style={s.distributionPill}
                >
                  <View style={s.distributionPillLeft}>
                    <View style={[s.distributionDot, { backgroundColor: "#E91E63" }]} />
                    <Text style={s.distributionLabel}>Members</Text>
                  </View>
                  <Text style={s.distributionCount}>
                    {memberUsers} <Text style={s.distributionPercent}>({memberPct}%)</Text>
                  </Text>
                </Pressable>
                {/* Trainers */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Trainers distribution"
                  onPress={() => navigation.navigate("Trainers")}
                  style={s.distributionPill}
                >
                  <View style={s.distributionPillLeft}>
                    <View style={[s.distributionDot, { backgroundColor: "#34C759" }]} />
                    <Text style={s.distributionLabel}>Trainers</Text>
                  </View>
                  <Text style={s.distributionCount}>
                    {trainerUsers} <Text style={s.distributionPercent}>({trainerPct}%)</Text>
                  </Text>
                </Pressable>
              </View>

              <View style={s.distributionRow}>
                {/* Reception */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reception distribution"
                  onPress={() => navigation.navigate("Staff")}
                  style={s.distributionPill}
                >
                  <View style={s.distributionPillLeft}>
                    <View style={[s.distributionDot, { backgroundColor: "#E91E63" }]} />
                    <Text style={s.distributionLabel}>Reception</Text>
                  </View>
                  <Text style={s.distributionCount}>
                    {receptionUsers} <Text style={s.distributionPercent}>({receptionPct}%)</Text>
                  </Text>
                </Pressable>
                {/* Others */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Others distribution"
                  onPress={() => navigation.navigate("Staff")}
                  style={s.distributionPill}
                >
                  <View style={s.distributionPillLeft}>
                    <View style={[s.distributionDot, { backgroundColor: "#007AFF" }]} />
                    <Text style={s.distributionLabel}>Others</Text>
                  </View>
                  <Text style={s.distributionCount}>
                    {otherUsers} <Text style={s.distributionPercent}>({otherPct}%)</Text>
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={s.distributionFooterText}>
              {totalUsers > 0
                ? `${memberPct}% Active Members • ${100 - memberPct}% Gym Staff & Support`
                : "No registered members or staff yet"}
            </Text>
          </View>

          {/* Membership Expirations Section */}
          <View style={s.expirationCard}>
            <View style={s.expirationHeader}>
              <View>
                <Text style={s.expirationTitle}>MEMBERSHIP EXPIRATIONS</Text>
                <Text style={s.expirationSubtitle}>Upcoming renewals & due actions</Text>
              </View>
              <View style={s.dueSoonBadge}>
                <Text style={s.dueSoonBadgeText}>
                  {expiringMembers.length > 0 ? `${expiringMembers.length} Due Soon` : "Up to date"}
                </Text>
              </View>
            </View>

            {expiringMembers.length > 0 ? (
              expiringMembers.map((m: any, idx: number) => {
                const memberName = `${m.first_name ?? "Member"} ${m.last_name ?? ""}`.trim();
                const memberInitials = (m.first_name ? `${m.first_name[0]}${m.last_name?.[0] ?? ""}` : "M").toUpperCase();
                const planName = m.membership_plan_name ?? "Plan";
                const isDue = idx === 0;
                return (
                  <View key={m.id ?? idx} style={s.expirationMemberRow}>
                    <View style={[s.memberAvatarCircle, { backgroundColor: idx % 2 === 0 ? "#E91E63" : "#007AFF" }]}>
                      <Text style={s.memberAvatarText}>{memberInitials}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                      <Text numberOfLines={1} style={s.memberName}>{memberName}</Text>
                      <View style={s.memberSubRow}>
                        <Text style={s.memberPlanMuted}>{planName} • </Text>
                        <Text style={isDue ? s.memberDueGold : s.memberActiveGreen}>
                          {isDue ? "Due soon" : "Active status"}
                        </Text>
                      </View>
                    </View>
                    {isDue ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remind ${memberName}`}
                        onPress={() => navigation.navigate("Payments")}
                        style={s.remindButton}
                      >
                        <Text style={s.remindButtonText}>Remind</Text>
                      </Pressable>
                    ) : (
                      <View style={s.onlineGreenDot} />
                    )}
                  </View>
                );
              })
            ) : (
              <View style={{ paddingVertical: 14, alignItems: "center" }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No memberships expiring soon.</Text>
              </View>
            )}
          </View>

          {/* QUICK ACTIONS Section */}
          <View style={s.quickHeaderRow}>
            <Text style={s.quickHeaderTitle}>QUICK ACTIONS</Text>
            <Text style={s.quickHeaderSubtitle}>Rapid operational triggers</Text>
          </View>

          <View style={[s.quickGrid, isSmallPhone && { gap: 8 }]}>
            {/* 1. Add Member */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Member"
              onPress={() => navigation.navigate("Invitations")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                <Ionicons name="person-add-outline" size={20} color="#E91E63" />
              </View>
              <Text style={s.quickTitle}>Add Member</Text>
            </Pressable>

            {/* 2. Mark Pass (Neon Green Border + Neon Green Title) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark Pass"
              onPress={() => navigation.navigate("Attendance")}
              style={[s.quickCard, s.passScanCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(52, 199, 89, 0.14)" }]}>
                <Ionicons name="qr-code-outline" size={20} color="#34C759" />
              </View>
              <Text style={s.quickTitleGreen}>Mark Pass</Text>
            </Pressable>

            {/* 3. Add Trainer */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Trainer"
              onPress={() => navigation.navigate("Trainers")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                <Ionicons name="person-outline" size={20} color="#E91E63" />
              </View>
              <Text style={s.quickTitle}>Add Trainer</Text>
            </Pressable>

            {/* 4. Record Pay */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Record Pay"
              onPress={() => navigation.navigate("Payments")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                <Ionicons name="card-outline" size={20} color="#E91E63" />
              </View>
              <Text style={s.quickTitle}>Record Pay</Text>
            </Pressable>

            {/* 5. Create Plan */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create Plan"
              onPress={() => navigation.navigate("MembershipPlans")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                <Ionicons name="star-outline" size={20} color="#007AFF" />
              </View>
              <Text style={s.quickTitle}>Create Plan</Text>
            </Pressable>

            {/* 6. View Reports */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Reports"
              onPress={() => navigation.navigate("Reports")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                <Ionicons name="bar-chart-outline" size={20} color="#007AFF" />
              </View>
              <Text style={s.quickTitle}>View Reports</Text>
            </Pressable>

            {/* 7. Invitations */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invitations"
              onPress={() => navigation.navigate("Invitations")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(0, 122, 255, 0.14)" }]}>
                <Ionicons name="mail-outline" size={20} color="#007AFF" />
              </View>
              <Text style={s.quickTitle}>Invitations</Text>
            </Pressable>

            {/* 8. Workouts */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Workouts"
              onPress={() => navigation.navigate("WorkoutPlans")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(233, 30, 99, 0.14)" }]}>
                <Ionicons name="barbell-outline" size={20} color="#E91E63" />
              </View>
              <Text style={s.quickTitle}>Workouts</Text>
            </Pressable>

            {/* 9. Nutrition */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nutrition"
              onPress={() => navigation.navigate("DietPlans")}
              style={[s.quickCard, isSmallPhone && { width: "48%" }]}
            >
              <View style={[s.quickIconCircle, { backgroundColor: "rgba(52, 199, 89, 0.14)" }]}>
                <Ionicons name="nutrition-outline" size={20} color="#34C759" />
              </View>
              <Text style={s.quickTitle}>Nutrition</Text>
            </Pressable>
          </View>

          {/* Gym feedback & ratings */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gym feedback and ratings"
            onPress={() => navigation.navigate("RatingsFeedback")}
            style={[s.recentCard, { marginTop: 0 }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={s.cardHeaderTitle}>Gym feedback & ratings</Text>
              <Ionicons name="star" size={18} color="#E91E63" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 10 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "800" }}>
                {gymFeedbackQuery?.data?.average_rating !== undefined && gymFeedbackQuery.data.average_rating !== null
                  ? gymFeedbackQuery.data.average_rating.toFixed(1)
                  : "0.0"}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                out of 5 · {gymFeedbackQuery?.data?.total_reviews ?? 0} reviews
              </Text>
            </View>
          </Pressable>

          {/* Plan Expiration / Notice Popup Window */}
          <Modal
            visible={showNoticeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNoticeModal(false)}
          >
            <View style={s.noticeModalBackdrop}>
              <View style={s.noticeModalCard}>
                <View style={s.noticeModalHeader}>
                  <View style={s.noticeModalIconWrap}>
                    <Ionicons name="time-outline" size={24} color="#E91E63" />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close notification"
                    onPress={() => setShowNoticeModal(false)}
                    style={s.noticeModalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color={colors.ink} />
                  </Pressable>
                </View>

                <Text style={s.noticeModalTitle}>
                  {isExpired ? "Platform Subscription Expired" : "Payment Due Soon"}
                </Text>
                <Text style={s.noticeModalBody}>
                  {isExpired
                    ? "Your PulseFit platform subscription has expired. Please choose a platform plan to restore uninterrupted services."
                    : `Your PulseFit platform subscription is due in ${daysRemaining ?? 1} ${daysRemaining === 1 ? "day" : "days"}. Renew your plan now to ensure uninterrupted access.`}
                </Text>

                <View style={s.noticeModalDetailsBox}>
                  <View style={s.noticeModalDetailRow}>
                    <Text style={s.noticeModalDetailLabel}>Gym</Text>
                    <Text style={s.noticeModalDetailValue}>{gymName}</Text>
                  </View>
                  <View style={s.noticeModalDivider} />
                  <View style={s.noticeModalDetailRow}>
                    <Text style={s.noticeModalDetailLabel}>Status</Text>
                    <View style={s.noticeModalStatusBadge}>
                      <View style={[s.noticeModalStatusDot, isExpired && { backgroundColor: "#E91E63" }]} />
                      <Text style={[s.noticeModalStatusText, isExpired && { color: "#E91E63" }]}>
                        {isExpired ? "Expired" : `${daysRemaining ?? 1} day${daysRemaining === 1 ? "" : "s"} left`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.noticeModalActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View Platform Plans"
                    onPress={() => {
                      setShowNoticeModal(false);
                      navigation.navigate("MembershipPlans");
                    }}
                    style={s.noticeModalPrimaryBtn}
                  >
                    <Text style={s.noticeModalPrimaryBtnText}>View Platform Plans</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss notice"
                    onPress={() => setShowNoticeModal(false)}
                    style={s.noticeModalSecondaryBtn}
                  >
                    <Text style={s.noticeModalSecondaryBtnText}>Remind Me Later</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Profile Menu Modal */}
          {OwnerProfileMenu ? (
            <OwnerProfileMenu
              visible={profileMenuOpen}
              owner={owner}
              logout={logout}
              onClose={() => setProfileMenuOpen?.(false)}
              navigation={navigation}
              styles={styles}
            />
          ) : null}
        </PulseDashboardLayout>
      );
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
      <Ionicons name={icon} size={20} color={danger ? "#FF3B30" : "#E91E63"} />
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
                  backgroundColor: ["#E91E63", "#34C759", "#E91E63", "#E91E63"][
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
