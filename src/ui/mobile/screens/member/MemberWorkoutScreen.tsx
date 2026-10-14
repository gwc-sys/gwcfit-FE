import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatDate } from "../../../../utils/formatters";
import type * as React from "react";
import type { useMemberWorkoutScreenPresentation, useButtonPresentation, useMetricPresentation, useWorkoutCardPresentation, useStatePresentation } from "../../../../screens/member/MemberWorkoutScreen";

type Filter = "all" | "completed" | "pending" | "not-started";

export function MemberWorkoutScreenView({ model }: { model: ReturnType<typeof useMemberWorkoutScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, query, colors, Metric, completed, consistency, calories, durationText, duration, setFilter, filter, navigation, ui, setRecent, recent, State, visible, WorkoutCard, compact, workouts, Button } = model.props;
      return (<Screen scroll maxWidth="none" contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={colors.primary} />}>
    <View style={styles.metrics}>
      <Metric icon="checkmark-circle" label="Completed Workouts" value={`${completed}`} sub="This Month" tone="#0066CC" />
      <Metric icon="trending-up" label="Consistency" value={`${consistency}%`} sub="This Week" tone="#10B981" />
      <Metric icon="flame" label="Total Calories" value={calories.toLocaleString()} sub="This Week" tone="#F97316" />
      <Metric icon="time" label="Total Duration" value={durationText(duration)} sub="This Week" tone="#3B82F6" />
    </View>

    <View style={styles.toolbar}><View style={styles.filters}>{([ ["all", "All Workouts"], ["completed", "Completed"], ["pending", "Pending"], ["not-started", "Not Started"] ] as Array<[Filter, string]>).map(([key, label]) => <Pressable accessibilityRole="button" key={key} onPress={() => setFilter(key)} style={[styles.filter, filter === key && styles.filterActive]}><Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={() => navigation.navigate("AIWorkoutGenerator")} style={({ pressed }) => [styles.newWorkout, pressed && ui.pressed]}><Ionicons name="add" size={18} color="#FFFFFF" /><Text style={styles.newWorkoutText}>New Workout</Text></Pressable></View><Pressable accessibilityRole="button" onPress={() => setRecent((value) => !value)} style={styles.sort}><Text style={styles.sortText}>{recent ? "Recent First" : "Oldest First"}</Text><Ionicons name="chevron-down" size={17} color={colors.ink} /></Pressable></View>

    {query.isLoading ? <State icon="barbell-outline" message="Loading your workouts..." loading /> : query.error ? <State icon="alert-circle-outline" title="Couldn't load workouts" message={getApiErrorMessage(query.error)} /> : visible.length ? <View style={styles.list}>{visible.map((workout) => <WorkoutCard key={workout.workout_plan_uuid} workout={workout} compact={compact} onOpen={() => navigation.navigate("MemberWorkoutDetail", { workoutPlanUuid: workout.workout_plan_uuid })} />)}</View> : <State icon="barbell-outline" title={workouts.length ? "No workouts in this status" : "No workout assigned"} message={workouts.length ? "Choose another filter to see your plans." : "Your trainer-created workout plans will appear here."} />}

    <LinearGradient colors={[colors.primarySoft, colors.surface]} style={styles.progress}><View style={styles.trophy}><Ionicons name="trophy" size={25} color="#fff" /></View><View style={styles.progressCopy}><Text style={styles.progressTitle}>Keep going, you&apos;re doing great! 💪</Text><Text style={styles.progressText}>Consistency is the key to achieving your fitness goals.</Text></View><Button icon="trending-up" label="View Progress" onPress={() => navigation.navigate("MemberProgress")} secondary /></LinearGradient>
  </Screen>);
    }
  }
}

export function ButtonView({ model }: { model: ReturnType<typeof useButtonPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, ui, secondary, colors, icon, label } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [ui.button, { backgroundColor: secondary ? colors.surface : colors.primary, borderColor: secondary ? colors.border : colors.primary }, pressed && ui.pressed]}><Ionicons name={icon} size={19} color={secondary ? colors.ink : "#fff"} /><Text style={[ui.buttonText, { color: secondary ? colors.ink : "#fff" }]}>{label}</Text></Pressable>);
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { ui, colors, tone, icon, label, value, sub } = model.props;
      return (<View style={[ui.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[ui.metricIcon, { backgroundColor: tone }]}><Ionicons name={icon} size={24} color="#fff" /></View><View style={ui.metricCopy}><Text style={[ui.metricLabel, { color: colors.ink }]}>{label}</Text><Text style={[ui.metricValue, { color: colors.ink }]}>{value}</Text><Text style={[ui.metricSub, { color: colors.muted }]}>{sub}</Text></View><View style={ui.bars}>{[14, 25, 18, 38, 29, 52].map((height, i) => <View key={i} style={{ width: 4, height, borderRadius: 4, backgroundColor: `${tone}${i > 3 ? "CC" : "55"}` }} />)}</View></View>);
    }
  }
}

export function WorkoutCardView({ model }: { model: ReturnType<typeof useWorkoutCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, onOpen, imageOf, workout, tone, status, category, exercise, label, colors } = model.props;
      return (<View style={styles.card}><Pressable accessibilityRole="button" onPress={onOpen} style={styles.thumbWrap} accessibilityLabel={"Open workout"}><Image source={imageOf(workout)} style={styles.thumb} resizeMode="cover" /><View style={[styles.thumbBadge, { backgroundColor: tone }]}><Ionicons name={status === "completed" ? "checkmark" : "barbell"} size={20} color="#fff" /></View></Pressable><Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardCopy}><Text style={styles.cardTitle}>{workout.workout_plan_name}</Text><Text style={[styles.cardCategory, { color: tone }]}>{workout.goal} · {workout.level}</Text><Text numberOfLines={2} style={styles.cardMeta}>Trainer: {workout.trainer_name ?? "Not assigned"}  ·  {category}  ·  {exercise}</Text></Pressable><View style={styles.cardActions}><View style={[styles.status, { backgroundColor: `${tone}18` }]}><Text style={[styles.statusText, { color: tone }]}>{label}</Text></View>{status === "completed" ? <Pressable accessibilityRole="button" onPress={onOpen} style={styles.detail}><Ionicons name="eye-outline" size={17} color={colors.ink} /><Text style={styles.detailText}>View Details</Text></Pressable> : <Pressable accessibilityRole="button" onPress={onOpen} style={styles.start}><Ionicons name="play" size={14} color="#fff" /><Text style={styles.startText}>{status === "pending" ? "Continue" : "Start Workout"}</Text></Pressable>}<View style={styles.date}><Ionicons name="calendar-outline" size={16} color={colors.muted} /><Text style={styles.dateText}>{workout.starts_at ? formatDate(workout.starts_at) : "Schedule pending"}</Text></View></View></View>);
    }
  }
}

export function StateView({ model }: { model: ReturnType<typeof useStatePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { ui, colors, loading, icon, title, message } = model.props;
      return (<View style={[ui.state, { backgroundColor: colors.surface, borderColor: colors.border }]}>{loading ? <ActivityIndicator size="large" color={colors.primary} /> : <Ionicons name={icon} size={32} color={colors.primary} />}{title ? <Text style={[ui.stateTitle, { color: colors.ink }]}>{title}</Text> : null}<Text style={[ui.stateText, { color: colors.muted }]}>{message}</Text></View>);
    }
  }
}
