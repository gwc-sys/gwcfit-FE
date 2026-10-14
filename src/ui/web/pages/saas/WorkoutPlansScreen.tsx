import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { workoutPlanConfig } from "../../../../features/operations/resourceConfigs";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useWorkoutPlansScreenPresentation, useStatPresentation } from "../../../../screens/saas/WorkoutPlansScreen";

export function WorkoutPlansScreenView({ model }: { model: ReturnType<typeof useWorkoutPlansScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, setCreateRequest, Stat, createRequest } = model.props;
      return (<Screen scroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><View><Text style={styles.title}>Workout Plans</Text><Text style={styles.subtitle}>Member programming and sessions</Text></View><PrimaryButton title="Create New Plan" icon="add" onPress={() => setCreateRequest((value) => value + 1)} style={styles.createButton} /></View>
    <View style={styles.stats}><Stat icon="barbell-outline" label="Total Plans" value="0" detail="No plans created yet" tone="#0A84FF" styles={styles} /><Stat icon="clipboard-outline" label="Active Plans" value="0" detail="Currently running" tone="#22C55E" styles={styles} /><Stat icon="calendar-outline" label="Programs" value="0" detail="Total programs" tone="#3B82F6" styles={styles} /><Stat icon="people-outline" label="Members Assigned" value="0" detail="Across all plans" tone="#F59E0B" styles={styles} /></View>
    <View style={styles.manageHeader}><View><Text style={styles.kicker}>Manage workouts</Text><Text style={styles.manageTitle}>Workout Plans</Text></View></View>
    <ResourceCrudPanel config={workoutPlanConfig} createRequest={createRequest} />
  </Screen>);
    }
  }
}

export function StatView({ model }: { model: ReturnType<typeof useStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value, detail } = model.props;
      return (<View style={styles.stat}><View style={[styles.statIcon, { borderColor: `${tone}66`, backgroundColor: `${tone}18` }]}><Ionicons name={icon} size={24} color={tone} /></View><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={[styles.statDetail, { color: tone }]}>{detail}</Text></View></View>);
    }
  }
}
