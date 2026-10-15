import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Trainer } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useTrainersScreenPresentation, useStatPresentation, useTrainerRowPresentation } from "../../../../screens/saas/TrainersScreen";

type TrainerFilter = "all" | "active" | "inactive";

export function TrainersScreenView({ model }: { model: ReturnType<typeof useTrainersScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, resource, colors, search, setSearch, setPage, setFilter, filter, openCreate, Stat, trainers, visible, TrainerRow, openEdit, remove, page, formOpen, setFormOpen, editing, name, setName, email, setEmail, phone, setPhone, specialties, setSpecialties, save , activeTrainerCount, inactiveTrainerCount, newTrainerCount } = model.props;
      return (<Screen scroll contentContainerStyle={styles.screen} refreshControl={<RefreshControl refreshing={resource.listQuery.isFetching} onRefresh={() => resource.listQuery.refetch()} />}>
    <View style={styles.pageHeader}><View><Text style={styles.title}>Trainers</Text><Text style={styles.subtitle}>Manage your gym trainers, specialties, and assigned members.</Text></View><View style={styles.headerActions}><View style={styles.searchBox}><Ionicons name="search-outline" size={19} color={colors.muted} /><TextInput value={search} onChangeText={(value) => { setSearch(value); setPage(0); }} placeholder="Search trainers..." placeholderTextColor={colors.subtle} style={styles.searchInput} /></View><Pressable accessibilityRole="button" style={styles.outlineButton} onPress={() => setFilter((value) => value === "all" ? "active" : value === "active" ? "inactive" : "all")}><Ionicons name="funnel-outline" size={17} color={colors.ink} /><Text style={styles.buttonText}>Filter{filter !== "all" ? `: ${filter}` : ""}</Text></Pressable><PrimaryButton title="Add Trainer" onPress={openCreate} style={styles.addButton} /></View></View>
    <View style={styles.statsGrid}><Stat icon="people" label="Total Trainers" value={String(trainers.length)} tone="#0A84FF" styles={styles} /><Stat icon="person" label="Active Trainers" value={String(activeTrainerCount)} tone="#16C784" styles={styles} /><Stat icon="person-add" label="New This Month" value={String(newTrainerCount)} tone="#3B82F6" styles={styles} /><Stat icon="time" label="Inactive / Expired" value={String(inactiveTrainerCount)} tone="#F59E0B" styles={styles} /></View>
    <View style={styles.tableCard}><View style={styles.filterBar}><View style={styles.tabs}>{(["all", "active", "inactive"] as TrainerFilter[]).map((value) => <Pressable accessibilityRole="button" key={value} onPress={() => setFilter(value)} style={[styles.tab, filter === value && styles.tabActive]}><Text style={[styles.tabText, filter === value && styles.tabTextActive]}>{value === "all" ? `All Trainers  ${trainers.length}` : value[0].toUpperCase() + value.slice(1)}</Text></Pressable>)}</View><View style={styles.sortBox}><Text style={styles.buttonText}>Sort by: Newest</Text><Ionicons name="chevron-down" size={14} color={colors.muted} /></View></View><View style={styles.tableHeader}><Text style={[styles.columnHeader, styles.trainerCol]}>Trainer</Text><Text style={styles.columnHeader}>Contact</Text><Text style={styles.columnHeader}>Specializations</Text><Text style={styles.columnHeader}>Rating</Text><Text style={styles.columnHeader}>Assigned Members</Text><Text style={styles.columnHeader}>Status</Text><Text style={styles.columnHeader}>Join Date</Text><Text style={styles.columnHeader}>Action</Text></View><DataState loading={resource.listQuery.isLoading} error={resource.listQuery.error ? getApiErrorMessage(resource.listQuery.error) : null} empty={!resource.listQuery.isLoading && visible.length === 0} emptyTitle="No trainers found" emptyMessage="Add a trainer to start managing your gym team." emptyActionLabel="Add Trainer" onEmptyAction={openCreate} />{visible.length > 0 ? <FlatList data={visible} keyExtractor={(item) => item.id} scrollEnabled={false} ItemSeparatorComponent={() => <View style={styles.separator} />} renderItem={({ item }) => <TrainerRow trainer={item} styles={styles} colors={colors} onEdit={() => openEdit(item)} onDelete={() => remove(item)} />} /> : null}<View style={styles.pagination}><Text style={styles.paginationText}>Showing {visible.length} of {trainers.length} trainers</Text><View style={styles.paginationActions}><Pressable accessibilityRole="button" accessibilityLabel="Previous" disabled={page === 0} onPress={() => setPage((value) => Math.max(0, value - 1))} style={styles.pageButton} accessibilityState={{ disabled: page === 0 }}><Ionicons name="chevron-back" size={16} color={colors.ink} /></Pressable><Text style={styles.pageNumber}>{page + 1}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next" disabled={trainers.length < 50} onPress={() => setPage((value) => value + 1)} style={styles.pageButton} accessibilityState={{ disabled: trainers.length < 50 }}><Ionicons name="chevron-forward" size={16} color={colors.ink} /></Pressable></View></View></View>
    <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => setFormOpen(false)}><Pressable accessibilityRole="button" style={styles.modalBackdrop} onPress={() => setFormOpen(false)}><Pressable accessibilityRole="button" style={styles.formCard} onPress={(event) => event.stopPropagation()} accessible={false} importantForAccessibility="no"><Text style={styles.formTitle}>{editing ? "Edit Trainer" : "Add Trainer"}</Text>{[[name, setName, "Full name"], [email, setEmail, "Email"], [phone, setPhone, "Phone"], [specialties, setSpecialties, "Specializations (comma separated)"]].map(([value, setter, placeholder]) => <TextInput key={placeholder as string} value={value as string} onChangeText={setter as (value: string) => void} placeholder={placeholder as string} placeholderTextColor={colors.subtle} style={styles.input} />)}<View style={styles.formActions}><PrimaryButton title={editing ? "Save Changes" : "Create Trainer"} onPress={save} loading={resource.createMutation.isPending || resource.updateMutation.isPending} /><PrimaryButton title="Cancel" variant="secondary" onPress={() => setFormOpen(false)} /></View></Pressable></Pressable></Modal>
  </Screen>);
    }
  }
}

export function StatView({ model }: { model: ReturnType<typeof useStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (<View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: `${tone}33` }]}><Ionicons name={icon} size={23} color={tone} /></View><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statTrend}>↑ Live data</Text></View></View>);
    }
  }
}

export function TrainerRowView({ model }: { model: ReturnType<typeof useTrainerRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, trainer, onEdit, colors, onDelete } = model.props;
      return (<View style={styles.row}><View style={[styles.trainerCell, styles.trainerCol]}><View style={styles.avatar}><Text style={styles.avatarText}>{trainer.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</Text></View><View style={styles.identity}><Text style={styles.name} numberOfLines={1}>{trainer.full_name}</Text><Text style={styles.meta} numberOfLines={1}>TRN-{trainer.id.slice(0, 5).toUpperCase()} · {trainer.specialties.length} specialties</Text></View></View><View style={styles.contactCell}><Text style={styles.cellText} numberOfLines={1}>{trainer.phone || "—"}</Text><Text style={styles.meta} numberOfLines={1}>{trainer.email || "No email"}</Text></View><View style={styles.specialtyCell}>{(trainer.specialties.length ? trainer.specialties : ["Not assigned"]).slice(0, 2).map((item) => <Text key={item} style={styles.specialtyTag}>{item}</Text>)}</View><View style={styles.ratingCell}><Text style={styles.stars}>★★★★★</Text><Text style={styles.cellText}>5.0</Text></View><View style={styles.assignedCell}><Text style={styles.cellText}>—</Text><View style={styles.progress}><View style={styles.progressFill} /></View></View><View style={styles.statusCell}><StatusBadge label={trainer.is_active ? "Active" : "Inactive"} tone={trainer.is_active ? "success" : "warning"} /></View><Text style={styles.dateCell}>{new Date(trainer.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</Text><View style={styles.actions}><Pressable accessibilityRole="button" style={styles.iconButton} onPress={onEdit} accessibilityLabel={"Edit record"}><Ionicons name="create-outline" size={18} color={colors.ink} /></Pressable><Pressable accessibilityRole="button" style={styles.iconButton} onPress={onDelete} accessibilityLabel={"Delete record"}><Ionicons name="ellipsis-vertical" size={18} color={colors.muted} /></Pressable></View></View>);
    }
  }
}
