import { showAlert } from "../../../../utils/appAlert";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PulseDashboardLayout } from "../../../../components/dashboard/PulseDashboardLayout";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { membershipPlanConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatCurrency } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useMembershipPlanScreenPresentation, usePlanCardPresentation, usePlatformPlanCrudModalPresentation, usePlanActionModalPresentation, usePlanEditModalPresentation } from "../../../../screens/saas/MembershipPlanScreen";

// --- SVG Icons precisely matching the reference images ---

function PlanDiamondIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4.5}
        y={4.5}
        width={15}
        height={15}
        rx={3}
        transform="rotate(45 12 12)"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlanZapIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlanShieldIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlanRocketIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlanCardIcon({ index, size = 20 }: { index: number; size?: number }) {
  const i = index % 4;
  if (i === 0) return <PlanDiamondIcon size={size} color="#FFFFFF" />;
  if (i === 1) return <PlanZapIcon size={size} color="#FFFFFF" />;
  if (i === 2) return <PlanShieldIcon size={size} color="#FFFFFF" />;
  return <PlanRocketIcon size={size} color="#FFFFFF" />;
}

function LayersIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points="12 2 2 7 12 12 22 7 12 2"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="2 12 12 17 22 12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="2 17 12 22 22 17"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkIcon({ size = 13, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ size = 16, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PencilIcon({ size = 15, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon({ size = 15, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronLeftIcon({ size = 16, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon({ size = 16, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseCircleIcon({ size = 16, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CloseIcon({ size = 22, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// --- Main Membership Plan Screen ---

export function MembershipPlanScreenView({ model }: { model: ReturnType<typeof useMembershipPlanScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { isReceptionist } = model.props;
      return isReceptionist ? <PulseDashboardLayout activeLabel="Plans" roleLabel="Reception"><AccessDeniedScreen /></PulseDashboardLayout> : <AccessDeniedScreen />;
    }
    case "view2": {
      const { isSuperAdmin, isReceptionist, styles, query, installStarters, setPlatformPlanDraft, platformQuery, colors, plans, PlanCard, setEditingPlan, setDetailsPlan, PlanActionModal, detailsPlan, PlanEditModal, editingPlan, queryClient, PlatformPlanCrudModal, platformPlanDraft } = model.props;
      const [search, setSearch] = useState("");
      const filteredPlans = plans.filter((p) =>
        `${p.name} ${p.description ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()),
      );

      return (
        <PulseDashboardLayout
          activeLabel={isReceptionist ? "Plans" : isSuperAdmin ? "Membership plans" : "Membership Plans"}
          roleLabel={isSuperAdmin ? "Super Admin" : isReceptionist ? "Reception" : "Gym Owner"}
        >
          <View style={styles.screen}>
            {/* Header Card */}
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{isSuperAdmin ? "Platform Membership Plans" : "Membership Plans"}</Text>
                <Text style={styles.subtitle}>
                  {isSuperAdmin
                    ? "Review every plan currently used by gym owners across the platform."
                    : "Create and manage membership plans for your gym."}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (isSuperAdmin) {
                    setPlatformPlanDraft("new");
                  } else {
                    setEditingPlan(plans[0]);
                  }
                }}
                style={styles.createButton}
              >
                <PlusIcon size={16} color="#FFFFFF" />
                <Text style={styles.createText}>Create New Plan</Text>
              </Pressable>
            </View>

            {/* Pricing Grid */}
            <View style={styles.grid}>
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  styles={styles}
                  onEdit={
                    isSuperAdmin
                      ? (plan) =>
                          setPlatformPlanDraft(
                            (platformQuery.data ?? []).find((item) => item.id === plan.id) ?? null,
                          )
                      : setEditingPlan
                  }
                  onView={setDetailsPlan}
                />
              ))}
            </View>

            {/* Total Plans Card with Table */}
            <View style={styles.tableCard}>
            <View style={styles.tableCardHeader}>
              <View style={styles.totalPlansTitleRow}>
                <Text style={styles.totalPlansTitle}>Total Plans</Text>
                <View style={styles.savedPill}>
                  <Text style={styles.savedPillText}>{plans.length} Saved membership plans</Text>
                </View>
              </View>
              <View style={styles.tableSearch}>
                <SearchIcon size={16} color={colors.textSecondary} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search membership plans..."
                  placeholderTextColor={colors.textPlaceholder}
                  style={styles.tableSearchInput}
                />
                {search ? (
                  <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
                    <CloseCircleIcon size={15} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { flex: 2 }]}>PACKAGE</Text>
              <Text style={[styles.thText, { flex: 1.5 }]}>DURATION & PRICE</Text>
              <Text style={[styles.thText, { flex: 1.5 }]}>GYM LOCATION</Text>
              <Text style={[styles.thText, { flex: 1 }]}>STATUS</Text>
              <Text style={[styles.thText, { width: 80, textAlign: "right" }]}>ACTIONS</Text>
            </View>

            {/* Table Rows */}
            {filteredPlans.map((plan, index) => {
              const accent = ["#E91E63", "#E91E63", "#34C759", "#007AFF"][index % 4];
              return (
                <View key={plan.id} style={styles.tableRow}>
                  <View style={styles.packageCell}>
                    <View style={[styles.packageIcon, { backgroundColor: accent }]}>
                      <LayersIcon size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packageName}>{plan.name}</Text>
                      <Text numberOfLines={1} style={styles.packageSubtitle}>
                        {plan.description || "Flexible fitness plan"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.durationPriceCell}>
                    <Text style={styles.durationText}>{plan.duration_days} days - </Text>
                    <Text style={styles.priceGreen}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
                  </View>
                  <Text style={styles.gymLocationText}>Gym: {plan.gym_name || "ZD Fitness"}</Text>
                  <View style={styles.statusCell}>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{plan.is_active === false ? "inactive" : "active"}</Text>
                    </View>
                  </View>
                  <View style={styles.actionsCell}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Edit plan"
                      onPress={() => setEditingPlan(plan)}
                      style={styles.actionIconBtn}
                    >
                      <PencilIcon size={15} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Delete plan"
                      onPress={() =>
                        showAlert("Delete plan?", "Are you sure you want to remove this plan?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => {} },
                        ])
                      }
                      style={styles.actionIconBtn}
                    >
                      <TrashIcon size={15} color="#E91E63" />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* Table Footer */}
            <View style={styles.tableFooter}>
              <Text style={styles.footerText}>
                Showing {filteredPlans.length} of {plans.length} plans
              </Text>
              <View style={styles.paginationRow}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous" style={styles.pageNavBtn}>
                  <ChevronLeftIcon size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.pageActiveBtn}>
                  <Text style={styles.pageActiveText}>1</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Next" style={styles.pageNavBtn}>
                  <ChevronRightIcon size={16} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <PlanActionModal
            plan={detailsPlan}
            onClose={() => setDetailsPlan(null)}
            styles={styles}
          />
          <PlanEditModal
            plan={editingPlan}
            onClose={() => setEditingPlan(null)}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ["operations", "membership-plans"] })}
            styles={styles}
          />
          {isSuperAdmin ? (
            <PlatformPlanCrudModal
              plan={platformPlanDraft}
              onClose={() => setPlatformPlanDraft(null)}
              onSaved={() => {
                setPlatformPlanDraft(null);
                queryClient.invalidateQueries({ queryKey: ["platform-plans"] });
              }}
            />
          ) : null}
        </PulseDashboardLayout>
      );
    }
  }
}

export function PlanCardView({ model }: { model: ReturnType<typeof usePlanCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, index, accent, plan, onEdit, onView } = model.props;
      const isPopular = plan.is_popular || index === 1;
      const durationLabel =
        plan.duration_days >= 365
          ? "12 Months"
          : plan.duration_days >= 180
            ? "6 Months"
            : plan.duration_days >= 90
              ? "3 Months"
              : `${Math.max(1, Math.round(plan.duration_days / 30))} Months`;

      return (
        <View style={[styles.card, isPopular && styles.popularCard]}>
          {isPopular ? (
            <View style={styles.popular}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          ) : null}
          <View style={styles.cardTopRow}>
            <View style={[styles.icon, { backgroundColor: accent }]}>
              <PlanCardIcon index={index} size={20} />
            </View>
            <View style={styles.durationPill}>
              <Text style={styles.durationPillText}>{durationLabel}</Text>
            </View>
          </View>
          <Text style={styles.gymTag}>{plan.gym_name || "ZD FITNESS"}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text numberOfLines={2} style={styles.description}>
            {plan.description || "Flexible access for your gym members"}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
            <Text style={styles.priceUnit}> / plan</Text>
          </View>
          <View style={styles.features}>
            {(plan.features.length ? plan.features : ["Gym access"]).map((feature) => (
              <View key={feature} style={styles.feature}>
                <CheckmarkIcon size={13} color="#34C759" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cardActions}>
            {onEdit ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onEdit(plan)}
                style={styles.editButton}
              >
                <Text style={styles.editText}>Edit Plan</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => onView(plan)}>
              <Text style={styles.detailsText}>View Details →</Text>
            </Pressable>
          </View>
        </View>
      );
    }
  }
}

export function PlatformPlanCrudModalView({ model }: { model: ReturnType<typeof usePlatformPlanCrudModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, existing, colors, slug, setSlug, name, setName, description, setDescription, price, setPrice, currency, setCurrency, billingPeriod, setBillingPeriod, displayOrder, setDisplayOrder, memberLimit, setMemberLimit, ctaLabel, setCtaLabel, trialDays, setTrialDays, features, setFeatures, isPopular, setIsPopular, isActive, setIsActive, save, remove, input } = model.props;
      return (
        <Modal transparent visible animationType="fade" onRequestClose={onClose}>
          <View style={styles.backdrop}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              <View style={styles.modal}>
                <View style={styles.header}>
                  <Text style={styles.title}>{existing ? `Edit ${existing.name}` : "Create platform plan"}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
                    <CloseIcon size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>
                {!existing ? input("Slug", slug, setSlug) : null}
                {input("Plan name", name, setName)}
                {input("Description", description, setDescription)}
                <View style={styles.grid}>
                  {input("Price (₹)", price, setPrice, true, true)}
                  {input("Currency", currency, setCurrency, false, true)}
                  {input("Billing period", billingPeriod, setBillingPeriod, false, true)}
                  {input("Display order", displayOrder, setDisplayOrder, true, true)}
                  {input("Member limit", memberLimit, setMemberLimit, false, true)}
                  {input("Button label", ctaLabel, setCtaLabel, false, true)}
                  {input("Free trial days", trialDays, setTrialDays, true, true)}
                </View>
                {input("Features (one per line)", features, setFeatures)}
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Show “Most popular” badge</Text>
                  <Switch value={isPopular} onValueChange={setIsPopular} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Show plan in public pricing</Text>
                  <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} />
                </View>
                {save.error ? <Text style={styles.error}>{getApiErrorMessage(save.error)}</Text> : null}
                <View style={styles.actions}>
                  {existing ? (
                    <PrimaryButton
                      title="Delete plan"
                      variant="danger"
                      loading={remove.isPending}
                      onPress={() =>
                        showAlert("Delete plan?", "This removes the plan from public pricing.", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => remove.mutate() },
                        ])
                      }
                    />
                  ) : null}
                  <PrimaryButton title="Save plan" loading={save.isPending} onPress={() => save.mutate()} />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      );
    }
  }
}

export function PlanActionModalView({ model }: { model: ReturnType<typeof usePlanActionModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { plan, onClose, styles } = model.props;
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
                >
                  <CloseIcon size={22} color={styles.modalTitle?.color || "#8E8E93"} />
                </Pressable>
              </View>
              <Text style={styles.description}>
                {plan.description || "Flexible access for your gym members"}
              </Text>
              <Text style={styles.modalPrice}>
                {formatCurrency(plan.price_cents, plan.currency)} · {plan.duration_days} days
              </Text>
              <View style={styles.modalFeatures}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.feature}>
                    <CheckmarkIcon size={14} color="#34C759" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              {plan.id.endsWith("-template") ? (
                <Text style={styles.templateNotice}>
                  Save the starter plans first, then you can edit this plan.
                </Text>
              ) : null}
              <PrimaryButton title="Close" onPress={onClose} />
            </View>
          </View>
        </Modal>
      );
    }
  }
}

export function PlanEditModalView({ model }: { model: ReturnType<typeof usePlanEditModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, plan, fields, mutation } = model.props;
      return (
        <Modal transparent visible animationType="fade" onRequestClose={onClose}>
          <View style={styles.modalBackdrop}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit {plan.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close editor"
                    onPress={onClose}
                  >
                    <CloseIcon size={24} color={styles.modalTitle?.color || "#8E8E93"} />
                  </Pressable>
                </View>
                {fields.map(([label, value, setter]) => {
                  const multiline = label.startsWith("Features") || label === "Description";
                  return (
                    <View key={label} style={styles.field}>
                      <Text style={styles.fieldLabel}>{label}</Text>
                      <TextInput
                        value={value}
                        onChangeText={setter}
                        multiline={multiline}
                        textAlignVertical={multiline ? "top" : "center"}
                        style={[styles.input, multiline && styles.inputMultiline]}
                        placeholderTextColor={styles.fieldLabel?.color || "#8E8E93"}
                      />
                    </View>
                  );
                })}
                {mutation.error ? (
                  <Text style={styles.error}>
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : "Could not save the plan."}
                  </Text>
                ) : null}
                <View style={styles.modalActions}>
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={onClose}
                    style={styles.modalButton}
                  />
                  <PrimaryButton
                    title="Save Changes"
                    loading={mutation.isPending}
                    disabled={mutation.isPending}
                    onPress={() => mutation.mutate()}
                    style={styles.modalButton}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      );
    }
  }
}
