import { useState } from "react";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { DataState } from "../../components/DataState";
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
  const [tab, setTab] = useState<"Check-in" | "QR code" | "History">("Check-in");
  const [showNotes, setShowNotes] = useState(false);
  if (!model) return null;
  if (model.kind === "view1") return <AccessDeniedScreen />;
  const p = model.props;
  const c = p.colors;
  const stats = p.statsQuery.data;
  const ready = !p.statsQuery.isPending && !p.statsQuery.error;
  const pending = p.checkInMutation.isPending;
  const assignedMembers = p.ptMembersQuery.data?.pages.flat() ?? [];
  const trainerMembers = tab === "Check-in" ? assignedMembers.filter(member => ready && stats?.checked_in_members.some(visit => visit.member_id === member.id)) : assignedMembers;
  const tabs = p.isTrainer ? (["Check-in", "History"] as const) : (["Check-in", "QR code", "History"] as const);
  return <Screen scroll keyboard reference={false} contentContainerStyle={mobile.screen} refreshControl={<RefreshControl refreshing={p.statsQuery.isFetching} onRefresh={() => { void p.statsQuery.refetch(); void p.membersQuery.refetch(); if (p.isTrainer) void p.ptMembersQuery.refetch(); }} tintColor={c.primary} />}>
    <View style={{ gap: 4 }}><Text accessibilityRole="header" style={{ color: c.ink, fontSize: 34, lineHeight: 41, fontWeight: "700", letterSpacing: -0.6 }}>Attendance</Text><Text style={[mobile.body, { color: c.muted }]}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Text></View>
    <View style={[mobile.summary, { backgroundColor: c.surface }]}>
      {([["Check-ins", stats?.total_check_ins], ["Check-outs", stats?.total_check_outs], ["Inside now", stats?.currently_checked_in]] as const).map(([label, value]) => <View key={label} style={mobile.stat}><Text style={[mobile.value, { color: c.ink }]}>{ready ? value ?? "--" : "--"}</Text><Text style={[mobile.caption, { color: c.muted }]}>{label}</Text></View>)}
    </View>
    <NoticeBanner message={p.statsQuery.error ? getApiErrorMessage(p.statsQuery.error) : null} tone="error" />
    <View accessibilityRole="tablist" style={[mobile.tabs, { backgroundColor: c.surface }]}>{tabs.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }} onPress={() => setTab(value)} style={[mobile.tab, tab === value && { backgroundColor: c.surfaceStrong }]}><Text style={{ color: tab === value ? c.ink : c.muted, fontSize: 14, fontWeight: tab === value ? "600" : "400", textAlign: "center" }}>{value}</Text></Pressable>)}</View>
    {!p.isTrainer && tab === "QR code" ? <DailyAttendancePanel /> : null}
    {p.isTrainer ? <>
        <View style={mobile.sectionHeader}><Text accessibilityRole="header" style={[mobile.heading, { color: c.ink }]}>{tab === "Check-in" ? "Checked-in PT members" : "All assigned PT members"}</Text></View>
        <Text style={[mobile.body, { color: c.muted }]}>{tab === "Check-in" ? "Your PT members currently inside the gym." : "All members assigned to you, including those not checked in."}</Text>
        <DataState compact loading={p.ptMembersQuery.isPending || (tab === "Check-in" && (p.statsQuery.isPending || p.ptMembersQuery.isFetchingNextPage))} error={p.ptMembersQuery.error ? getApiErrorMessage(p.ptMembersQuery.error) : null} empty={!p.ptMembersQuery.isPending && (tab !== "Check-in" || ready) && !p.ptMembersQuery.hasNextPage && !trainerMembers.length} emptyTitle={tab === "Check-in" ? "No PT members checked in" : "No PT members assigned"} emptyMessage={tab === "Check-in" ? "Your assigned members will appear here when they check in." : "Members will appear here when they are assigned to you."} />
        <View style={[mobile.members, { backgroundColor: c.surface }]}>
          {trainerMembers.map((member, index, all) => {
            const visit = ready ? stats?.checked_in_members.find(item => item.member_id === member.id) : undefined;
            return <View key={member.id} style={mobile.member}>
              <View style={[mobile.avatar, { backgroundColor: c.primarySoft }]}><Text style={{ color: c.primary, fontWeight: "600", fontSize: 14 }}>{member.first_name.charAt(0)}{member.last_name?.charAt(0)}</Text></View>
              <View style={[mobile.memberBody, index < all.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
                <View style={{ flex: 1, minWidth: 0 }}><Text style={[mobile.name, { color: c.ink }]}>{member.first_name} {member.last_name}</Text><Text style={[mobile.caption, { color: c.muted }]}>{relatedDisplayName(member.membership_plan_name, "No plan assigned")}</Text><Text style={[mobile.caption, { color: visit ? c.success : c.muted }]}>{!ready ? "Check-in status unavailable" : visit ? `Checked in at ${new Date(visit.check_in_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not currently checked in"}</Text></View>
                <Ionicons name={visit ? "checkmark-circle" : "person-outline"} size={22} color={visit ? c.success : c.muted} />
              </View>
            </View>;
          })}
        </View>
        {p.ptMembersQuery.isError ? <PrimaryButton title="Retry member list" variant="ghost" onPress={() => { void p.ptMembersQuery.refetch(); }} /> : null}
        {p.ptMembersQuery.hasNextPage ? <PrimaryButton title="Load more members" variant="ghost" loading={p.ptMembersQuery.isFetchingNextPage} onPress={() => { void p.ptMembersQuery.fetchNextPage(); }} /> : null}
    </> : null}
    {!p.isTrainer && tab === "History" ? <ResourceCrudPanel config={attendanceConfig} /> : null}
    {!p.isTrainer && tab === "Check-in" ? <>
      <View style={mobile.sectionHeader}><Text accessibilityRole="header" style={[mobile.heading, { color: c.ink }]}>Record a visit</Text>{ready ? <Text style={[mobile.caption, { color: c.muted }]}>{stats?.daily_visit_limit ?? "--"} visits / day</Text> : null}</View>
      <Text style={[mobile.body, { color: c.muted }]}>Choose a member, then confirm their check-in.</Text>
      <View style={[mobile.search, { backgroundColor: c.surface }]}><Ionicons name="search" size={19} color={c.muted} /><TextInput accessibilityLabel="Search members for check-in" value={p.memberSearch} onChangeText={p.setMemberSearch} placeholder="Name, email or phone" placeholderTextColor={c.muted} autoCorrect={false} style={[mobile.input, { color: c.ink }]} /></View>
      <NoticeBanner message={p.membersQuery.error ? getApiErrorMessage(p.membersQuery.error) : null} tone="error" />
      {p.membersQuery.isLoading ? <Text style={[mobile.body, { color: c.muted }]}>Loading members...</Text> : null}
      {!p.membersQuery.isLoading && !p.membersQuery.error && !p.memberOptions.length ? <Text style={[mobile.body, { color: c.muted }]}>No members found. Try a different search.</Text> : null}
      <View style={[mobile.members, { backgroundColor: c.surface }]}>{!p.membersQuery.error && p.memberOptions.map((member, index) => <Pressable key={member.id} accessibilityRole="radio" accessibilityState={{ checked: p.selectedMemberId === member.id, disabled: pending }} disabled={pending} onPress={() => p.setSelectedMemberId(member.id)} style={({ pressed }) => [mobile.member, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={[mobile.avatar, { backgroundColor: c.primarySoft }]}><Text style={{ color: c.primary, fontWeight: "600", fontSize: 14 }}>{member.first_name.charAt(0)}{member.last_name?.charAt(0)}</Text></View>
        <View style={[mobile.memberBody, index < p.memberOptions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}><View style={{ flex: 1, minWidth: 0 }}><Text style={[mobile.name, { color: c.ink }]}>{member.first_name} {member.last_name}</Text><Text style={[mobile.caption, { color: c.muted }]}>{relatedDisplayName(member.membership_plan_name, "No plan assigned")}</Text></View><Ionicons name={p.selectedMemberId === member.id ? "checkmark-circle" : "ellipse-outline"} size={23} color={p.selectedMemberId === member.id ? c.primary : c.muted} /></View>
      </Pressable>)}</View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showNotes }} onPress={() => setShowNotes(!showNotes)} style={mobile.noteButton}><Ionicons name="create-outline" size={18} color={c.primary} /><Text style={{ color: c.primary, fontSize: 15 }}>{showNotes ? "Hide note" : p.notes ? "Edit note" : "Add a note"}</Text></Pressable>
      {showNotes ? <FormTextField label="Visit note" multiline value={p.notes} onChangeText={p.setNotes} placeholder="Optional note" /> : null}
      <NoticeBanner message={p.notice} />
      <NoticeBanner message={p.checkInMutation.error ? getApiErrorMessage(p.checkInMutation.error) : null} tone="error" />
      <PrimaryButton title="Confirm check-in" icon="checkmark" disabled={!p.selectedMemberId} loading={pending} onPress={() => p.checkInMutation.mutate(undefined)} />
      <View style={mobile.sectionHeader}><Text accessibilityRole="header" style={[mobile.heading, { color: c.ink }]}>Inside now</Text></View>
      {ready && !stats?.checked_in_members.length ? <Text style={[mobile.body, { color: c.muted }]}>No members are currently checked in.</Text> : null}
      {ready ? stats?.checked_in_members.map(member => <View key={member.id} style={[mobile.insideRow, { borderBottomColor: c.border }]}><Text style={[mobile.name, { color: c.ink, flex: 1 }]}>{member.member_name ?? "Member"}</Text><Text style={[mobile.caption, { color: c.muted }]}>{new Date(member.check_in_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text></View>) : null}
    </> : null}
  </Screen>;
}

const mobile = StyleSheet.create({
  screen: { gap: 14, paddingBottom: 32 },
  summary: { flexDirection: "row", gap: 10, padding: 18, borderRadius: 16 },
  stat: { flex: 1, gap: 4 },
  value: { fontSize: 30, lineHeight: 37, fontWeight: "600", fontVariant: ["tabular-nums"] },
  caption: { fontSize: 13, lineHeight: 19 },
  tabs: { flexDirection: "row", padding: 4, gap: 4, borderRadius: 12 },
  tab: { flex: 1, minWidth: 0, minHeight: 44, alignItems: "center", justifyContent: "center", padding: 8, borderRadius: 9 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 },
  heading: { fontSize: 21, lineHeight: 27, fontWeight: "600", flexShrink: 1 },
  body: { fontSize: 15, lineHeight: 22 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderRadius: 12 },
  input: { minHeight: 48, flex: 1, minWidth: 0, fontSize: 17, paddingVertical: 10 },
  members: { borderRadius: 14, overflow: "hidden" },
  member: { flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 14 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  memberBody: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingRight: 14, paddingVertical: 14, minHeight: 74 },
  name: { fontSize: 17, lineHeight: 23, fontWeight: "500" },
  noteButton: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, alignSelf: "flex-start" },
  insideRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth }
});

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
