import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Modal, ScrollView, Switch, Text, TextInput, View } from "react-native";
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
  const [showTemplates, setShowTemplates] = useState(false);
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
          <ScreenHeader title={isSuperAdmin ? "Platform Membership Plans" : "Membership Plans"} subtitle={isSuperAdmin ? "Review every plan currently used by gym owners across the platform." : "Create and manage membership plans for your gym."} />
        </View>
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
          Could not load saved plans. Pull to refresh and try again.
        </Text>
      ) : null}
      {!isSuperAdmin ? <ResourceCrudPanel config={membershipPlanConfig} /> : null}
      <View style={styles.previewHeader}>
        <Text accessibilityRole="header" style={styles.statLabel}>{!isSuperAdmin && !query.data?.length ? "Starter templates" : "Plan preview"}</Text>
        <Text style={styles.subtitle}>{isSuperAdmin ? platformQuery.data?.length ?? 0 : query.data?.length ?? 0} saved</Text>
      </View>
      {!isSuperAdmin && plans.some(plan => plan.id.endsWith("-template")) ? <>
        <Text style={styles.subtitle}>Use a starter template or create your own plan above.</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showTemplates }} onPress={() => setShowTemplates(value => !value)} style={styles.templateToggle}><Text style={styles.detailsText}>{showTemplates ? "Hide templates" : `Browse ${plans.filter(plan => plan.id.endsWith("-template")).length} starter templates`}</Text><Ionicons name={showTemplates ? "chevron-up" : "chevron-down"} size={18} color={colors.primary} /></Pressable>
      </> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToAlignment="start" contentContainerStyle={styles.planScroller}>
        {plans.filter(plan => isSuperAdmin || !plan.id.endsWith("-template") || showTemplates).map((plan, index) => (
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
      </ScrollView>
      {isSuperAdmin ? (
        <View style={styles.platformNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.platformNoteText}>
            These plans are shared from each Gym Owner site. The gym name on each card identifies the plan owner.
          </Text>
        </View>
       ) : null}
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
    <View style={styles.card}>
      <View style={styles.previewHeader}>
        <View style={styles.planHeading}>
          <View style={[styles.icon, { backgroundColor: `${accent}18` }]}><Ionicons name={icon} size={23} color={accent} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            {plan.gym_name ? <Text style={styles.gymTag}>{plan.gym_name}</Text> : null}
            <Text style={styles.planName}>{plan.name}</Text>
          </View>
        </View>
        {plan.is_popular ? <View style={styles.pill}><Text style={styles.detailsText}>Popular</Text></View> : null}
      </View>
      {plan.description ? <Text style={styles.description}>{plan.description}</Text> : null}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatCurrency(plan.price_cents, plan.currency)}</Text>
        <Text style={styles.subtitle}>for {plan.duration_days} {plan.duration_days === 1 ? "day" : "days"}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.features}>
        {plan.features.slice(0, 3).map((feature, i) => <View key={i} style={styles.feature}><Ionicons name="checkmark" size={17} color={accent} /><Text style={styles.featureText}>{feature}</Text></View>)}
        {plan.features.length > 3 ? <Text style={styles.subtitle}>+{plan.features.length - 3} more in details</Text> : null}
      </View>
      <View style={styles.cardActions}>
        {onEdit ? <Pressable accessibilityRole="button" accessibilityLabel={`${plan.id.endsWith("-template") ? "Customize" : "Edit"} ${plan.name}`} onPress={() => onEdit(plan)} style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}><Text style={styles.editText}>{plan.id.endsWith("-template") ? "Customize" : "Edit plan"}</Text></Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={`View details for ${plan.name}`} onPress={() => onView(plan)} style={styles.detailsButton}><Text style={styles.detailsText}>Details</Text><Ionicons name="chevron-forward" size={16} color={accent} /></Pressable>
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
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { if (!mutation.isPending) onClose(); }}>
      <SafeAreaView style={styles.editorScreen} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.editorHeader}>
            <Pressable accessibilityRole="button" disabled={mutation.isPending} accessibilityState={{ disabled: mutation.isPending }} onPress={onClose} style={styles.editorCancel}><Text style={[styles.detailsText, mutation.isPending && { opacity: 0.4 }]}>Cancel</Text></Pressable>
            <Text accessibilityRole="header" style={styles.editorTitle}>{plan.id.endsWith("-template") ? "Customize plan" : "Edit plan"}</Text>
            <View style={{ width: 64 }} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} automaticallyAdjustKeyboardInsets={false} contentContainerStyle={styles.editorContent}>
            <View style={{ gap: 5 }}>
              <Text style={styles.editorPlanName}>{plan.name}</Text>
              <Text style={styles.description}>{plan.id.endsWith("-template") ? "Make this template your own. Saving creates a plan for your gym." : "Update the details members see for this plan."}</Text>
            </View>
            {[
              { title: "Plan details", items: fields.slice(0, 2) },
              { title: "Price & duration", items: fields.slice(2, 4) },
              { title: "Included benefits", items: fields.slice(4) },
            ].map(group => <View key={group.title} style={{ gap: 8 }}>
              <Text accessibilityRole="header" style={styles.editorSectionTitle}>{group.title}</Text>
              <View style={styles.editorGroup}>
                {group.items.map(([label, value, setter], index) => {
                  const isFeatures = label.startsWith("Features");
                  const numeric = label === "Price" || label.startsWith("Duration");
                  const multiline = isFeatures || label === "Description";
                  const displayLabel = label === "Price" ? `Price (${plan.currency})` : isFeatures ? "Benefits" : label;
                  return <View key={label} style={[styles.editorField, index > 0 && styles.editorFieldDivider]}>
                    <Text style={styles.editorLabel}>{displayLabel}</Text>
                    <TextInput accessibilityLabel={displayLabel} editable={!mutation.isPending} value={value} onChangeText={setter} keyboardType={numeric ? label === "Price" ? "decimal-pad" : "number-pad" : "default"} multiline={multiline} textAlignVertical={multiline ? "top" : "center"} placeholder={isFeatures ? "Gym access, Group classes, Personal training" : label === "Description" ? "A short description of your plan" : label === "Price" ? "0.00" : "Enter " + label.toLowerCase()} placeholderTextColor={styles.editorHint.color} selectionColor={styles.detailsText.color} style={[styles.editorInput, multiline && styles.editorMultiline]} />
                  </View>;
                })}
              </View>
              {group.title === "Included benefits" ? <Text style={styles.editorHint}>Separate benefits with commas.</Text> : group.title === "Price & duration" ? <Text style={styles.editorHint}>This price covers the full duration, entered in days.</Text> : null}
            </View>)}
            {mutation.error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{getApiErrorMessage(mutation.error)}</Text> : null}
          </ScrollView>
          <View style={styles.editorFooter}>
            <PrimaryButton title={plan.id.endsWith("-template") ? "Create plan" : "Save changes"} loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate()} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  ));
    }
  }
}
