import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatCurrency } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { membershipPlansApi } from "../../../../services/api/operations";
import type {
  useMembershipPlanScreenPresentation,
  usePlanCardPresentation,
  usePlatformPlanCrudModalPresentation,
  usePlanActionModalPresentation,
  usePlanEditModalPresentation,
} from "../../../../screens/saas/MembershipPlanScreen";

const TIER_COLORS = ["#E91E63", "#E91E63", "#34C759", "#007AFF"] as const;
const TIER_ICONS = ["diamond-outline", "flash", "shield-checkmark", "rocket-outline"] as const;

const DURATION_OPTIONS = [
  { label: "1 Month", days: 30, tag: "1 Months" },
  { label: "3 Months", days: 90, tag: "3 Months" },
  { label: "6 Months", days: 180, tag: "6 Months" },
  { label: "12 Months", days: 365, tag: "12 Months" },
];

const SUGGESTED_PERKS = [
  "Gym Access (24/7)",
  "All Premium Equipment",
  "Unlimited Group Classes",
  "Locker Room Access",
  "Diet Plan (Basic)",
  "Diet Plan (Elite)",
  "Progress Tracking",
  "Personal Training Sessions",
];

export function MembershipPlanScreenView({
  model,
}: {
  model: ReturnType<typeof useMembershipPlanScreenPresentation>;
}): React.ReactNode {
  const [expandedTierId, setExpandedTierId] = useState<string | null>("standard-template");
  const [search, setSearch] = useState("");
  const [newModalVisible, setNewModalVisible] = useState(false);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const {
        isSuperAdmin,
        styles,
        query,
        colors,
        plans,
        setEditingPlan,
        setDetailsPlan,
        detailsPlan,
        editingPlan,
        queryClient,
        PlatformPlanCrudModal,
        platformPlanDraft,
        setPlatformPlanDraft,
      } = model.props;

      // Filtered saved plans list
      const filteredPlans = plans.filter((p) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
        );
      });

      const handleDeletePlan = (plan: any) => {
        showAlert(
          "Delete Plan",
          `Are you sure you want to remove "${plan.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                if (plan.id && !plan.id.endsWith("-template")) {
                  try {
                    await membershipPlansApi.remove(plan.id);
                    queryClient.invalidateQueries({
                      queryKey: ["operations", "membership-plans"],
                    });
                  } catch (e) {
                    Alert.alert("Error", getApiErrorMessage(e));
                  }
                } else {
                  Alert.alert("Notice", "Template plans cannot be deleted.");
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
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text accessibilityRole="header" style={styles.headerTitle}>
                Membership Plans
              </Text>
              <Text numberOfLines={1} style={styles.headerSubtitle}>
                Create and manage membership plans for your gym.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create New Plan"
              onPress={() => {
                if (isSuperAdmin) {
                  setPlatformPlanDraft("new");
                } else {
                  setNewModalVisible(true);
                }
              }}
              style={styles.createPlanBtn}
            >
              <Ionicons name="add" size={17} color="#FFFFFF" />
              <Text style={styles.createPlanBtnText}>Create New Plan</Text>
            </Pressable>
          </View>

          {/* 2. Top Card: MEMBERSHIP TIERS (4) */}
          <View style={styles.tiersCard}>
            <View style={styles.tiersHeader}>
              <Text style={styles.tiersHeaderLeft}>
                MEMBERSHIP TIERS ({plans.length})
              </Text>
              <Text style={styles.tiersHeaderRight}>TAP ROW FOR PERKS</Text>
            </View>

            {plans.map((plan, index) => {
              const isExpanded = expandedTierId === plan.id;
              const color = TIER_COLORS[index % TIER_COLORS.length];
              const iconName = TIER_ICONS[index % TIER_ICONS.length];

              // Duration tag
              const durationTag =
                plan.duration_days >= 360
                  ? "12 Months"
                  : plan.duration_days >= 170
                    ? "6 Months"
                    : plan.duration_days >= 80
                      ? "3 Months"
                      : "1 Months";

              return (
                <View key={plan.id} style={styles.tierRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${plan.name}, ${formatCurrency(plan.price_cents, plan.currency)}`}
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => setExpandedTierId(isExpanded ? null : plan.id)}
                    style={styles.tierRowTop}
                  >
                    {/* Left: Icon, Name, Badges, Subtitle */}
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                      <View style={[styles.tierIconWrap, { backgroundColor: color }]}>
                        <Ionicons name={iconName} size={20} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text numberOfLines={1} style={styles.tierTitle}>
                            {plan.name}
                          </Text>
                          {plan.is_popular ? (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularBadgeText}>POPULAR</Text>
                            </View>
                          ) : null}
                          <View style={styles.tierBadgeDuration}>
                            <Text style={styles.tierBadgeDurationText}>
                              {durationTag}
                            </Text>
                          </View>
                        </View>
                        <Text numberOfLines={1} style={styles.tierSubtitle}>
                          {plan.description || "Standard gym membership plan"}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Price, Days, Chevron */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.tierPrice}>
                          {formatCurrency(plan.price_cents, plan.currency)}
                        </Text>
                        <Text style={styles.tierDays}>
                          {plan.duration_days} days
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#F2F2F7"
                      />
                    </View>
                  </Pressable>

                  {/* Expanded Perks State (matching Image 2) */}
                  {isExpanded ? (
                    <View style={styles.perksExpandedWrap}>
                      <View style={styles.perksGrid}>
                        {plan.features.map((perk, perkIdx) => (
                          <View key={perkIdx} style={styles.perkItem}>
                            <Ionicons name="checkmark" size={15} color="#34C759" />
                            <Text numberOfLines={1} style={styles.perkItemText}>
                              {perk}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.expandedFooter}>
                        <Text style={styles.expandedGymText}>
                          {plan.gym_name || "ZD FITNESS"} • {plan.features.length} PERKS
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="View details"
                            onPress={() => setDetailsPlan(plan)}
                            style={styles.viewDetailsBtn}
                          >
                            <Text style={styles.viewDetailsBtnText}>View Details →</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Edit plan"
                            onPress={() => setEditingPlan(plan)}
                            style={styles.editPlanBtnSmall}
                          >
                            <Ionicons name="pencil-outline" size={13} color="#FFFFFF" />
                            <Text style={styles.editPlanBtnSmallText}>Edit Plan</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* 3. Card 2: Total Plans (Saved membership plans) */}
          <View style={styles.savedCard}>
            <View style={styles.savedHeader}>
              <Text accessibilityRole="header" style={styles.savedTitle}>
                Total Plans
              </Text>
              <View style={styles.savedCountBadge}>
                <Text style={styles.savedCountBadgeText}>
                  {plans.length} Saved membership plans
                </Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.savedSearchBar}>
              <Ionicons name="search" size={16} color="#1C1C1E" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search membership plans..."
                placeholderTextColor="#1C1C1E"
                style={styles.savedSearchInput}
              />
            </View>

            {/* Plans list */}
            {filteredPlans.map((plan, index) => {
              const color = TIER_COLORS[index % TIER_COLORS.length];
              return (
                <View key={plan.id} style={styles.savedPlanItem}>
                  {/* Left: Layers Icon, Name, Active Badge, Subtitle, Meta */}
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <View style={[styles.tierIconWrap, { backgroundColor: color }]}>
                      <Ionicons name="layers" size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text numberOfLines={1} style={styles.tierTitle}>
                          {plan.name}
                        </Text>
                        <View style={styles.savedActiveBadge}>
                          <Text style={styles.savedActiveBadgeText}>active</Text>
                        </View>
                      </View>
                      <Text numberOfLines={1} style={styles.tierSubtitle}>
                        {plan.description || "Standard gym membership plan"}
                      </Text>
                      <Text numberOfLines={1} style={styles.savedMetaLine}>
                        {plan.duration_days} days •{" "}
                        <Text style={{ color: "#34C759", fontWeight: "800" }}>
                          {formatCurrency(plan.price_cents, plan.currency)}
                        </Text>{" "}
                        • Gym: {plan.gym_name || "ZD Fitness"}
                      </Text>
                    </View>
                  </View>

                  {/* Right Actions: Pencil and Trash buttons */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${plan.name}`}
                      onPress={() => setEditingPlan(plan)}
                      style={styles.actionBtnSquare}
                    >
                      <Ionicons name="pencil-outline" size={15} color="#F2F2F7" />
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${plan.name}`}
                      onPress={() => handleDeletePlan(plan)}
                      style={styles.actionBtnSquare}
                    >
                      <Ionicons name="trash-outline" size={15} color="#F2F2F7" />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* Footer row */}
            <View style={styles.savedFooterRow}>
              <Text style={styles.savedFooterText}>
                Showing {filteredPlans.length} of {plans.length} plans
              </Text>
              <View style={styles.pageCircle}>
                <Text style={styles.pageCircleText}>1</Text>
              </View>
            </View>
          </View>

          {/* Details Modal */}
          <PlanActionModalView
            model={{
              kind: "view1",
              props: {
                plan: detailsPlan,
                onClose: () => setDetailsPlan(null),
                styles,
              },
            } as any}
          />

          {/* Edit Plan Modal Sheet (Image 3) */}
          {editingPlan ? (
            <PlanEditSheetModal
              plan={editingPlan}
              onClose={() => setEditingPlan(null)}
              onSaved={() => {
                setEditingPlan(null);
                queryClient.invalidateQueries({
                  queryKey: ["operations", "membership-plans"],
                });
              }}
              styles={styles}
            />
          ) : null}

          {/* New Plan Modal Sheet (Image 4) */}
          {newModalVisible ? (
            <PlanCreateSheetModal
              onClose={() => setNewModalVisible(false)}
              onSaved={() => {
                setNewModalVisible(false);
                queryClient.invalidateQueries({
                  queryKey: ["operations", "membership-plans"],
                });
              }}
              styles={styles}
            />
          ) : null}

          {isSuperAdmin && platformPlanDraft ? (
            <PlatformPlanCrudModal
              plan={platformPlanDraft}
              onClose={() => setPlatformPlanDraft(null)}
              onSaved={() => {
                setPlatformPlanDraft(null);
                queryClient.invalidateQueries({ queryKey: ["platform-plans"] });
              }}
            />
          ) : null}
        </ScrollView>
      );
    }
  }
}

// -------------------------------------------------------------
// Interactive Plan Edit Sheet Modal (Image 3)
// -------------------------------------------------------------
function PlanEditSheetModal({
  plan,
  onClose,
  onSaved,
  styles,
}: {
  plan: any;
  onClose: () => void;
  onSaved: () => void;
  styles: any;
}) {
  const [name, setName] = useState(plan.name || "");
  const [subtitle, setSubtitle] = useState(plan.description || "");
  const [price, setPrice] = useState(String(Math.round(plan.price_cents / 100)));
  const [durationDays, setDurationDays] = useState(plan.duration_days || 365);
  const [perks, setPerks] = useState<string[]>(plan.features || []);
  const [customPerk, setCustomPerk] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TIER_COLORS[0]);
  const [isPopular, setIsPopular] = useState(Boolean(plan.is_popular));
  const [saving, setSaving] = useState(false);

  const handleAddPerk = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!perks.includes(trimmed)) {
      setPerks([...perks, trimmed]);
    }
    setCustomPerk("");
  };

  const handleRemovePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a plan name.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert("Validation", "Please enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      if (plan.id && !plan.id.endsWith("-template")) {
        await membershipPlansApi.update(plan.id, {
          name: name.trim(),
          description: subtitle.trim(),
          price_cents: Math.round(numPrice * 100),
          duration_days: durationDays,
          features: perks,
        });
      } else {
        await membershipPlansApi.create({
          name: name.trim(),
          description: subtitle.trim(),
          price_cents: Math.round(numPrice * 100),
          duration_days: durationDays,
          currency: "INR",
          features: perks,
        });
      }
      onSaved();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <View>
              <Text style={styles.sheetKicker}>GYM BILLING TIERS</Text>
              <Text style={styles.sheetTitle}>Edit Membership Plan</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleSave}
              style={styles.sheetSaveBtn}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sheetSaveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Live Preview Box */}
            <View style={styles.previewBox}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                <View style={[styles.tierIconWrap, { backgroundColor: selectedColor }]}>
                  <Ionicons name="layers" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={styles.previewTitle}>
                    {name || "Untitled Plan"}
                  </Text>
                  <Text numberOfLines={1} style={styles.previewSubtitle}>
                    {subtitle || "Tagline preview"}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.previewPrice}>
                  ₹{Number(price || 0).toLocaleString()}
                </Text>
                <Text style={styles.previewDays}>{durationDays} days</Text>
              </View>
            </View>

            {/* Section 1: Plan Identity & Pricing */}
            <Text style={styles.sectionKicker}>PLAN IDENTITY & PRICING</Text>
            <View style={styles.inputCardGroup}>
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Plan Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.inputRowTextInput}
                  placeholderTextColor="#1C1C1E"
                />
              </View>
              <View style={{ height: 1, backgroundColor: "#1C1C1E" }} />
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Subtitle</Text>
                <TextInput
                  value={subtitle}
                  onChangeText={setSubtitle}
                  style={styles.inputRowTextInput}
                  placeholderTextColor="#1C1C1E"
                />
              </View>
              <View style={{ height: 1, backgroundColor: "#1C1C1E" }} />
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Package Fee</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#34C759", fontSize: 16, fontWeight: "700", marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={[styles.inputRowTextInput, { flex: 1 }]}
                    placeholderTextColor="#1C1C1E"
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Billing Duration */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.sectionKicker}>BILLING DURATION</Text>
              <Text style={{ color: "#E91E63", fontSize: 11, fontWeight: "700" }}>
                {durationDays} Days Validity
              </Text>
            </View>
            <View style={styles.durationPillsRow}>
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = durationDays === opt.days;
                return (
                  <Pressable
                    key={opt.days}
                    accessibilityRole="button"
                    onPress={() => setDurationDays(opt.days)}
                    style={[styles.durationPill, isSelected && styles.durationPillActive]}
                  >
                    <Text style={[styles.durationPillTitle, isSelected && { color: "#FFFFFF" }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.durationPillDays, isSelected && { color: "#FFFFFF" }]}>
                      {opt.days}d
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Section 3: Included Perks */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.sectionKicker}>INCLUDED PERKS ({perks.length})</Text>
              <Text style={{ color: "#F2F2F7", fontSize: 11 }}>Tap × to remove</Text>
            </View>

            <View style={styles.perksChipsWrap}>
              {perks.map((perk, idx) => (
                <Pressable
                  key={idx}
                  accessibilityRole="button"
                  onPress={() => handleRemovePerk(idx)}
                  style={styles.perkChip}
                >
                  <Ionicons name="checkmark" size={14} color="#34C759" />
                  <Text style={styles.perkChipText}>{perk}</Text>
                  <Text style={styles.perkRemoveText}>×</Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Perk Input */}
            <View style={styles.addPerkRow}>
              <TextInput
                value={customPerk}
                onChangeText={setCustomPerk}
                placeholder="Add custom perk (e.g. Steam & Sauna)..."
                placeholderTextColor="#1C1C1E"
                style={styles.addPerkInput}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => handleAddPerk(customPerk)}
                style={styles.addPerkBtn}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>+ Add</Text>
              </Pressable>
            </View>

            {/* Quick Add Suggestion Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SUGGESTED_PERKS.map((sug) => (
                <Pressable
                  key={sug}
                  accessibilityRole="button"
                  onPress={() => handleAddPerk(sug)}
                  style={{
                    backgroundColor: "#000000",
                    borderWidth: 1,
                    borderColor: "#1C1C1E",
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "#F2F2F7", fontSize: 11 }}>+ {sug}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Section 4: Tier Badge Color */}
            <Text style={styles.sectionKicker}>Tier Badge Color</Text>
            <View style={styles.colorCirclesRow}>
              {TIER_COLORS.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <Pressable
                    key={col}
                    accessibilityRole="button"
                    onPress={() => setSelectedColor(col)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col },
                      isSelected && styles.colorCircleSelected,
                    ]}
                  />
                );
              })}
            </View>

            {/* Section 5: Highlight with POPULAR badge */}
            <View style={styles.popularSwitchRow}>
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
                  Highlight with POPULAR badge
                </Text>
                <Text style={{ color: "#F2F2F7", fontSize: 11, marginTop: 2 }}>
                  Pins a vibrant pink badge to this membership row
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#1C1C1E", true: "#34C759" }}
                thumbColor="#FFFFFF"
                value={isPopular}
                onValueChange={setIsPopular}
              />
            </View>

            {/* Bottom Save Button */}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleSave}
              style={styles.bottomSubmitBtn}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.bottomSubmitBtnText}>Save Plan Changes</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// -------------------------------------------------------------
// Interactive Plan Create Sheet Modal (Image 4)
// -------------------------------------------------------------
function PlanCreateSheetModal({
  onClose,
  onSaved,
  styles,
}: {
  onClose: () => void;
  onSaved: () => void;
  styles: any;
}) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [perks, setPerks] = useState<string[]>([]);
  const [customPerk, setCustomPerk] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TIER_COLORS[2]);
  const [isPopular, setIsPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddPerk = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!perks.includes(trimmed)) {
      setPerks([...perks, trimmed]);
    }
    setCustomPerk("");
  };

  const handleRemovePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a plan name.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert("Validation", "Please enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      await membershipPlansApi.create({
        name: name.trim(),
        description: subtitle.trim(),
        price_cents: Math.round(numPrice * 100),
        duration_days: durationDays,
        currency: "INR",
        features: perks,
      });
      onSaved();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <View>
              <Text style={styles.sheetKicker}>GYM BILLING TIERS</Text>
              <Text style={styles.sheetTitle}>New Membership Plan</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleCreate}
              style={styles.sheetSaveBtn}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sheetSaveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Live Preview Box */}
            <View style={styles.previewBox}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                <View style={[styles.tierIconWrap, { backgroundColor: selectedColor }]}>
                  <Ionicons name="layers" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={styles.previewTitle}>
                    {name || "Untitled Plan"}
                  </Text>
                  <Text numberOfLines={1} style={styles.previewSubtitle}>
                    {subtitle || "Tagline preview"}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.previewPrice}>
                  ₹{Number(price || 0).toLocaleString()}
                </Text>
                <Text style={styles.previewDays}>{durationDays} days</Text>
              </View>
            </View>

            {/* Section 1: Plan Identity & Pricing */}
            <Text style={styles.sectionKicker}>PLAN IDENTITY & PRICING</Text>
            <View style={styles.inputCardGroup}>
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Plan Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.inputRowTextInput}
                  placeholderTextColor="#1C1C1E"
                />
              </View>
              <View style={{ height: 1, backgroundColor: "#1C1C1E" }} />
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Subtitle</Text>
                <TextInput
                  value={subtitle}
                  onChangeText={setSubtitle}
                  style={styles.inputRowTextInput}
                  placeholderTextColor="#1C1C1E"
                />
              </View>
              <View style={{ height: 1, backgroundColor: "#1C1C1E" }} />
              <View style={styles.inputRowField}>
                <Text style={styles.inputRowLabel}>Package Fee</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#34C759", fontSize: 16, fontWeight: "700", marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={[styles.inputRowTextInput, { flex: 1 }]}
                    placeholderTextColor="#1C1C1E"
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Billing Duration */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.sectionKicker}>BILLING DURATION</Text>
              <Text style={{ color: "#E91E63", fontSize: 11, fontWeight: "700" }}>
                {durationDays} Days Validity
              </Text>
            </View>
            <View style={styles.durationPillsRow}>
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = durationDays === opt.days;
                return (
                  <Pressable
                    key={opt.days}
                    accessibilityRole="button"
                    onPress={() => setDurationDays(opt.days)}
                    style={[styles.durationPill, isSelected && styles.durationPillActive]}
                  >
                    <Text style={[styles.durationPillTitle, isSelected && { color: "#FFFFFF" }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.durationPillDays, isSelected && { color: "#FFFFFF" }]}>
                      {opt.days}d
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Section 3: Included Perks */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.sectionKicker}>INCLUDED PERKS ({perks.length})</Text>
              <Text style={{ color: "#F2F2F7", fontSize: 11 }}>Tap × to remove</Text>
            </View>

            <View style={styles.perksChipsWrap}>
              {perks.map((perk, idx) => (
                <Pressable
                  key={idx}
                  accessibilityRole="button"
                  onPress={() => handleRemovePerk(idx)}
                  style={styles.perkChip}
                >
                  <Ionicons name="checkmark" size={14} color="#34C759" />
                  <Text style={styles.perkChipText}>{perk}</Text>
                  <Text style={styles.perkRemoveText}>×</Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Perk Input */}
            <View style={styles.addPerkRow}>
              <TextInput
                value={customPerk}
                onChangeText={setCustomPerk}
                placeholder="Add custom perk (e.g. Steam & Sauna)..."
                placeholderTextColor="#1C1C1E"
                style={styles.addPerkInput}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => handleAddPerk(customPerk)}
                style={styles.addPerkBtn}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>+ Add</Text>
              </Pressable>
            </View>

            {/* Quick Add Suggestion Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SUGGESTED_PERKS.map((sug) => (
                <Pressable
                  key={sug}
                  accessibilityRole="button"
                  onPress={() => handleAddPerk(sug)}
                  style={{
                    backgroundColor: "#000000",
                    borderWidth: 1,
                    borderColor: "#1C1C1E",
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "#F2F2F7", fontSize: 11 }}>+ {sug}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Section 4: Tier Badge Color */}
            <Text style={styles.sectionKicker}>Tier Badge Color</Text>
            <View style={styles.colorCirclesRow}>
              {TIER_COLORS.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <Pressable
                    key={col}
                    accessibilityRole="button"
                    onPress={() => setSelectedColor(col)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col },
                      isSelected && styles.colorCircleSelected,
                    ]}
                  />
                );
              })}
            </View>

            {/* Section 5: Highlight with POPULAR badge */}
            <View style={styles.popularSwitchRow}>
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
                  Highlight with POPULAR badge
                </Text>
                <Text style={{ color: "#F2F2F7", fontSize: 11, marginTop: 2 }}>
                  Pins a vibrant pink badge to this membership row
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#1C1C1E", true: "#34C759" }}
                thumbColor="#FFFFFF"
                value={isPopular}
                onValueChange={setIsPopular}
              />
            </View>

            {/* Bottom Create Button */}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleCreate}
              style={styles.bottomSubmitBtn}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.bottomSubmitBtnText}>+ Create Membership Plan</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// -------------------------------------------------------------
// Legacy exports preserved for presentation callers & web
// -------------------------------------------------------------
export function PlanCardView({
  model,
}: {
  model: ReturnType<typeof usePlanCardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, index, accent, icon, plan, onEdit, onView } = model.props;
      return (
        <View style={styles.card}>
          <View style={styles.previewHeader}>
            <View style={styles.planHeading}>
              <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
                <Ionicons name={icon} size={23} color={accent} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                {plan.gym_name ? <Text style={styles.gymTag}>{plan.gym_name}</Text> : null}
                <Text style={styles.planName}>{plan.name}</Text>
              </View>
            </View>
            {plan.is_popular ? (
              <View style={styles.pill}>
                <Text style={styles.detailsText}>Popular</Text>
              </View>
            ) : null}
          </View>
          {plan.description ? <Text style={styles.description}>{plan.description}</Text> : null}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
            <Text style={styles.subtitle}>
              for {plan.duration_days} {plan.duration_days === 1 ? "day" : "days"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.features}>
            {plan.features.slice(0, 3).map((feature, i) => (
              <View key={i} style={styles.feature}>
                <Ionicons name="checkmark" size={17} color={accent} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
            {plan.features.length > 3 ? (
              <Text style={styles.subtitle}>+{plan.features.length - 3} more in details</Text>
            ) : null}
          </View>
          <View style={styles.cardActions}>
            {onEdit ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${plan.name}`}
                onPress={() => onEdit(plan)}
                style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.editText}>Edit plan</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View details for ${plan.name}`}
              onPress={() => onView(plan)}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsText}>Details</Text>
              <Ionicons name="chevron-forward" size={16} color={accent} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}

export function PlatformPlanCrudModalView({
  model,
}: {
  model: ReturnType<typeof usePlatformPlanCrudModalPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return null;
    }
  }
}

export function PlanActionModalView({
  model,
}: {
  model: ReturnType<typeof usePlanActionModalPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, plan } = model.props;
      if (!plan) return null;
      return (
        <Modal transparent visible animationType="fade" onRequestClose={onClose}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{plan.name}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={onClose}
                  style={{
                    minWidth: controlMetrics.minimumTouchSize,
                    minHeight: controlMetrics.minimumTouchSize,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={24} color="#007AFF" />
                </Pressable>
              </View>
              <ScrollView
                style={{ maxHeight: 360 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                <Text style={styles.description}>
                  {plan.description || "Flexible access for your gym members"}
                </Text>
                <Text style={styles.modalPrice}>
                  {formatCurrency(plan.price_cents, plan.currency)} · {plan.duration_days} days
                </Text>
                <View style={styles.modalFeatures}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.feature}>
                      <Ionicons name="checkmark-circle" size={19} color="#34C759" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      );
    }
  }
}

export function PlanEditModalView({
  model,
}: {
  model: ReturnType<typeof usePlanEditModalPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return null;
    }
  }
}
