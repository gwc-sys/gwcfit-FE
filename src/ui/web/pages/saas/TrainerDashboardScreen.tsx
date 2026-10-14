import { Pressable, RefreshControl, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { QuickAction } from "../../components/QuickAction";
import { SectionHeader } from "../../components/SectionHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardLayout } from "../../../../components/dashboard/PulseDashboardLayout";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatDate, initials } from "../../../../utils/formatters";
import type { Attendance, Member } from "../../../../types/saas";
import type * as React from "react";
import type { useTrainerDashboardScreenPresentation } from "../../../../screens/saas/TrainerDashboardScreen";

export function TrainerDashboardScreenView({ model }: { model: ReturnType<typeof useTrainerDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { search, setSearch, isRefreshing, membersQuery, workoutsQuery, dietsQuery, attendanceQuery, styles, assignedMemberCount, activeMemberCount, workoutPlanCount, dietPlanCount, todayAttendance, completedSessions, navigation, assignedMembers, workoutPlans, dietPlans, attendanceRecords } = model.props;
      return ((
    <PulseDashboardLayout
      activeLabel="Dashboard"
      trainerSearchValue={search}
      onTrainerSearchChange={setSearch}
      roleLabel="Trainer"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            void membersQuery.refetch();
            void workoutsQuery.refetch();
            void dietsQuery.refetch();
            void attendanceQuery.refetch();
          }}
        />
      }
    >
      <View style={styles.metricGrid}>
        <MetricCard label="Assigned Members" value={String(assignedMemberCount)} icon="people-outline" trend="+4 this week" tone="primary" />
        <MetricCard label="Active Members" value={String(activeMemberCount)} icon="pulse-outline" trend="+3 this week" tone="success" />
        <MetricCard label="Workouts" value={String(workoutPlanCount)} icon="barbell-outline" trend="+8 this week" tone="info" />
        <MetricCard label="Diets" value={String(dietPlanCount)} icon="nutrition-outline" trend="+2 this week" tone="warning" />
        <MetricCard label="Today Attendance" value={String(todayAttendance)} icon="calendar-outline" trend="80% present" tone="info" />
        <MetricCard label="Completed Sessions" value={String(completedSessions)} icon="trophy-outline" trend="+2 this week" tone="primary" />
      </View>

      <SectionHeader title="Quick Actions" action="Customize" />
      <View style={styles.quickGrid}>
        <QuickAction icon="add-circle-outline" title="Add Workout" subtitle="Create plan" tone="primary" onPress={() => navigation.navigate("WorkoutPlans")} />
        <QuickAction icon="restaurant-outline" title="Assign Diet" subtitle="Nutrition plan" tone="info" onPress={() => navigation.navigate("DietPlans")} />
        <QuickAction icon="calendar-outline" title="Schedule" subtitle="Session booking" tone="accent" onPress={() => navigation.navigate("Attendance")} />
        <QuickAction icon="chatbubble-ellipses-outline" title="Message" subtitle="Member chat" tone="info" onPress={() => navigation.navigate("Notifications")} />
        <QuickAction icon="analytics-outline" title="Reports" subtitle="Performance" tone="accent" onPress={() => navigation.navigate("Reports")} />
        <QuickAction icon="heart-outline" title="Measurements" subtitle="Body stats" tone="info" onPress={() => navigation.navigate("FeaturePlaceholder", { title: "Body Measurements", message: "Body measurements are not configured yet." })} />
        <QuickAction icon="images-outline" title="Progress photos" subtitle="Before / after" tone="accent" onPress={() => navigation.navigate("FeaturePlaceholder", { title: "Progress Photos", message: "Progress photo support is not configured yet." })} />
        <QuickAction icon="flag-outline" title="Goals" subtitle="Track milestones" tone="primary" onPress={() => navigation.navigate("FeaturePlaceholder", { title: "Goal Management", message: "Goal management is not configured yet." })} />
        <QuickAction icon="medkit-outline" title="Supplements" subtitle="Track dosages" tone="warning" onPress={() => navigation.navigate("FeaturePlaceholder", { title: "Supplement Tracking", message: "Supplement tracking is not configured yet." })} />
      </View>

      <SurfacePanel title="Assigned Members" kicker="Clients" icon="people-outline" actionLabel="View all" onAction={() => navigation.navigate("MemberList")}> 
        <DataState
          loading={membersQuery.isLoading}
          error={membersQuery.error ? getApiErrorMessage(membersQuery.error) : null}
          empty={!membersQuery.isLoading && assignedMembers.length === 0}
          emptyTitle={search ? "No members match" : "No assigned members"}
          emptyMessage={search ? "Try a different search term." : "Assign a member to begin coaching."}
          emptyActionLabel={search ? undefined : "Add member"}
          onEmptyAction={() => navigation.navigate("AddMember")}
        />
        <View style={styles.rowList}>
          {assignedMembers.slice(0, 5).map((member) => (
            <Pressable accessibilityRole="button"
              key={member.id}
              style={styles.listItem}
              onPress={() => navigation.navigate("MemberProfile", { memberId: member.id })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(`${member.first_name} ${member.last_name}`)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.first_name} {member.last_name}</Text>
                <Text style={styles.memberMeta}>{member.member_code} • {member.trainer_name ?? "Self"}</Text>
                <Text style={styles.memberMeta}>Membership ends {formatDate(member.membership_ends_at)}</Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>{member.status}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </SurfacePanel>

      <SectionHeader title="Workout Management" action="All workouts" onAction={() => navigation.navigate("WorkoutPlans")} />
      <SurfacePanel title="Plans" kicker="Workouts" icon="barbell-outline" actionLabel="Manage" onAction={() => navigation.navigate("WorkoutPlans")}>
        <DataState
          loading={workoutsQuery.isLoading}
          error={workoutsQuery.error ? getApiErrorMessage(workoutsQuery.error) : null}
          empty={!workoutsQuery.isLoading && workoutPlans.length === 0}
          emptyTitle="No workouts yet"
          emptyMessage="Create a workout plan for your member."
          emptyActionLabel="Add workout"
          onEmptyAction={() => navigation.navigate("WorkoutPlans")}
        />
        <View style={styles.rowList}>
          {workoutPlans.slice(0, 4).map((plan) => (
            <View key={plan.id} style={styles.cardRow}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planMeta}>{plan.goal} • {plan.level}</Text>
              </View>
              <Text style={styles.planDate}>{plan.starts_at ? formatDate(plan.starts_at) : "No start"}</Text>
            </View>
          ))}
        </View>
      </SurfacePanel>

      <SectionHeader title="Nutrition Management" action="All diets" onAction={() => navigation.navigate("DietPlans")} />
      <SurfacePanel title="Diet plans" kicker="Nutrition" icon="nutrition-outline" actionLabel="Manage" onAction={() => navigation.navigate("DietPlans")}>
        <DataState
          loading={dietsQuery.isLoading}
          error={dietsQuery.error ? getApiErrorMessage(dietsQuery.error) : null}
          empty={!dietsQuery.isLoading && dietPlans.length === 0}
          emptyTitle="No diet plans"
          emptyMessage="Assign a meal plan for a client."
          emptyActionLabel="Create diet"
          onEmptyAction={() => navigation.navigate("DietPlans")}
        />
        <View style={styles.rowList}>
          {dietPlans.slice(0, 4).map((diet) => (
            <View key={diet.id} style={styles.cardRow}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{diet.title}</Text>
                <Text style={styles.planMeta}>{diet.calories_per_day} kcal • {diet.trainer_name ?? "Coach"}</Text>
              </View>
              <Text style={styles.planDate}>{diet.starts_at ? formatDate(diet.starts_at) : "No start"}</Text>
            </View>
          ))}
        </View>
      </SurfacePanel>

      <SectionHeader title="Attendance" action="All attendance" onAction={() => navigation.navigate("Attendance")} />
      <SurfacePanel title="Check-ins" kicker="Attendance" icon="walk-outline" actionLabel="Manage" onAction={() => navigation.navigate("Attendance")}>
        <DataState
          loading={attendanceQuery.isLoading}
          error={attendanceQuery.error ? getApiErrorMessage(attendanceQuery.error) : null}
          empty={!attendanceQuery.isLoading && attendanceRecords.length === 0}
          emptyTitle="No attendance records"
          emptyMessage="Track your client sessions with check-ins."
          emptyActionLabel="Record attendance"
          onEmptyAction={() => navigation.navigate("Attendance")}
        />
        <View style={styles.rowList}>
          {attendanceRecords.slice(0, 4).map((attendance) => (
            <View key={attendance.id} style={styles.cardRow}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{attendance.member_name ?? "Member"}</Text>
                <Text style={styles.planMeta}>{formatDate(attendance.check_in_at)}</Text>
              </View>
              <Text style={styles.planDate}>{attendance.check_out_at ? "Completed" : "Pending"}</Text>
            </View>
          ))}
        </View>
      </SurfacePanel>
    </PulseDashboardLayout>
  ));
    }
  }
}
