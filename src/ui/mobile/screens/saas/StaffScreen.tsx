import { ScreenHeader } from "../../components/ScreenHeader";
import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { UserStatus } from "../../../../types/saas";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatDate, formatRole, initials } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
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
      return ((
    <Screen
      scroll
      keyboard
      contentContainerStyle={[styles.screen, compact && styles.screenCompact]}
      refreshControl={
        <RefreshControl
          refreshing={usersQuery.isFetching || countsQuery.isFetching}
          onRefresh={() => {
            usersQuery.refetch();
            countsQuery.refetch();
          }}
        />
      }
    >
      <View style={[styles.pageHeader, compact && styles.pageHeaderCompact]}>
        <View style={{ width: "100%" }}><ScreenHeader title="Staff" subtitle={isSuperAdmin ? "Manage application developers and gym owners across the platform" : "Invite, manage and control staff for your gym"} /></View>
        <View style={styles.headerActions}><Pressable accessibilityRole="button" style={styles.headerButton} onPress={() => showAlert("Export users", "User export is ready to connect to your backend export endpoint.")}><Ionicons name="download-outline" size={17} color={colors.ink} /><Text style={styles.headerButtonText}>Export</Text></Pressable><PrimaryButton title="Invite User" onPress={beginCreate} style={styles.addButton} /></View>
      </View>

      <View style={styles.metrics}>{isSuperAdmin ? <><CountCard label="Total Admins" value={users.length} icon="people-circle-outline" /><CountCard label="Application Developers" value={developerCount} icon="code-slash-outline" /><CountCard label="Gym Owners" value={gymOwnerCount} icon="business-outline" /></> : <><CountCard label="Total Staff" value={counts.trainer + counts.receptionist + counts.sub_admin} icon="people-circle-outline" /><CountCard label="Trainers" value={counts.trainer} icon="barbell-outline" /><CountCard label="Reception" value={counts.receptionist} icon="headset-outline" /><CountCard label="Sub Admins" value={counts.sub_admin} icon="shield-checkmark-outline" /></>}</View>

      <View style={styles.filterRow}>
        {(isSuperAdmin ? platformRoleOptions : roleOptions).map((option) => {
          const selected = roleFilter === option.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => setRoleFilter(option.value)}
              style={({ pressed }) => [styles.filterPill, selected && styles.filterPillSelected, pressed && styles.pressed]}
            >
              <Ionicons name={option.icon} size={17} color={selected ? colors.white : colors.muted} />
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          autoCapitalize="none"
          maxLength={120}
          onChangeText={setSearch}
          placeholder="Search name, email, or phone"
          placeholderTextColor={colors.subtle}
          style={styles.searchInput}
          value={search}
        />
        {search ? (
          <Pressable accessibilityRole="button" onPress={() => setSearch("")} accessibilityLabel={"Clear search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
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

      <View style={styles.tableCard}>
        {!compact && <View style={styles.tableHeader}><Text style={[styles.columnHeader, styles.userColumn]}>User</Text><Text style={styles.columnHeader}>Role</Text><Text style={styles.columnHeader}>Gym</Text><Text style={styles.columnHeader}>Status</Text><Text style={styles.columnHeader}>Joined On</Text><Text style={[styles.columnHeader, styles.actionColumn]}>Actions</Text></View>}
      <DataState
        loading={usersQuery.isLoading}
        error={usersQuery.error ? getApiErrorMessage(usersQuery.error) : null}
        empty={!usersQuery.isLoading && users.length === 0}
        emptyTitle={search ? "No users match" : "No users found"}
        emptyMessage={search ? "Clear the search or try another detail." : user?.role === "super_admin" ? "Create the first staff user for the platform." : "Create the first staff user for this gym."}
        emptyActionLabel={search ? "Clear Search" : "Create User"}
        onEmptyAction={search ? () => setSearch("") : beginCreate}
      />

      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
          scrollEnabled={false}
        />
      ) : null}
      </View>
    </Screen>
  ));
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
      const { styles, user, roleTone, statusTone, onView, colors, canEdit, isBusy, onEdit, onDeactivate } = model.props;
      return ((
    <View style={styles.userRow}>
      <View style={styles.userCell}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(user.name)}</Text></View><View style={styles.userBody}><Text style={styles.userName} numberOfLines={1}>{user.name}</Text><Text style={styles.userMeta} numberOfLines={1}>{user.email}</Text><Text style={styles.userMeta} numberOfLines={1}>{user.phone || "No phone"}</Text></View></View>
      <View style={styles.roleCell}><StatusBadge label={formatRole(user.role)} tone={roleTone(user.role)} /></View>
      <View style={styles.gymCell}><Text style={styles.cellText} numberOfLines={1}>{relatedDisplayName(user.gym_name, "Assigned gym")}</Text><Text style={styles.userMeta}>Current gym</Text></View>
      <View style={styles.statusCell}><StatusBadge label={user.status === "active" ? "Active" : "Inactive"} tone={statusTone(user.status)} /></View>
      <View style={styles.joinCell}><Text style={styles.cellText}>{formatDate(user.created_at)}</Text></View>
      <View style={styles.rowActions}>
        <Pressable accessibilityRole="button" onPress={onView} style={styles.iconButton} accessibilityLabel={"View user details"}>
          <Ionicons name="eye-outline" size={19} color={colors.ink} />
        </Pressable>
        <Pressable accessibilityRole="button" disabled={!canEdit || isBusy} onPress={onEdit} style={[styles.iconButton, (!canEdit || isBusy) && styles.disabledIcon]} accessibilityLabel={"Edit record"} accessibilityState={{ disabled: !canEdit || isBusy }}>
          <Ionicons name="create-outline" size={19} color={colors.ink} />
        </Pressable>
        <Pressable accessibilityRole="button" disabled={isBusy || user.status === "inactive"} onPress={onDeactivate} style={[styles.iconButton, (isBusy || user.status === "inactive") && styles.disabledIcon]} accessibilityLabel={"Deactivate user"} accessibilityState={{ disabled: isBusy || user.status === "inactive" }}>
          <Ionicons name="ban-outline" size={19} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  ));
    }
  }
}
