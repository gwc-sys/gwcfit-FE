import React, { useState, useMemo } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { Pressable } from "../../components/NativePressable";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";
import { createStyles } from "../../styles/screens/saas/WorkoutPlansScreen.styles";
import type {
  useWorkoutPlansScreenPresentation,
  useStatPresentation,
} from "../../../../screens/saas/WorkoutPlansScreen";
import type { WorkoutPlan } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";

export function WorkoutPlansScreenView({
  model,
}: {
  model: ReturnType<typeof useWorkoutPlansScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  if (model.kind === "view1") return <AccessDeniedScreen />;

  const p = model.props;
  const c = p.colors;
  const styles = useMemo(() => createStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { isSmallPhone, isLargeFont, width } = useResponsiveLayout();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [formLevel, setFormLevel] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  const isRefreshing = p.plansQuery?.isFetching ?? false;

  // Real data from query
  const plans = useMemo(() => {
    return p.plansQuery?.data ?? [];
  }, [p.plansQuery?.data]);

  const activePlansCount = useMemo(() => {
    return plans.filter((item) => item.is_active).length;
  }, [plans]);

  const assignedMembersCount = useMemo(() => {
    const set = new Set(plans.map((item) => item.member_id).filter(Boolean));
    return set.size;
  }, [plans]);

  const filteredPlans = useMemo(() => {
    if (!search.trim()) return plans;
    const q = search.trim().toLowerCase();
    return plans.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(q) ||
        (item.goal || "").toLowerCase().includes(q) ||
        (item.level || "").toLowerCase().includes(q) ||
        (item.member_name || "").toLowerCase().includes(q) ||
        (item.trainer_name || "").toLowerCase().includes(q) ||
        (item.gym_name || "").toLowerCase().includes(q),
    );
  }, [plans, search]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormTitle("");
    setFormGoal("Back Workout");
    setFormLevel("first level");
    setSelectedMemberId(p.membersQuery?.data?.[0]?.id || "");
    setSelectedTrainerId(p.trainersQuery?.data?.[0]?.id || "");
    setModalVisible(true);
  };

  const openEditModal = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setFormTitle(plan.title);
    setFormGoal(plan.goal);
    setFormLevel(plan.level);
    setSelectedMemberId(plan.member_id || "");
    setSelectedTrainerId(plan.trainer_id || "");
    setModalVisible(true);
  };

  const handleSavePlan = () => {
    if (!formTitle.trim()) {
      Alert.alert("Validation", "Please provide a plan title.");
      return;
    }

    if (editingPlan) {
      if (p.updatePlanMutation) {
        p.updatePlanMutation.mutate(
          {
            id: editingPlan.id,
            payload: {
              title: formTitle.trim(),
              goal: formGoal.trim(),
              level: formLevel.trim(),
              trainer_id: selectedTrainerId || undefined,
            },
          },
          {
            onSuccess: () => {
              setModalVisible(false);
              Alert.alert("Success", "Workout plan updated successfully.");
            },
          },
        );
      }
    } else {
      if (p.createPlanMutation) {
        p.createPlanMutation.mutate(
          {
            title: formTitle.trim(),
            goal: formGoal.trim() || formTitle.trim(),
            level: formLevel.trim() || "first level",
            member_id: selectedMemberId || p.membersQuery?.data?.[0]?.id || "m-1",
            trainer_id: selectedTrainerId || p.trainersQuery?.data?.[0]?.id || undefined,
            sessions: [],
          },
          {
            onSuccess: () => {
              setModalVisible(false);
              Alert.alert("Success", "Workout plan created successfully.");
            },
          },
        );
      }
    }
  };

  const handleDeletePlan = (plan: WorkoutPlan) => {
    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete "${plan.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (p.deletePlanMutation) {
              p.deletePlanMutation.mutate(plan.id, {
                onSuccess: () => {
                  Alert.alert("Success", "Workout plan deleted.");
                },
              });
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#000000" }}
      contentContainerStyle={styles.screen}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            void p.plansQuery?.refetch();
            void p.membersQuery?.refetch();
            void p.trainersQuery?.refetch();
          }}
          tintColor="#E91E63"
        />
      }
    >
      {/* 1. Header Row */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 6, 12) }, isSmallPhone && { flexWrap: "wrap", gap: 10 }]}>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={[styles.title, isSmallPhone && { fontSize: 26 }]}>
            Workout Plans
          </Text>
          <Text style={styles.subtitle}>
            Member programming and assigned fitness sessions
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create New Plan"
          style={[styles.createButton, isSmallPhone && { alignSelf: "flex-start", height: 36, paddingHorizontal: 12 }]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create New Plan</Text>
        </Pressable>
      </View>

      {/* Error notices if any */}
      {p.plansQuery?.error ? (
        <NoticeBanner message={getApiErrorMessage(p.plansQuery.error)} tone="error" />
      ) : null}

      {/* 2. 3 KPI Stat Cards Row */}
      <View style={[styles.statsRow, isSmallPhone && { gap: 6 }]}>
        {/* Card 1: Total Active Plans */}
        <View style={[styles.statCard, isSmallPhone && { padding: 8 }]}>
          <View style={styles.statTop}>
            <View style={[styles.statIconWrap, { backgroundColor: "#E91E63" }, isSmallPhone && { width: 26, height: 26, borderRadius: 13 }]}>
              <Ionicons name="barbell" size={isSmallPhone ? 13 : 16} color="#E91E63" />
            </View>
            <View
              style={[
                styles.statBadge,
                { backgroundColor: "#34C759", borderColor: "#34C759" },
                isSmallPhone && { paddingHorizontal: 4, paddingVertical: 1 },
              ]}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statBadgeText, { color: "#34C759" }, isSmallPhone && { fontSize: 9.5 }]}>
                Active
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statLabel}>Total Active Plans</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{activePlansCount}</Text>
        </View>

        {/* Card 2: Assigned Members */}
        <View style={[styles.statCard, isSmallPhone && { padding: 8 }]}>
          <View style={styles.statTop}>
            <View style={[styles.statIconWrap, { backgroundColor: "#34C759" }, isSmallPhone && { width: 26, height: 26, borderRadius: 13 }]}>
              <Ionicons name="pulse" size={isSmallPhone ? 13 : 16} color="#34C759" />
            </View>
            <View
              style={[
                styles.statBadge,
                { backgroundColor: "#34C759", borderColor: "#34C759" },
                isSmallPhone && { paddingHorizontal: 4, paddingVertical: 1 },
              ]}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statBadgeText, { color: "#34C759" }, isSmallPhone && { fontSize: 9.5 }]}>
                Live
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statLabel}>Assigned Members</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{assignedMembersCount}</Text>
        </View>

        {/* Card 3: Completion Ratio */}
        <View style={[styles.statCard, isSmallPhone && { padding: 8 }]}>
          <View style={styles.statTop}>
            <View style={[styles.statIconWrap, { backgroundColor: "#1C1C1E" }, isSmallPhone && { width: 26, height: 26, borderRadius: 13 }]}>
              <Ionicons name="flame" size={isSmallPhone ? 13 : 16} color="#E91E63" />
            </View>
            <View
              style={[
                styles.statBadge,
                { backgroundColor: "#1C1C1E", borderColor: "#1C1C1E" },
                isSmallPhone && { paddingHorizontal: 4, paddingVertical: 1 },
              ]}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statBadgeText, { color: "#E91E63" }, isSmallPhone && { fontSize: 9.5 }]}>
                Optimal
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statLabel}>Completion Ratio</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>100%</Text>
        </View>
      </View>

      {/* 3. Saved Plans Container Card */}
      <View style={styles.savedPlansContainer}>
        <Text style={styles.savedPlansKicker}>SAVED PLANS</Text>
        <Text style={styles.savedPlansTitle}>Assigned Workout Routines</Text>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#F2F2F7" />
          <TextInput
            placeholder="Search plans..."
            placeholderTextColor="#007AFF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#F2F2F7" />
            </Pressable>
          ) : null}
        </View>

        {/* Plans List */}
        {filteredPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workout plans found.</Text>
          </View>
        ) : (
          filteredPlans.map((item) => (
            <View key={item.id} style={[styles.planCard, isSmallPhone && { padding: 10 }]}>
              {/* Hot pink barbell icon */}
              <View style={[styles.planIconWrap, isSmallPhone && { width: 38, height: 38, borderRadius: 10, marginRight: 8 }]}>
                <Ionicons name="barbell" size={isSmallPhone ? 18 : 22} color="#FFFFFF" />
              </View>

              {/* Plan info */}
              <View style={styles.planInfo}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planTitle}>{item.title}</Text>
                  <View style={styles.planActiveBadge}>
                    <Text style={styles.planActiveBadgeText}>
                      {item.is_active ? "active" : "inactive"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.planDescription}>
                  {item.goal || item.title} - {item.level || "first level"}
                </Text>

                <View style={styles.planMetaRow}>
                  <Text style={styles.planMetaLabel}>Member: </Text>
                  <Text style={styles.planMetaValue}>
                    {item.member_name || "Unassigned"}
                  </Text>
                  <Text style={styles.planMetaDot}> • </Text>
                  <Text style={styles.planMetaLabel}>Trainer: </Text>
                  <Text style={styles.planMetaValue}>
                    {item.trainer_name || "Unassigned"}
                  </Text>
                  <Text style={styles.planMetaDot}> • </Text>
                  <Text style={styles.planMetaLabel}>Gym: </Text>
                  <Text style={styles.planMetaValue}>
                    {item.gym_name || "ZD Fitness"}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.planActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit plan"
                  style={styles.editButton}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil-outline" size={15} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete plan"
                  style={styles.deleteButton}
                  onPress={() => handleDeletePlan(item)}
                >
                  <Ionicons name="trash-outline" size={15} color="#E91E63" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 4. Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlan ? "Edit Workout Plan" : "Create New Workout Plan"}
              </Text>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Plan Title</Text>
              <TextInput
                placeholder="e.g. Back Workout"
                placeholderTextColor="#007AFF"
                value={formTitle}
                onChangeText={setFormTitle}
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Goal</Text>
              <TextInput
                placeholder="e.g. Back Workout"
                placeholderTextColor="#007AFF"
                value={formGoal}
                onChangeText={setFormGoal}
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Level</Text>
              <TextInput
                placeholder="e.g. first level"
                placeholderTextColor="#007AFF"
                value={formLevel}
                onChangeText={setFormLevel}
                style={styles.formInput}
              />
            </View>

            <Pressable style={styles.formSubmitBtn} onPress={handleSavePlan}>
              <Text style={styles.formSubmitBtnText}>
                {editingPlan ? "Update Plan" : "Save Workout Plan"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

export function StatView({
  model,
}: {
  model: ReturnType<typeof useStatPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  const { styles, tone, icon, label, value, detail } = model.props;
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <View style={[styles.statIconWrap, { backgroundColor: `${tone}20` }]}>
          <Ionicons name={icon} size={16} color={tone} />
        </View>
        <View
          style={[
            styles.statBadge,
            { backgroundColor: `${tone}18`, borderColor: `${tone}33` },
          ]}
        >
          <Text style={[styles.statBadgeText, { color: tone }]}>{detail}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}
