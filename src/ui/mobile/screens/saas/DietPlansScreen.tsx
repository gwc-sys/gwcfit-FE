import { Pressable } from "../../components/NativePressable";
import { useCallback, useState } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../../../navigation/types";
import { DietFoodLibrary } from "./DietFoodLibrary";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { dietPlanConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useDietPlansScreenPresentation, useStatPresentation, usePlanCardPresentation } from "../../../../screens/saas/DietPlansScreen";

export function DietPlansScreenView({ model }: { model: ReturnType<typeof useDietPlansScreenPresentation> }): React.ReactNode {
  const route = useRoute<RouteProp<RootStackParamList, "DietPlans">>();
  const [showFoodLibrary, setShowFoodLibrary] = useState(true);
  useFocusEffect(useCallback(() => {
    setShowFoodLibrary(route.params?.view !== "plans");
  }, [route.params?.view]));
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, colors, navigation, setEditRecordId, setFormModalOpen, setCreateRequest, Stat, plans, activePlans, assignedClients, averageCalories, search, setSearch, setPage, setActiveOnly, activeOnly, setAscending, ascending, categories, setCategory, category, listQuery, visiblePlans, PlanCard, formModalOpen, editRecordId, createRequest, planCategory, filteredPlans, safePage, pageSize, pageCount } = model.props;
      if (showFoodLibrary) return <DietFoodLibrary onPlans={() => setShowFoodLibrary(false)} />;
      if (formModalOpen) return (
        <Screen scroll keyboard maxWidth="dashboard" contentContainerStyle={{ gap: 24, paddingBottom: 48 }}>
          <View style={{ gap: 12 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to diet plans" onPress={() => { setFormModalOpen(false); setEditRecordId(null); }} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 17 }}>Diet plans</Text>
            </Pressable>
            <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.7 }}>{editRecordId ? "Edit diet plan" : "Create diet plan"}</Text>
            <Text style={{ color: colors.muted, fontSize: 17, lineHeight: 24 }}>A daily plan, tailored to your client.</Text>
          </View>
              <ResourceCrudPanel
                config={dietPlanConfig}
                formOnly
                createRequest={createRequest}
                editRecordId={editRecordId}
                onEditRecordOpened={() => undefined}
                onFormClosed={() => { setFormModalOpen(false); setEditRecordId(null); }}
                onRecordSaved={(plan) => {
                  setSearch("");
                  setCategory(planCategory(plan));
                  setActiveOnly(false);
                  setPage(0);
                }}
              />
        </Screen>
      );
      return ((
    <Screen scroll reference={false} contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
      <View style={{ gap: 4 }}><Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 34, lineHeight: 41, fontWeight: "700" }}>Nutrition</Text><Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>Plans tailored to your clients.</Text></View>
      <View style={modern.switcher}><Pressable accessibilityRole="button" onPress={() => setShowFoodLibrary(true)} style={[modern.switch, { backgroundColor: colors.surface }]}><Text style={{ color: colors.muted, fontSize: 15 }}>Food library</Text></Pressable><View style={[modern.switch, { backgroundColor: colors.surfaceStrong }]}><Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>Created plans</Text></View></View>
      <View style={[modern.summary, { backgroundColor: colors.surface }]}>{[["Plans", plans.length], ["Active", activePlans.length], ["Clients", assignedClients]].map(([label, count]) => <View key={label} style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.ink, fontSize: 26, fontWeight: "600" }}>{listQuery.isLoading || listQuery.error ? "--" : count}</Text><Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text></View>)}</View>
      <Pressable accessibilityRole="button" onPress={() => { setEditRecordId(null); setFormModalOpen(true); setCreateRequest(value => value + 1); }} style={({ pressed }) => [modern.create, { backgroundColor: colors.primaryButton, opacity: pressed ? 0.65 : 1 }]}><Ionicons name="add" size={21} color={colors.white} /><Text style={{ color: colors.white, fontSize: 17, fontWeight: "600" }}>Create plan</Text></Pressable>
      <View style={[modern.search, { backgroundColor: colors.surface }]}><Ionicons name="search" size={19} color={colors.muted} /><TextInput accessibilityLabel="Search created diet plans" value={search} onChangeText={value => { setSearch(value); setPage(0); }} placeholder="Search plans or clients" placeholderTextColor={colors.muted} style={{ color: colors.ink, fontSize: 17, flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 10 }} />{search ? <Pressable accessibilityRole="button" accessibilityLabel="Clear plan search" onPress={() => { setSearch(""); setPage(0); }} style={modern.iconButton}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable> : null}</View>
      <View style={modern.filterRow}><Pressable accessibilityRole="button" accessibilityState={{ selected: activeOnly }} onPress={() => { setActiveOnly(value => !value); setPage(0); }} style={modern.filter}><Ionicons name={activeOnly ? "checkmark-circle" : "ellipse-outline"} size={18} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 14 }}>{activeOnly ? "Active only" : "All statuses"}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { setAscending(value => !value); setPage(0); }} style={modern.filter}><Ionicons name="swap-vertical" size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 14 }}>{ascending ? "A to Z" : "Z to A"}</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{categories.map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: category === item }} key={item} onPress={() => { setCategory(item); setPage(0); }} style={{ minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, justifyContent: "center", backgroundColor: category === item ? colors.surfaceStrong : colors.surface }}><Text style={{ color: category === item ? colors.ink : colors.muted, fontSize: 13, fontWeight: category === item ? "600" : "400" }}>{item}</Text></Pressable>)}</ScrollView>
      {listQuery.isLoading ? <ActivityIndicator accessibilityLabel="Loading plans" color={colors.primary} /> : listQuery.error ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{getApiErrorMessage(listQuery.error)}</Text> : visiblePlans.length ? <View style={{ backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16 }}>{visiblePlans.map(plan => <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${plan.title}`} key={plan.id} onPress={() => { setEditRecordId(plan.id); setFormModalOpen(true); }} style={({ pressed }) => ({ paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.6 : 1 })}><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "600" }}>{plan.title}</Text><Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{plan.member_name ?? "Unassigned"} / {plan.calories_per_day} kcal</Text><Text style={{ color: plan.is_active ? colors.success : colors.muted, fontSize: 12 }}>{planCategory(plan)} / {plan.is_active ? "Active" : "Draft"}</Text></View><Ionicons name="chevron-forward" size={17} color={colors.muted} /></Pressable>)}</View> : <View style={{ paddingVertical: 24, gap: 8, alignItems: "center" }}><Ionicons name="leaf-outline" size={30} color={colors.primary} /><Text style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>{plans.length ? "No matching plans" : "Start with a plan"}</Text><Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" }}>{plans.length ? "Try another search or change the filters." : "Create a nutrition plan and assign it to a client."}</Text></View>}



      {pageCount > 1 ? <View style={modern.filterRow}><Pressable accessibilityRole="button" accessibilityState={{ disabled: safePage === 0 }} disabled={safePage === 0} onPress={() => setPage(value => Math.max(0, value - 1))} style={modern.filter}><Text style={{ color: safePage === 0 ? colors.muted : colors.primary }}>Previous</Text></Pressable><Text style={{ color: colors.muted, fontSize: 13 }}>Page {safePage + 1} of {pageCount}</Text><Pressable accessibilityRole="button" accessibilityState={{ disabled: safePage >= pageCount - 1 }} disabled={safePage >= pageCount - 1} onPress={() => setPage(value => Math.min(pageCount - 1, value + 1))} style={modern.filter}><Text style={{ color: safePage >= pageCount - 1 ? colors.muted : colors.primary }}>Next</Text></Pressable></View> : null}
    </Screen>
  ));
    }
  }
}

export function StatView({ model }: { model: ReturnType<typeof useStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, tone, icon, value, label, note } = model.props;
      return (<View style={shared.stat}><View style={[shared.statIcon, { backgroundColor: `${tone}26` }]}><Ionicons name={icon} size={27} color={tone} /></View><View><Text style={shared.statValue}>{value}</Text><Text style={shared.statLabel}>{label}</Text><Text style={shared.statNote}>{note}</Text></View></View>);
    }
  }
}

export function PlanCardView({ model }: { model: ReturnType<typeof usePlanCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { shared, dietImage, index, plan, onEdit, planCategory, mealCount } = model.props;
      return (<View style={shared.card}><View style={shared.imageWrap}><Image source={dietImage} style={[shared.cardImage, { transform: [{ scale: 1.05 + (index % 3) * 0.08 }] }]} resizeMode="cover" /><View style={[shared.status, { backgroundColor: plan.is_active ? "#14532D" : "#334155" }]}><Text style={[shared.statusText, { color: plan.is_active ? "#86EFAC" : "#E2E8F0" }]}>{plan.is_active ? "Active" : "Draft"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="More options" onPress={onEdit} style={shared.more}><Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" /></Pressable></View><View style={shared.cardBody}><View style={shared.cardTitleRow}><Text numberOfLines={1} style={shared.cardTitle}>{plan.title}</Text><Ionicons name="star-outline" size={22} color="#C4D0E0" /></View><Text style={shared.category}>{planCategory(plan)}</Text><Text numberOfLines={2} style={shared.description}>{plan.member_name ? `Assigned to ${plan.member_name}` : "Balanced nutrition plan ready for client assignment."}</Text><View style={shared.cardMeta}><View style={shared.metaItem}><Ionicons name="flame" size={16} color="#0A84FF" /><Text style={shared.metaText}>{plan.calories_per_day.toLocaleString()} kcal</Text></View><View style={shared.metaItem}><Ionicons name="calendar" size={15} color="#0A84FF" /><Text style={shared.metaText}>{mealCount} meals</Text></View></View><View style={shared.assignee}><View style={shared.miniAvatar}><Text style={shared.miniAvatarText}>{(plan.member_name ?? "U").charAt(0).toUpperCase()}</Text></View><Text style={shared.assigneeText}>{plan.member_name ?? "Unassigned"}</Text></View></View></View>);
    }
  }
}

const modern = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 4 },
  switch: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, padding: 8 },
  summary: { flexDirection: "row", padding: 16, gap: 12, borderRadius: 14 },
  create: { minHeight: 50, borderRadius: 12, padding: 12, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12, paddingRight: 4, borderRadius: 12 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  filterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  filter: { flexDirection: "row", gap: 6, alignItems: "center", minHeight: 44 }
});
