import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useMemberExerciseDetailScreenPresentation, useButtonPresentation, usePanelPresentation, useTagPresentation, useMetricPresentation, useLegendPresentation, useSummaryPresentation, useTrainerTipsPresentation, useTipPresentation } from "../../../../screens/member/MemberExerciseDetailScreen";

type Tab = "exercises" | "notes" | "history" | "tips";

type Icon = keyof typeof Ionicons.glyphMap;

export function MemberExerciseDetailScreenView({ model }: { model: ReturnType<typeof useMemberExerciseDetailScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><ActivityIndicator size="large" color="#0A84FF" /><Text style={s.muted}>Loading exercise...</Text></Screen>);
    }
    case "view2": {
      const { s, query, Button, navigation } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><Ionicons name="alert-circle-outline" size={38} color="#EF4444" /><Text style={s.title}>{query.error ? "Couldn't load exercise" : "Exercise not found"}</Text><Text style={s.muted}>{query.error ? getApiErrorMessage(query.error) : "Return to the plan and choose another exercise."}</Text><Button icon="arrow-back" label="Back" onPress={() => navigation.goBack()} /></Screen>);
    }
    case "view3": {
      const { s, query, navigation, exercise, workout, Button, statusDone, start, stacked, fallbackImage, Panel, Tag, Metric, minutes, focusImage, Legend, setTab, tab, steps, TrainerTips, Summary, exercises, totalSets, lowReps, difficulty } = model.props;
      return (<Screen dark scroll maxWidth="none" contentContainerStyle={s.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor="#0A84FF" />}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Previous" onPress={() => navigation.goBack()} style={s.back}><Ionicons name="chevron-back" size={25} color="#fff" /></Pressable><View style={s.headerCopy}><View style={s.titleLine}><Text style={s.title}>{exercise.name}</Text><View style={s.category}><Text style={s.categoryText}>{exercise.group}</Text></View></View><Text style={s.subtitle}>Trainer: {workout.trainer_name ?? "Not assigned"}   •   Equipment: {exercise.equipment}</Text></View><Button icon="play-outline" label={statusDone ? "Completed" : "Start Workout"} onPress={start} outline /></View>

    <View style={[s.topGrid, stacked && s.column]}>
      <View style={s.mediaPanel}><Image source={exercise.image ?? fallbackImage} style={s.media} resizeMode="contain" /><View style={s.videoBadge}><Ionicons name="play-circle-outline" size={18} color="#0A84FF" /><Text style={s.videoText}>Video Guide</Text></View><Pressable accessibilityRole="button" onPress={() => showAlert(exercise.name, "The animated guide demonstrates the complete movement.")} style={s.expand} accessibilityLabel={"Open movement guide"}><Ionicons name="expand-outline" size={20} color="#111827" /></Pressable></View>
      <Panel title="About this exercise" style={s.about}><Text style={s.body}>{exercise.name} targets your {exercise.group.toLowerCase()}, improving strength, control, and stability. Perform every repetition with a controlled range of motion.</Text><View style={s.tags}><Tag label="Strength" /><Tag label="Isolation" /><Tag label={exercise.group} /></View><Text style={s.caption}>Great for building a strong and stable movement pattern.</Text></Panel>
      <Panel style={s.metricsPanel}><Metric icon="stats-chart" label="Level" value={`${workout.level} – Advanced`} tone="#0A84FF" /><Metric icon="time-outline" label="Duration" value={`${minutes}-${minutes + 15} min`} tone="#F59E0B" /><Metric icon="alarm-outline" label="Rest Between Sets" value={exercise.rest} tone="#F59E0B" /><Metric icon="barbell-outline" label="Equipment" value={exercise.equipment} tone="#0A84FF" /></Panel>
      <Panel title="Muscle Focus" style={s.musclePanel}><View style={s.muscleBody}><Image source={focusImage(exercise.group)} style={s.muscle} resizeMode="contain" /><View style={s.legend}><Legend tone="#EF4444" label="Primary" value={exercise.group} /><Legend tone="#F59E0B" label="Secondary" value="Core, Stabilizers" /><Legend tone="#10B981" label="Stabilizers" value="Core, Lower Back" /></View></View></Panel>
    </View>

    <View style={s.tabs}>{([["exercises", "barbell-outline", "Exercises"], ["notes", "document-text-outline", "Notes"], ["history", "time-outline", "History"], ["tips", "bulb-outline", "Tips"]] as Array<[Tab, Icon, string]>).map(([key, icon, label]) => <Pressable accessibilityRole="button" key={key} onPress={() => setTab(key)} style={[s.tab, tab === key && s.tabActive]}><Ionicons name={icon} size={18} color={tab === key ? "#0A84FF" : "#CBD5E1"} /><Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text></Pressable>)}</View>

    <View style={[s.bottomGrid, stacked && s.column]}><View style={s.stepsColumn}>{tab === "exercises" ? <Panel title="Exercise Steps"><View style={s.setBadge}><Text style={s.caption}>{exercise.sets} Sets · {exercise.reps} Reps</Text></View><View style={s.steps}>{steps.map((step, index) => <View key={step.title} style={s.step}><Ionicons name="reorder-three-outline" size={20} color="#64748B" /><View style={s.stepNumber}><Text style={s.stepNumberText}>{index + 1}</Text></View><Image source={exercise.image ?? fallbackImage} style={s.stepImage} resizeMode="contain" /><View style={s.stepCopy}><Text style={s.stepTitle}>{step.title}</Text><Text style={s.stepBody}>{step.body}</Text></View><View><Text style={s.caption}>Reps</Text><Text style={s.repText}>{exercise.reps}</Text></View><Ionicons name="chevron-down" size={18} color="#94A3B8" /></View>)}</View><Pressable accessibilityRole="button" onPress={() => showAlert("Add exercise", "Ask your trainer to add an exercise to this assigned plan.")} style={s.add}><Ionicons name="add" size={21} color="#0A84FF" /><Text style={s.addText}>Add Exercise to Plan</Text></Pressable></Panel> : tab === "notes" ? <Panel title="Trainer Notes"><Text style={s.body}>{workout.trainer_notes ?? `Keep your ${exercise.name} repetitions controlled and stop if you feel pain.`}</Text></Panel> : tab === "history" ? <Panel title="Exercise History"><Text style={s.body}>Plan completions: {workout.completed_workouts}</Text><Text style={s.body}>Weekly consistency: {Math.round(workout.weekly_consistency)}%</Text></Panel> : <TrainerTips exercise={exercise} />}</View><View style={s.rightColumn}><Panel title="Workout Summary"><View style={s.summaryGrid}><Summary icon="body-outline" label="Total Exercises" value={`${exercises.length}`} tone="#0EA5E9" /><Summary icon="grid-outline" label="Total Sets" value={`${totalSets}`} tone="#0A84FF" /><Summary icon="pulse-outline" label="Total Reps" value={`${lowReps}-${lowReps + totalSets}`} tone="#10B981" /><Summary icon="time-outline" label="Est. Duration" value={`${minutes}-${minutes + 15} min`} tone="#F59E0B" /><Summary icon="flame-outline" label="Calories Burn" value={`${minutes * 6}-${minutes * 8} kcal`} tone="#EF4444" /><Summary icon="flame" label="Difficulty" value={difficulty(workout.level)} tone="#F59E0B" /></View></Panel><TrainerTips exercise={exercise} /></View></View>
  </Screen>);
    }
  }
}

export function ButtonView({ model }: { model: ReturnType<typeof useButtonPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, s, outline, icon, label } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={[s.button, outline && s.buttonOutline]}><Ionicons name={icon} size={19} color={outline ? "#0A84FF" : "#fff"} /><Text style={[s.buttonText, outline && s.buttonOutlineText]}>{label}</Text></Pressable>);
    }
  }
}

export function PanelView({ model }: { model: ReturnType<typeof usePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, style, title, children } = model.props;
      return (<View style={[s.panel, style]}>{title ? <Text style={s.panelTitle}>{title}</Text> : null}{children}</View>);
    }
  }
}

export function TagView({ model }: { model: ReturnType<typeof useTagPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, label } = model.props;
      return (<View style={s.tag}><Text style={s.tagText}>{label}</Text></View>);
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, icon, label, value } = model.props;
      return (<View style={s.metric}><View style={[s.metricIcon, { backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={20} color={tone} /></View><View style={s.flex}><Text style={s.caption}>{label}</Text><Text numberOfLines={2} style={s.metricValue}>{value}</Text></View></View>);
    }
  }
}

export function LegendView({ model }: { model: ReturnType<typeof useLegendPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, label, value } = model.props;
      return (<View style={s.legendItem}><View style={[s.dot, { backgroundColor: tone }]} /><View><Text style={s.legendLabel}>{label}</Text><Text style={s.caption}>{value}</Text></View></View>);
    }
  }
}

export function SummaryView({ model }: { model: ReturnType<typeof useSummaryPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, icon, label, value } = model.props;
      return (<View style={s.summary}><View style={[s.summaryIcon, { backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={19} color={tone} /></View><View><Text style={s.caption}>{label}</Text><Text style={[s.summaryValue, label === "Difficulty" && { color: tone }]}>{value}</Text></View></View>);
    }
  }
}

export function TrainerTipsView({ model }: { model: ReturnType<typeof useTrainerTipsPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Panel, s, Tip, exercise } = model.props;
      return (<Panel title="Trainer Tips"><View style={s.tipList}><Tip icon="shield-checkmark" text="Keep your movements slow and controlled." tone="#10B981" /><Tip icon="water" text="Stay hydrated and rest properly between sets." tone="#3B82F6" /><Tip icon="shield-checkmark" text="Engage your core throughout the movement." tone="#10B981" /><Tip icon="flame-outline" text={`Focus on squeezing your ${exercise.group.toLowerCase()}.`} tone="#EF4444" /></View></Panel>);
    }
  }
}

export function TipView({ model }: { model: ReturnType<typeof useTipPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, icon, text } = model.props;
      return (<View style={s.tip}><View style={[s.tipIcon, { backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={17} color={tone} /></View><Text style={s.tipText}>{text}</Text></View>);
    }
  }
}
