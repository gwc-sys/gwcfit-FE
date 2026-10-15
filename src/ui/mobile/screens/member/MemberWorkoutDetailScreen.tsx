import { Pressable } from "../../components/NativePressable";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, RefreshControl, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useMemberWorkoutDetailScreenPresentation, useActionPresentation, useInfoPresentation, usePanelPresentation, useSummaryPresentation, useExercisePanelPresentation, useTipsPresentation, useTipPresentation, useProgressChartPresentation } from "../../../../screens/member/MemberWorkoutDetailScreen";

type Tab = "plan" | "details" | "notes" | "history";

type Icon = keyof typeof Ionicons.glyphMap;

export function MemberWorkoutDetailScreenView({ model }: { model: ReturnType<typeof useMemberWorkoutDetailScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><ActivityIndicator size="large" color="#0066CC" /><Text style={s.muted}>Loading workout plan...</Text></Screen>);
    }
    case "view2": {
      const { s, query, Action, navigation } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><Ionicons name="alert-circle-outline" size={38} color="#EF4444" /><Text style={s.pageTitle}>{query.error ? "Couldn't load this plan" : "Workout plan not found"}</Text><Text style={s.muted}>{query.error ? getApiErrorMessage(query.error) : "Return to workouts and select another plan."}</Text><Action icon="arrow-back" label="Back to Workouts" onPress={() => navigation.goBack()} /></Screen>);
    }
    case "view3": {
      const { s, query, navigation, workout, Action, planStatus, stacked, heroImage, exercises, Info, duration, focus, equipment, setTab, tab, ExercisePanel, Panel, muscleImages, muscleKey, Summary, totalSets, totalRepsLow, Tips, ProgressChart } = model.props;
      return (<Screen dark scroll maxWidth="none" contentContainerStyle={s.screen} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor="#0066CC" />}>
    <View style={s.topbar}><Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={s.back}><Ionicons name="arrow-back" size={20} color="#fff" /><Text style={s.buttonText}>Back</Text></Pressable><View style={s.planHeading}><View style={s.planIcon}><Ionicons name="barbell" size={24} color="#0A84FF" /></View><View><Text style={s.pageTitle}>{workout.workout_plan_name}</Text><Text style={s.subtitle}>{workout.goal} - {workout.gym_name ?? "GYM"}</Text></View></View><View style={s.topActions}><Action icon="play" label={planStatus(workout) === "Completed" ? "Completed" : "Start Workout"} onPress={() => planStatus(workout) === "Completed" ? undefined : navigation.navigate("MemberWorkoutSession", { workoutPlanUuid: workout.workout_plan_uuid, exerciseIndex: 0 })} /></View></View>

    <View style={[s.overview, stacked && s.column]}><View style={s.heroWrap}><Image source={heroImage} style={s.hero} resizeMode="cover" /><View style={s.heroStatus}><Text style={s.heroStatusText}>{planStatus(workout)}</Text></View></View><View style={s.overviewInfo}><Text style={s.overviewTitle}>{workout.workout_plan_name}</Text><Text style={s.muted}>♧  Trainer: {workout.trainer_name ?? "Not assigned"}   •   {exercises[0]?.name ?? workout.goal}</Text><View style={s.infoTiles}><Info icon="stats-chart" label="Level" value={workout.level} tone="#0A84FF" /><Info icon="time-outline" label="Duration" value={`${duration}-${duration + 15} min`} tone="#F59E0B" /><Info icon="locate-outline" label="Focus" value={focus} tone="#EF4444" /><Info icon="barbell-outline" label="Equipment" value={equipment} tone="#0A84FF" /></View><Text style={s.description}>This workout is designed to build strength and improve your {focus.toLowerCase()} with controlled compound and isolation movements.</Text></View></View>

    <View style={s.tabs}>{([["plan", "barbell-outline", "Workout Plan"], ["details", "body-outline", "Exercise Details"], ["notes", "document-text-outline", "Notes"], ["history", "time-outline", "History"]] as Array<[Tab, Icon, string]>).map(([key, icon, label]) => <Pressable accessibilityRole="button" key={key} onPress={() => setTab(key)} style={[s.tab, tab === key && s.tabActive]}><Ionicons name={icon} size={18} color={tab === key ? "#0A84FF" : "#CBD5E1"} /><Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text></Pressable>)}</View>

    <View style={[s.content, stacked && s.column]}><View style={s.mainColumn}>{tab === "plan" || tab === "details" ? <ExercisePanel exercises={exercises} detailed={tab === "details"} onOpen={(exerciseIndex) => navigation.navigate("MemberExerciseDetail", { workoutPlanUuid: workout.workout_plan_uuid, exerciseIndex })} /> : tab === "notes" ? <Panel title="Trainer Notes"><Text style={s.body}>{workout.trainer_notes ?? "Your trainer has not added notes for this workout yet."}</Text></Panel> : <Panel title="Workout History"><Text style={s.body}>Completed workouts: {workout.completed_workouts}</Text><Text style={s.body}>Missed workouts: {workout.missed_workouts}</Text><Text style={s.body}>Weekly consistency: {Math.round(workout.weekly_consistency)}%</Text></Panel>}</View><View style={s.sideColumn}><View style={s.sideTop}><Panel title="Muscle Focus" style={s.musclePanel}><Image source={muscleImages[muscleKey]} style={s.muscle} resizeMode="contain" /><Text style={s.focusLabel}>{focus}</Text></Panel><Panel title="Workout Summary" style={s.summaryPanel}><Summary icon="body-outline" label="Total Exercises" value={`${exercises.length}`} tone="#0EA5E9" /><Summary icon="grid-outline" label="Total Sets" value={`${totalSets}`} tone="#0A84FF" /><Summary icon="pulse-outline" label="Total Reps" value={`${totalRepsLow}-${totalRepsLow + totalSets}`} tone="#10B981" /><Summary icon="time-outline" label="Est. Duration" value={`${duration}-${duration + 15} min`} tone="#F59E0B" /><Summary icon="flame-outline" label="Calories Burn" value={`${duration * 6}-${duration * 8} kcal`} tone="#EF4444" /></Panel></View><Tips /><Panel title="Progress Overview"><ProgressChart consistency={Math.round(workout.weekly_consistency)} /></Panel></View></View>
  </Screen>);
    }
  }
}

export function ActionView({ model }: { model: ReturnType<typeof useActionPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, s, icon, label } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={s.action}><Ionicons name={icon} size={18} color="#fff" /><Text style={s.buttonText}>{label}</Text></Pressable>);
    }
  }
}

export function InfoView({ model }: { model: ReturnType<typeof useInfoPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, icon, label, detail } = model.props;
      return (<View style={s.info}><View style={[s.infoIcon, { backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={18} color={tone} /></View><View><Text style={s.caption}>{label}</Text><Text numberOfLines={1} style={s.infoValue}>{detail}</Text></View></View>);
    }
  }
}

export function PanelView({ model }: { model: ReturnType<typeof usePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, style, title, children } = model.props;
      return (<View style={[s.panel, style]}><Text style={s.panelTitle}>{title}</Text>{children}</View>);
    }
  }
}

export function SummaryView({ model }: { model: ReturnType<typeof useSummaryPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, tone, icon, label, detail } = model.props;
      return (<View style={s.summaryRow}><View style={[s.summaryIcon, { borderColor: tone }]}><Ionicons name={icon} size={15} color={tone} /></View><Text style={s.summaryLabel}>{label}</Text><Text style={s.summaryValue}>{detail}</Text></View>);
    }
  }
}

export function ExercisePanelView({ model }: { model: ReturnType<typeof useExercisePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Panel, detailed, s, exercises, onOpen, fallbackHero } = model.props;
      return (<Panel title={detailed ? "Exercise Details" : "Workout Plan"}><View style={s.exerciseCount}><Text style={s.caption}>{exercises.length} Exercises</Text></View><View style={s.exerciseList}>{exercises.map((item, index) => <Pressable accessibilityRole="button" onPress={() => onOpen(index)} key={`${item.name}-${index}`} style={s.exercise}><View style={s.number}><Text style={s.numberText}>{index + 1}</Text></View><Image source={item.image ?? fallbackHero} style={s.exerciseImage} resizeMode="cover" /><View style={s.exerciseCopy}><Text style={s.exerciseName}>{item.name}</Text><Text style={s.exerciseMeta}>{item.sets} Sets  •  {item.reps} Reps{detailed ? `  •  ${item.group}  •  ${item.equipment}` : ""}</Text></View><View><Text style={s.caption}>Rest</Text><Text style={s.rest}>{item.rest}</Text></View><Ionicons name="chevron-forward" size={18} color="#94A3B8" /></Pressable>)}</View><Pressable accessibilityRole="button" onPress={() => showAlert("Add exercise", "Ask your trainer to add an exercise to this assigned plan.")} style={s.addExercise}><Ionicons name="add" size={20} color="#0A84FF" /><Text style={s.addText}>Add Exercise</Text></Pressable></Panel>);
    }
  }
}

export function TipsView({ model }: { model: ReturnType<typeof useTipsPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Panel, s, Tip } = model.props;
      return (<Panel title="♙ Training Tips"><View style={s.tipGrid}><Tip icon="stats-chart" text="Control the movement and focus on full range of motion." tone="#0A84FF" /><Tip icon="shield-checkmark" text="Keep your form stable during every repetition." tone="#10B981" /><Tip icon="locate" text="Squeeze the target muscle at the bottom of each rep." tone="#F59E0B" /><Tip icon="water" text="Stay hydrated and take proper rest between sets." tone="#3B82F6" /></View></Panel>);
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

export function ProgressChartView({ model }: { model: ReturnType<typeof useProgressChartPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, points, consistency } = model.props;
      return (<View style={s.chart}><Svg width="100%" height="160" viewBox="0 0 500 160"><Line x1="28" y1="130" x2="470" y2="130" stroke="#243047" /><Line x1="28" y1="80" x2="470" y2="80" stroke="#18243A" /><Line x1="28" y1="30" x2="470" y2="30" stroke="#18243A" /><Polyline points={points} fill="none" stroke="#0066CC" strokeWidth="3" />{points.split(" ").map((point, index) => { const [cx, cy] = point.split(","); return <Circle key={index} cx={cx} cy={cy} r="4" fill="#0A84FF" />; })}{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => <SvgText key={day} x={42 + index * 66} y="153" fill="#94A3B8" fontSize="11">{day}</SvgText>)}</Svg><View style={s.chartBadge}><Text style={s.chartBadgeText}>{consistency}%</Text></View></View>);
    }
  }
}
