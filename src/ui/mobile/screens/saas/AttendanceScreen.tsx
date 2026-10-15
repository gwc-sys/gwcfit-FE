import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { DailyAttendancePanel } from "../../../../components/dashboard/DailyAttendancePanel";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { attendanceConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useAttendanceScreenPresentation, useReceptionStatCardPresentation, useActivityItemPresentation } from "../../../../screens/saas/AttendanceScreen";

export function AttendanceScreenView({ model }: { model: ReturnType<typeof useAttendanceScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, ReceptionStatCard, statsQuery, queryClient, ActivityItem, colors, memberSearch, setMemberSearch, memberOptions, selectedMemberId, setSelectedMemberId, checkInMutation, membersQuery, setNotes, notes, notice } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <ScreenHeader title="Attendance" subtitle="Member visits and today’s activity" />
          </View>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={17} color={colors.muted} />
            <Text style={styles.dateText}>
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </Text>

          </View>
        </View>
        <View style={styles.statsGrid}>
          <ReceptionStatCard
            title="Today's Check-ins"
            value={statsQuery.data?.total_check_ins ?? 0}
            detail="Member visits recorded"
            icon="log-in-outline"
            tone="#0A84FF"
          />
          <ReceptionStatCard
            title="Today's Check-outs"
            value={statsQuery.data?.total_check_outs ?? 0}
            detail="Completed visits"
            icon="log-out-outline"
            tone="#22C55E"
          />
          <ReceptionStatCard
            title="Inside Now"
            value={statsQuery.data?.currently_checked_in ?? 0}
            detail="Members in the gym"
            icon="people-outline"
            tone="#38BDF8"
          />
          <ReceptionStatCard
            title="Visit Limit"
            value={statsQuery.data?.daily_visit_limit ?? 4}
            detail="Per member, per day"
            icon="calendar-clear-outline"
            tone="#F59E0B"
          />
        </View>
      </View>
      <View style={styles.middleGrid}>
      <View style={styles.middleCard}><DailyAttendancePanel /></View>
      <View style={[styles.activityPanel, styles.middleCard]}>
        <View style={styles.activityHeader}><Text style={styles.activityTitle}>Today&apos;s Activity</Text><Pressable accessibilityRole="button" onPress={() => queryClient.invalidateQueries({ queryKey: ["attendance", "today"] })} style={{ minHeight: 44, justifyContent: "center" }}><Text style={styles.reportLink}>View Report</Text></Pressable></View>
        <View style={styles.activityContent}>
          <View style={styles.activityRing}><Text style={styles.activityPercent}>{Math.round(((statsQuery.data?.total_check_ins ?? 0) / Math.max(statsQuery.data?.daily_visit_limit ?? 4, 1)) * 100)}%</Text><Text style={styles.activityLabel}>Activity</Text></View>
          <View style={styles.activityList}><ActivityItem icon="log-in-outline" label="Check-ins" value={statsQuery.data?.total_check_ins ?? 0} tone="#0A84FF" styles={styles} /><ActivityItem icon="log-out-outline" label="Check-outs" value={statsQuery.data?.total_check_outs ?? 0} tone="#22C55E" styles={styles} /><ActivityItem icon="people-outline" label="Inside Now" value={statsQuery.data?.currently_checked_in ?? 0} tone="#38BDF8" styles={styles} /><ActivityItem icon="calendar-outline" label="Visit Limit Reached" value={statsQuery.data?.daily_visit_limit ?? 4} tone="#F59E0B" styles={styles} /></View>
        </View>
      </View>
      </View>
      <SurfacePanel
        title="Quick Check-in"
        kicker="Manually check-in members"
        icon="walk-outline"
      >
        <View style={styles.quickSearch}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput value={memberSearch} onChangeText={setMemberSearch} placeholder="Search member by name, email or phone..." placeholderTextColor={colors.subtle} style={styles.quickSearchInput} /></View>
        <View style={styles.memberPicker}>
          {memberOptions.map((member) => {
            const selected = selectedMemberId === member.id;
            return (
              <Pressable accessibilityRole="button"
                key={member.id}
                onPress={() => setSelectedMemberId(member.id)}
                style={[
                  styles.memberChip,
                  selected && styles.memberChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.memberChipText,
                    selected && styles.memberChipTextSelected,
                  ]}
                >
                  {member.first_name} {member.last_name}
                </Text>
                <Text style={styles.memberChipMeta}>
                  Plan:{" "}
                  {relatedDisplayName(
                    member.membership_plan_name,
                    "Not assigned",
                  )}
                </Text>
                <Text style={styles.memberChipMeta}>
                  Trainer:{" "}
                  {relatedDisplayName(member.trainer_name, "Not assigned")}
                </Text>
                <Text numberOfLines={1} ellipsizeMode="middle" accessibilityLabel={`Member code ${member.member_code}`} style={[styles.memberChipMeta, { width: "100%" }]}>{member.member_code}</Text>
                <Pressable accessibilityRole="button" style={styles.checkinButton} onPress={() => { setSelectedMemberId(member.id); checkInMutation.mutate(member.id); }}><Ionicons name="person-add-outline" size={15} color="#fff" /><Text style={styles.checkinButtonText}>Check-in</Text></Pressable>
              </Pressable>
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
        <FormTextField
          label="Notes"
          multiline
          onChangeText={setNotes}
          placeholder="Optional note"
          value={notes}
        />
        <NoticeBanner message={notice} />
        <NoticeBanner
          message={
            checkInMutation.error
              ? getApiErrorMessage(checkInMutation.error)
              : null
          }
          tone="error"
        />
        <PrimaryButton
          title="Record Check-in"
          icon="checkmark-circle-outline"
          loading={checkInMutation.isPending}
          onPress={() => checkInMutation.mutate(undefined)}
        />
      </SurfacePanel>
      <ResourceCrudPanel config={attendanceConfig} />
    </Screen>
  ));
    }
  }
}

export function ReceptionStatCardView({ model }: { model: ReturnType<typeof useReceptionStatCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { dashboardStyles, tone, icon, title, value, detail } = model.props;
      return ((
    <View style={dashboardStyles.statCard}>
      <View style={dashboardStyles.statTop}>
        <View
          style={[dashboardStyles.statIcon, { backgroundColor: `${tone}26` }]}
        >
          <Ionicons name={icon} size={21} color={tone} />
        </View>
        <Text style={dashboardStyles.statLabel}>{title}</Text>
      </View>
      <Text style={dashboardStyles.statValue}>{value}</Text>
      <Text style={dashboardStyles.statDetail}>{detail}</Text>
      <View style={dashboardStyles.sparkline}>
        <View
          style={[dashboardStyles.sparklineFill, { backgroundColor: tone }]}
        />
        <View style={dashboardStyles.sparkDot} />
      </View>
    </View>
  ));
    }
  }
}

export function ActivityItemView({ model }: { model: ReturnType<typeof useActivityItemPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (<View style={styles.activityItem}><View style={[styles.activityIcon, { backgroundColor: `${tone}30` }]}><Ionicons name={icon} size={15} color={tone} /></View><Text style={styles.activityItemLabel}>{label}</Text><Text style={styles.activityItemValue}>{value}</Text></View>);
    }
  }
}
