import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../../../features/operations/ResourceCrudPanel";
import { dietPlanConfig } from "../../../../features/operations/resourceConfigs";
import { getApiErrorMessage } from "../../../../services/api/client";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useDietPlansScreenPresentation, useStatPresentation, usePlanCardPresentation } from "../../../../screens/saas/DietPlansScreen";

export function DietPlansScreenView({ model }: { model: ReturnType<typeof useDietPlansScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, colors, navigation, setEditRecordId, setFormModalOpen, setCreateRequest, Stat, plans, activePlans, assignedClients, averageCalories, search, setSearch, setPage, setActiveOnly, activeOnly, setAscending, ascending, categories, setCategory, category, listQuery, visiblePlans, PlanCard, formModalOpen, editRecordId, createRequest, planCategory, filteredPlans, safePage, pageSize, pageCount } = model.props;
      return ((
    <Screen scroll maxWidth="none" contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.headerCopy}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backIcon}><Ionicons name="arrow-back" size={22} color="#C4B5FD" /></Pressable><View><Text style={styles.title}>Diet Plans</Text><Text style={styles.subtitle}>Create and manage nutrition plans for your clients</Text></View></View>
        <View style={styles.headerActions}><Pressable accessibilityRole="button" onPress={() => showAlert("Import JSON", "JSON import is ready for file-picker integration.")} style={styles.importButton}><Ionicons name="share-outline" size={18} color="#FFFFFF" /><Text style={styles.importText}>Import JSON</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { setEditRecordId(null); setFormModalOpen(true); setCreateRequest((value) => value + 1); }} style={styles.createButton}><Ionicons name="add" size={20} color="#FFFFFF" /><Text style={styles.createText}>Create New Plan</Text></Pressable></View>
      </View>

      <View style={styles.statsGrid}>
        <Stat icon="clipboard-outline" tone="#0A84FF" value={String(plans.length)} label="Total Plans" note="All time" />
        <Stat icon="checkbox-outline" tone="#22C55E" value={String(activePlans.length)} label="Active Plans" note="Currently active" />
        <Stat icon="people" tone="#F59E0B" value={String(assignedClients)} label="Assigned Clients" note="Across all plans" />
        <Stat icon="flame" tone="#1685F8" value={averageCalories.toLocaleString()} label="Avg. Daily Calories" note="All plans average" />
      </View>

      <View style={styles.toolbar}>
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}><Ionicons name="search-outline" size={21} color={colors.muted} /><TextInput value={search} onChangeText={(value) => { setSearch(value); setPage(0); }} placeholder="Search diet plans by name, goal or client..." placeholderTextColor={colors.subtle} style={[styles.searchInput, { color: colors.ink }]} />{search ? <Pressable accessibilityRole="button" onPress={() => setSearch("")} accessibilityLabel={"Clear search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="close-circle" size={19} color={colors.muted} /></Pressable> : null}</View>
        <Pressable accessibilityRole="button" onPress={() => setActiveOnly((value) => !value)} style={[styles.filterButton, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}><View style={[styles.statusDot, { backgroundColor: activeOnly ? "#22C55E" : "#64748B" }]} /><Text style={[styles.filterText, { color: colors.inkSoft }]}>{activeOnly ? "Active" : "All Status"}</Text><Ionicons name="chevron-down" size={17} color={colors.muted} /></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setAscending((value) => !value)} style={[styles.filterButton, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}><Ionicons name="options-outline" size={18} color={colors.muted} /><Text style={[styles.filterText, { color: colors.inkSoft }]}>Sort: {ascending ? "A - Z" : "Z - A"}</Text><Ionicons name="chevron-down" size={17} color={colors.muted} /></Pressable>
      </View>

      <View style={styles.tabs}>{categories.map((item) => <Pressable accessibilityRole="button" key={item} onPress={() => { setCategory(item); setPage(0); }} style={[styles.tab, { backgroundColor: colors.surfaceElevated }, category === item && styles.tabActive]}><Text style={[styles.tabText, { color: colors.muted }, category === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View>

      {listQuery.isLoading ? <View style={styles.state}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.stateText}>Loading diet plans...</Text></View> : listQuery.error ? <View style={styles.state}><Ionicons name="alert-circle-outline" size={30} color="#EF4444" /><Text style={styles.stateText}>{getApiErrorMessage(listQuery.error)}</Text></View> : visiblePlans.length ? <View style={styles.cardGrid}>{visiblePlans.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} onEdit={() => { setEditRecordId(plan.id); setFormModalOpen(true); }} />)}</View> : <View style={styles.state}><Ionicons name="restaurant-outline" size={34} color="#0A84FF" /><Text style={styles.stateTitle}>No diet plans found</Text><Text style={styles.stateText}>Change the filters or create a new nutrition plan.</Text></View>}

      <Modal animationType="fade" transparent visible={formModalOpen} onRequestClose={() => setFormModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalWindow, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
              <View><Text style={[styles.modalTitle, { color: colors.ink }]}>{editRecordId ? "Edit Diet Plan" : "Create New Diet Plan"}</Text><Text style={[styles.modalSubtitle, { color: colors.muted }]}>Build and assign a nutrition plan</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close diet plan window" onPress={() => setFormModalOpen(false)} style={styles.modalClose}><Ionicons name="close" size={22} color="#FFFFFF" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator>
              {formModalOpen ? <ResourceCrudPanel
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
              /> : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}><Text style={styles.footerText}>{filteredPlans.length ? `Showing ${safePage * pageSize + 1} to ${Math.min((safePage + 1) * pageSize, filteredPlans.length)} of ${filteredPlans.length} plans` : "Showing 0 plans"}</Text><View style={styles.pagination}><Pressable accessibilityRole="button" accessibilityLabel="Previous" disabled={safePage === 0} onPress={() => setPage((value) => Math.max(0, value - 1))} style={[styles.pageButton, safePage === 0 && styles.disabled]} accessibilityState={{ disabled: safePage === 0 }}><Ionicons name="chevron-back" size={18} color="#B8C6D9" /></Pressable>{Array.from({ length: Math.min(3, pageCount) }, (_, index) => index).map((number) => <Pressable accessibilityRole="button" key={number} onPress={() => setPage(number)} style={[styles.pageButton, safePage === number && styles.pageButtonActive]}><Text style={[styles.pageText, safePage === number && styles.pageTextActive]}>{number + 1}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel="Next" disabled={safePage >= pageCount - 1} onPress={() => setPage((value) => Math.min(pageCount - 1, value + 1))} style={[styles.pageButton, safePage >= pageCount - 1 && styles.disabled]} accessibilityState={{ disabled: safePage >= pageCount - 1 }}><Ionicons name="chevron-forward" size={18} color="#B8C6D9" /></Pressable></View><View style={styles.perPage}><Text style={styles.filterText}>5 / page</Text><Ionicons name="chevron-down" size={17} color="#B8C6D9" /></View></View>
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
