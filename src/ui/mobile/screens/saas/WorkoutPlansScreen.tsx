import { ScreenHeader } from "../../components/ScreenHeader";
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
    <ScreenHeader title="Workout Plans" subtitle="Build and manage member programs" />
    <PrimaryButton title="Create New Plan" icon="add" onPress={() => setCreateRequest(value => value + 1)} />
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
