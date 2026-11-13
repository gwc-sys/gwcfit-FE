import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { NoticeBanner } from "../../components/NoticeBanner";
import { Screen } from "../../components/Screen";
import { DailyAttendancePanel } from "../../../../components/dashboard/DailyAttendancePanel";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { attendanceConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import {
  CalendarSvg,
  CheckCircleSvg,
  HeartPulseSvg,
  LogInSvg,
  LogOutSvg,
  SearchSvg,
  UserPlusSvg,
  UsersSvg,
} from "../../../../components/icons/PulseSvgIcons";
import {
  createDashboardStyles,
  createStyles,
} from "../../styles/pages/saas/AttendanceScreen.styles";
import type * as React from "react";
import type {
  useActivityItemPresentation,
  useAttendanceScreenPresentation,
  useReceptionStatCardPresentation,
} from "../../../../screens/saas/AttendanceScreen";

export function AttendanceScreenView({
  model,
}: {
  model: ReturnType<typeof useAttendanceScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const {
        styles: mobileStyles,
        ReceptionStatCard,
        statsQuery,
        queryClient,
        ActivityItem,
        colors,
        memberSearch,
        setMemberSearch,
        memberOptions,
        selectedMemberId,
        setSelectedMemberId,
        checkInMutation,
        membersQuery,
        setNotes,
        notes,
        notice,
      } = model.props;

      const styles = createStyles(colors);
      const totalCheckIns = statsQuery.data?.total_check_ins ?? 0;
      const dailyVisitLimit = Math.max(statsQuery.data?.daily_visit_limit ?? 4, 1);
      const activityPercent = Math.min(100, Math.round((totalCheckIns / dailyVisitLimit) * 100));

      return (
        <Screen scroll keyboard contentContainerStyle={styles.screen}>
          {/* Hero Header */}
          <View style={styles.hero}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Attendance</Text>
                <Text style={styles.heroSubtitle}>
                  Track member check-ins, check-outs, and today's attendance summary
                </Text>
              </View>
              <View style={styles.datePill}>
                <CalendarSvg size={16} color="#F2F2F7" />
                <Text style={styles.dateText}>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date())}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#F2F2F7" />
              </View>
            </View>

            {/* 4 KPI Cards */}
            <View style={styles.statsGrid}>
              <ReceptionStatCard
                title="Today's Check-ins"
                value={statsQuery.data?.total_check_ins ?? 0}
                detail="Member visits recorded"
                icon="log-in-outline"
                tone="#E91E63"
              />
              <ReceptionStatCard
                title="Today's Check-outs"
                value={statsQuery.data?.total_check_outs ?? 0}
                detail="Completed visits"
                icon="log-out-outline"
                tone="#34C759"
              />
              <ReceptionStatCard
                title="Inside Now"
                value={statsQuery.data?.currently_checked_in ?? 0}
                detail="Members in the gym"
                icon="people-outline"
                tone="#E91E63"
              />
              <ReceptionStatCard
                title="Visit Limit"
                value={statsQuery.data?.daily_visit_limit ?? 4}
                detail="Per member, per day"
                icon="calendar-clear-outline"
                tone="#E91E63"
              />
            </View>
          </View>

          {/* Middle Grid: Today's Attendance QR + Today's Activity */}
          <View style={styles.middleGrid}>
            <View style={styles.middleCard}>
              <DailyAttendancePanel />
            </View>

            <View style={[styles.activityPanel, styles.middleCard]}>
              <View style={styles.activityHeader}>
                <View>
                  <Text style={styles.activityTitle}>Today's Activity</Text>
                  <Text style={styles.activitySubtitle}>
                    Real-time attendance & limit indicators
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["attendance", "today"],
                    })
                  }
                >
                  <Text style={styles.reportLink}>View Report →</Text>
                </Pressable>
              </View>

              <View style={styles.activityContent}>
                {/* Concentric Donut Gauge */}
                <View style={styles.activityRingWrap}>
                  <Svg width={140} height={140} viewBox="0 0 140 140">
                    <Circle
                      cx={70}
                      cy={70}
                      r={52}
                      stroke="#1C1C1E"
                      strokeWidth={10}
                      fill="none"
                    />
                    <Circle
                      cx={70}
                      cy={70}
                      r={52}
                      stroke="#E91E63"
                      strokeWidth={10}
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.72)}`}
                      strokeLinecap="round"
                      fill="none"
                      transform="rotate(-90 70 70)"
                    />
                    <Circle cx={70} cy={18} r={4.5} fill="#34C759" />
                  </Svg>
                  <View style={styles.activityRingInner}>
                    <Text style={styles.activityPercent}>{activityPercent}%</Text>
                    <Text style={styles.activityLabel}>ACTIVITY</Text>
                  </View>
                </View>

                {/* Activity 4 item list */}
                <View style={styles.activityList}>
                  <ActivityItem
                    icon="log-in-outline"
                    label="Check-ins"
                    value={statsQuery.data?.total_check_ins ?? 0}
                    tone="#E91E63"
                    styles={mobileStyles}
                  />
                  <ActivityItem
                    icon="log-out-outline"
                    label="Check-outs"
                    value={statsQuery.data?.total_check_outs ?? 0}
                    tone="#34C759"
                    styles={mobileStyles}
                  />
                  <ActivityItem
                    icon="people-outline"
                    label="Inside Now"
                    value={statsQuery.data?.currently_checked_in ?? 0}
                    tone="#E91E63"
                    styles={mobileStyles}
                  />
                  <ActivityItem
                    icon="calendar-outline"
                    label="Visit Limit Reached"
                    value={statsQuery.data?.daily_visit_limit ?? 4}
                    tone="#E91E63"
                    styles={mobileStyles}
                  />
                </View>
              </View>

              {/* Sensor status footer */}
              <View style={styles.activityFooter}>
                <View style={styles.activityStatusOnline}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#34C759",
                    }}
                  />
                  <Text style={styles.activityStatusText}>All sensors online</Text>
                </View>
                <Text style={styles.activityWatchText}>Real-time watch active</Text>
              </View>
            </View>
          </View>

          {/* Quick Check-in Panel */}
          <View style={styles.quickCheckinCard}>
            <View style={styles.kickerRow}>
              <View>
                <Text style={styles.sectionKicker}>MANUALLY CHECK-IN MEMBERS</Text>
                <Text style={styles.sectionTitle}>Quick Check-in</Text>
              </View>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(233, 30, 99, 0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HeartPulseSvg size={20} color="#E91E63" />
              </View>
            </View>

            {/* Quick Search */}
            <View style={styles.quickSearch}>
              <SearchSvg size={16} color="#F2F2F7" />
              <TextInput
                value={memberSearch}
                onChangeText={setMemberSearch}
                placeholder="Search member by name, email or phone..."
                placeholderTextColor="#F2F2F7"
                style={styles.quickSearchInput}
              />
            </View>

            {/* Member Picker */}
            <View style={styles.memberPicker}>
              {memberOptions.map((member, index) => {
                const selected = selectedMemberId === member.id;
                const useSecondaryAvatar = member.id
                  ? member.id.charCodeAt(member.id.length - 1) % 2 !== 0
                  : index % 2 === 1;

                return (
                  <View
                    key={member.id}
                    style={[
                      styles.memberChip,
                      selected && styles.memberChipSelected,
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${member.first_name} ${member.last_name}`}
                      onPress={() => setSelectedMemberId(member.id)}
                      style={styles.memberHeader}
                    >
                      <View
                        style={
                          useSecondaryAvatar
                            ? styles.memberAvatarSR
                            : styles.memberAvatarMR
                        }
                      >
                        <Text style={styles.memberAvatarText}>
                          {member.first_name[0] ?? ""}
                          {member.last_name[0] ?? ""}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <Text style={styles.memberChipText} numberOfLines={1}>
                          {member.first_name} {member.last_name}
                        </Text>
                        <Text style={styles.memberChipMeta} numberOfLines={1}>
                          Plan: {member.membership_plan_name || "No Plan Assigned"}
                        </Text>
                        <Text style={styles.memberChipMeta} numberOfLines={1}>
                          Trainer: {member.trainer_name || "Unassigned"}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={styles.memberCodeBadge}>
                      <Text style={styles.memberCodeText} numberOfLines={1}>
                        {member.member_code}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Check in ${member.first_name} ${member.last_name}`}
                      style={styles.checkinButton}
                      onPress={() => {
                        setSelectedMemberId(member.id);
                        checkInMutation.mutate(member.id);
                      }}
                    >
                      <UserPlusSvg size={15} color="#FFFFFF" />
                      <Text style={styles.checkinButtonText}>Check-in</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {membersQuery.isLoading ? (
              <Text style={styles.helper}>Loading members...</Text>
            ) : null}
            {membersQuery.error ? (
              <NoticeBanner
                message={getApiErrorMessage(membersQuery.error)}
                tone="error"
              />
            ) : null}

            {/* Notes */}
            <View style={{ gap: 6, marginTop: 4 }}>
              <Text style={styles.notesLabel}>Notes</Text>
              <TextInput
                multiline
                numberOfLines={2}
                onChangeText={setNotes}
                placeholder="Optional note (e.g. locker #42 assigned, guest workout)"
                placeholderTextColor="#F2F2F7"
                value={notes}
                style={styles.notesInput}
              />
            </View>

            <NoticeBanner message={notice} />
            <NoticeBanner
              message={
                checkInMutation.error
                  ? getApiErrorMessage(checkInMutation.error)
                  : null
              }
              tone="error"
            />

            <Pressable
              accessibilityRole="button"
              disabled={checkInMutation.isPending}
              onPress={() => checkInMutation.mutate(undefined)}
              style={styles.recordCheckinButton}
            >
              <CheckCircleSvg size={18} color="#FFFFFF" />
              <Text style={styles.recordCheckinButtonText}>
                {checkInMutation.isPending ? "Recording..." : "Record Check-in"}
              </Text>
            </Pressable>
          </View>

          {/* Attendance Log Card via ResourceCrudPanel */}
          <ResourceCrudPanel config={attendanceConfig} />
        </Screen>
      );
    }
  }
}

export function ReceptionStatCardView({
  model,
}: {
  model: ReturnType<typeof useReceptionStatCardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { dashboardStyles, tone, icon, title, value, detail } = model.props;
      const progressWidth =
        title === "Today's Check-ins" || title === "Today's Check-outs"
          ? "28%"
          : title === "Inside Now"
          ? "40%"
          : "80%";

      return (
        <View style={dashboardStyles.statCard}>
          <View style={dashboardStyles.statTop}>
            <View
              style={[
                dashboardStyles.statIcon,
                { backgroundColor: `${tone}20` },
              ]}
            >
              {icon === "log-in-outline" ? (
                <LogInSvg size={18} color={tone} />
              ) : icon === "log-out-outline" ? (
                <LogOutSvg size={18} color={tone} />
              ) : icon === "people-outline" ? (
                <UsersSvg size={18} color={tone} />
              ) : (
                <CalendarSvg size={18} color={tone} />
              )}
            </View>
            <Text style={dashboardStyles.statLabel}>{title}</Text>
          </View>
          <Text style={dashboardStyles.statValue}>{value}</Text>
          <Text style={dashboardStyles.statDetail}>{detail}</Text>
          <View style={dashboardStyles.sparkline}>
            <View
              style={[
                dashboardStyles.sparklineFill,
                { backgroundColor: tone, width: progressWidth },
              ]}
            />
          </View>
        </View>
      );
    }
  }
}

export function ActivityItemView({
  model,
}: {
  model: ReturnType<typeof useActivityItemPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (
        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: `${tone}20` }]}>
            {icon === "log-in-outline" ? (
              <LogInSvg size={15} color={tone} />
            ) : icon === "log-out-outline" ? (
              <LogOutSvg size={15} color={tone} />
            ) : icon === "people-outline" ? (
              <UsersSvg size={15} color={tone} />
            ) : (
              <CalendarSvg size={15} color={tone} />
            )}
          </View>
          <Text style={styles.activityItemLabel}>{label}</Text>
          <Text style={styles.activityItemValue}>{value}</Text>
        </View>
      );
    }
  }
}
