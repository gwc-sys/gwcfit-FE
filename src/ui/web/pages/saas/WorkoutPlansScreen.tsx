import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { workoutPlanConfig } from "../../../../features/operations/resourceConfigs";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { workoutPlansApi } from "../../../../services/api/operations";
import {
  ActivitySvg,
  DumbbellSvg,
  FlameSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/pages/saas/WorkoutPlansScreen.styles";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import type * as React from "react";
import type {
  useStatPresentation,
  useWorkoutPlansScreenPresentation,
} from "../../../../screens/saas/WorkoutPlansScreen";

export function WorkoutPlansScreenView({
  model,
}: {
  model: ReturnType<typeof useWorkoutPlansScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const { setCreateRequest, createRequest } = model.props;
      const { colors } = useAppTheme();
      const styles = createStyles(colors);

      const plansQuery = useQuery({
        queryKey: ["operations", "workout-plans"],
        queryFn: () => workoutPlansApi.list({ limit: 50 }),
      });

      const totalPlans = plansQuery.data?.length ?? 0;
      const totalActivePlans =
        plansQuery.data?.filter((p) => p.is_active).length ?? 0;
      const assignedMembers =
        plansQuery.data
          ? new Set(plansQuery.data.map((p) => p.member_id).filter(Boolean)).size
          : 0;

      return (
        <Screen scroll contentContainerStyle={styles.screen}>
          {/* Top Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Workout Plans</Text>
              <Text style={styles.subtitle}>
                Member programming and assigned fitness sessions
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create New Plan"
              style={styles.createButton}
              onPress={() => setCreateRequest((value) => value + 1)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create New Plan</Text>
            </Pressable>
          </View>

          {/* 3 KPI Cards */}
          <View style={styles.stats}>
            {/* Card 1: Total Active Plans */}
            <View style={styles.stat}>
              <View style={styles.statTop}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: "rgba(233, 30, 99, 0.12)" },
                  ]}
                >
                  <DumbbellSvg size={18} color="#E91E63" />
                </View>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: "rgba(52, 199, 89, 0.12)",
                      borderColor: "rgba(52, 199, 89, 0.25)",
                    },
                  ]}
                >
                  <Text style={[styles.statPillText, { color: "#34C759" }]}>
                    Active
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.statLabel}>Total Active Plans</Text>
                <Text style={styles.statValue}>{totalActivePlans}</Text>
              </View>
            </View>

            {/* Card 2: Assigned Members */}
            <View style={styles.stat}>
              <View style={styles.statTop}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: "rgba(52, 199, 89, 0.12)" },
                  ]}
                >
                  <ActivitySvg size={18} color="#34C759" />
                </View>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: "rgba(52, 199, 89, 0.12)",
                      borderColor: "rgba(52, 199, 89, 0.25)",
                    },
                  ]}
                >
                  <Text style={[styles.statPillText, { color: "#34C759" }]}>
                    Live
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.statLabel}>Assigned Members</Text>
                <Text style={styles.statValue}>{assignedMembers}</Text>
              </View>
            </View>

            {/* Card 3: Completion Ratio */}
            <View style={styles.stat}>
              <View style={styles.statTop}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: "rgba(233, 30, 99, 0.12)" },
                  ]}
                >
                  <FlameSvg size={18} color="#E91E63" />
                </View>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: "rgba(233, 30, 99, 0.12)",
                      borderColor: "rgba(233, 30, 99, 0.25)",
                    },
                  ]}
                >
                  <Text style={[styles.statPillText, { color: "#E91E63" }]}>
                    All Plans
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.statLabel}>Total Plans</Text>
                <Text style={styles.statValue}>{totalPlans}</Text>
              </View>
            </View>
          </View>

          {/* Assigned Workout Routines */}
          <ResourceCrudPanel
            config={workoutPlanConfig}
            createRequest={createRequest}
          />
        </Screen>
      );
    }
  }
}

export function StatView({
  model,
}: {
  model: ReturnType<typeof useStatPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { tone, icon, label, value, detail } = model.props;
      const { colors } = useAppTheme();
      const styles = createStyles(colors);

      return (
        <View style={styles.stat}>
          <View style={styles.statTop}>
            <View style={[styles.statIcon, { backgroundColor: `${tone}18` }]}>
              <Ionicons name={icon} size={20} color={tone} />
            </View>
            <View
              style={[
                styles.statPill,
                {
                  backgroundColor: `${tone}18`,
                  borderColor: `${tone}33`,
                },
              ]}
            >
              <Text style={[styles.statPillText, { color: tone }]}>{detail}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        </View>
      );
    }
  }
}
