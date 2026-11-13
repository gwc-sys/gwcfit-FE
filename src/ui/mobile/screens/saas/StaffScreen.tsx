import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { ManagedUser, UserStatus } from "../../../../types/saas";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatDate, formatRole, initials } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { referenceStaffStyles, createReferenceStaffStyles } from "../../styles/screens/saas/StaffScreen.styles";
import { useNavigation } from "@react-navigation/native";
import type * as React from "react";
import type { useStaffScreenPresentation, useCountCardPresentation, useDetailPresentation, useUserRowPresentation } from "../../../../screens/saas/StaffScreen";

export function StaffScreenView({ model }: { model: ReturnType<typeof useStaffScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, compact, usersQuery, countsQuery, isSuperAdmin, colors, beginCreate, CountCard, users, counts, platformRoleOptions, roleOptions, roleFilter, setRoleFilter, setSearch, search, showForm, editingUser, formErrors, setFormValues, formValues, user, createRoleOptions, gymsQuery, createUser, updateUser, isMutating, submitForm, closeForm, selectedUser, setSelectedUser, Detail, beginEdit, notice, deactivateUser, UserRow, confirmDeactivate, setShowForm , developerCount, gymOwnerCount } = model.props;
      const { isSmallPhone, isLargeFont } = useResponsiveLayout();
      const s = createReferenceStaffStyles(colors);
      const navigation = useNavigation<any>();
      const trainerCount = counts.trainer ?? users.filter((u) => u.role === "trainer").length;
      const receptionistCount = counts.receptionist ?? users.filter((u) => u.role === "receptionist").length;
      const subAdminCount = counts.sub_admin ?? users.filter((u) => u.role === "sub_admin").length;
      const allCount = (counts.trainer || 0) + (counts.receptionist || 0) + (counts.sub_admin || 0) || users.length;

      const staffToRender: ManagedUser[] = users;

      return (
        <Screen
          scroll
          keyboard
          contentContainerStyle={s.screen}
          refreshControl={
            <RefreshControl
              refreshing={usersQuery.isFetching || countsQuery.isFetching}
              onRefresh={() => {
                usersQuery.refetch();
                countsQuery.refetch();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header Row: Title & Subtitle on left, + Invite on right */}
          <View style={s.headerRow}>
            <View style={s.headerTitleContainer}>
              <Text style={s.headerTitle}>Staff Directory</Text>
              <Text style={s.headerSubtitle}>Invite & control gym personnel</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invite staff"
              onPress={() => navigation.navigate("Invitations")}
              style={s.inviteButton}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={s.inviteButtonText}>Invite</Text>
            </Pressable>
          </View>

          {/* Filter Tabs Strip (Horizontal scrollable to prevent wrapping/clipping) */}
          <View style={s.filterTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`All (${allCount})`}
                onPress={() => setRoleFilter("all")}
                style={[s.filterTab, roleFilter === "all" && s.filterTabActive, { minWidth: 70, paddingHorizontal: 12 }]}
              >
                <Text style={[s.filterTabText, roleFilter === "all" && s.filterTabTextActive]}>
                  All ({allCount})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Trainers (${trainerCount})`}
                onPress={() => setRoleFilter("trainer")}
                style={[s.filterTab, roleFilter === "trainer" && s.filterTabActive, { minWidth: 90, paddingHorizontal: 12 }]}
              >
                <Text style={[s.filterTabText, roleFilter === "trainer" && s.filterTabTextActive]}>
                  Trainers ({trainerCount})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reception (${receptionistCount})`}
                onPress={() => setRoleFilter("receptionist")}
                style={[s.filterTab, roleFilter === "receptionist" && s.filterTabActive, { minWidth: 96, paddingHorizontal: 12 }]}
              >
                <Text style={[s.filterTabText, roleFilter === "receptionist" && s.filterTabTextActive]}>
                  Reception ({receptionistCount})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Admins (${subAdminCount})`}
                onPress={() => setRoleFilter("sub_admin")}
                style={[s.filterTab, roleFilter === "sub_admin" && s.filterTabActive, { minWidth: 84, paddingHorizontal: 12 }]}
              >
                <Text style={[s.filterTabText, roleFilter === "sub_admin" && s.filterTabTextActive]}>
                  Admins ({subAdminCount})
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Search Bar */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={18} color={colors.subtle} />
            <TextInput
              autoCapitalize="none"
              maxLength={120}
              onChangeText={setSearch}
              placeholder="Search staff by name or email..."
              placeholderTextColor={colors.subtle}
              style={s.searchInput}
              value={search}
              accessibilityLabel="Search staff"
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearch("")}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={18} color={colors.subtle} />
              </Pressable>
            ) : null}
          </View>

      {showForm ? (
        <SurfacePanel title={editingUser ? "Edit user" : "Create user"} kicker="Users" icon="person-add-outline">
          <View style={styles.formGrid}>
            <FormTextField
              error={formErrors.name}
              label="Name"
              leftIcon="person-outline"
              onChangeText={(value) => setFormValues((current) => ({ ...current, name: value }))}
              placeholder="Full name"
              required
              value={formValues.name}
            />
            <FormTextField
              autoCapitalize="none"
              error={formErrors.email}
              keyboardType="email-address"
              label="Email"
              leftIcon="mail-outline"
              onChangeText={(value) => setFormValues((current) => ({ ...current, email: value }))}
              placeholder="user@example.com"
              required
              value={formValues.email}
            />
            <FormTextField
              error={formErrors.phone}
              keyboardType="phone-pad"
              label="Phone"
              leftIcon="call-outline"
              onChangeText={(value) => setFormValues((current) => ({ ...current, phone: value }))}
              placeholder="Phone"
              value={formValues.phone}
            />
            <FormTextField
              error={formErrors.password}
              label={editingUser ? "New password" : "Password"}
              leftIcon="lock-closed-outline"
              maxLength={72}
              onChangeText={(value) => setFormValues((current) => ({ ...current, password: value }))}
              placeholder={editingUser ? "Leave blank to keep current password" : "Password"}
              required={!editingUser}
              secureTextEntry
              value={formValues.password}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              {editingUser && (editingUser.role as string) === "super_admin" ? <View style={styles.readOnlyRole}><Ionicons name="code-slash-outline" size={18} color={colors.primary} /><Text style={styles.optionText}>Application Developer (role cannot be changed)</Text></View> : null}
              <View style={styles.optionGrid}>
                {(editingUser && (editingUser.role as string) === "super_admin" ? [] : user?.role === "super_admin" ? [...createRoleOptions, { value: "gym_owner" as const, label: "Gym Owners", icon: "business-outline" as const }] : createRoleOptions).map((option) => {
                  const selected = formValues.role === option.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={option.value}
                      onPress={() => setFormValues((current) => ({ ...current, role: option.value }))}
                      style={({ pressed }) => [styles.optionButton, selected && styles.optionButtonSelected, pressed && styles.pressed]}
                    >
                      <Ionicons name={option.icon} size={18} color={selected ? colors.white : colors.muted} />
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {formErrors.role ? <Text style={styles.error}>{formErrors.role}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.optionGrid}>
                {(["active", "inactive"] as UserStatus[]).map((status) => {
                  const selected = formValues.status === status;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={status}
                      onPress={() => setFormValues((current) => ({ ...current, status }))}
                      style={({ pressed }) => [styles.optionButton, selected && styles.optionButtonSelected, pressed && styles.pressed]}
                    >
                      <Ionicons name={status === "active" ? "checkmark-circle-outline" : "pause-circle-outline"} size={18} color={selected ? colors.white : colors.muted} />
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{status === "active" ? "Active" : "Inactive"}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {user?.role === "super_admin" ? <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>Gym assignment</Text><View style={styles.optionGrid}>{(gymsQuery.data ?? []).map((gym) => { const selected = formValues.gym_id === gym.id; return <Pressable key={gym.id} accessibilityRole="button" onPress={() => setFormValues((current) => ({ ...current, gym_id: gym.id }))} style={({ pressed }) => [styles.optionButton, selected && styles.optionButtonSelected, pressed && styles.pressed]}><Ionicons name="business-outline" size={18} color={selected ? colors.white : colors.muted} /><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{gym.name}</Text></Pressable>; })}</View>{formErrors.gym_id ? <Text style={styles.error}>{formErrors.gym_id}</Text> : null}</View> : null}

            {createUser.error ? <Text style={styles.error}>{getApiErrorMessage(createUser.error)}</Text> : null}
            {updateUser.error ? <Text style={styles.error}>{getApiErrorMessage(updateUser.error)}</Text> : null}
            <View style={styles.actionRow}>
              <PrimaryButton
                disabled={isMutating}
                loading={createUser.isPending || updateUser.isPending}
                onPress={submitForm}
                style={styles.actionButton}
                title={editingUser ? "Save Changes" : "Create User"}
              />
              <PrimaryButton disabled={isMutating} onPress={closeForm} style={styles.actionButton} title="Cancel" variant="secondary" />
            </View>
          </View>
        </SurfacePanel>
      ) : null}

      {selectedUser ? (
        <SurfacePanel title={selectedUser.name} kicker="User details" icon="person-circle-outline" actionLabel="Close" onAction={() => setSelectedUser(null)}>
          <View style={styles.detailGrid}>
            <Detail label="Email" value={selectedUser.email} />
            <Detail label="Phone" value={selectedUser.phone ?? "Not set"} />
            <Detail label="Role" value={formatRole(selectedUser.role)} />
            <Detail label="Status" value={selectedUser.status} />
            <Detail label="Gym" value={selectedUser.gym_id ? relatedDisplayName(selectedUser.gym_name, "Assigned gym") : "Not assigned"} />
            <Detail label="Created" value={formatDate(selectedUser.created_at)} />
            <Detail label="User ID" value={selectedUser.id} />
          </View>
          {(selectedUser.role as string) !== "super_admin" ? <PrimaryButton title="Edit all user information" icon="create-outline" onPress={() => beginEdit(selectedUser)} /> : <Text style={styles.protectedNotice}>This Application Developer account is protected and cannot be edited from the UI.</Text>}
        </SurfacePanel>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {deactivateUser.error ? <Text style={styles.error}>{getApiErrorMessage(deactivateUser.error)}</Text> : null}

      <DataState
        loading={usersQuery.isLoading}
        error={usersQuery.error ? getApiErrorMessage(usersQuery.error) : null}
        empty={!usersQuery.isLoading && staffToRender.length === 0}
        emptyTitle={search ? "No staff match" : "No staff found"}
        emptyMessage={search ? "Clear the search or try another detail." : "Invite staff to manage your gym."}
        emptyActionLabel={search ? "Clear Search" : "Invite"}
        onEmptyAction={search ? () => setSearch("") : beginCreate}
      />

      {staffToRender.length > 0 ? (
        <FlatList
          data={staffToRender}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              compact={compact}
              isBusy={isMutating}
              onDeactivate={() => confirmDeactivate(item)}
              onEdit={() => beginEdit(item)}
              onView={() => {
                setShowForm(false);
                setSelectedUser(item);
              }}
            />
          )}
        />
      ) : null}
    </Screen>
  );
    }
  }
}

export function CountCardView({ model }: { model: ReturnType<typeof useCountCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, icon, colors, value, label } = model.props;
      return ((
    <View style={styles.countCard}>
      <View style={styles.countIcon}>
        <Ionicons name={icon} size={20} color={colors.primaryDark} />
      </View>
      <Text style={styles.countValue}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  ));
    }
  }
}

export function DetailView({ model }: { model: ReturnType<typeof useDetailPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value } = model.props;
      return ((
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  ));
    }
  }
}

export function UserRowView({ model }: { model: ReturnType<typeof useUserRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, user, onView, colors, canEdit, isBusy, onEdit, onDeactivate } = model.props;
      const s = createReferenceStaffStyles(colors);
      const userInitials = initials(user.name);
      const isSubAdmin = user.role === "sub_admin";
      const isReception = user.role === "receptionist";
      const isTrainer = user.role === "trainer";

      const roleBadgeStyle = isSubAdmin
        ? s.roleBadgeSubAdmin
        : isReception
        ? s.roleBadgeReception
        : isTrainer
        ? s.roleBadgeTrainer
        : s.roleBadgeDefault;

      const roleTextStyle = isSubAdmin
        ? s.roleTextSubAdmin
        : isReception
        ? s.roleTextReception
        : isTrainer
        ? s.roleTextTrainer
        : s.roleTextDefault;

      const roleLabel = isSubAdmin
        ? "Sub Admin"
        : isReception
        ? "Reception"
        : isTrainer
        ? "Trainer"
        : formatRole(user.role);

      const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Staff member ${user.name}`}
          onPress={onEdit || onView}
          style={s.staffCard}
        >
          {/* Top Row: Avatar, Name & Email, Role Badge */}
          <View style={s.cardTopRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userInitials}</Text>
            </View>

            <View style={s.staffInfo}>
              <Text numberOfLines={1} style={s.staffName}>{user.name}</Text>
              <Text numberOfLines={1} style={s.staffEmail}>{user.email}</Text>
            </View>

            <View style={roleBadgeStyle}>
              <Text style={roleTextStyle}>{roleLabel}</Text>
            </View>
          </View>

          {/* Bottom Row: Joined Date & Status */}
          <View style={s.cardBottomRow}>
            <View style={s.joinedRow}>
              <Text style={s.joinedLabel}>Joined: </Text>
              <Text style={s.joinedDate}>{joinedDate}</Text>
            </View>

            <View style={s.statusRow}>
              <View style={user.status === "active" ? s.statusDot : s.statusDotInactive} />
              <Text style={user.status === "active" ? s.statusText : s.statusTextInactive}>
                {user.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }
  }
}
