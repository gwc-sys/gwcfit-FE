import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { DataState } from "../../components/DataState";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import {
  ClockSvg,
  DownloadSvg,
  EditPenSvg,
  EyeSvg,
  MoreHorizontalSvg,
  MoreVerticalSvg,
  PlanBadgeStarSvg,
  PulseReferenceIcon,
  SearchSvg,
  SlidersHorizontalSvg,
  UserCheckSvg,
  UserPlusSvg,
  UsersSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/pages/saas/MemberListScreen.styles";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { ManagedUserRole, UserStatus } from "../../../../types/saas";
import { relatedDisplayName } from "../../../../utils/displayNames";
import {
  formatDate,
  initials,
} from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type {
  useMemberListScreenPresentation,
  usePlatformUserDirectoryPresentation,
  usePlatformUserRowPresentation,
  usePlatformStatPresentation,
  useUserDetailsModalPresentation,
  useFormFieldPresentation,
  usePlatformDetailPresentation,
  useMemberRowPresentation,
  useMemberStatPresentation,
} from "../../../../screens/saas/MemberListScreen";

type MemberFilter = "all" | "active" | "inactive" | "expired" | "frozen";

function UserCheckIcon({ color = "#34C759", size = 21 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="9"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="1.9"
      />
      <Path
        d="M16 11l2 2 4-4"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MemberListScreenView({
  model,
}: {
  model: ReturnType<typeof useMemberListScreenPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const { ConnectedGyms } = model.props;
      return <ConnectedGyms />;
    }
    case "view3": {
      const {
        compact,
        membersQuery,
        isTrainer,
        colors,
        setSearch,
        setPage,
        search,
        setMemberFilter,
        memberFilter,
        canManageMembers,
        navigation,
        MemberStat,
        activeCount,
        newThisMonthCount,
        expiredCount,
        setSortDirection,
        sortDirection,
        notice,
        deleteMember,
        visibleMembers,
        MemberRow,
        confirmDelete,
        page,
        pendingClaimsCount = 0,
      } = model.props;
      const styles = createStyles(colors);
      const [viewMode, setViewMode] = useState<"table" | "empty">("table");
      const prevDisabled = page === 0 || membersQuery.isFetching;
      const nextDisabled =
        (membersQuery.data?.length ?? 0) < 50 || membersQuery.isFetching;

      return (
        <Screen
          scroll
          noPadding
          contentContainerStyle={[styles.screen, compact && styles.screenCompact]}
          refreshControl={
            <RefreshControl
              refreshing={membersQuery.isFetching}
              onRefresh={() => {
                void membersQuery.refetch();
              }}
            />
          }
        >
          {/* Page Header & Action Bar */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Members</Text>
              <Text style={styles.pageSubtitle}>
                {isTrainer
                  ? "Members assigned to you"
                  : "Manage all members of your gym"}
              </Text>
            </View>
            <View
              style={[
                styles.headerActions,
                compact && styles.headerActionsCompact,
              ]}
            >
              <View style={styles.toolbarSearch}>
                <SearchSvg size={15} color={colors.textSecondary} />
                <TextInput
                  autoCapitalize="none"
                  maxLength={120}
                  onChangeText={(value) => {
                    setSearch(value);
                    setPage(0);
                  }}
                  placeholder="Search member..."
                  placeholderTextColor={colors.textPlaceholder}
                  style={styles.searchInput}
                  value={search}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  setMemberFilter((value) =>
                    value === "all"
                      ? "active"
                      : value === "active"
                        ? "inactive"
                        : value === "inactive"
                          ? "expired"
                          : value === "expired"
                            ? "frozen"
                            : "all",
                  )
                }
              >
                <SlidersHorizontalSvg size={14} color={colors.textPrimary} />
                <Text style={styles.headerButtonText}>
                  Filters{memberFilter !== "all" ? `: ${memberFilter}` : ""}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  showAlert(
                    "Export members",
                    "Member export is ready to connect to your backend export endpoint.",
                  )
                }
              >
                <DownloadSvg size={14} color={colors.textPrimary} />
                <Text style={styles.headerButtonText}>Export</Text>
              </Pressable>
              {canManageMembers ? (
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate("MemberClaims")}
                    style={({ pressed }) => [
                      styles.headerButton,
                      { flexDirection: "row", alignItems: "center", gap: 6 },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                    <Text style={styles.headerButtonText}>Member Claims</Text>
                    {pendingClaimsCount > 0 ? (
                      <View style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 2 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>{pendingClaimsCount}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate("Invitations", { defaultRole: "member" })}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <LinearGradient
                      colors={["#E91E63", "#E91E63"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addMemberButton}
                    >
                      <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.addMemberButtonText}>Invite Member</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>

          {/* 4 KPI Stat Cards Row */}
          <View style={[styles.statsGrid, compact && styles.statsGridCompact]}>
            <MemberStat
              icon="people-outline"
              label="Total Members"
              value={String((membersQuery.data ?? []).length)}
              tone="#E91E63"
              styles={styles as any}
            />
            <MemberStat
              icon="checkmark-circle-outline"
              label="Active Members"
              value={String(activeCount)}
              tone="#34C759"
              styles={styles as any}
            />
            <MemberStat
              icon="person-add-outline"
              label="New This Month"
              value={String(newThisMonthCount)}
              tone="#E91E63"
              styles={styles as any}
            />
            <MemberStat
              icon="time-outline"
              label="Expired Members"
              value={String(expiredCount)}
              tone="#FF3B30"
              styles={styles as any}
            />
          </View>

          {/* Filter Tabs & Sort Bar (above the Table Card) */}
          <View style={styles.filterBar}>
            <View style={styles.filterTabs}>
              {(
                ["all", "active", "inactive", "expired", "frozen"] as MemberFilter[]
              ).map((filter) => (
                <Pressable
                  accessibilityRole="button"
                  key={filter}
                  style={[
                    styles.filterTab,
                    memberFilter === filter && styles.filterTabActive,
                  ]}
                  onPress={() => {
                    setMemberFilter(filter);
                    setPage(0);
                  }}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      memberFilter === filter && styles.filterTabTextActive,
                    ]}
                  >
                    {filter === "all"
                      ? "All Members"
                      : filter[0].toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filterRightControls}>
              <View style={styles.viewToggleWrap}>
                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.viewTogglePill,
                    viewMode === "table" && styles.viewTogglePillActive,
                  ]}
                  onPress={() => setViewMode("table")}
                >
                  <Text
                    style={[
                      styles.viewToggleText,
                      viewMode === "table" && styles.viewToggleTextActive,
                    ]}
                  >
                    Table
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.viewTogglePill,
                    viewMode === "empty" && styles.viewTogglePillActive,
                  ]}
                  onPress={() => setViewMode("empty")}
                >
                  <Text
                    style={[
                      styles.viewToggleText,
                      viewMode === "empty" && styles.viewToggleTextActive,
                    ]}
                  >
                    Empty State
                  </Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                style={styles.sortButton}
                onPress={() =>
                  setSortDirection((value) => (value === "az" ? "za" : "az"))
                }
              >
                <Text style={styles.sortText}>Sort by:</Text>
                <View style={styles.sortPill}>
                  <Text style={styles.sortValueText}>
                    {sortDirection === "az" ? "A-Z" : "Z-A"}
                  </Text>
                  <Ionicons name="chevron-down" size={13} color={colors.textPrimary} />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Members Table Card */}
          <View style={styles.tableCard}>
            {!compact && viewMode === "table" ? (
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, styles.memberColumn]}>
                  Member
                </Text>
                <Text style={[styles.columnHeader, styles.planColumn]}>
                  Plan
                </Text>
                <Text style={[styles.columnHeader, styles.statusColumn]}>
                  Status
                </Text>
                <Text style={[styles.columnHeader, styles.expiryColumn]}>
                  Expiry date
                </Text>
                <Text style={[styles.columnHeader, styles.actionColumn]}>
                  Actions
                </Text>
              </View>
            ) : null}
            <NoticeBanner message={notice} />
            <NoticeBanner
              message={
                deleteMember.error
                  ? getApiErrorMessage(deleteMember.error)
                  : null
              }
              tone="error"
            />

            {viewMode === "empty" ? (
              <DataState
                loading={false}
                error={null}
                empty={true}
                emptyTitle="No members found"
                emptyMessage="No members match the current filter or search criteria."
                emptyActionLabel={canManageMembers ? "+ Invite Member" : undefined}
                onEmptyAction={
                  canManageMembers
                    ? () => navigation.navigate("Invitations", { defaultRole: "member" })
                    : undefined
                }
              />
            ) : (
              <>
                <DataState
                  loading={membersQuery.isLoading}
                  error={
                    membersQuery.error
                      ? getApiErrorMessage(membersQuery.error)
                      : null
                  }
                  empty={!membersQuery.isLoading && visibleMembers.length === 0}
                  emptyTitle={search ? "No members match" : "No members found"}
                  emptyMessage={
                    search
                      ? "Clear the search or try another detail."
                      : isTrainer
                        ? "No members are currently assigned to you."
                        : "Invite your first member to start managing this gym."
                  }
                  emptyActionLabel={
                    search
                      ? "Clear Search"
                      : canManageMembers
                        ? "Invite Member"
                        : undefined
                  }
                  onEmptyAction={
                    search
                      ? () => setSearch("")
                      : canManageMembers
                        ? () => navigation.navigate("Invitations", { defaultRole: "member" })
                        : undefined
                  }
                />

                {visibleMembers.length > 0 ? (
                  <FlatList
                    data={visibleMembers}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                      <MemberRow
                        member={item}
                        compact={compact}
                        isDeleting={deleteMember.isPending}
                        onView={() =>
                          navigation.navigate("MemberProfile", {
                            memberId: item.id,
                          })
                        }
                        onEdit={
                          canManageMembers
                            ? () =>
                                navigation.navigate("EditMember", {
                                  memberId: item.id,
                                })
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
              </>
            )}

            <View
              style={[styles.pagination, compact && styles.paginationCompact]}
            >
              <Pressable
                accessibilityRole="button"
                disabled={prevDisabled}
                onPress={() => setPage((value) => Math.max(0, value - 1))}
                style={({ pressed }) => [
                  styles.pageButton,
                  prevDisabled && styles.pageButtonDisabled,
                  pressed && !prevDisabled && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    prevDisabled && styles.pageButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </Pressable>

              <Text style={styles.pageLabel}>
                Page {page + 1} of{" "}
                {Math.max(
                  1,
                  Math.ceil((membersQuery.data ?? []).length / 50),
                )}
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={nextDisabled}
                onPress={() => setPage((value) => value + 1)}
                style={({ pressed }) => [
                  styles.pageButton,
                  nextDisabled && styles.pageButtonDisabled,
                  pressed && !nextDisabled && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    nextDisabled && styles.pageButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </Pressable>
            </View>
          </View>
        </Screen>
      );
    }
  }
}

export function PlatformUserDirectoryView({
  model,
}: {
  model: ReturnType<typeof usePlatformUserDirectoryPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        styles,
        colors,
        setSearch,
        search,
        setFilter,
        navigation,
        PlatformStat,
        users,
        roleCount,
        filter,
        usersQuery,
        visibleUsers,
        PlatformUserRow,
        setSelectedUser,
        openEditor,
        UserDetailsModal,
        selectedUser,
        editingUser,
        draft,
        setDraft,
        gymsQuery,
        updateUser,
        setEditingUser,
        saveUser,
        activeUserCount,
        inactiveUserCount,
      } = model.props;
      return (
        <Screen scroll noPadding contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Members</Text>
              <Text style={styles.subtitle}>
                Manage all users across the PulseFit platform
              </Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.search}>
                <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setSearch}
                  placeholder="Search member..."
                  placeholderTextColor={colors.textPlaceholder}
                  style={styles.searchInput}
                  value={search}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                style={styles.headerButton}
                onPress={() =>
                  setFilter((value) =>
                    value === "all"
                      ? "member"
                      : value === "member"
                        ? "trainer"
                        : value === "trainer"
                          ? "receptionist"
                          : value === "receptionist"
                            ? "sub_admin"
                            : "all",
                  )
                }
              >
                <Ionicons name="options-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.headerButtonText}>Filters</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.headerButton}
                onPress={() =>
                  showAlert(
                    "Export users",
                    "User export is ready to connect to your backend export endpoint.",
                  )
                }
              >
                <Ionicons name="download-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.headerButtonText}>Export</Text>
              </Pressable>
              <PrimaryButton
                title="Invite Member"
                icon="paper-plane-outline"
                onPress={() => navigation.navigate("Invitations", { defaultRole: "member" })}
                style={styles.addButton}
              />
            </View>
          </View>
          <View style={styles.stats}>
            <PlatformStat
              icon="people-outline"
              label="Total Users"
              value={String(users.length)}
              tone="#E91E63"
              styles={styles}
            />
            <PlatformStat
              icon="checkmark-circle-outline"
              label="Active Users"
              value={String(activeUserCount)}
              tone="#34C759"
              styles={styles}
            />
            <PlatformStat
              icon="person-add-outline"
              label="Members"
              value={String(roleCount("member"))}
              tone="#E91E63"
              styles={styles}
            />
            <PlatformStat
              icon="time-outline"
              label="Inactive Users"
              value={String(inactiveUserCount)}
              tone="#FF3B30"
              styles={styles}
            />
          </View>
          <View style={styles.tableCard}>
            <View style={styles.filterBar}>
              <View style={styles.filterTabs}>
                {(
                  [
                    ["all", "All Users"],
                    ["member", "Members"],
                    ["trainer", "Trainers"],
                    ["receptionist", "Reception"],
                    ["sub_admin", "Sub Admins"],
                  ] as const
                ).map(([value, label]) => (
                  <Pressable
                    accessibilityRole="button"
                    key={value}
                    style={[
                      styles.filterTab,
                      filter === value && styles.filterTabActive,
                    ]}
                    onPress={() => setFilter(value)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === value && styles.filterTabTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.loadedLabel}>
                {users.length} loaded · 20 per batch
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, styles.memberColumn]}>
                User
              </Text>
              <Text style={styles.columnHeader}>Contact</Text>
              <Text style={styles.columnHeader}>Gym</Text>
              <Text style={styles.columnHeader}>Role</Text>
              <Text style={styles.columnHeader}>Status</Text>
              <Text style={styles.columnHeader}>Action</Text>
            </View>
            {usersQuery.isLoading ? (
              <Text style={styles.muted}>Loading users...</Text>
            ) : (
              visibleUsers.map((user) => (
                <PlatformUserRow
                  key={user.id}
                  user={user}
                  styles={styles}
                  colors={colors}
                  onPress={() => setSelectedUser(user)}
                  onEdit={() => openEditor(user)}
                />
              ))
            )}
            {usersQuery.error ? (
              <Text style={styles.error}>
                {getApiErrorMessage(usersQuery.error)}
              </Text>
            ) : null}
            {!usersQuery.isLoading && visibleUsers.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="file-tray-outline"
                    size={28}
                    color={colors.primaryDark}
                  />
                </View>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.muted}>
                  Try another search or load the next users.
                </Text>
              </View>
            ) : null}
            <View style={styles.pagination}>
              <PrimaryButton
                title="Previous"
                variant="secondary"
                disabled={true}
                style={styles.pageButton}
              />
              <Text style={styles.pageLabel}>Loaded {users.length}</Text>
              <PrimaryButton
                title={usersQuery.hasNextPage ? "Load next 20" : "All loaded"}
                icon={usersQuery.hasNextPage ? "arrow-down-outline" : undefined}
                loading={usersQuery.isFetchingNextPage}
                disabled={!usersQuery.hasNextPage}
                onPress={() => usersQuery.fetchNextPage()}
                style={styles.pageButton}
              />
            </View>
          </View>
          <UserDetailsModal
            user={selectedUser}
            editingUser={editingUser}
            draft={draft}
            setDraft={setDraft}
            gyms={gymsQuery.data ?? []}
            saving={updateUser.isPending}
            error={
              updateUser.error ? getApiErrorMessage(updateUser.error) : null
            }
            onClose={() => {
              setSelectedUser(null);
              setEditingUser(null);
            }}
            onEdit={() => selectedUser && openEditor(selectedUser)}
            onSave={saveUser}
          />
        </Screen>
      );
    }
  }
}

export function PlatformUserRowView({
  model,
}: {
  model: ReturnType<typeof usePlatformUserRowPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, user, onEdit, colors } = model.props;
      return (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.userRow, pressed && styles.rowPressed]}
        >
          <View style={styles.userCell}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.full_name || user.name).slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user.full_name || user.name}
            </Text>
          </View>
          <Text style={styles.tableCell} numberOfLines={1}>
            {user.email}
          </Text>
          <Text style={styles.tableCell} numberOfLines={1}>
            {user.gym_name || "Platform"}
          </Text>
          <View style={styles.tableCell}>
            <StatusBadge
              label={user.role.replace("_", " ")}
              tone={user.role === "member" ? "success" : "info"}
            />
          </View>
          <View style={styles.tableCell}>
            <StatusBadge
              label={user.status}
              tone={user.status === "active" ? "success" : "warning"}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.actionCell}
            onPress={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Ionicons name="create-outline" size={19} color={colors.ink} />
          </Pressable>
        </Pressable>
      );
    }
  }
}

export function PlatformStatView({
  model,
}: {
  model: ReturnType<typeof usePlatformStatPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, icon, label, value } = model.props;
      return (
        <View style={styles.stat}>
          <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.liveText}>↑ Live data</Text>
          </View>
          <View
            style={[
              styles.statIcon,
              {
                backgroundColor: `${tone}1F`,
                borderWidth: 1,
                borderColor: `${tone}38`,
              },
            ]}
          >
            <Ionicons name={icon} size={21} color={tone} />
          </View>
        </View>
      );
    }
  }
}

export function UserDetailsModalView({
  model,
}: {
  model: ReturnType<typeof useUserDetailsModalPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        user,
        onClose,
        styles,
        editingUser,
        colors,
        FormField,
        draft,
        setDraft,
        gyms,
        error,
        saving,
        onSave,
        PlatformDetail,
        onEdit,
      } = model.props;
      return (
        <Modal
          visible={Boolean(user)}
          transparent
          animationType="fade"
          onRequestClose={onClose}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {editingUser ? "Edit user" : "User details"}
                  </Text>
                  <Text style={styles.modalSubtitle}>{user?.email}</Text>
                </View>
                <Pressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  onPress={onClose}
                >
                  <Ionicons name="close" size={23} color={colors.ink} />
                </Pressable>
              </View>
              {editingUser ? (
                <>
                  <FormField
                    label="Full name"
                    value={draft.name}
                    onChangeText={(value) =>
                      setDraft((current) => ({ ...current, name: value }))
                    }
                    styles={styles}
                  />
                  <FormField
                    label="Email"
                    value={draft.email}
                    onChangeText={(value) =>
                      setDraft((current) => ({ ...current, email: value }))
                    }
                    styles={styles}
                  />
                  <FormField
                    label="Phone"
                    value={draft.phone}
                    onChangeText={(value) =>
                      setDraft((current) => ({ ...current, phone: value }))
                    }
                    styles={styles}
                  />
                  <FormField
                    label="New password (optional)"
                    value={draft.password}
                    onChangeText={(value) =>
                      setDraft((current) => ({ ...current, password: value }))
                    }
                    secureTextEntry
                    styles={styles}
                  />
                  <Text style={styles.modalLabel}>Role</Text>
                  <View style={styles.modalOptions}>
                    {(
                      [
                        "member",
                        "trainer",
                        "receptionist",
                        "sub_admin",
                      ] as ManagedUserRole[]
                    ).map((role) => (
                      <Pressable
                        accessibilityRole="button"
                        key={role}
                        onPress={() =>
                          setDraft((current) => ({ ...current, role }))
                        }
                        style={[
                          styles.modalOption,
                          draft.role === role && styles.modalOptionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            draft.role === role && styles.modalOptionTextActive,
                          ]}
                        >
                          {role.replace("_", " ")}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Status</Text>
                  <View style={styles.modalOptions}>
                    {(["active", "inactive"] as UserStatus[]).map((status) => (
                      <Pressable
                        accessibilityRole="button"
                        key={status}
                        onPress={() =>
                          setDraft((current) => ({ ...current, status }))
                        }
                        style={[
                          styles.modalOption,
                          draft.status === status && styles.modalOptionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            draft.status === status &&
                              styles.modalOptionTextActive,
                          ]}
                        >
                          {status}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.modalLabel}>Gym assignment</Text>
                  <View style={styles.modalOptions}>
                    {gyms.map((gym) => (
                      <Pressable
                        accessibilityRole="button"
                        key={gym.id}
                        onPress={() =>
                          setDraft((current) => ({
                            ...current,
                            gym_id: gym.id,
                          }))
                        }
                        style={[
                          styles.modalOption,
                          draft.gym_id === gym.id && styles.modalOptionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            draft.gym_id === gym.id &&
                              styles.modalOptionTextActive,
                          ]}
                        >
                          {gym.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <View style={styles.modalActions}>
                    <PrimaryButton
                      title="Cancel"
                      variant="secondary"
                      onPress={onClose}
                      style={styles.modalButton}
                    />
                    <PrimaryButton
                      title="Save changes"
                      loading={saving}
                      onPress={onSave}
                      style={styles.modalButton}
                    />
                  </View>
                </>
              ) : user ? (
                <>
                  <View style={styles.detailList}>
                    <PlatformDetail
                      label="Full name"
                      value={user.full_name || user.name}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Email"
                      value={user.email}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Phone"
                      value={user.phone || "Not provided"}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Role"
                      value={user.role.replace("_", " ")}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Status"
                      value={user.status}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Gym"
                      value={user.gym_name || "Not assigned"}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="Joined"
                      value={new Date(user.created_at).toLocaleString()}
                      styles={styles}
                    />
                    <PlatformDetail
                      label="User ID"
                      value={user.id}
                      styles={styles}
                    />
                  </View>
                  <PrimaryButton
                    title="Edit all information"
                    icon="create-outline"
                    onPress={onEdit}
                  />
                </>
              ) : null}
            </View>
          </View>
        </Modal>
      );
    }
  }
}

export function FormFieldView({
  model,
}: {
  model: ReturnType<typeof useFormFieldPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value, onChangeText, secureTextEntry } =
        model.props;
      return (
        <View style={styles.modalField}>
          <Text style={styles.modalLabel}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            placeholder={label}
            placeholderTextColor={styles.modalLabel?.color || "#8E8E93"}
            style={styles.modalInput}
          />
        </View>
      );
    }
  }
}

export function PlatformDetailView({
  model,
}: {
  model: ReturnType<typeof usePlatformDetailPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value } = model.props;
      return (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      );
    }
  }
}

export function MemberRowView({
  model,
}: {
  model: ReturnType<typeof useMemberRowPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        fullName,
        onView,
        member,
        membership,
        colors,
        onEdit,
        onDelete,
        isDeleting,
        compact,
      } = model.props;
      const styles = createStyles(colors);
      const statusLower = member.status.toLowerCase();
      const isActive = statusLower === "active";
      const isExpired = statusLower === "expired" || membership.tone === "danger";

      const useSecondaryAvatar = member.id
        ? member.id.charCodeAt(member.id.length - 1) % 2 !== 0
        : false;
      const memberInitials = (initials(fullName) || "--").slice(0, 2).toUpperCase();
      const contactText =
        member.email && member.phone
          ? `${member.email} • ${member.phone}`
          : member.email || member.phone || "No contact info";
      const planName = member.membership_plan_name || "No plan assigned";
      const expiryFormatted = member.membership_ends_at
        ? formatDate(member.membership_ends_at)
        : "No expiry date";
      const remainingDays = member.membership_ends_at
        ? Math.ceil(
            (Date.parse(String(member.membership_ends_at)) - Date.now()) /
              86400000,
          )
        : null;
      const remainingLabel =
        remainingDays != null
          ? remainingDays > 0
            ? `${remainingDays} days remaining`
            : remainingDays === 0
              ? "Expires today"
              : `${Math.abs(remainingDays)} days expired`
          : "No active expiry";

      return (
        <View style={[styles.memberRow, compact && styles.memberRowCompact]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${fullName}`}
            onPress={onView}
            style={({ pressed }) => [
              styles.memberInfo,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.avatar, useSecondaryAvatar && styles.avatarSecondary]}>
              <Text style={styles.avatarText}>{memberInitials}</Text>
            </View>
            <View style={styles.memberIdentity}>
              <Text style={styles.memberName} numberOfLines={1}>
                {fullName}
              </Text>
              <Text style={styles.memberMeta} numberOfLines={1}>
                {contactText}
              </Text>
            </View>
          </Pressable>

          <View
            style={[styles.planColumn, compact && styles.detailColumnCompact]}
          >
            {compact ? <Text style={styles.compactLabel}>Plan</Text> : null}
            <View style={styles.planPillBadge}>
              <PlanBadgeStarSvg size={13} color="#E91E63" />
              <Text style={styles.planPillBadgeText} numberOfLines={1}>
                {planName}
              </Text>
            </View>
          </View>

          <View
            style={[styles.statusColumn, compact && styles.detailColumnCompact]}
          >
            {compact ? <Text style={styles.compactLabel}>Status</Text> : null}
            <View
              style={[
                styles.statusDotPill,
                isActive
                  ? styles.statusDotPillActive
                  : isExpired
                    ? styles.statusDotPillDanger
                    : styles.statusDotPillWarning,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isActive
                      ? "#34C759"
                      : isExpired
                        ? "#E91E63"
                        : colors.textSecondary,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusDotPillText,
                  isActive
                    ? styles.statusDotPillTextActive
                    : isExpired
                      ? styles.statusDotPillTextDanger
                      : styles.statusDotPillTextWarning,
                ]}
              >
                {statusLower === "active" ? "Active" : statusLower}
              </Text>
            </View>
          </View>

          <View
            style={[styles.expiryColumn, compact && styles.detailColumnCompact]}
          >
            {compact ? (
              <Text style={styles.compactLabel}>Expiry date</Text>
            ) : null}
            <View>
              <Text style={styles.expiryDate}>{expiryFormatted}</Text>
              <Text style={styles.expirySubtext}>{remainingLabel}</Text>
            </View>
          </View>

          <View style={[styles.actions, compact && styles.actionsCompact]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${fullName}`}
              onPress={onView}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <EyeSvg size={15} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`More options for ${fullName}`}
              onPress={onEdit ?? onView}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <MoreHorizontalSvg size={15} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}

export function MemberStatView({
  model,
}: {
  model: ReturnType<typeof useMemberStatPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles: rawStyles, label, value } = model.props;
      const styles = rawStyles as unknown as ReturnType<typeof createStyles>;
      const isTotal = label === "Total Members";
      const isActive = label === "Active Members";
      const isNew = label === "New This Month";
      const isExpired = label === "Expired Members";

      const resolvedTone = isActive
        ? "#34C759"
        : isExpired
          ? "#FF3B30"
          : "#E91E63";

      return (
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: `${resolvedTone}18`,
                  borderColor: `${resolvedTone}32`,
                },
              ]}
            >
              {isActive ? (
                <UserCheckSvg size={19} color={resolvedTone} />
              ) : isTotal ? (
                <UsersSvg size={19} color={resolvedTone} />
              ) : isNew ? (
                <UserPlusSvg size={19} color={resolvedTone} />
              ) : (
                <ClockSvg size={19} color={resolvedTone} />
              )}
            </View>
          </View>
          <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTrend}>↑ Live data</Text>
          </View>
        </View>
      );
    }
  }
}
