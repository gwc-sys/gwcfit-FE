import { Pressable, Text, View } from "react-native";
import { Bot, Check, Clock, Dumbbell, Sparkles, Target } from "../components/icons";
import { AppScreen } from "../components/AppScreen";
import { Header } from "../components/Header";
import { PrimaryButton } from "../components/PrimaryButton";
import { SegmentedControl } from "../components/SegmentedControl";
import { palette } from "../theme/theme";
import type * as React from "react";
import type { useAIWorkoutGeneratorScreenPresentation } from "../../../screens/AIWorkoutGeneratorScreen";

export function AIWorkoutGeneratorScreenView({ model }: { model: ReturnType<typeof useAIWorkoutGeneratorScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, goals, setGoal, goal, levels, level, setLevel, genders, gender, setGender, setDays, days, setMinutes, minutes, equipmentOptions, equipment, toggleEquipment, isGenerating, handleGenerate } = model.props;
      return ((
    <AppScreen>
      <Header title="AI Workout" right={<Bot size={30} color={palette.green} />} />
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Sparkles size={30} color={palette.white} />
        </View>
        <Text style={styles.heroTitle}>Personalized plan generator</Text>
        <Text style={styles.heroBody}>
          Build a goal-based plan with matching male or female exercise demonstrations.
        </Text>
      </View>

      <Text style={styles.label}>Goal</Text>
      <View style={styles.chipGrid}>
        {goals.map((item) => (
          <Pressable accessibilityRole="button"
            key={item}
            onPress={() => setGoal(item)}
            style={[styles.choice, goal === item && styles.choiceActive]}
          >
            <Target size={18} color={goal === item ? palette.green : palette.muted} />
            <Text style={[styles.choiceText, goal === item && styles.choiceTextActive]}>{item}</Text>
            {goal === item ? <Check size={18} color={palette.green} /> : null}
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Experience</Text>
      <SegmentedControl options={levels} value={level} onChange={setLevel} />

      <Text style={styles.label}>Exercise demonstration</Text>
      <SegmentedControl options={genders} value={gender} onChange={setGender} />

      <Text style={styles.label}>Weekly schedule</Text>
      <View style={styles.dualRow}>
        {[3, 4, 5].map((item) => (
          <Pressable accessibilityRole="button"
            key={item}
            onPress={() => setDays(item)}
            style={[styles.numberCard, days === item && styles.numberCardActive]}
          >
            <Text style={[styles.number, days === item && styles.numberActive]}>{item}</Text>
            <Text style={styles.numberLabel}>days</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Session length</Text>
      <View style={styles.dualRow}>
        {[30, 45, 60].map((item) => (
          <Pressable accessibilityRole="button"
            key={item}
            onPress={() => setMinutes(item)}
            style={[styles.numberCard, minutes === item && styles.numberCardActive]}
          >
            <Clock size={20} color={minutes === item ? palette.green : palette.muted} />
            <Text style={[styles.number, minutes === item && styles.numberActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Equipment</Text>
      <View style={styles.chipGrid}>
        {equipmentOptions.map((item) => {
          const selected = equipment.includes(item);
          return (
            <Pressable accessibilityRole="button"
              key={item}
              onPress={() => toggleEquipment(item)}
              style={[styles.equipment, selected && styles.choiceActive]}
            >
              <Dumbbell size={18} color={selected ? palette.green : palette.muted} />
              <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton label="Generate AI Plan" loading={isGenerating} onPress={handleGenerate} style={styles.cta} />
    </AppScreen>
  ));
    }
  }
}
