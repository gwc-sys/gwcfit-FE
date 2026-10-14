import { ImageBackground, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Clock, Flame, MoreVertical, Pause, Play, RotateCcw } from "../components/icons";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { palette } from "../theme/theme";
import type * as React from "react";
import type { useExerciseDetailScreenPresentation } from "../../../screens/ExerciseDetailScreen";

export function ExerciseDetailScreenView({ model }: { model: ReturnType<typeof useExerciseDetailScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, exercise, formatTime, seconds, setSeconds, setRunning, running } = model.props;
      return ((
    <View style={styles.root}>
      <ImageBackground source={exercise.image} style={styles.hero} resizeMode="cover">
        <LinearGradient colors={["rgba(5,7,10,0.15)", "rgba(5,7,10,0.82)"]} style={styles.heroOverlay}>
          <Header transparent right={<MoreVertical color={palette.white} size={30} />} />
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>{exercise.focus}</Text>
            <Text style={styles.title}>{exercise.title}</Text>
            <View style={styles.metaRow}>
              <Clock color={palette.white} size={18} />
              <Text style={styles.meta}>{exercise.duration}</Text>
              <Flame color={palette.white} size={18} />
              <Text style={styles.meta}>{exercise.calories} kcal</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Workout Timer</Text>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>
          <View style={styles.controls}>
            <Pressable accessibilityRole="button" style={styles.iconButton} onPress={() => setSeconds(45 * 60)} accessibilityLabel={"Reset workout timer"}>
              <RotateCcw color={palette.text} size={24} />
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.playButton} onPress={() => setRunning((value) => !value)} accessibilityLabel={running ? "Pause workout timer" : "Start workout timer"}>
              {running ? (
                <Pause color={palette.white} size={30} fill={palette.white} />
              ) : (
                <Play color={palette.white} size={30} fill={palette.white} />
              )}
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>How to perform</Text>
        <Text style={styles.description}>{exercise.description}</Text>
        <View style={styles.steps}>
          {exercise.steps.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepIcon}>
                <Check color={palette.white} size={16} strokeWidth={3} />
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Step {index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            </View>
          ))}
        </View>
        <PrimaryButton label={running ? "Pause Workout" : "Start Workout"} onPress={() => setRunning((value) => !value)} />
      </View>
    </View>
  ));
    }
  }
}
