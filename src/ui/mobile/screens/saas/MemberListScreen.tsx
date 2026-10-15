import { Pressable } from "../../components/NativePressable";
import { pulseEffects } from "../../theme/referenceTokens";
import { useState } from "react";
import { isExpiringMember } from "../../data/referenceMetrics";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PulseAvatar, PulseChips, pulseStyles } from "../../components/PulseReference";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Gym, ManagedUserRole, Member, UserStatus } from "../../../../types/saas";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatDate, initials, memberStatusTone } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useMemberListScreenPresentation, usePlatformUserDirectoryPresentation, usePlatformUserRowPresentation, usePlatformStatPresentation, useUserDetailsModalPresentation, useFormFieldPresentation, usePlatformDetailPresentation, useMemberRowPresentation, useMemberStatPresentation } from "../../../../screens/saas/MemberListScreen";

type MemberFilter = "all" | "active" | "inactive" | "expired" | "frozen";

export function MemberListScreenView({ model }: { model: ReturnType<typeof useMemberListScreenPresentation> }): React.ReactNode {
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { PlatformUserDirectory } = model.props;
      return (<PlatformUserDirectory />);
    }
    case "view3": {
      const { styles, compact, membersQuery, isTrainer, colors, setSearch, setPage, search, setMemberFilter, memberFilter, canManageMembers, navigation, MemberStat, activeCount, newThisMonthCount, expiredCount, setSortDirection, sortDirection, notice, deleteMember, visibleMembers, MemberRow, confirmDelete, page } = model.props;
      const ps = pulseStyles(colors);
      const displayedMembers = expiringOnly ? visibleMembers.filter(isExpiringMember) : visibleMembers;
      const selectedChip = expiringOnly ? "Expiring" : memberFilter === "active" ? "Active" : memberFilter === "inactive" ? "Inactive" : "All";
      return ((
    <Screen reference
      scroll
      contentContainerStyle={[styles.screen, compact && styles.screenCompact]}
      refreshControl={
        <RefreshControl
          refreshing={membersQuery.isFetching}
          onRefresh={() => membersQuery.refetch()}
        />
      }
    >
      <ScreenHeader title="Members" actionIcon={canManageMembers ? "person-add-outline" : undefined} actionLabel="Add member" onAction={canManageMembers ? () => navigation.navigate("AddMember") : undefined} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={[styles.toolbarSearch, { flex: 1, width: undefined, minHeight: 44 }]}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput autoCapitalize="none" maxLength={120} onChangeText={value => { setSearch(value); setPage(0); }} placeholder="Search members..." placeholderTextColor={colors.subtle} style={[styles.searchInput, { fontSize: 14, minHeight: 44 }]} accessibilityLabel="Search members" value={search} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Member filters and sorting" onPress={() => setFiltersOpen(true)} style={ps.iconButton}><Ionicons name="filter" size={20} color={colors.ink} /></Pressable>
      </View>
      <PulseChips options={["All", "Active", "Inactive", "Expiring"]} value={selectedChip} onChange={value => { setExpiringOnly(value === "Expiring"); setMemberFilter(value === "Active" ? "active" : value === "Inactive" ? "inactive" : "all"); setPage(0); }} />
      <Modal visible={filtersOpen} transparent animationType="none" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close member filters" onPress={() => setFiltersOpen(false)} style={{ flex: 1, backgroundColor: pulseEffects.scrim, justifyContent: "center", padding: 20 }}>
          <Pressable accessible={false} onPress={event => event.stopPropagation()} style={[ps.card, { gap: 16 }]}>
            <Text style={[ps.name, { fontSize: 20 }]}>Member filters</Text>
            <PulseChips options={["All", "Active", "Inactive", "Expired", "Frozen"]} value={memberFilter[0].toUpperCase() + memberFilter.slice(1)} onChange={value => { setExpiringOnly(false); setMemberFilter(value.toLowerCase() as MemberFilter); setPage(0); setFiltersOpen(false); }} />
            <PrimaryButton title={`Sort: ${sortDirection === "az" ? "A-Z" : "Z-A"}`} variant="secondary" onPress={() => setSortDirection(value => value === "az" ? "za" : "az")} />
            <PrimaryButton title="Export members" variant="secondary" onPress={() => showAlert("Export members", "Member export is ready to connect to your backend export endpoint.")} />
            <PrimaryButton title="Done" onPress={() => setFiltersOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
      <View style={{ gap: 0 }}>
      {!compact ? (
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, styles.memberColumn]}>Member</Text>
          <Text style={styles.columnHeader}>Contact</Text>
          <Text style={styles.columnHeader}>Plan</Text>
          <Text style={styles.columnHeader}>Trainer</Text>
          <Text style={styles.columnHeader}>Status</Text>
          <Text style={styles.columnHeader}>Join Date</Text>
          <Text style={styles.columnHeader}>Expiry Date</Text>
          <Text style={[styles.columnHeader, styles.actionColumn]}>Action</Text>
        </View>
      ) : null}
      <NoticeBanner message={notice} />
      <NoticeBanner
        message={
          deleteMember.error ? getApiErrorMessage(deleteMember.error) : null
        }
        tone="error"
      />

      <DataState
        loading={membersQuery.isLoading}
        error={
          membersQuery.error ? getApiErrorMessage(membersQuery.error) : null
        }
        empty={!membersQuery.isLoading && displayedMembers.length === 0}
        emptyTitle={search || expiringOnly || memberFilter !== "all" ? "No members match" : "No members found"}
        emptyMessage={
          search || expiringOnly || memberFilter !== "all"
            ? "Clear the search or filters to see more members."
            : isTrainer
              ? "No members are currently assigned to you."
              : "Add your first member to start managing this gym."
        }
        emptyActionLabel={
          search || expiringOnly || memberFilter !== "all" ? "Clear Filters" : canManageMembers ? "Add Member" : undefined
        }
        onEmptyAction={
          search || expiringOnly || memberFilter !== "all"
            ? () => { setSearch(""); setExpiringOnly(false); setMemberFilter("all"); setPage(0); }
            : canManageMembers
              ? () => navigation.navigate("AddMember")
              : undefined
        }
      />

      {displayedMembers.length > 0 ? (
        <FlatList
          data={displayedMembers}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <MemberRow
              member={item}
              compact={compact}
              isDeleting={deleteMember.isPending}
              onView={() =>
                navigation.navigate("MemberProfile", { memberId: item.id })
              }
              onEdit={
                canManageMembers
                  ? () =>
                      navigation.navigate("EditMember", { memberId: item.id })
                  : undefined
              }
              onDelete={
                canManageMembers ? () => confirmDelete(item) : undefined
              }
            />
          )}
          scrollEnabled={false}
        />
      ) : null}

      <View style={[styles.pagination, compact && styles.paginationCompact]}>
        <PrimaryButton
          disabled={page === 0 || membersQuery.isFetching}
          onPress={() => setPage((value) => Math.max(0, value - 1))}
          title="Previous"
          variant="secondary"
          style={styles.pageButton}
        />
        <Text style={styles.pageLabel}>Page {page + 1}</Text>
        <PrimaryButton
          disabled={
            (membersQuery.data?.length ?? 0) < 50 || membersQuery.isFetching
          }
          onPress={() => setPage((value) => value + 1)}
          title="Next"
          variant="secondary"
          style={styles.pageButton}
        />
      </View>
      </View>
    </Screen>
  ));
    }
  }
}

export function PlatformUserDirectoryView({ model }: { model: ReturnType<typeof usePlatformUserDirectoryPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, setSearch, search, setFilter, navigation, PlatformStat, users, roleCount, filter, usersQuery, visibleUsers, PlatformUserRow, setSelectedUser, openEditor, UserDetailsModal, selectedUser, editingUser, draft, setDraft, gymsQuery, updateUser, setEditingUser, saveUser , activeUserCount, inactiveUserCount } = model.props;
      return ((
    <Screen reference scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}><View><Text style={styles.title}>Members</Text><Text style={styles.subtitle}>Manage all users across the PulseFit platform</Text></View><View style={styles.headerActions}><View style={styles.search}><Ionicons name="search-outline" size={19} color={colors.muted} /><TextInput autoCapitalize="none" onChangeText={setSearch} placeholder="Search member..." placeholderTextColor={colors.subtle} style={styles.searchInput} value={search} /></View><Pressable accessibilityRole="button" style={styles.headerButton} onPress={() => setFilter((value) => value === "all" ? "member" : value === "member" ? "trainer" : value === "trainer" ? "receptionist" : value === "receptionist" ? "sub_admin" : "all")}><Ionicons name="funnel-outline" size={17} color={colors.ink} /><Text style={styles.headerButtonText}>Filters</Text></Pressable><Pressable accessibilityRole="button" style={styles.headerButton} onPress={() => showAlert("Export users", "User export is ready to connect to your backend export endpoint.")}><Ionicons name="download-outline" size={17} color={colors.ink} /><Text style={styles.headerButtonText}>Export</Text></Pressable><PrimaryButton title="Add Member" onPress={() => navigation.navigate("AddMember")} style={styles.addButton} /></View></View>
      <View style={styles.stats}><PlatformStat icon="people" label="Total Users" value={String(users.length)} tone="#0A84FF" styles={styles} /><PlatformStat icon="checkmark-circle" label="Active Users" value={String(activeUserCount)} tone="#16C784" styles={styles} /><PlatformStat icon="person" label="Members" value={String(roleCount("member"))} tone="#3B82F6" styles={styles} /><PlatformStat icon="time" label="Inactive Users" value={String(inactiveUserCount)} tone="#F59E0B" styles={styles} /></View>
      <View style={styles.tableCard}><View style={styles.filterBar}><View style={styles.filterTabs}>{([["all", "All Users"], ["member", "Members"], ["trainer", "Trainers"], ["receptionist", "Reception"], ["sub_admin", "Sub Admins"]] as const).map(([value, label]) => <Pressable accessibilityRole="button" key={value} style={[styles.filterTab, filter === value && styles.filterTabActive]} onPress={() => setFilter(value)}><Text style={[styles.filterTabText, filter === value && styles.filterTabTextActive]}>{label}</Text></Pressable>)}</View><Text style={styles.loadedLabel}>{users.length} loaded · 20 per batch</Text></View><View style={styles.tableHeader}><Text style={[styles.columnHeader, styles.memberColumn]}>User</Text><Text style={styles.columnHeader}>Contact</Text><Text style={styles.columnHeader}>Gym</Text><Text style={styles.columnHeader}>Role</Text><Text style={styles.columnHeader}>Status</Text><Text style={styles.columnHeader}>Action</Text></View>{usersQuery.isLoading ? <Text style={styles.muted}>Loading users...</Text> : visibleUsers.map((user) => <PlatformUserRow key={user.id} user={user} styles={styles} colors={colors} onPress={() => setSelectedUser(user)} onEdit={() => openEditor(user)} />)}{usersQuery.error ? <Text style={styles.error}>{getApiErrorMessage(usersQuery.error)}</Text> : null}{!usersQuery.isLoading && visibleUsers.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="file-tray-outline" size={28} color={colors.primaryDark} /></View><Text style={styles.emptyTitle}>No users found</Text><Text style={styles.muted}>Try another search or load the next users.</Text></View> : null}<View style={styles.pagination}><PrimaryButton title="Previous" variant="secondary" disabled={true} style={styles.pageButton} /><Text style={styles.pageLabel}>Loaded {users.length}</Text><PrimaryButton title={usersQuery.hasNextPage ? "Load next 20" : "All loaded"} icon={usersQuery.hasNextPage ? "arrow-down-outline" : undefined} loading={usersQuery.isFetchingNextPage} disabled={!usersQuery.hasNextPage} onPress={() => usersQuery.fetchNextPage()} style={styles.pageButton} /></View></View>
      <UserDetailsModal user={selectedUser} editingUser={editingUser} draft={draft} setDraft={setDraft} gyms={gymsQuery.data ?? []} saving={updateUser.isPending} error={updateUser.error ? getApiErrorMessage(updateUser.error) : null} onClose={() => { setSelectedUser(null); setEditingUser(null); }} onEdit={() => selectedUser && openEditor(selectedUser)} onSave={saveUser} />
    </Screen>
  ));
    }
  }
}

export function PlatformUserRowView({ model }: { model: ReturnType<typeof usePlatformUserRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, user, onEdit, colors } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.userRow, pressed && styles.rowPressed]}><View style={styles.userCell}><View style={styles.avatar}><Text style={styles.avatarText}>{(user.full_name || user.name).slice(0, 1).toUpperCase()}</Text></View><Text style={styles.userName} numberOfLines={1}>{user.full_name || user.name}</Text></View><Text style={styles.tableCell} numberOfLines={1}>{user.email}</Text><Text style={styles.tableCell} numberOfLines={1}>{user.gym_name || "Platform"}</Text><View style={styles.tableCell}><StatusBadge label={user.role.replace("_", " ")} tone={user.role === "member" ? "success" : "info"} /></View><View style={styles.tableCell}><StatusBadge label={user.status} tone={user.status === "active" ? "success" : "warning"} /></View><Pressable accessibilityRole="button" style={styles.actionCell} onPress={(event) => { event.stopPropagation(); onEdit(); }} accessibilityLabel={"Edit record"}><Ionicons name="create-outline" size={19} color={colors.ink} /></Pressable></Pressable>);
    }
  }
}

export function PlatformStatView({ model }: { model: ReturnType<typeof usePlatformStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (<View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: `${tone}22` }]}><Ionicons name={icon} size={22} color={tone} /></View><View style={{ minWidth: 0, gap: 2 }}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.liveText}>↑ Live data</Text></View></View>);
    }
  }
}

export function UserDetailsModalView({ model }: { model: ReturnType<typeof useUserDetailsModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { user, onClose, styles, editingUser, colors, FormField, draft, setDraft, gyms, error, saving, onSave, PlatformDetail, onEdit } = model.props;
      return (<Modal visible={Boolean(user)} transparent animationType="fade" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{editingUser ? "Edit user" : "User details"}</Text><Text style={styles.modalSubtitle}>{user?.email}</Text></View><Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="close" size={23} color={colors.ink} /></Pressable></View>{editingUser ? <><FormField label="Full name" value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} styles={styles} /><FormField label="Email" value={draft.email} onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))} styles={styles} /><FormField label="Phone" value={draft.phone} onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))} styles={styles} /><FormField label="New password (optional)" value={draft.password} onChangeText={(value) => setDraft((current) => ({ ...current, password: value }))} secureTextEntry styles={styles} /><Text style={styles.modalLabel}>Role</Text><View style={styles.modalOptions}>{(["member", "trainer", "receptionist", "sub_admin"] as ManagedUserRole[]).map((role) => <Pressable accessibilityRole="button" key={role} onPress={() => setDraft((current) => ({ ...current, role }))} style={[styles.modalOption, draft.role === role && styles.modalOptionActive]}><Text style={[styles.modalOptionText, draft.role === role && styles.modalOptionTextActive]}>{role.replace("_", " ")}</Text></Pressable>)}</View><Text style={styles.modalLabel}>Status</Text><View style={styles.modalOptions}>{(["active", "inactive"] as UserStatus[]).map((status) => <Pressable accessibilityRole="button" key={status} onPress={() => setDraft((current) => ({ ...current, status }))} style={[styles.modalOption, draft.status === status && styles.modalOptionActive]}><Text style={[styles.modalOptionText, draft.status === status && styles.modalOptionTextActive]}>{status}</Text></Pressable>)}</View><Text style={styles.modalLabel}>Gym assignment</Text><View style={styles.modalOptions}>{gyms.map((gym) => <Pressable accessibilityRole="button" key={gym.id} onPress={() => setDraft((current) => ({ ...current, gym_id: gym.id }))} style={[styles.modalOption, draft.gym_id === gym.id && styles.modalOptionActive]}><Text style={[styles.modalOptionText, draft.gym_id === gym.id && styles.modalOptionTextActive]}>{gym.name}</Text></Pressable>)}</View>{error ? <Text style={styles.error}>{error}</Text> : null}<View style={styles.modalActions}><PrimaryButton title="Cancel" variant="secondary" onPress={onClose} style={styles.modalButton} /><PrimaryButton title="Save changes" loading={saving} onPress={onSave} style={styles.modalButton} /></View></> : user ? <><View style={styles.detailList}><PlatformDetail label="Full name" value={user.full_name || user.name} styles={styles} /><PlatformDetail label="Email" value={user.email} styles={styles} /><PlatformDetail label="Phone" value={user.phone || "Not provided"} styles={styles} /><PlatformDetail label="Role" value={user.role.replace("_", " ")} styles={styles} /><PlatformDetail label="Status" value={user.status} styles={styles} /><PlatformDetail label="Gym" value={user.gym_name || "Not assigned"} styles={styles} /><PlatformDetail label="Joined" value={new Date(user.created_at).toLocaleString()} styles={styles} /><PlatformDetail label="User ID" value={user.id} styles={styles} /></View><PrimaryButton title="Edit all information" icon="create-outline" onPress={onEdit} /></> : null}</View></View></Modal>);
    }
  }
}

export function FormFieldView({ model }: { model: ReturnType<typeof useFormFieldPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value, onChangeText, secureTextEntry } = model.props;
      return (<View style={styles.modalField}><Text style={styles.modalLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} placeholder={label} placeholderTextColor="#9A9381" style={styles.modalInput} /></View>);
    }
  }
}

export function PlatformDetailView({ model }: { model: ReturnType<typeof usePlatformDetailPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value } = model.props;
      return (<View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>);
    }
  }
}

export function MemberRowView({ model }: { model: ReturnType<typeof useMemberRowPresentation> }): React.ReactNode {
  const [expanded, setExpanded] = useState(false);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, fullName, onView, member, membership, colors, onEdit, onDelete, isDeleting } = model.props;
      const ps = pulseStyles(colors);
      return ((
    <View>
      <View style={ps.row}>
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${fullName}`} onPress={onView} onLongPress={() => setExpanded(value => !value)} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", flex: 1, minHeight: 68, gap: 12 }, pressed && { opacity: 0.65 }]}>
          <PulseAvatar name={fullName} uri={typeof member.extra_data?.profile_photo === "string" ? member.extra_data.profile_photo : undefined} />
          <View style={ps.copy}><Text style={ps.name}>{fullName}</Text><Text style={ps.meta}>{relatedDisplayName(member.membership_plan_name, "No plan assigned")}</Text></View>
          <StatusBadge label={member.status.charAt(0).toUpperCase() + member.status.slice(1)} tone={memberStatusTone(member.status)} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Manage ${fullName}`} accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={{ minHeight: 48, minWidth: 44, alignItems: "center", justifyContent: "center" }}><Ionicons name={expanded ? "chevron-down" : "chevron-forward"} size={16} color={colors.muted} /></Pressable>
      </View>
      {expanded && <View style={{ gap: 10 }}>
      <View style={{ gap: 6 }}>
        <Text style={styles.cellText}>{member.phone || "No phone"}</Text>
        <Text style={styles.memberMeta}>{member.email || "No email"}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <View style={{ flexGrow: 1, flexBasis: "45%", gap: 4 }}><Text style={styles.memberMeta}>Membership</Text><Text style={styles.cellText}>{relatedDisplayName(member.membership_plan_name, "Not assigned")}</Text></View>
        <View style={{ flexGrow: 1, flexBasis: "45%", gap: 4 }}><Text style={styles.memberMeta}>Trainer</Text><Text style={styles.cellText}>{relatedDisplayName(member.trainer_name, "Not assigned")}</Text></View>
        <View style={{ flexGrow: 1, flexBasis: "45%", gap: 4 }}><Text style={styles.memberMeta}>Joined</Text><Text style={styles.cellText}>{formatDate(member.joined_at)}</Text></View>
        <View style={{ flexGrow: 1, flexBasis: "45%", gap: 4 }}><Text style={styles.memberMeta}>Expires</Text><Text style={styles.cellText}>{formatDate(member.membership_ends_at)}</Text><Text style={[styles.memberMeta, membership.tone === "danger" && styles.expiredText]}>{membership.label}</Text></View>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${fullName}`} onPress={onView} style={styles.iconButton}><Ionicons name="eye-outline" size={20} color={colors.primary} /></Pressable>
        {onEdit ? <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${fullName}`} onPress={onEdit} style={styles.iconButton}><Ionicons name="create-outline" size={20} color={colors.primary} /></Pressable> : null}
        {onDelete ? <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${fullName}`} accessibilityState={{ disabled: isDeleting }} disabled={isDeleting} onPress={onDelete} style={styles.iconButton}><Ionicons name="trash-outline" size={20} color={colors.danger} /></Pressable> : null}
      </View>
      </View>}
    </View>
  ));
    }
  }
}

export function MemberStatView({ model }: { model: ReturnType<typeof useMemberStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (<View style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: `${tone}33` }]}><Ionicons name={icon} size={23} color={tone} /></View><View style={{ minWidth: 0, gap: 2 }}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statTrend}>↑ Live data</Text></View></View>);
    }
  }
}
