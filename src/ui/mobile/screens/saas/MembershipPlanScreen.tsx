import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
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

export function MembershipPlanScreenView({ model }: { model: ReturnType<typeof useMembershipPlanScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { isSuperAdmin, styles, query, installStarters, setPlatformPlanDraft, platformQuery, colors, plans, PlanCard, setEditingPlan, setDetailsPlan, PlanActionModal, detailsPlan, PlanEditModal, editingPlan, queryClient, PlatformPlanCrudModal, platformPlanDraft } = model.props;
      return ((
    <PulseDashboardLayout
      activeLabel="Membership plans"
      roleLabel={isSuperAdmin ? "Super Admin" : "Gym Owner"}
      contentStyle={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{isSuperAdmin ? "Platform Membership Plans" : "Membership Plans"}</Text>
          <Text style={styles.subtitle}>
            {isSuperAdmin
              ? "Review every plan currently used by gym owners across the platform."
              : "Create and manage membership plans for your gym."}
          </Text>
        </View>
        {!isSuperAdmin && !query.data?.length ? (
          <PrimaryButton
            title="Add All Starter Plans"
            icon="add"
            disabled={installStarters.isPending}
            onPress={() => installStarters.mutate()}
          />
        ) : null}
        {isSuperAdmin ? <PrimaryButton title="Create plan" icon="add" onPress={() => setPlatformPlanDraft("new")} /> : null}
      </View>
      <NoticeBanner
        message={
          installStarters.isSuccess
            ? "All starter plans are now saved and editable in Plan Management."
            : null
        }
      />
      <NoticeBanner
        message={
          installStarters.error
            ? "The starter plans could not be saved. Please try again."
            : null
        }
        tone="error"
      />
      {(isSuperAdmin ? platformQuery.isLoading : query.isLoading) ? <ActivityIndicator color={colors.primary} /> : null}
      {(isSuperAdmin ? platformQuery.error : query.error) ? (
        <Text style={styles.error}>
          Could not load saved plans. Showing plan templates below.
        </Text>
      ) : null}
      {!isSuperAdmin && !query.isLoading && !query.data?.length ? (
        <Text style={styles.templateNotice}>
          Starter plan templates — create or customize them using Plan
          Management below.
        </Text>
      ) : null}
      <View style={styles.grid}>
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            styles={styles}
            onEdit={isSuperAdmin
              ? (plan) => setPlatformPlanDraft((platformQuery.data ?? []).find((item) => item.id === plan.id) ?? null)
              : setEditingPlan}
            onView={setDetailsPlan}
          />
        ))}
      </View>
      <View style={styles.stats}>
        <Text style={styles.statValue}>{plans.length}</Text>
        <View>
          <Text style={styles.statLabel}>Total Plans</Text>
          <Text style={styles.subtitle}>Membership packages displayed</Text>
        </View>
      </View>
      {isSuperAdmin ? (
        <View style={styles.platformNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.platformNoteText}>
            These plans are shared from each Gym Owner site. The gym name on each card identifies the plan owner.
          </Text>
        </View>
      ) : <ResourceCrudPanel config={membershipPlanConfig} />}
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
      {isSuperAdmin ? <PlatformPlanCrudModal plan={platformPlanDraft} onClose={() => setPlatformPlanDraft(null)} onSaved={() => { setPlatformPlanDraft(null); queryClient.invalidateQueries({ queryKey: ["platform-plans"] }); }} /> : null}
    </PulseDashboardLayout>
  ));
    }
  }
}

export function PlanCardView({ model }: { model: ReturnType<typeof usePlanCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, index, accent, icon, plan, onEdit, onView } = model.props;
      return ((
    <View
      style={[
        styles.card,
        index === 1 && { borderColor: accent, borderWidth: 2 },
      ]}
    >
      {index === 1 ? (
        <View style={[styles.popular, { backgroundColor: accent }]}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      ) : null}
      <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={34} color={accent} />
      </View>
      {plan.gym_name ? <Text style={styles.gymTag}>{plan.gym_name}</Text> : null}
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.description}>
        {plan.description || "Flexible access for your gym members"}
      </Text>
      <Text style={[styles.price, { color: accent }]}>
        {formatCurrency(plan.price_cents, plan.currency)}
      </Text>
      <Text style={styles.subtitle}>/ plan</Text>
      <View style={[styles.pill, { backgroundColor: `${accent}15` }]}>
        <Text style={{ color: accent, fontWeight: "800" }}>
          {Math.max(1, Math.round(plan.duration_days / 30))} Months
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.features}>
        {(plan.features.length ? plan.features : ["Gym access"]).map(
          (feature) => (
            <View key={feature} style={styles.feature}>
              <Ionicons name="checkmark" size={18} color={accent} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ),
        )}
      </View>
      <View style={styles.cardActions}>
        {onEdit ? <Pressable
          accessibilityRole="button"
          onPress={() => onEdit(plan)}
          style={({ pressed }) => [
            styles.editButton,
            { borderColor: accent },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.editText, { color: accent }]}>Edit Plan</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="button" onPress={() => onView(plan)}>
          <Text style={[styles.detailsText, { color: accent }]}>
            View Details →
          </Text>
        </Pressable>
      </View>
    </View>
  ));
    }
  }
}

export function PlatformPlanCrudModalView({ model }: { model: ReturnType<typeof usePlatformPlanCrudModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, existing, colors, input, slug, setSlug, name, setName, description, setDescription, price, setPrice, currency, setCurrency, billingPeriod, setBillingPeriod, displayOrder, setDisplayOrder, memberLimit, setMemberLimit, ctaLabel, setCtaLabel, trialDays, setTrialDays, features, setFeatures, isPopular, setIsPopular, isActive, setIsActive, save, remove } = model.props;
      return (<Modal transparent visible animationType="fade" onRequestClose={onClose}><View style={styles.backdrop}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.modal}><View style={styles.header}><Text style={styles.title}>{existing ? `Edit ${existing.name}` : "Create platform plan"}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="close" size={25} color={colors.textSecondary} /></Pressable></View>{!existing ? input("Slug", slug, setSlug) : null}{input("Plan name", name, setName)}{input("Description", description, setDescription)}<View style={styles.grid}>{input("Price (₹)", price, setPrice, true, true)}{input("Currency", currency, setCurrency, false, true)}{input("Billing period", billingPeriod, setBillingPeriod, false, true)}{input("Display order", displayOrder, setDisplayOrder, true, true)}{input("Member limit", memberLimit, setMemberLimit, false, true)}{input("Button label", ctaLabel, setCtaLabel, false, true)}{input("Free trial days", trialDays, setTrialDays, true, true)}</View>{input("Features (one per line)", features, setFeatures)}<View style={styles.switchRow}><Text style={styles.label}>Show “Most popular” badge</Text><Switch value={isPopular} onValueChange={setIsPopular} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} /></View><View style={styles.switchRow}><Text style={styles.label}>Show plan in public pricing</Text><Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} /></View>{save.error ? <Text style={styles.error}>{getApiErrorMessage(save.error)}</Text> : null}<View style={styles.actions}>{existing ? <PrimaryButton title="Delete plan" variant="danger" loading={remove.isPending} onPress={() => showAlert("Delete plan?", "This removes the plan from public pricing.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => remove.mutate() }])} /> : null}<PrimaryButton title="Save plan" loading={save.isPending} onPress={() => save.mutate()} /></View></View></ScrollView></View></Modal>);
    }
  }
}

export function PlanActionModalView({ model }: { model: ReturnType<typeof usePlanActionModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, plan } = model.props;
      return ((
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{plan.name}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
             style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </Pressable>
          </View>
          <Text style={styles.description}>
            {plan.description || "Flexible access for your gym members"}
          </Text>
          <Text style={styles.modalPrice}>
            {formatCurrency(plan.price_cents, plan.currency)} ·{" "}
            {plan.duration_days} days
          </Text>
          <View style={styles.modalFeatures}>
            {plan.features.map((feature) => (
              <View key={feature} style={styles.feature}>
                <Ionicons name="checkmark-circle" size={19} color="#22C55E" />
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
  ));
    }
  }
}

export function PlanEditModalView({ model }: { model: ReturnType<typeof usePlanEditModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, styles, plan, fields, mutation } = model.props;
      return ((
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
               style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={28} color="#94A3B8" />
              </Pressable>
            </View>
            {fields.map(([label, value, setter]) => {
              const multiline =
                label.startsWith("Features") || label === "Description";
              return (
                <View key={label} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    value={value}
                    onChangeText={setter}
                    multiline={multiline}
                    textAlignVertical={multiline ? "top" : "center"}
                    style={[styles.input, multiline && styles.inputMultiline]}
                    placeholderTextColor="#64748B"
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
  ));
    }
  }
}
