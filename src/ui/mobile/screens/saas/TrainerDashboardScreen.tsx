import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import { Pressable } from "../../components/NativePressable";
import { Screen } from "../../components/Screen";
import { DataState } from "../../components/DataState";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatDate, initials } from "../../../../utils/formatters";
import type { useTrainerDashboardScreenPresentation } from "../../../../screens/saas/TrainerDashboardScreen";

type Props = { model: ReturnType<typeof useTrainerDashboardScreenPresentation> };
type Category = "Workouts" | "Nutrition" | "Attendance";

export function TrainerDashboardScreenView({ model }: Props): ReactNode {
  const { colors: c } = useAppTheme();
  const [category, setCategory] = useState<Category>("Workouts");
  if (!model || model.kind !== "view1") return null;
  const p = model.props;
  const route = category === "Workouts" ? "WorkoutPlans" : category === "Nutrition" ? "DietPlans" : "Attendance";
  const query = category === "Workouts" ? p.workoutsQuery : category === "Nutrition" ? p.dietsQuery : p.attendanceQuery;
  const records = category === "Workouts" ? p.workoutPlans : category === "Nutrition" ? p.dietPlans : p.attendanceRecords;
  const refresh = () => { void p.membersQuery.refetch(); void p.workoutsQuery.refetch(); void p.dietsQuery.refetch(); void p.attendanceQuery.refetch(); };
  const heading = (title: string, action?: string, onPress?: () => void) => <View style={s.sectionHeader}>
    <Text accessibilityRole="header" style={[s.sectionTitle, { color: c.ink }]}>{title}</Text>
    {action && onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={s.textButton}><Text style={[s.actionText, { color: c.primary }]}>{action}</Text></Pressable> : null}
  </View>;
  const summary = (label: string, value: number, unavailable: boolean) => <View style={s.stat}><Text style={[s.statNumber, { color: c.ink }]}>{unavailable ? "--" : value}</Text><Text style={[s.caption, { color: c.muted }]}>{label}</Text></View>;
  const primaryAction = (title: string, icon: keyof typeof Ionicons.glyphMap, target: string, unavailable = false) => <Pressable key={title} accessibilityRole="button" accessibilityHint={unavailable ? "Opens feature availability information" : undefined} onPress={() => unavailable ? p.navigation.navigate("FeaturePlaceholder", { title: target, message: `${title} are not configured yet.` }) : p.navigation.navigate(target)} style={({ pressed }) => [s.shortcut, { opacity: pressed ? 0.6 : 1 }]}><View style={[s.actionIcon, { backgroundColor: c.primarySoft }]}><Ionicons name={icon} size={23} color={c.primary} /></View><Text style={[s.shortcutLabel, { color: c.ink }]}>{title}</Text></Pressable>;
  const tools = [
    ["Messages", "chatbubble-ellipses-outline", "Notifications"],
    ["Reports", "analytics-outline", "Reports"],
    ["Measurements", "body-outline", "Body Measurements"],
    ["Progress photos", "images-outline", "Progress Photos"],
    ["Goals", "flag-outline", "Goal Management"],
    ["Supplements", "medkit-outline", "Supplement Tracking"]
  ] as const;
  return <Screen scroll keyboard reference={false} noPadding contentContainerStyle={s.page} refreshControl={<RefreshControl refreshing={p.isRefreshing} onRefresh={refresh} tintColor={c.primary} />}>
    <View style={s.topline}>
      <Text style={[s.eyebrow, { color: c.muted }]}>TRAINER WORKSPACE</Text>
      <View style={s.topActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => p.navigation.navigate("Notifications")} style={s.iconButton}><Ionicons name="notifications-outline" size={23} color={c.primary} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="My profile" onPress={() => p.navigation.navigate("AppTabs", { screen: "Profile" })} style={s.iconButton}><Ionicons name="person-circle-outline" size={27} color={c.primary} /></Pressable>
      </View>
    </View>
    <Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>Today</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Open attendance" onPress={() => p.navigation.navigate("Attendance")} style={s.dateButton}><Text style={[s.date, { color: c.muted }]}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Text><Ionicons name="chevron-forward" size={14} color={c.muted} /></Pressable>

    <View style={[s.overview, { backgroundColor: c.surface }]}>
      <View style={s.overviewTop}>
        <View style={s.flex}><Text style={[s.caption, { color: c.muted }]}>TODAY / CHECK-INS</Text><Text style={[s.attendanceNumber, { color: c.ink }]}>{p.attendanceQuery.isLoading || p.attendanceQuery.error ? "--" : p.todayAttendance}</Text></View>
        <Pressable accessibilityRole="button" onPress={() => p.navigation.navigate("Attendance")} style={({ pressed }) => [s.recordButton, { backgroundColor: c.primaryButton, opacity: pressed ? 0.65 : 1 }]}><Ionicons name="add" size={20} color="#FFFFFF" /><Text style={s.recordLabel}>Record</Text></Pressable>
      </View>
      <View style={[s.stats, { borderTopColor: c.border }]}>
        {summary("Clients", p.assignedMemberCount, p.membersQuery.isLoading || !!p.membersQuery.error)}
        {summary("Active", p.activeMemberCount, p.membersQuery.isLoading || !!p.membersQuery.error)}
        {summary("Completed", p.completedSessions, p.attendanceQuery.isLoading || !!p.attendanceQuery.error)}
      </View>
    </View>
    {heading("Quick actions")}
    <View style={s.shortcuts}>
      {primaryAction("Add workout", "add", "WorkoutPlans")}
      {primaryAction("Assign diet", "nutrition-outline", "DietPlans")}
      {primaryAction("Schedule", "calendar-outline", "Attendance")}
      {tools.map(([title, icon, target], index) => primaryAction(title, icon, target, index > 1))}
    </View>

    {heading("Your clients", "See all", () => p.navigation.navigate("MemberList"))}
    <View style={[s.search, { backgroundColor: c.surface }]}><Ionicons name="search" size={18} color={c.muted} /><TextInput accessibilityLabel="Search clients" placeholder="Search clients" placeholderTextColor={c.muted} value={p.search} onChangeText={p.setSearch} autoCorrect={false} style={[s.searchInput, { color: c.ink }]} />{p.search ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => p.setSearch("")} style={s.iconButton}><Ionicons name="close-circle" size={18} color={c.muted} /></Pressable> : null}</View>
    <DataState compact loading={p.membersQuery.isLoading} error={p.membersQuery.error ? getApiErrorMessage(p.membersQuery.error) : null} empty={!p.membersQuery.isLoading && !p.assignedMembers.length} emptyTitle={p.search ? "No matching clients" : "Your client list starts here"} emptyMessage={p.search ? "Try another name." : "Assigned members will appear here."} />
    {!p.membersQuery.isLoading && !p.membersQuery.error ? p.assignedMembers.slice(0, 5).map(member => <Pressable key={member.id} accessibilityRole="button" onPress={() => p.navigation.navigate("MemberProfile", { memberId: member.id })} style={({ pressed }) => [s.client, { borderBottomColor: c.border, opacity: pressed ? 0.55 : 1 }]}>
      <View style={[s.avatar, { backgroundColor: c.primarySoft }]}><Text style={[s.avatarText, { color: c.primary }]}>{initials(`${member.first_name} ${member.last_name}`)}</Text></View>
      <View style={s.flex}><Text style={[s.clientName, { color: c.ink }]}>{member.first_name} {member.last_name}</Text><Text style={[s.clientDetail, { color: c.muted }]}>{member.membership_ends_at ? `Membership ends ${formatDate(member.membership_ends_at)}` : "No membership expiry set"}</Text><Text style={[s.status, { color: member.status === "active" ? c.success : c.muted }]}>{member.status}</Text></View>
      <Ionicons name="chevron-forward" size={17} color={c.muted} />
    </Pressable>) : null}

    {heading("Coaching", "Open", () => p.navigation.navigate(route))}
    <View accessibilityRole="tablist" style={[s.segmented, { backgroundColor: c.surface }]}>{(["Workouts", "Nutrition", "Attendance"] as const).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[s.segment, category === item && { backgroundColor: c.surfaceStrong }]}><Text style={[s.segmentLabel, { color: category === item ? c.ink : c.muted }]}>{item}</Text></Pressable>)}</View>
    <View style={s.coachingContent}>
      <DataState compact loading={query.isLoading} error={query.error ? getApiErrorMessage(query.error) : null} empty={!query.isLoading && records.length === 0} emptyTitle={category === "Workouts" ? "Build their next workout" : category === "Nutrition" ? "Plan their next meal" : "Ready for the next session"} emptyMessage={category === "Workouts" ? "Create a plan tailored to your client." : category === "Nutrition" ? "Add a nutrition plan to support their training." : "Record a check-in when your client arrives."} emptyActionLabel={category === "Workouts" ? "Create workout" : category === "Nutrition" ? "Create nutrition plan" : "Record check-in"} onEmptyAction={() => p.navigation.navigate(route)} />
      {!query.isLoading && !query.error && category === "Workouts" ? p.workoutPlans.slice(0, 3).map(plan => <View key={plan.id} style={[s.record, { borderBottomColor: c.border }]}><Text style={[s.clientName, { color: c.ink }]}>{plan.title}</Text><Text style={[s.clientDetail, { color: c.muted }]}>{plan.goal} / {plan.level}</Text></View>) : null}
      {!query.isLoading && !query.error && category === "Nutrition" ? p.dietPlans.slice(0, 3).map(plan => <View key={plan.id} style={[s.record, { borderBottomColor: c.border }]}><Text style={[s.clientName, { color: c.ink }]}>{plan.title}</Text><Text style={[s.clientDetail, { color: c.muted }]}>{plan.calories_per_day} kcal per day</Text></View>) : null}
      {!query.isLoading && !query.error && category === "Attendance" ? p.attendanceRecords.slice(0, 3).map(record => <View key={record.id} style={[s.record, { borderBottomColor: c.border }]}><Text style={[s.clientName, { color: c.ink }]}>{record.member_name ?? "Member"}</Text><Text style={[s.clientDetail, { color: c.muted }]}>{formatDate(record.check_in_at)} / {record.check_out_at ? "Completed" : "Checked in"}</Text></View>) : null}
    </View>

  </Screen>;
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, width: "100%", maxWidth: 680, alignSelf: "center" },
  flex: { flex: 1, minWidth: 0 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  eyebrow: { fontSize: 11, fontWeight: "600", letterSpacing: 1.4, flexShrink: 1 },
  topActions: { flexDirection: "row" },
  iconButton: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 36, lineHeight: 44, fontWeight: "700", letterSpacing: -0.8 },
  dateButton: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginBottom: 12 },
  date: { fontSize: 15, lineHeight: 21 },
  overview: { padding: 18, borderRadius: 20 },
  overviewTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "500" },
  attendanceNumber: { fontSize: 48, lineHeight: 58, fontWeight: "600", fontVariant: ["tabular-nums"], letterSpacing: -1.5 },
  recordButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, borderRadius: 22 },
  recordLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 12, paddingTop: 14, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1, gap: 3 },
  statNumber: { fontSize: 23, fontWeight: "600", fontVariant: ["tabular-nums"] },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", rowGap: 8, alignItems: "stretch" },
  shortcut: { flexBasis: "33.333%", minWidth: 0, paddingHorizontal: 4, minHeight: 88, paddingVertical: 8, gap: 8, alignItems: "center", justifyContent: "center" },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  shortcutLabel: { fontSize: 13, lineHeight: 18, fontWeight: "500", textAlign: "center" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: "700", flex: 1 },
  textButton: { minHeight: 44, justifyContent: "center" },
  actionText: { fontSize: 15, fontWeight: "500" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 12, paddingRight: 4, borderRadius: 12 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 44, fontSize: 16, paddingVertical: 10 },
  client: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "600" },
  clientName: { fontSize: 17, lineHeight: 23, fontWeight: "600" },
  clientDetail: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  status: { fontSize: 12, lineHeight: 18, marginTop: 3, textTransform: "capitalize" },
  segmented: { flexDirection: "row", padding: 4, borderRadius: 12, gap: 4 },
  segment: { flex: 1, minHeight: 44, paddingVertical: 10, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  segmentLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  coachingContent: { paddingTop: 8 },
  record: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },

});
