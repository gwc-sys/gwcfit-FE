import { Pressable } from "../../components/NativePressable";
import { pulseEffects } from "../../theme/referenceTokens";
import { useState } from "react";
import { isExpiringMember } from "../../data/referenceMetrics";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PulseAvatar, PulseChips, pulseStyles } from "../../components/PulseReference";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
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
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { createReferenceMemberListStyles } from "../../styles/screens/saas/MemberListScreen.styles";
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
      const { ConnectedGyms } = model.props;
      return (<ConnectedGyms />);
    }
    case "view3": {
      const { styles, compact, membersQuery, isTrainer, colors, setSearch, setPage, search, setMemberFilter, memberFilter, canManageMembers, navigation, MemberStat, activeCount, newThisMonthCount, expiredCount, setSortDirection, sortDirection, notice, deleteMember, visibleMembers, MemberRow, confirmDelete, page, pendingClaimsCount = 0 } = model.props;
      const { isSmallPhone, isLargeFont } = useResponsiveLayout();
      const ps = pulseStyles(colors);
      const s = createReferenceMemberListStyles(colors);
      const displayedMembers = expiringOnly ? visibleMembers.filter(isExpiringMember) : visibleMembers;
      const selectedChip = expiringOnly ? "Expiring" : memberFilter === "active" ? "Active" : memberFilter === "inactive" ? "Inactive" : "All";
      const totalMembersCount = membersQuery.data?.length ?? 0;
      const activeMembersCount = activeCount ?? 0;
      const newMonthMembersCount = newThisMonthCount ?? 0;
      const expiredMembersCount = expiredCount ?? 0;

      return (
        <Screen
          reference={false}
          scroll
          contentContainerStyle={{ backgroundColor: colors.background, minHeight: "100%", paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={membersQuery.isFetching}
              onRefresh={() => { void membersQuery.refetch(); }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header Row: Title, Live Data Badge, + Add Member Button */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.titleRow}>
                <Text style={s.title}>{isTrainer ? "Clients" : "Members"}</Text>
                <View style={s.liveDataBadge}>
                  <View style={s.liveDataDot} />
                  <Text style={s.liveDataText}>Live Data • Synced just now</Text>
                </View>
              </View>
              <Text style={s.subtitle}>
                {isTrainer ? "Your coaching directory" : "Manage all members of your gym"}
              </Text>
            </View>
            {canManageMembers ? (
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Member claims"
                  onPress={() => navigation.navigate("MemberClaims")}
                  style={[s.addMemberButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                >
                  <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
                  <Text style={[s.addMemberText, { color: colors.ink }]}>Claims</Text>
                  {pendingClaimsCount > 0 ? (
                    <View style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 2 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>{pendingClaimsCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Invite member"
                  onPress={() => navigation.navigate("Invitations", { defaultRole: "member" })}
                  style={s.addMemberButton}
                >
                  <Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" />
                  <Text style={s.addMemberText}>Invite Member</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Search Bar */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={18} color={colors.subtle} />
            <TextInput
              autoCapitalize="none"
              maxLength={120}
              onChangeText={(value) => { setSearch(value); setPage(0); }}
              placeholder="Search member by name, email, or phone..."
              placeholderTextColor={colors.subtle}
              style={s.searchInput}
              accessibilityLabel="Search members"
              value={search}
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => { setSearch(""); setPage(0); }}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={18} color={colors.subtle} />
              </Pressable>
            ) : null}
          </View>

          {/* Action Buttons Row: Filters, Sort: A-Z, Export CSV (Scrollable on small widths) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Member filters and sorting"
              onPress={() => setFiltersOpen(true)}
              style={s.pillActionButton}
            >
              <Ionicons name="funnel-outline" size={15} color="#FFFFFF" />
              <Text style={s.pillActionText}>Filters</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle sort direction"
              onPress={() => setSortDirection((value: any) => (value === "az" ? "za" : "az"))}
              style={s.pillActionButton}
            >
              <Ionicons name="swap-vertical-outline" size={15} color="#FFFFFF" />
              <Text style={s.pillActionText}>Sort: {sortDirection === "az" ? "A-Z" : "Z-A"}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Export CSV"
              onPress={() => showAlert("Export CSV", "Member CSV export ready to connect.")}
              style={s.pillActionButton}
            >
              <Ionicons name="download-outline" size={15} color="#FFFFFF" />
              <Text style={s.pillActionText}>Export CSV</Text>
            </Pressable>
          </ScrollView>

          {/* 2x2 KPI Stat Cards Grid */}
          <View style={s.statsGrid}>
            {/* Total Members */}
            <View style={s.statCard}>
              <View style={s.statTopRow}>
                <Text style={s.statLabel}>Total Members</Text>
                <View style={[s.statIconBox, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="person-outline" size={16} color={colors.primary} />
                </View>
              </View>
              <Text style={s.statValue}>{totalMembersCount}</Text>
            </View>

            {/* Active Members */}
            <View style={s.statCard}>
              <View style={s.statTopRow}>
                <Text style={s.statLabel}>Active Members</Text>
                <View style={[s.statIconBox, { backgroundColor: colors.successSoft }]}>
                  <Ionicons name="checkmark-circle-outline" size={17} color={colors.success} />
                </View>
              </View>
              <Text style={s.statValueGreen}>{activeMembersCount}</Text>
            </View>

            {/* New This Month */}
            <View style={s.statCard}>
              <View style={s.statTopRow}>
                <Text style={s.statLabel}>New This Month</Text>
                <View style={[s.statIconBox, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="person-add-outline" size={16} color={colors.primary} />
                </View>
              </View>
              <Text style={s.statValue}>{newMonthMembersCount}</Text>
            </View>

            {/* Expired Members */}
            <View style={s.statCard}>
              <View style={s.statTopRow}>
                <Text style={s.statLabel}>Expired Members</Text>
                <View style={[s.statIconBox, { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name="time-outline" size={17} color={colors.danger} />
                </View>
              </View>
              <Text style={s.statValue}>{expiredMembersCount}</Text>
            </View>
          </View>

          {/* Filter Tabs Strip (Horizontal scrollable to prevent clipping across all widths) */}
          <View accessibilityRole="tablist" style={s.tabsStripContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabsStrip}
            >
              {[
                { key: "All", label: `All (${totalMembersCount})` },
                { key: "Active", label: `Active (${activeMembersCount})` },
                { key: "Inactive", label: "Inactive (0)" },
                { key: "Expiring", label: `Expired (${expiredMembersCount})` },
              ].map(({ key, label }) => {
                const isSelected = selectedChip === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setExpiringOnly(key === "Expiring");
                      setMemberFilter(key === "Active" ? "active" : key === "Inactive" ? "inactive" : "all");
                      setPage(0);
                    }}
                    style={isSelected ? s.tabActive : s.tabInactive}
                  >
                    <Text style={isSelected ? s.tabActiveText : s.tabInactiveText}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setExpiringOnly(false);
                  setMemberFilter("frozen" as any);
                  setPage(0);
                }}
                style={s.tabInactive}
              >
                <Text style={s.tabInactiveMutedText}>Frozen (0)</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Filter Modal */}
          <Modal visible={filtersOpen} transparent animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close member filters" onPress={() => setFiltersOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 }}>
              <Pressable accessible={false} onPress={(e) => e.stopPropagation()} style={[ps.card, { backgroundColor: colors.surface, borderColor: colors.separator, borderWidth: 1, borderRadius: 20, gap: 16, padding: 20 }]}>
                <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800" }}>Member Filters</Text>
                <PulseChips options={["All", "Active", "Inactive", "Expired", "Frozen"]} value={memberFilter[0].toUpperCase() + memberFilter.slice(1)} onChange={(value) => { setExpiringOnly(false); setMemberFilter(value.toLowerCase() as MemberFilter); setPage(0); setFiltersOpen(false); }} />
                <PrimaryButton title={`Sort: ${sortDirection === "az" ? "A-Z" : "Z-A"}`} variant="secondary" onPress={() => setSortDirection((v: any) => v === "az" ? "za" : "az")} />
                <PrimaryButton title="Export members" variant="secondary" onPress={() => showAlert("Export members", "Member CSV export ready.")} />
                <PrimaryButton title="Done" onPress={() => setFiltersOpen(false)} />
              </Pressable>
            </Pressable>
          </Modal>

          <NoticeBanner message={notice} />
          <NoticeBanner
            message={deleteMember.error ? getApiErrorMessage(deleteMember.error) : null}
            tone="error"
          />

          <DataState
            loading={membersQuery.isLoading}
            error={membersQuery.error ? getApiErrorMessage(membersQuery.error) : null}
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
              search || expiringOnly || memberFilter !== "all" ? "Clear Filters" : canManageMembers ? "Invite Member" : undefined
            }
            onEmptyAction={
              search || expiringOnly || memberFilter !== "all"
                ? () => { setSearch(""); setExpiringOnly(false); setMemberFilter("all"); setPage(0); }
                : canManageMembers
                  ? () => navigation.navigate("Invitations", { defaultRole: "member" })
                  : undefined
            }
          />

          {/* Members List */}
          {displayedMembers.map((item) => (
            <MemberRow
              key={item.id}
              member={item}
              compact={compact}
              isDeleting={deleteMember.isPending}
              onView={() => navigation.navigate("MemberProfile", { memberId: item.id })}
              onEdit={canManageMembers ? () => navigation.navigate("EditMember", { memberId: item.id }) : undefined}
              onDelete={canManageMembers ? () => confirmDelete(item) : undefined}
            />
          ))}

          {/* Pagination */}
          {page > 0 || (membersQuery.data?.length ?? 0) >= 50 ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginTop: 12 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous page" accessibilityState={{ disabled: page === 0 || membersQuery.isFetching }} disabled={page === 0 || membersQuery.isFetching} onPress={() => setPage((v: any) => Math.max(0, v - 1))} style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: "center" }}>
                <Text style={{ color: page === 0 || membersQuery.isFetching ? colors.subtle : colors.primary, fontSize: 15 }}>Previous</Text>
              </Pressable>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Page {page + 1}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Next page" accessibilityState={{ disabled: (membersQuery.data?.length ?? 0) < 50 || membersQuery.isFetching }} disabled={(membersQuery.data?.length ?? 0) < 50 || membersQuery.isFetching} onPress={() => setPage((v: any) => v + 1)} style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: "center" }}>
                <Text style={{ color: (membersQuery.data?.length ?? 0) < 50 || membersQuery.isFetching ? colors.subtle : colors.primary, fontSize: 15 }}>Next</Text>
              </Pressable>
            </View>
          ) : null}
        </Screen>
      );
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
      <View style={styles.stats}><PlatformStat icon="people" label="Total Users" value={String(users.length)} tone={colors.primary} styles={styles} /><PlatformStat icon="checkmark-circle" label="Active Users" value={String(activeUserCount)} tone={colors.success} styles={styles} /><PlatformStat icon="person" label="Members" value={String(roleCount("member"))} tone={colors.primary} styles={styles} /><PlatformStat icon="time" label="Inactive Users" value={String(inactiveUserCount)} tone={colors.textSecondary} styles={styles} /></View>
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
      return (<View style={styles.modalField}><Text style={styles.modalLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} placeholder={label} placeholderTextColor={styles.pageLabel?.color || "#1C1C1E"} style={styles.modalInput} /></View>);
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
      const s = createReferenceMemberListStyles(colors);

      const isGreenAvatar = member.id ? member.id.charCodeAt(0) % 2 === 0 : true;
      const avatarInitials = (initials(fullName) || "--").slice(0, 2).toUpperCase();
      const planName = member.membership_plan_name || "No Plan";
      const isPremium = planName.toLowerCase().includes("premium");

      const formattedExpiry = member.membership_ends_at
        ? formatDate(member.membership_ends_at)
        : "No expiry date";
      const daysLeft = member.membership_ends_at
        ? Math.round(
            (new Date(member.membership_ends_at).getTime() - Date.now()) /
              86400000,
          )
        : null;
      const isShortExpiry = daysLeft != null && daysLeft <= 30;
      const contactInfo = member.email || member.phone || "No contact info";

      return (
        <View style={s.memberCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${fullName}`}
            onPress={onView}
            onLongPress={() => setExpanded((v) => !v)}
          >
            {/* Top Row: Avatar, Identity, Plan Badge */}
            <View style={s.memberCardTop}>
              <View
                style={[
                  s.avatarCircle,
                  isGreenAvatar
                    ? { backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.separator }
                    : { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.separator },
                ]}
              >
                <Text
                  style={[
                    s.avatarText,
                    { color: isGreenAvatar ? colors.success : colors.primary },
                  ]}
                >
                  {avatarInitials}
                </Text>
              </View>

              <View style={s.identityBox}>
                <View style={s.nameRow}>
                  <Text numberOfLines={1} style={s.memberName}>{fullName}</Text>
                  <View style={s.onlineDot} />
                </View>
                <Text numberOfLines={1} style={s.memberEmail}>
                  {contactInfo}
                </Text>
              </View>

              <View style={isPremium ? s.planBadgePremium : s.planBadgeBasic}>
                <Text style={isPremium ? s.planBadgePremiumText : s.planBadgeBasicText}>
                  {planName}
                </Text>
              </View>
            </View>

            {/* Bottom Row: Expiry, Profile Button, Pass Button, Contact Icon */}
            <View style={s.memberCardBottom}>
              <View style={s.expiryGroup}>
                <Text style={s.expiryLabel}>Expiry: </Text>
                <Text style={s.expiryDateText}>{formattedExpiry} </Text>
                {daysLeft != null ? (
                  <Text style={isShortExpiry ? s.daysLeftAmber : s.daysLeftGreen}>
                    ({daysLeft > 0 ? `${daysLeft} days left` : "Expired"})
                  </Text>
                ) : null}
              </View>

              <View style={s.cardActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Profile ${fullName}`}
                  onPress={onView}
                  style={s.actionProfileButton}
                >
                  <Text style={s.actionProfileText}>Profile</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Pass ${fullName}`}
                  onPress={onView}
                  style={s.actionPassButton}
                >
                  <Text style={s.actionPassText}>Pass</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Contact ${fullName}`}
                  onPress={onView}
                  style={s.actionContactButton}
                >
                  <Ionicons
                    name={member.phone ? "call-outline" : "mail-outline"}
                    size={16}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>
          </Pressable>

          {/* Expanded Management Drawer on Long Press */}
          {expanded && (
            <View style={{ gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.separator, marginTop: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Phone: {member.phone || "Not provided"}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Trainer: {relatedDisplayName(member.trainer_name, "None")}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                {onEdit ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${fullName}`} onPress={onEdit} style={[s.actionProfileButton, { paddingHorizontal: 16 }]}>
                    <Text style={{ color: colors.link, fontWeight: "700", fontSize: 12 }}>Edit</Text>
                  </Pressable>
                ) : null}
                {onDelete ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${fullName}`} accessibilityState={{ disabled: isDeleting }} disabled={isDeleting} onPress={onDelete} style={[s.actionProfileButton, { borderColor: "#FF3B30", paddingHorizontal: 16 }]}>
                    <Text style={{ color: "#FF3B30", fontWeight: "700", fontSize: 12 }}>Deactivate</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        </View>
      );
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
