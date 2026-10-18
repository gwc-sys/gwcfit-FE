import { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../../../utils/memberFeatureMetrics";
import { FlatList, RefreshControl, Switch, Text, View } from "react-native";
import type { ReactNode } from "react";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ClassBookingCard, EmptyState, ErrorState, GoalProgressCard, LoadingSkeleton, MemberStatCard, NotificationItem, PaymentHistoryCard, RewardBadge, ScrollListCard, StatusBadge } from "../../components/member/index";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type { MemberAttendance, MemberClass, MemberGoal, MemberMealPlan, MemberNotification, MemberPayment, MemberProgressLog, MemberReward, MemberWorkout } from "../../../../types/member";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { formatCurrency, formatDate, formatDateTime, memberStatusTone } from "../../../../utils/formatters";
import type * as React from "react";
import type { useQueryRefreshPresentation, useQueryStatePresentation, useListSectionPresentation, useDetailGridPresentation, useSectionTitlePresentation, useMemberMembershipScreenPresentation, useMemberPaymentsScreenPresentation, useMemberAttendanceScreenPresentation, useMemberWorkoutScreenPresentation, useMemberMealPlanScreenPresentation, useMemberProgressScreenPresentation, useMemberTrainerScreenPresentation, useMemberClassesScreenPresentation, useMemberNotificationsScreenPresentation, useMemberGoalsScreenPresentation, useMemberRewardsScreenPresentation, useMemberSupportScreenPresentation, useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";

export function QueryRefreshView({ model }: { model: ReturnType<typeof useQueryRefreshPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { refreshing, onRefresh } = model.props;
      return (<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />);
    }
  }
}

export function QueryStateView<T>({ model }: { model: ReturnType<typeof useQueryStatePresentation<T>> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<LoadingSkeleton rows={4} />);
    }
    case "view2": {
      const { error, onRetry } = model.props;
      return (<ErrorState message={getApiErrorMessage(error)} onRetry={onRetry} />);
    }
    case "view3": {
      const { emptyTitle, emptyMessage } = model.props;
      return (<EmptyState title={emptyTitle} message={emptyMessage} icon="file-tray-outline" />);
    }
  }
}

export function ListSectionView<T extends object>({ model }: { model: ReturnType<typeof useListSectionPresentation<T>> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { data, keyExtractor, renderItem, styles } = model.props;
      return ((
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  ));
    }
  }
}

export function DetailGridView({ model }: { model: ReturnType<typeof useDetailGridPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, children } = model.props;
      return (<View style={styles.grid}>{children}</View>);
    }
  }
}

export function SectionTitleView({ model }: { model: ReturnType<typeof useSectionTitlePresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, title } = model.props;
      return (<Text style={styles.sectionTitle}>{title}</Text>);
    }
  }
}

export function MemberMembershipScreenView({ model }: { model: ReturnType<typeof useMemberMembershipScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, DetailGrid, SectionTitle, ListSection, toneForStatus } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Membership" subtitle="Plan and renewal" icon="ribbon-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data}
        emptyTitle="No membership found"
        emptyMessage="Your membership details will appear once your gym assigns a plan."
        data={query.data ?? undefined}
        onRetry={() => query.refetch()}
      >
        {(membership) => (
          <>
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View>
                  <Text style={styles.kicker}>{membership.gym_name ?? "Gym"}</Text>
                  <Text style={styles.largeTitle}>{membership.membership_plan_name ?? "Membership plan"}</Text>
                </View>
                <StatusBadge label={membership.status} tone={memberStatusTone(membership.status)} />
              </View>
              <DetailGrid>
                <MemberStatCard title="Price" value={formatCurrency(membership.plan_price_cents, membership.plan_currency)} icon="cash-outline" tone="success" />
                <MemberStatCard title="Days left" value={`${membership.days_remaining}`} subtitle={membership.renewal_reminder} icon="calendar-number-outline" tone={membership.days_remaining <= 7 ? "warning" : "info"} />
                <MemberStatCard title="Duration" value={membership.plan_duration_days ? `${membership.plan_duration_days}d` : "--"} icon="timer-outline" tone="neutral" />
                <MemberStatCard title="Expiry" value={formatDate(membership.expiry_date)} icon="calendar-outline" tone="info" />
              </DetailGrid>
            </View>

            <SectionTitle title="Benefits" />
            {membership.benefits.length ? (
              membership.benefits.map((benefit) => <ScrollListCard key={benefit} title={benefit} icon="checkmark-circle-outline" />)
            ) : (
              <EmptyState title="No benefits listed" message="Plan benefits will appear when your gym adds them." icon="sparkles-outline" />
            )}

            <SectionTitle title="Membership History" />
            <ListSection
              data={membership.history}
              keyExtractor={(item) => item.membership_uuid}
              renderItem={(item) => (
                <ScrollListCard
                  title={item.membership_plan_name ?? "Membership"}
                  subtitle={`${formatDate(item.start_date)} - ${formatDate(item.expiry_date)}`}
                  description={item.amount_cents ? formatCurrency(item.amount_cents, item.currency ?? membership.plan_currency) : undefined}
                  status={item.status}
                  statusTone={toneForStatus(item.status)}
                  icon="receipt-outline"
                />
              )}
            />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberPaymentsScreenView({ model }: { model: ReturnType<typeof useMemberPaymentsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, DetailGrid, ListSection, toneForStatus } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Payments" subtitle="Receipts and dues" icon="card-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No payments yet"
        emptyMessage="Payment history will appear once your gym records it."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(payments) => {
          const { paid, due } = getMemberPaymentTotals(payments);
          const currency = "INR";
          return (
            <>
              <DetailGrid>
                <MemberStatCard title="Paid" value={formatCurrency(paid, currency)} icon="checkmark-circle-outline" tone="success" />
                <MemberStatCard title="Due" value={formatCurrency(due, currency)} icon="alert-circle-outline" tone={due > 0 ? "warning" : "success"} />
              </DetailGrid>
              <ListSection
                data={payments}
                keyExtractor={(item) => item.payment_uuid}
                renderItem={(payment: MemberPayment) => (
                  <PaymentHistoryCard
                    title={payment.membership_plan_name ?? "Payment"}
                    subtitle={`${formatCurrency(payment.amount_cents, payment.currency)} - ${payment.payment_method}`}
                    description={`Invoice: ${payment.invoice_number ?? "Not issued"} - ${formatDateTime(payment.payment_date)}`}
                    status={payment.status}
                    statusTone={toneForStatus(payment.status)}
                    actionLabel={payment.receipt_url ? "Receipt" : undefined}
                  />
                )}
              />
            </>
          );
        }}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberAttendanceScreenView({ model }: { model: ReturnType<typeof useMemberAttendanceScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, DetailGrid, checkIn, checkOut, SectionTitle, ListSection, toneForStatus } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Attendance" subtitle="Check-ins and calendar" icon="walk-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data}
        emptyTitle="No attendance yet"
        emptyMessage="Your attendance history will appear after your first check-in."
        data={query.data ?? undefined}
        onRetry={() => query.refetch()}
      >
        {(attendance) => (
          <>
            <DetailGrid>
              <MemberStatCard title="Today's visits" value={`${attendance.today_visit_count} / ${attendance.daily_visit_limit}`} subtitle={attendance.today_status === "checked_in" ? "Currently checked in" : attendance.can_check_in ? "Ready to check in" : "Daily limit reached"} icon="today-outline" tone={attendance.today_status === "checked_in" ? "success" : "warning"} />
              <MemberStatCard title="This month" value={`${attendance.monthly_attendance_count}`} subtitle={`${attendance.attendance_percentage}% attendance`} icon="calendar-outline" tone="info" />
              <MemberStatCard title="Missed days" value={`${attendance.missed_days}`} icon="remove-circle-outline" tone={attendance.missed_days > 0 ? "warning" : "success"} />
            </DetailGrid>
            <View style={styles.buttonRow}>
              <PrimaryButton title="Check In" icon="log-in-outline" disabled={!attendance.can_check_in} loading={checkIn.isPending} onPress={() => checkIn.mutate()} style={styles.buttonFlex} />
              <PrimaryButton title="Check Out" icon="log-out-outline" variant="secondary" disabled={!attendance.can_check_out} loading={checkOut.isPending} onPress={() => checkOut.mutate()} style={styles.buttonFlex} />
            </View>
            <NoticeBanner message={checkIn.error ? getApiErrorMessage(checkIn.error) : checkOut.error ? getApiErrorMessage(checkOut.error) : null} tone="error" />
            <SectionTitle title="History" />
            <ListSection
              data={attendance.history}
              keyExtractor={(item) => item.attendance_uuid}
              renderItem={(item: MemberAttendance) => (
                <ScrollListCard
                  title={formatDateTime(item.check_in_at)}
                  subtitle={item.check_out_at ? `Out: ${formatDateTime(item.check_out_at)}` : "Active check-in"}
                  description={item.notes ?? item.source}
                  status={item.status}
                  statusTone={toneForStatus(item.status)}
                  icon="time-outline"
                />
              )}
            />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberWorkoutScreenView({ model }: { model: ReturnType<typeof useMemberWorkoutScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, DetailGrid, ListSection, displayValue, toneForStatus, completeWorkout } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Workout Plan" subtitle="Training and completion" icon="barbell-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No workout assigned"
        emptyMessage="Your trainer-created workout plans will appear here."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(workouts) => (
          <>
            <DetailGrid>
              <MemberStatCard title="Completed" value={`${getCompletedWorkoutCount(workouts)}`} icon="checkmark-done-outline" tone="success" />
              <MemberStatCard title="Consistency" value={`${Math.round(workouts[0]?.weekly_consistency ?? 0)}%`} icon="trending-up-outline" tone="info" />
            </DetailGrid>
            <ListSection
              data={workouts}
              keyExtractor={(item) => item.workout_plan_uuid}
              renderItem={(workout: MemberWorkout) => (
                <ScrollListCard
                  title={workout.workout_plan_name}
                  subtitle={`${workout.goal} - ${workout.level}`}
                  description={`Trainer: ${workout.trainer_name ?? "Not assigned"} - ${displayValue(workout.today_workout?.title ?? workout.today_workout?.name, "Today workout")}`}
                  status={workout.completion_status}
                  statusTone={toneForStatus(workout.completion_status)}
                  icon="barbell-outline"
                  actionLabel="Complete"
                  onAction={() => completeWorkout.mutate({ workoutPlanUuid: workout.workout_plan_uuid })}
                />
              )}
            />
            <NoticeBanner message={completeWorkout.error ? getApiErrorMessage(completeWorkout.error) : null} tone="error" />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberMealPlanScreenView({ model }: { model: ReturnType<typeof useMemberMealPlanScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, waterMl, setWaterMl, QueryState, DetailGrid, ListSection, displayValue, toneForStatus, completeMeal } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Meal Plan" subtitle="Nutrition and water" icon="nutrition-outline" />
      <FormTextField label="Water log" value={waterMl} keyboardType="numeric" onChangeText={setWaterMl} leftIcon="water-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No meal plan assigned"
        emptyMessage="Your trainer-created meal plans will appear here."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(meals) => (
          <>
            <DetailGrid>
              <MemberStatCard title="Daily calories" value={`${meals[0]?.calories_per_day ?? 0}`} icon="flame-outline" tone="warning" />
              <MemberStatCard title="Water target" value={meals[0]?.water_target_ml ? `${meals[0].water_target_ml} ml` : "--"} icon="water-outline" tone="info" />
            </DetailGrid>
            <ListSection
              data={meals}
              keyExtractor={(item) => item.meal_plan_uuid}
              renderItem={(meal: MemberMealPlan) => (
                <ScrollListCard
                  title={meal.meal_plan_name}
                  subtitle={`${meal.calories_per_day} calories - ${meal.trainer_name ?? "Trainer"}`}
                  description={meal.trainer_notes ?? displayValue(meal.today_meal_plan?.title ?? meal.today_meal_plan?.name, "Today meal plan")}
                  status={meal.completion_status}
                  statusTone={toneForStatus(meal.completion_status)}
                  icon="restaurant-outline"
                  actionLabel="Complete"
                  onAction={() => completeMeal.mutate({ mealPlanUuid: meal.meal_plan_uuid, waterMl: Number(waterMl) || undefined })}
                />
              )}
            />
            <NoticeBanner message={completeMeal.error ? getApiErrorMessage(completeMeal.error) : null} tone="error" />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberProgressScreenView({ model }: { model: ReturnType<typeof useMemberProgressScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, SectionTitle, weight, setWeight, bodyFat, setBodyFat, activeCalories, setActiveCalories, progressValidation, notes, setNotes, createLog, submit, QueryState, DetailGrid, ListSection } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Progress" subtitle="Logs and goal charts" icon="trending-up-outline" />
      <View style={styles.panel}>
        <SectionTitle title="Log Progress" />
        <FormTextField label="Active calories burned (kcal)" value={activeCalories} keyboardType="numeric" onChangeText={setActiveCalories} leftIcon="flame-outline" />
        <NoticeBanner message={progressValidation} tone="error" />
        <View style={styles.inputRow}>
          <FormTextField label="Weight" value={weight} keyboardType="numeric" onChangeText={setWeight} leftIcon="scale-outline" />
          <FormTextField label="Body fat %" value={bodyFat} keyboardType="numeric" onChangeText={setBodyFat} leftIcon="pulse-outline" />
        </View>
        <FormTextField label="Notes" value={notes} onChangeText={setNotes} leftIcon="create-outline" multiline />
        <PrimaryButton title="Save Log" icon="save-outline" loading={createLog.isPending} onPress={submit} />
        <NoticeBanner message={createLog.error ? getApiErrorMessage(createLog.error) : createLog.data ? "Progress logged." : null} tone={createLog.error ? "error" : "success"} />
      </View>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No progress logs"
        emptyMessage="Weight, BMI, measurements, and photos will appear after logging."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(logs) => (
          <>
            <DetailGrid>
              <MemberStatCard title="Latest weight" value={logs[0]?.weight ? `${logs[0].weight} kg` : "--"} icon="scale-outline" tone="info" />
              <MemberStatCard title="BMI" value={logs[0]?.bmi ? `${logs[0].bmi}` : "--"} icon="pulse-outline" tone="success" />
              <MemberStatCard title="Goal" value={`${Math.round(logs[0]?.goal_progress_percentage ?? 0)}%`} icon="flag-outline" tone="warning" />
            </DetailGrid>
            <ListSection
              data={logs}
              keyExtractor={(item) => item.progress_uuid}
              renderItem={(log: MemberProgressLog) => (
                <ScrollListCard
                  title={formatDate(log.logged_at)}
                  subtitle={`Weight: ${log.weight ?? "--"} kg - BMI: ${log.bmi ?? "--"}`}
                  description={log.notes ?? `Goal progress: ${Math.round(log.goal_progress_percentage ?? 0)}%`}
                  status={log.photo_url ? "photo" : "log"}
                  statusTone={log.photo_url ? "info" : "neutral"}
                  icon="analytics-outline"
                />
              )}
            />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberTrainerScreenView({ model }: { model: ReturnType<typeof useMemberTrainerScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, SectionTitle, navigation } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="My Trainer" subtitle="Coach and availability" icon="person-outline" />
      {query.isLoading ? <LoadingSkeleton rows={4} /> : null}
      {query.error ? <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} /> : null}
      {!query.isLoading && !query.error && !query.data ? (
        <EmptyState title="No trainer assigned" message="Your assigned trainer will appear once your gym links one to your profile." icon="person-outline" />
      ) : null}
      {query.data ? (
        <>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.kicker}>Assigned trainer</Text>
                <Text style={styles.largeTitle}>{query.data.trainer_name}</Text>
              </View>
              <StatusBadge label="Trainer" tone="info" />
            </View>
            <ScrollListCard title="Email" subtitle={query.data.email ?? "Not shared"} icon="mail-outline" />
            <ScrollListCard title="Phone" subtitle={query.data.phone ?? "Not shared"} icon="call-outline" />
            <ScrollListCard title="Specialization" subtitle={query.data.specialization.join(", ") || "General fitness"} icon="sparkles-outline" />
          </View>
          <SectionTitle title="Assigned Plans" />
          {[...query.data.assigned_workout_plans, ...query.data.assigned_meal_plans].map((plan) => (
            <ScrollListCard key={plan} title={plan} icon="document-text-outline" />
          ))}
          <PrimaryButton title="Message Trainer" icon="chatbubble-ellipses-outline" onPress={() => navigation.navigate("MemberSupport")} />
        </>
      ) : null}
    </Screen>
  ));
    }
  }
}

export function MemberClassesScreenView({ model }: { model: ReturnType<typeof useMemberClassesScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, ListSection, toneForStatus, cancelClass, bookClass } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Classes" subtitle="Book gym classes" icon="calendar-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No classes available"
        emptyMessage="Available classes from your gym will appear here."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(classes) => (
          <>
            <ListSection
              data={classes}
              keyExtractor={(item) => item.class_uuid}
              renderItem={(item: MemberClass) => {
                const booked = item.booking_status === "booked" || item.booking_status === "waiting_list";
                return (
                  <ClassBookingCard
                    title={item.class_name}
                    subtitle={`${item.class_type} - ${formatDate(item.date)} ${item.time ?? ""}`}
                    description={`${item.trainer_name ?? "Trainer"} - ${item.available_seats}/${item.capacity} seats`}
                    status={item.booking_status}
                    statusTone={toneForStatus(item.booking_status)}
                    actionLabel={booked ? "Cancel" : "Book"}
                    onAction={() => (booked ? cancelClass.mutate(item.class_uuid) : bookClass.mutate(item.class_uuid))}
                  />
                );
              }}
            />
            <NoticeBanner message={bookClass.error ? getApiErrorMessage(bookClass.error) : cancelClass.error ? getApiErrorMessage(cancelClass.error) : null} tone="error" />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberNotificationsScreenView({ model }: { model: ReturnType<typeof useMemberNotificationsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, unreadOnly, setUnreadOnly, QueryState, ListSection, markRead } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Notifications" subtitle="Personal updates" icon="notifications-outline" />
      <View style={styles.settingRow}>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>Unread only</Text>
          <Text style={styles.rowText}>Filter current alerts</Text>
        </View>
        <Switch value={unreadOnly} onValueChange={setUnreadOnly} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} />
      </View>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No notifications"
        emptyMessage="Membership, payments, workouts, classes, and gym announcements will appear here."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(notifications) => (
          <>
            <ListSection
              data={notifications}
              keyExtractor={(item) => item.notification_uuid}
              renderItem={(item: MemberNotification) => (
                <NotificationItem
                  title={item.title}
                  subtitle={formatDateTime(item.created_at)}
                  description={item.body}
                  status={item.status}
                  statusTone={item.status === "unread" ? "warning" : "neutral"}
                  actionLabel={item.status === "unread" ? "Read" : undefined}
                  onAction={() => markRead.mutate(item.notification_uuid)}
                />
              )}
            />
            <NoticeBanner message={markRead.error ? getApiErrorMessage(markRead.error) : null} tone="error" />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberGoalsScreenView({ model }: { model: ReturnType<typeof useMemberGoalsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, SectionTitle, goalName, setGoalName, targetWeight, setTargetWeight, caloriesGoal, setCaloriesGoal, goalValidation, createGoal, submit, QueryState, ListSection, updateGoal } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Goals" subtitle="Fitness targets" icon="flag-outline" />
      <View style={styles.panel}>
        <SectionTitle title="Create Goal" />
        <FormTextField label="Goal" value={goalName} onChangeText={setGoalName} leftIcon="flag-outline" />
        <FormTextField label="Daily Move goal (kcal)" value={caloriesGoal} keyboardType="numeric" onChangeText={setCaloriesGoal} leftIcon="flame-outline" />
        <NoticeBanner message={goalValidation} tone="error" />
        <FormTextField label="Target weight" value={targetWeight} keyboardType="numeric" onChangeText={setTargetWeight} leftIcon="scale-outline" />
        <PrimaryButton title="Create Goal" icon="add-circle-outline" loading={createGoal.isPending} onPress={submit} />
        <NoticeBanner message={createGoal.error ? getApiErrorMessage(createGoal.error) : createGoal.data ? "Goal created." : null} tone={createGoal.error ? "error" : "success"} />
      </View>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No goals yet"
        emptyMessage="Create a goal to track weight, water, attendance, workouts, and calories."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(goals) => (
          <ListSection
            data={goals}
            keyExtractor={(item) => item.goal_uuid}
            renderItem={(goal: MemberGoal) => (
              <GoalProgressCard
                title={goal.goal_name}
                value={`${Math.round(goal.progress_percentage)}%`}
                subtitle={goal.calories_goal ? `${goal.status} - Daily Move goal ${goal.calories_goal} kcal` : `${goal.status} - target ${goal.target_weight ?? "--"} kg`}
                onPress={() => {
                  if (goal.calories_goal) { setCaloriesGoal(String(goal.calories_goal)); setGoalName(goal.goal_name); }
                  else updateGoal.mutate({ goalUuid: goal.goal_uuid, payload: { status: "completed", progress_percentage: 100 } });
                }}
              />
            )}
          />
        )}
      </QueryState>
      <NoticeBanner message={updateGoal.error ? getApiErrorMessage(updateGoal.error) : null} tone="error" />
    </Screen>
  ));
    }
  }
}

export function MemberRewardsScreenView({ model }: { model: ReturnType<typeof useMemberRewardsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, DetailGrid, ListSection } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Rewards" subtitle="Challenges and badges" icon="trophy-outline" />
      <QueryState
        loading={query.isLoading}
        error={query.error}
        empty={!query.data?.length}
        emptyTitle="No rewards yet"
        emptyMessage="Challenges, points, badges, and offers from your gym will appear here."
        data={query.data ?? []}
        onRetry={() => query.refetch()}
      >
        {(rewards) => (
          <>
            <DetailGrid>
              <MemberStatCard title="Reward points" value={`${getRewardPoints(rewards)}`} icon="star-outline" tone="warning" />
              <MemberStatCard title="Badges" value={`${getRewardBadgeCount(rewards)}`} icon="medal-outline" tone="success" />
            </DetailGrid>
            <ListSection
              data={rewards}
              keyExtractor={(item, index) => `${item.reward_uuid}-${index}`}
              renderItem={(reward: MemberReward) => (
                <RewardBadge title={reward.title} subtitle={`${reward.points} points - ${reward.status}`} />
              )}
            />
          </>
        )}
      </QueryState>
    </Screen>
  ));
    }
  }
}

export function MemberSupportScreenView({ model }: { model: ReturnType<typeof useMemberSupportScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SectionTitle, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader title="Support" subtitle="Trainer and gym contact" icon="chatbubbles-outline" />
      <View style={styles.panel}>
        <SectionTitle title="New Request" />
        <FormTextField label="Category" value={category} onChangeText={setCategory} leftIcon="pricetag-outline" />
        <FormTextField label="Subject" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
        <FormTextField label="Message" value={message} onChangeText={setMessage} leftIcon="chatbubble-outline" multiline />
        <PrimaryButton title="Send Request" icon="send-outline" loading={createTicket.isPending} onPress={submit} />
        <NoticeBanner message={createTicket.error ? getApiErrorMessage(createTicket.error) : createTicket.data ? "Request sent." : null} tone={createTicket.error ? "error" : "success"} />
      </View>
      <ScrollListCard title="Trainer message" subtitle="Send a request to your assigned trainer" icon="person-outline" />
      <ScrollListCard title="Reception" subtitle="Contact the gym desk" icon="call-outline" />
      <ScrollListCard title="Feedback" subtitle="Share feedback with your gym" icon="heart-outline" />
      <ScrollListCard title="FAQ" subtitle="Common membership and billing questions" icon="help-circle-outline" />
    </Screen>
  ));
    }
  }
}

export function MemberSettingsScreenView({ model }: { model: ReturnType<typeof useMemberSettingsScreenPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, themeColors, oldPassword, setOldPassword, newPassword, setNewPassword, changePassword, submitPassword, notifications, setNotifications, privacy, setPrivacy, isDark, setColorScheme, navigation, logout } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader title="Settings" subtitle="Member preferences" icon="settings-outline" />
      <View style={[styles.panel, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.ink }]}>Security</Text>
        <FormTextField label="Old password" value={oldPassword} onChangeText={setOldPassword} secureTextEntry leftIcon="lock-open-outline" />
        <FormTextField label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry leftIcon="lock-closed-outline" />
        <PrimaryButton title="Change Password" icon="key-outline" loading={changePassword.isPending} onPress={submitPassword} />
        <NoticeBanner message={changePassword.error ? getApiErrorMessage(changePassword.error) : changePassword.data?.message ?? null} tone={changePassword.error ? "error" : "success"} />
      </View>

      <View style={[styles.panel, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.ink }]}>Preferences</Text>
        <View style={[styles.settingRow, { backgroundColor: themeColors.surfaceMuted }]}>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: themeColors.ink }]}>Notifications</Text>
            <Text style={[styles.rowText, { color: themeColors.muted }]}>Reminders and gym updates</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: themeColors.primary, false: themeColors.surfaceStrong }} thumbColor={themeColors.white} ios_backgroundColor={themeColors.surfaceStrong} />
        </View>
        <View style={[styles.settingRow, { backgroundColor: themeColors.surfaceMuted }]}>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: themeColors.ink }]}>Privacy</Text>
            <Text style={[styles.rowText, { color: themeColors.muted }]}>Use display names in shared views</Text>
          </View>
          <Switch value={privacy} onValueChange={setPrivacy} trackColor={{ true: themeColors.primary, false: themeColors.surfaceStrong }} thumbColor={themeColors.white} ios_backgroundColor={themeColors.surfaceStrong} />
        </View>
        <View style={[styles.settingRow, { backgroundColor: themeColors.surfaceMuted }]}>
          <View style={styles.flex}>
            <Text style={[styles.rowTitle, { color: themeColors.ink }]}>Dark mode</Text>
            <Text style={[styles.rowText, { color: themeColors.muted }]}>{isDark ? "Dark mode is on" : "Light mode is on"}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(enabled) => setColorScheme(enabled ? "dark" : "light")}
            trackColor={{ true: themeColors.primary, false: themeColors.surfaceStrong }}
            thumbColor={themeColors.white}
            ios_backgroundColor={themeColors.surfaceStrong}
          />
        </View>
        <ScrollListCard title="Language" subtitle="English" icon="language-outline" />
        <ScrollListCard title="Connected devices" subtitle="Not connected" icon="watch-outline" />
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton
          title="Dashboard"
          icon="speedometer-outline"
          variant="secondary"
          onPress={() => navigation.navigate("AppTabs", { screen: "MemberHome" })}
          style={styles.buttonFlex}
        />
        <PrimaryButton title="Logout" icon="log-out-outline" variant="danger" loading={logout.isPending} onPress={() => requestLogoutConfirmation(() => logout.mutate())} style={styles.buttonFlex} />
      </View>
    </Screen>
  ));
    }
  }
}
