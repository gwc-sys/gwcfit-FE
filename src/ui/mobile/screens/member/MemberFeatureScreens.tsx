import { MemberPaymentReceipt } from "../../../../features/operations/MemberPaymentReceipt";
import { MemberPlanCheckout } from "../../../../features/operations/MembershipCheckout";
import { WeekCalendar } from "../../components/WeekCalendar";
import { createMembershipStyles } from "../../styles/screens/member/MemberMembershipScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "../../components/NativePressable";
import { useState } from "react";
import { positiveNumberError, progressFormError, supportFormError } from "../../components/member/formValidation";
import { changePasswordSchema } from "../../../../validation/auth";
import { MemberProgressOverview, useMemberReferenceColors } from "../../components/member/MemberReference";
import { getMemberPaymentTotals, getCompletedWorkoutCount, getRewardPoints, getRewardBadgeCount } from "../../../../utils/memberFeatureMetrics";
import { FlatList, RefreshControl, ScrollView, Switch, Text, useWindowDimensions, View } from "react-native";
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const membershipStyles = createMembershipStyles(colors);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, QueryState, toneForStatus } = model.props;
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
          <View style={membershipStyles.content}>
            <View style={membershipStyles.section}>
              <WeekCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              <Text accessibilityLiveRegion="polite" style={membershipStyles.label}>{(() => {
                const day = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
                const label = selectedDate.toLocaleDateString(undefined, { day: "numeric", month: "short" });
                if (!membership.membership_plan_uuid) return `${label}: No plan assigned`;
                if (!membership.start_date || !membership.expiry_date) return `${label}: Membership dates not set`;
                return `${label}: ${day < membership.start_date ? "Before your plan starts" : day > membership.expiry_date ? "After your plan ends" : "Within your membership period"}`;
              })()}</Text>
            </View>
            <View style={membershipStyles.panel}>
              <View style={membershipStyles.header}>
                <View style={membershipStyles.copy}>
                  <Text style={membershipStyles.gym}>{membership.gym_name ?? "Your gym"}</Text>
                  <Text accessibilityRole="header" style={membershipStyles.title}>{membership.membership_plan_name ?? "No plan assigned"}</Text>
                </View>
                {membership.membership_plan_uuid ? <StatusBadge label={membership.status} tone={memberStatusTone(membership.status)} /> : null}
              </View>
              {membership.membership_plan_uuid ? <>
              <View style={membershipStyles.summary}>
                <View style={membershipStyles.metric}>
                  <Text style={membershipStyles.value}>{formatCurrency(membership.plan_price_cents, membership.plan_currency)}</Text>
                  <Text style={membershipStyles.label}>Plan price</Text>
                </View>
                <View style={membershipStyles.metric}>
                  <Text style={[membershipStyles.value, { color: membership.days_remaining > 0 && membership.days_remaining <= 7 ? colors.warning : colors.ink }]}>{Math.max(0, membership.days_remaining)}</Text>
                  <Text style={membershipStyles.label}>Days remaining</Text>
                </View>
              </View>
              <View style={membershipStyles.dates}>
                {[
                  ["Start date", membership.start_date ? formatDate(membership.start_date) : "Not set"],
                  ["Expiry date", membership.expiry_date ? formatDate(membership.expiry_date) : "Not set"],
                  ["Plan duration", membership.plan_duration_days ? `${membership.plan_duration_days} days` : "Not set"],
                ].map(([label, value]) => <View key={label} style={membershipStyles.dateRow}><Text style={membershipStyles.label}>{label}</Text><Text style={membershipStyles.dateValue}>{value}</Text></View>)}
              </View>
              </> : <Text style={membershipStyles.empty}>Choose a plan below to get started.</Text>}
              {membership.membership_plan_uuid && membership.renewal_reminder && !/^no reminder$/i.test(membership.renewal_reminder.trim()) ? <Text style={membershipStyles.label}>{membership.renewal_reminder}</Text> : null}
            </View>
            <View style={membershipStyles.section}>
              <Text accessibilityRole="header" style={membershipStyles.sectionTitle}>Plans at your gym</Text>
              <Text style={membershipStyles.label}>Swipe to compare plans. Choose a plan to join or renew.</Text>
              <MemberPlanCheckout plans={membership.available_plans ?? []} renderPlans={(choose, enabled) => (membership.available_plans ?? []).length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" contentContainerStyle={membershipStyles.planRail}>
                {[...(membership.available_plans ?? [])].sort((a, b) => Number(b.plan_uuid === membership.membership_plan_uuid) - Number(a.plan_uuid === membership.membership_plan_uuid)).map(plan => <View key={plan.plan_uuid} style={[membershipStyles.planCard, { width: Math.min(340, Math.max(240, width - 72)) }, plan.plan_uuid === membership.membership_plan_uuid && { borderColor: colors.primary }]}>
                  <View style={membershipStyles.header}>
                    <View style={membershipStyles.copy}><Text style={membershipStyles.planName}>{plan.name}</Text><Text style={membershipStyles.label}>{plan.duration_days} days</Text></View>
                    {plan.plan_uuid === membership.membership_plan_uuid ? <StatusBadge label="Your plan" tone="info" /> : null}
                  </View>
                  <Text style={membershipStyles.planPrice}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
                  {plan.description ? <Text style={membershipStyles.empty}>{plan.description}</Text> : null}
                  <View style={membershipStyles.planBenefits}>
                    {plan.benefits.map((benefit, i) => <View key={i} style={membershipStyles.benefit}><Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} /><Text style={membershipStyles.body}>{benefit}</Text></View>)}
                  </View>
                  <PrimaryButton title={plan.plan_uuid === membership.membership_plan_uuid ? "Renew plan" : "Choose plan"} disabled={!enabled || plan.price_cents <= 0} onPress={() => choose(plan)} />
                </View>)}
              </ScrollView> : <Text style={membershipStyles.empty}>Your gym has not published any plans yet.</Text>} />

            </View>
            {membership.membership_plan_uuid ? <View style={membershipStyles.section}>
              <Text accessibilityRole="header" style={membershipStyles.sectionTitle}>Your plan benefits</Text>
              {membership.benefits.length ? <View style={membershipStyles.list}>
                {membership.benefits.map((benefit, index) => <View key={`${index}-${benefit}`} style={[membershipStyles.row, membershipStyles.benefit, index > 0 && membershipStyles.divider]}><Ionicons name="checkmark-circle-outline" size={19} color={colors.primary} /><Text style={membershipStyles.body}>{benefit}</Text></View>)}
              </View> : <Text style={membershipStyles.empty}>No benefits listed for your current plan.</Text>}
            </View> : null}
            <View style={membershipStyles.section}>
              <Text accessibilityRole="header" style={membershipStyles.sectionTitle}>Membership history</Text>
              {membership.history.length ? <View style={membershipStyles.list}>
                {membership.history.map((item, index) => <View key={item.membership_uuid} style={[membershipStyles.row, index > 0 && membershipStyles.divider]}>
                  <View style={membershipStyles.header}><View style={membershipStyles.copy}><Text style={membershipStyles.historyTitle}>{item.membership_plan_name ?? "Membership"}</Text><Text style={membershipStyles.label}>{item.start_date ? formatDate(item.start_date) : "Not set"} to {item.expiry_date ? formatDate(item.expiry_date) : "Not set"}</Text></View><StatusBadge label={item.status} tone={toneForStatus(item.status)} /></View>
                  {item.amount_cents != null ? <Text style={membershipStyles.dateValue}>{formatCurrency(item.amount_cents, item.currency ?? membership.plan_currency)}</Text> : null}
                  {item.status === "paid" ? <MemberPaymentReceipt paymentId={item.membership_uuid} /> : null}
                </View>)}
              </View> : <Text style={membershipStyles.empty}>Your membership records will appear here.</Text>}
            </View>
          </View>
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
                  <MemberPaymentReceipt paymentId={payment.payment_uuid}>{(open, busy) => <Pressable accessibilityRole={payment.status === "paid" ? "button" : undefined} accessibilityLabel={`${payment.membership_plan_name ?? "Payment"}. ${payment.status === "paid" ? "View payment receipt" : "Receipt available after confirmation"}`} disabled={payment.status !== "paid" || busy} onPress={open}>
                  <PaymentHistoryCard
                    title={payment.membership_plan_name ?? "Payment"}
                    subtitle={`${formatCurrency(payment.amount_cents, payment.currency)} - ${payment.payment_method}`}
                    description={`${formatDateTime(payment.payment_date)}${payment.status === "paid" ? " - Tap to view receipt" : " - Receipt available after confirmation"}`}
                    status={payment.status}
                    statusTone={toneForStatus(payment.status)}
                  />
                  </Pressable>}</MemberPaymentReceipt>
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
  const [showMore, setShowMore] = useState(false);
  const [validationError, setValidationError] = useState<string>();
  const memberColors = useMemberReferenceColors();
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, SectionTitle, weight, setWeight, bodyFat, setBodyFat, activeCalories, setActiveCalories, progressValidation, notes, setNotes, createLog, submit, QueryState, DetailGrid, ListSection } = model.props;
      return ((
    <Screen scroll keyboard reference={false} style={{ backgroundColor: memberColors.background }} contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Your progress" subtitle="Small steps. Stronger you." />
      <MemberProgressOverview logs={query.data ?? []} loading={query.isLoading} failed={Boolean(query.error)} />
      <View style={[styles.panel, { padding: 16, gap: 16, borderWidth: 0, borderRadius: 18 }]}>
        <View style={{ gap: 4 }}>
          <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: "600", letterSpacing: -0.4 }}>Log progress</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>Add weight or active calories. Other details are optional.</Text>
        </View>
        <FormTextField label="Weight (kg)" placeholder="e.g. 72.5" value={weight} keyboardType="decimal-pad" onChangeText={setWeight} />
        <FormTextField label="Active calories (kcal)" placeholder="e.g. 300" value={activeCalories} keyboardType="numeric" onChangeText={setActiveCalories} />
        <NoticeBanner message={progressValidation} tone="error" />
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMore }} onPress={() => setShowMore(value => !value)} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "500" }}>More details{!showMore && (bodyFat || notes) ? " ? Added" : ""}</Text>
          <Ionicons name={showMore ? "chevron-up" : "chevron-down"} size={17} color={colors.primary} />
        </Pressable>
        {showMore ? <View style={{ gap: 16 }}>
          <FormTextField label="Body fat (%)" placeholder="Optional" value={bodyFat} keyboardType="decimal-pad" onChangeText={setBodyFat} />
          <FormTextField label="Notes" placeholder="How did you feel?" value={notes} onChangeText={setNotes} multiline />
        </View> : null}
        <NoticeBanner message={validationError ?? null} tone="error" />
        <PrimaryButton title="Save log" loading={createLog.isPending} onPress={() => {
          const error = progressFormError(weight, bodyFat, notes, activeCalories); setValidationError(error);
          if (error && (bodyFat || notes)) setShowMore(true);
          if (!error && !createLog.isPending) submit();
        }} />
        <NoticeBanner message={createLog.error ? getApiErrorMessage(createLog.error) : createLog.data ? "Progress logged." : null} tone={createLog.error ? "error" : "success"} />
      </View>
      <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>History</Text>
      {!query.isLoading && !query.error && !query.data?.length ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, paddingBottom: 16 }}>Your saved entries will appear here.</Text> : <QueryState
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
      </QueryState>}
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
      const { styles, queryRefresh, query, feedbackQuery, saveFeedback, rating, setRating, feedbackOption, setFeedbackOption, customFeedback, setCustomFeedback, submitFeedback, SectionTitle, navigation } = model.props;
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
          <SectionTitle title="Rate your trainer" />
          <View style={styles.panel}>
            <Text style={styles.kicker}>{feedbackQuery.data ? "Edit this month’s review" : "Your feedback helps your gym improve"}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} accessibilityRole="button" accessibilityLabel={`Rate ${star} stars`} onPress={() => setRating(star)}><Text style={{ fontSize: 28, color: star <= rating ? "#F59E0B" : colors.border }}>★</Text></Pressable>)}</View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{["Knowledgeable and helpful", "Motivating and encouraging", "Personalized my workouts", "Clear communication", "Could improve availability", "Other"].map((option) => <Pressable key={option} accessibilityRole="button" onPress={() => setFeedbackOption(option)} style={{ borderWidth: 1, borderColor: feedbackOption === option ? colors.primary : colors.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 }}><Text style={{ color: colors.ink }}>{option}</Text></Pressable>)}</View>
            {feedbackOption === "Other" ? <FormTextField label="Your feedback" value={customFeedback} onChangeText={setCustomFeedback} placeholder="Tell us more" multiline /> : null}
            {saveFeedback.error ? <NoticeBanner tone="error" message={getApiErrorMessage(saveFeedback.error)} /> : null}
            <PrimaryButton title={feedbackQuery.data ? "Update Review" : "Submit Review"} loading={saveFeedback.isPending} onPress={submitFeedback} style={{ marginTop: 12 }} />
          </View>
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
                    actionDisabled={bookClass.isPending || cancelClass.isPending}
                    onAction={() => { if (!bookClass.isPending && !cancelClass.isPending) { if (booked) cancelClass.mutate(item.class_uuid); else bookClass.mutate(item.class_uuid); } }}
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
        <Switch accessibilityLabel="Show unread notifications only" value={unreadOnly} onValueChange={setUnreadOnly} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} />
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
                  actionDisabled={markRead.isPending}
                  onAction={() => { if (!markRead.isPending && item.status === "unread") markRead.mutate(item.notification_uuid); }}
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
  const [validationError, setValidationError] = useState<string>();
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, queryRefresh, query, SectionTitle, goalName, setGoalName, targetWeight, setTargetWeight, caloriesGoal, setCaloriesGoal, goalValidation, createGoal, submit, QueryState, ListSection, updateGoal } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen} refreshControl={queryRefresh(query.isRefetching, () => query.refetch())}>
      <ScreenHeader title="Goals" subtitle="Fitness targets" icon="flag-outline" />
      <View style={styles.panel}>
        <SectionTitle title="Create Goal" />
        <FormTextField label="Goal" value={goalName} onChangeText={setGoalName} leftIcon="flag-outline" />
        <FormTextField label="Daily Move goal (kcal)" value={caloriesGoal} keyboardType="numeric" onChangeText={setCaloriesGoal} leftIcon="flame-outline" />
        <NoticeBanner message={goalValidation} tone="error" />
        <FormTextField label="Target weight" value={targetWeight} keyboardType="numeric" onChangeText={setTargetWeight} leftIcon="scale-outline" />
        <NoticeBanner message={validationError ?? null} tone="error" />
        <PrimaryButton title="Create Goal" icon="add-circle-outline" loading={createGoal.isPending} onPress={() => {
          const error = positiveNumberError(targetWeight, "Target weight"); setValidationError(error);
          if (!error && !createGoal.isPending) submit();
        }} />
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
  const [validationError, setValidationError] = useState<string>();
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SectionTitle, category, setCategory, subject, setSubject, message, setMessage, createTicket, submit } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <ScreenHeader title="Support" subtitle="Trainer and gym contact" icon="chatbubbles-outline" />
      <View style={styles.panel}>
        <SectionTitle title="New Request" />
        <FormTextField required maxLength={80} label="Category" value={category} onChangeText={setCategory} leftIcon="pricetag-outline" />
        <FormTextField required maxLength={180} label="Subject" value={subject} onChangeText={setSubject} leftIcon="text-outline" />
        <FormTextField required maxLength={2000} label="Message" value={message} onChangeText={setMessage} leftIcon="chatbubble-outline" multiline />
        <NoticeBanner message={validationError ?? null} tone="error" />
        <PrimaryButton title="Send Request" icon="send-outline" loading={createTicket.isPending} onPress={() => {
          const error = supportFormError(category, subject, message); setValidationError(error);
          if (!error && !createTicket.isPending) submit();
        }} />
        <NoticeBanner message={createTicket.error ? getApiErrorMessage(createTicket.error) : createTicket.data ? "Request sent." : null} tone={createTicket.error ? "error" : "success"} />
      </View>
      <Text style={styles.rowText}>Requests are sent to your gym. This screen does not provide live chat or phone calls.</Text>
      <ScrollListCard title="Trainer request" subtitle="Prepare a request about training" icon="person-outline" actionLabel="Select" onAction={() => { setCategory("trainer"); setSubject("Training support"); }} />
      <ScrollListCard title="Reception" subtitle="Prepare a front desk request" icon="call-outline" actionLabel="Select" onAction={() => { setCategory("reception"); setSubject("Front desk support"); }} />
      <ScrollListCard title="Feedback" subtitle="Prepare feedback for your gym" icon="heart-outline" actionLabel="Select" onAction={() => { setCategory("feedback"); setSubject("Gym feedback"); }} />

    </Screen>
  ));
    }
  }
}

export { MemberSettingsView as MemberSettingsScreenView } from "./MemberSettingsView";
