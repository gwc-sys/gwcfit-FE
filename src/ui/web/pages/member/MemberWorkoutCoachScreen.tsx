import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useMemberWorkoutSessionScreenPresentation, useSkeletonPresentation, useAnglePresentation, useOverlayPresentation, usePhasesPresentation, useMetricPresentation, useQueuePresentation, useCheckPresentation, useTipPresentation } from "../../../../screens/member/MemberWorkoutCoachScreen";

export function MemberWorkoutSessionScreenView({ model }: { model: ReturnType<typeof useMemberWorkoutSessionScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><ActivityIndicator size="large" color="#0A84FF" /><Text style={s.muted}>Preparing AI coach...</Text></Screen>);
    }
    case "view2": {
      const { s, query } = model.props;
      return (<Screen dark contentContainerStyle={s.center}><Ionicons name="alert-circle-outline" size={40} color="#EF4444" /><Text style={s.title}>Workout unavailable</Text><Text style={s.muted}>{query.error ? getApiErrorMessage(query.error) : "No exercises available."}</Text></Screen>);
    }
    case "view3": {
      const { s, navigation, workout, setNumber, exercise, index, exercises, time, elapsed, setPaused, paused, stacked, detector, cameraOpen, facing, Skeleton, pose, reps, target, analysis, quality, rom, Angle, back, hip, score, openCamera, setFacing, setTracking, tracking, setAnalysis, engine, Overlay, rest, nextIndex, setRest, Phases, complete, completeSet, Metric, fatigue, doneSets, totalSets, Queue, sets, goTo, Check, Tip } = model.props;
      return (<Screen dark scroll maxWidth="none" contentContainerStyle={s.screen}>
    <View style={s.topbar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back to workout plan" onPress={() => navigation.goBack()} style={s.topButton}><Ionicons name="arrow-back" size={20} color="#fff" /><Text style={s.buttonText}>Back</Text></Pressable>
      <View style={s.heading}><Text style={s.eyebrow}>ACTIVE WORKOUT</Text><Text style={s.title}>{workout.workout_plan_name}</Text><Text style={s.muted}>Set {setNumber} of {exercise.sets}  •  Exercise {index + 1} of {exercises.length}</Text></View>
      <View style={s.timer}><Ionicons name="stopwatch-outline" size={20} color="#0A84FF" /><Text style={s.timerText}>{time(elapsed)}</Text></View>
      <Pressable accessibilityRole="button" onPress={() => setPaused((v) => !v)} style={s.topButton}><Ionicons name={paused ? "play" : "pause"} size={20} color="#fff" /><Text style={s.buttonText}>{paused ? "Resume" : "Pause"}</Text></Pressable>
    </View>

    <View style={[s.layout, stacked && s.stacked]}>
      <View style={s.main}>
        <View style={s.analysisCard}>
          <View style={s.cardHead}><Text style={s.analysisTitle}>CAMERA BASED FORM ANALYSIS</Text><View style={s.live}><Text style={s.liveText}>{detector}</Text></View></View>
          <View style={s.stage}>
            {cameraOpen ? <View nativeID="ai-coach-camera" style={s.camera}><CameraView style={StyleSheet.absoluteFill} facing={facing} mirror={facing === "front"} /></View> : <Image source={exercise.image ?? require("../../../../../assets/images/workout-floor.jpg")} style={s.camera} resizeMode="cover" />}
            <View style={s.shade} /><Skeleton landmarks={cameraOpen ? pose.landmarks : undefined} mirrored={facing === "front"} />
            <View style={s.reps}><Text style={s.smallLabel}>REPS</Text><Text style={s.bigValue}>{reps} <Text style={s.target}>/ {target}</Text></Text><Text style={s.good}>{analysis.framesProcessed ? quality : "Get Ready"}</Text></View>
            <View style={s.rom}><Text style={s.smallLabel}>ROM</Text><Text style={s.bigValue}>{rom}%</Text><Text style={s.good}>{rom >= 80 ? "Good Range" : "Build Range"}</Text></View>
            <View style={s.angleList}><Angle label="Back Angle" value={back ? `${back}°` : "--"} good={back > 0 && back <= 30} /><Angle label="Hip Angle" value={hip ? `${hip}°` : "--"} good={hip >= 150} /><Angle label="Body Position" value={analysis.fullBodyVisible ? "Full Body" : analysis.framesProcessed ? "Partial" : "Waiting"} good={analysis.fullBodyVisible} /></View>
            <View style={s.feedback}><Ionicons name={score >= 70 ? "checkmark" : "bulb-outline"} size={19} color={score >= 70 ? "#22C55E" : "#F59E0B"} /><View><Text style={s.feedbackTitle}>{score >= 70 ? "Great job!" : "Coach Feedback"}</Text><Text numberOfLines={2} style={s.feedbackText}>{pose.error ?? analysis.feedback[0] ?? "Position your full body in the frame."}</Text></View></View>
            {!cameraOpen ? <Pressable accessibilityRole="button" onPress={() => void openCamera()} style={s.startCamera}><Ionicons name="camera" size={21} color="#fff" /><Text style={s.buttonText}>Start Camera Analysis</Text></Pressable> : <View style={s.controls}><Pressable accessibilityRole="button" onPress={() => setFacing((v) => v === "front" ? "back" : "front")} style={s.round}><Ionicons name="camera-reverse-outline" size={22} color="#fff" /></Pressable><Pressable accessibilityRole="button" onPress={() => setTracking((v) => !v)} style={s.record}><Ionicons name={tracking ? "stop" : "play"} size={20} color="#fff" /></Pressable><Pressable accessibilityRole="button" onPress={() => setAnalysis(engine.current.confirmManualRep())} style={s.round}><Ionicons name="flash" size={21} color="#fff" /></Pressable></View>}
            {cameraOpen ? <Pressable accessibilityRole="button" onPress={() => setFacing((v) => v === "front" ? "back" : "front")} style={s.switch}><Ionicons name="camera-reverse-outline" size={18} color="#fff" /><Text style={s.buttonText}>Switch Camera</Text></Pressable> : null}
            {paused ? <Overlay icon="pause-circle" title="Workout Paused" /> : null}
            {rest > 0 ? <View style={s.overlay}><Text style={s.restLabel}>REST TIME</Text><Text style={s.restTime}>{time(rest)}</Text><Text style={s.muted}>{nextIndex !== null ? `Next: ${exercises[nextIndex]?.name}` : `Prepare for set ${setNumber}`}</Text><Pressable accessibilityRole="button" onPress={() => setRest(0)} style={s.complete}><Text style={s.buttonText}>Skip Rest</Text></Pressable></View> : null}
          </View>
          <Phases phase={analysis.phase} />
          <View style={s.setRow}><View><Text style={s.exerciseName}>{exercise.name}</Text><Text style={s.exerciseMeta}>{exercise.group} • {exercise.equipment}</Text></View><Pressable accessibilityRole="button" disabled={paused || rest > 0 || complete.isPending} onPress={completeSet} style={[s.complete, (paused || rest > 0) && s.disabled]}>{complete.isPending ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle" size={19} color="#fff" />}<Text style={s.buttonText}>Complete Set</Text></Pressable></View>
        </View>
        <View style={s.metrics}><Metric label="Form Score" value={analysis.framesProcessed ? `${score}%` : "--"} sub={quality} ring /><Metric label="Tempo" value={analysis.tempoSeconds ? `${analysis.tempoSeconds}s` : "--"} sub={analysis.tempoSeconds ? "Controlled" : "Waiting"} /><Metric label="Stability" value={analysis.framesProcessed ? `${Math.round(analysis.stability)}%` : "--"} sub={analysis.stability >= 85 ? "Excellent" : "Keep Steady"} /><Metric label="Balance" value={analysis.framesProcessed ? `${Math.round(analysis.balance)}%` : "--"} sub={analysis.balance >= 85 ? "Excellent" : "Re-center"} /><Metric label="Fatigue" value={fatigue} sub={`${doneSets}/${totalSets} sets`} warning={fatigue !== "Low"} /></View>
      </View>

      <View style={[s.rail, stacked && s.railStack]}>
        <View style={s.sideCard}><View style={s.sideHead}><Text style={s.sideTitle}>Workout Queue</Text><Text style={s.queueProgress}>{index}/{exercises.length} Exercises</Text></View><View style={s.queue}>{exercises.slice(0, 7).map((item, i) => <Queue key={`${item.name}-${i}`} item={item} index={i} active={i === index} completed={sets[i] ?? 0} onPress={() => goTo(i)} />)}</View>{exercises.length > 7 ? <View style={s.viewAll}><Text style={s.listText}>View All Exercises ({exercises.length})</Text><Ionicons name="chevron-down" size={16} color="#CBD5E1" /></View> : null}</View>
        <View style={s.sideCard}><Text style={s.sideTitle}>Form Checklist</Text><Check text={`Keep the ${exercise.group.toLowerCase()} engaged.`} /><Check text="Move slowly through the full range." /><Check text="Breathe out during the working phase." /><Check text="Stop if you feel sharp pain." warning /></View>
        <View style={s.sideCard}><Text style={s.sideTitle}>Quick Tips</Text><Tip text="Focus on mind-muscle connection." /><Tip text="Control the negative (lowering) phase." /><Tip text="Quality over quantity." /></View>
      </View>
    </View>
    {complete.error ? <Text style={s.error}>{getApiErrorMessage(complete.error)}</Text> : null}
  </Screen>);
    }
  }
}

export function SkeletonView({ model }: { model: ReturnType<typeof useSkeletonPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, CONNECTIONS, landmarks, x, y } = model.props;
      return (<View style={s.skeleton}><Svg width="100%" height="100%" viewBox="0 0 640 410">{CONNECTIONS.map(([a,b]) => landmarks[a] && landmarks[b] && landmarks[a].confidence > .42 && landmarks[b].confidence > .42 ? <Line key={`${a}-${b}`} x1={x(landmarks[a])} y1={y(landmarks[a])} x2={x(landmarks[b])} y2={y(landmarks[b])} stroke="#22C55E" strokeWidth="4" /> : null)}{landmarks.map((p,i) => p.confidence > .42 ? <Circle key={p.name} cx={x(p)} cy={y(p)} r={i < 11 ? 3 : 6} fill="#86EFAC" stroke="#16A34A" strokeWidth="3" /> : null)}</Svg></View>);
    }
  }
}

export function AngleView({ model }: { model: ReturnType<typeof useAnglePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, label, value, good } = model.props;
      return (<View style={s.angle}><Text style={s.angleLabel}>{label}</Text><View style={s.angleLine}><Text style={s.angleValue}>{value}</Text><Ionicons name={good ? "checkmark-circle" : "alert-circle"} size={16} color={good ? "#22C55E" : "#F59E0B"} /></View><Text style={[s.angleStatus, !good && s.warning]}>{good ? "Good" : "Adjust"}</Text></View>);
    }
  }
}

export function OverlayView({ model }: { model: ReturnType<typeof useOverlayPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, icon, title } = model.props;
      return (<View style={s.overlay}><Ionicons name={icon} size={62} color="#0A84FF" /><Text style={s.overlayTitle}>{title}</Text></View>);
    }
  }
}

export function PhasesView({ model }: { model: ReturnType<typeof usePhasesPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, items, phase } = model.props;
      return (<View style={s.phases}>{items.map((label,i) => { const active = phase === "waiting" ? i === 0 : phase === "lowered" ? i <= 1 : i >= 2; return <View key={label} style={s.phase}><View style={[s.phaseNumber, active && s.phaseActive]}><Text style={s.phaseNumberText}>{i+1}</Text></View><View><Text style={s.phaseLabel}>{label}</Text><Text style={[s.phaseStatus, active && s.good]}>{active ? i === 2 ? "Great" : "Good" : "Waiting"}</Text></View>{i < 3 ? <Ionicons name="chevron-forward" size={20} color="#475569" style={s.arrow} /> : null}</View>; })}</View>);
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, label, ring, warning, value, sub } = model.props;
      return (<View style={s.metric}><Text style={s.metricLabel}>{label}</Text><View style={ring ? s.ring : undefined}><Text style={[s.metricValue, warning && s.warningValue]}>{value}</Text></View><Text style={[s.metricSub, warning && s.warning]}>{sub}</Text></View>);
    }
  }
}

export function QueueView({ model }: { model: ReturnType<typeof useQueuePresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, s, active, index, item, completed } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={[s.queueItem, active && s.queueActive]}><View style={s.queueNumber}><Text style={s.queueNumberText}>{index+1}</Text></View>{item.image ? <Image source={item.image} style={s.queueImage} resizeMode="contain" /> : null}<View style={s.queueCopy}><Text numberOfLines={1} style={s.queueName}>{item.name}</Text><Text style={s.queueMeta}>{completed}/{item.sets} sets</Text></View>{active ? <View style={s.play}><Ionicons name="play" size={14} color="#fff" /></View> : null}</Pressable>);
    }
  }
}

export function CheckView({ model }: { model: ReturnType<typeof useCheckPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, warning, text } = model.props;
      return (<View style={s.listRow}><Ionicons name={warning ? "alert-circle" : "checkmark-circle"} size={18} color={warning ? "#FBBF24" : "#22C55E"} /><Text style={[s.listText, warning && s.warning]}>{text}</Text></View>);
    }
  }
}

export function TipView({ model }: { model: ReturnType<typeof useTipPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, text } = model.props;
      return (<View style={s.listRow}><Ionicons name="checkmark-circle-outline" size={17} color="#0A84FF" /><Text style={s.listText}>{text}</Text></View>);
    }
  }
}
