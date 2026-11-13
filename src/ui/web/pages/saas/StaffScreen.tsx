import { showAlert } from "../../../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import {
  BanSvg,
  DownloadSvg,
  DumbbellSvg,
  EditPenSvg,
  EyeSvg,
  HeadphonesSvg,
  SearchSvg,
  ShieldCheckSvg,
  UsersSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/pages/saas/StaffScreen.styles";
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
      const {
        compact,
        usersQuery,
        countsQuery,
        isSuperAdmin,
        colors,
        beginCreate,
        CountCard,
        users,
        counts,
        platformRoleOptions,
        roleOptions,
        roleFilter,
        setRoleFilter,
        setSearch,
        search,
        showForm,
        editingUser,
        formErrors,
        setFormValues,
        formValues,
        user,
        createRoleOptions,
        gymsQuery,
        createUser,
        updateUser,
        isMutating,
        submitForm,
        closeForm,
        selectedUser,
        setSelectedUser,
        Detail,
        beginEdit,
        notice,
        deactivateUser,
        UserRow,
        confirmDeactivate,
        setShowForm,
        developerCount,
        gymOwnerCount,
      } = model.props;

      const styles = createStyles(colors);

      const renderFilterIcon = (value: string, selected: boolean) => {
        const color = selected ? colors.textPrimary : colors.textSecondary;
        if (value === "all") return <UsersSvg size={15} color={color} />;
        if (value === "trainer") return <DumbbellSvg size={15} color={color} />;
        if (value === "receptionist") return <HeadphonesSvg size={15} color={color} />;
        if (value === "sub_admin") return <ShieldCheckSvg size={15} color={color} />;
        return <UsersSvg size={15} color={color} />;
      };

      const totalStaffCount = counts.trainer + counts.receptionist + counts.sub_admin || users.length;

      return (
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
              tintColor={colors.primary}
            />
          }
        >
          {/* Header & Right Action Buttons */}
          <View style={[styles.pageHeader, compact && styles.pageHeaderCompact]}>
            <View>
              <Text style={styles.pageTitle}>Staff</Text>
              <Text style={styles.pageSubtitle}>
                {isSuperAdmin
                  ? "Manage application developers and gym owners across the platform"
                  : "Invite, manage and control staff for your gym"}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.headerButton}
                onPress={() => showAlert("Export users", "User export is ready to connect to your backend export endpoint.")}
              >
                <DownloadSvg size={15} color={colors.iconSecondary} />
                <Text style={styles.headerButtonText}>Export</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={beginCreate}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Invite User</Text>
              </Pressable>
            </View>
          </View>

          {/* 4 Stat KPI Cards */}
          <View style={styles.metrics}>
            {isSuperAdmin ? (
              <>
                <CountCard label="Total Admins" value={users.length} icon="people-circle-outline" />
                <CountCard label="Application Developers" value={developerCount} icon="code-slash-outline" />
                <CountCard label="Gym Owners" value={gymOwnerCount} icon="business-outline" />
              </>
            ) : (
              <>
                <CountCard label="Total Staff" value={totalStaffCount} icon="people-circle-outline" />
                <CountCard label="Trainers" value={counts.trainer} icon="barbell-outline" />
                <CountCard label="Reception" value={counts.receptionist} icon="headset-outline" />
                <CountCard label="Sub Admins" value={counts.sub_admin} icon="shield-checkmark-outline" />
              </>
            )}
          </View>

          {/* Filter Pills / Role Tabs */}
          <View style={styles.filterRow}>
            {(isSuperAdmin ? platformRoleOptions : roleOptions).map((option) => {
              const selected = roleFilter === option.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => setRoleFilter(option.value)}
                  style={[styles.filterPill, selected && styles.filterPillSelected]}
                >
                  {renderFilterIcon(option.value, selected)}
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {option.label}
                  </Text>
                  {selected && option.value === "all" ? (
                    <View style={styles.filterCountBadge}>
                      <Text style={styles.filterCountText}>{totalStaffCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Full Width Search Bar */}
          <View style={styles.searchWrap}>
            <SearchSvg size={16} color={colors.iconSecondary} />
            <TextInput
              autoCapitalize="none"
              maxLength={120}
              onChangeText={setSearch}
              placeholder="Search name, email, or phone"
              placeholderTextColor={colors.placeholder}
              style={styles.searchInput}
              value={search}
            />
            {search ? (
              <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={colors.iconSecondary} />
              </Pressable>
            ) : null}
          </View>

          {/* Add / Edit User Form Modal/Panel */}
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
                  {editingUser && (editingUser.role as string) === "super_admin" ? (
                    <View style={styles.readOnlyRole}>
                      <Ionicons name="code-slash-outline" size={18} color={colors.primary} />
                      <Text style={styles.optionText}>Application Developer (role cannot be changed)</Text>
                    </View>
                  ) : null}
                  <View style={styles.optionGrid}>
                    {(editingUser && (editingUser.role as string) === "super_admin"
                      ? []
                      : user?.role === "super_admin"
                      ? [...createRoleOptions, { value: "gym_owner" as const, label: "Gym Owners", icon: "business-outline" as const }]
                      : createRoleOptions
                    ).map((option) => {
                      const selected = formValues.role === option.value;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          key={option.value}
                          onPress={() => setFormValues((current) => ({ ...current, role: option.value }))}
                          style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        >
                          <Ionicons name={option.icon} size={18} color={selected ? colors.textPrimary : colors.textSecondary} />
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
                          style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        >
                          <Ionicons
                            name={status === "active" ? "checkmark-circle-outline" : "pause-circle-outline"}
                            size={18}
                            color={selected ? colors.textPrimary : colors.textSecondary}
                          />
                          <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                            {status === "active" ? "Active" : "Inactive"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {user?.role === "super_admin" ? (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Gym assignment</Text>
                    <View style={styles.optionGrid}>
                      {(gymsQuery.data ?? []).map((gym) => {
                        const selected = formValues.gym_id === gym.id;
                        return (
                          <Pressable
                            key={gym.id}
                            accessibilityRole="button"
                            onPress={() => setFormValues((current) => ({ ...current, gym_id: gym.id }))}
                            style={[styles.optionButton, selected && styles.optionButtonSelected]}
                          >
                            <Ionicons name="business-outline" size={18} color={selected ? colors.textPrimary : colors.textSecondary} />
                            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{gym.name}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {formErrors.gym_id ? <Text style={styles.error}>{formErrors.gym_id}</Text> : null}
                  </View>
                ) : null}

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

          {/* User Details Panel */}
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
              {(selectedUser.role as string) !== "super_admin" ? (
                <PrimaryButton title="Edit all user information" icon="create-outline" onPress={() => beginEdit(selectedUser)} />
              ) : (
                <Text style={styles.protectedNotice}>This Application Developer account is protected and cannot be edited from the UI.</Text>
              )}
            </SurfacePanel>
          ) : null}

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {deactivateUser.error ? <Text style={styles.error}>{getApiErrorMessage(deactivateUser.error)}</Text> : null}

          {/* Staff Table Card */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, styles.userColumn]}>USER</Text>
              <Text style={[styles.columnHeader, styles.roleColumn]}>ROLE</Text>
              <Text style={[styles.columnHeader, styles.gymColumn]}>GYM</Text>
              <Text style={[styles.columnHeader, styles.statusColumn]}>STATUS</Text>
              <Text style={[styles.columnHeader, styles.joinColumn]}>JOINED ON</Text>
              <Text style={[styles.columnHeader, styles.actionColumn]}>ACTIONS</Text>
            </View>

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
      );
    }
  }
}

export function CountCardView({ model }: { model: ReturnType<typeof useCountCardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { icon, colors, value, label } = model.props;
      const styles = createStyles(colors);

      const renderIcon = () => {
        if (label.includes("Staff") || label.includes("Admins") || icon.includes("people")) {
          return <UsersSvg size={18} color={colors.primary} />;
        }
        if (label.includes("Trainer") || icon.includes("barbell")) {
          return <DumbbellSvg size={18} color={colors.primary} />;
        }
        if (label.includes("Reception") || icon.includes("headset")) {
          return <HeadphonesSvg size={18} color={colors.primary} />;
        }
        if (label.includes("Sub Admin") || icon.includes("shield")) {
          return <ShieldCheckSvg size={18} color={colors.primary} />;
        }
        return <UsersSvg size={18} color={colors.primary} />;
      };

      return (
        <View style={styles.countCard}>
          <View style={styles.countIcon}>
            {renderIcon()}
          </View>
          <View>
            <Text style={styles.countValue}>{value}</Text>
            <Text style={styles.countLabel}>{label}</Text>
          </View>
        </View>
      );
    }
  }
}

export function DetailView({ model }: { model: ReturnType<typeof useDetailPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { label, value } = model.props;
      const styles = model.props.styles as unknown as ReturnType<typeof createStyles>;
      return (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      );
    }
  }
}

export function UserRowView({ model }: { model: ReturnType<typeof useUserRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { user, onView, colors, canEdit, isBusy, onEdit, onDeactivate } = model.props;
      const styles = createStyles(colors);

      const avatarStyle =
        user.role === "sub_admin"
          ? styles.avatarSubAdmin
          : user.role === "receptionist"
          ? styles.avatarReception
          : user.role === "trainer"
          ? styles.avatarTrainer
          : styles.avatarDefault;
      const avatarTextStyle = user.role === "receptionist" ? styles.avatarReceptionText : styles.avatarText;

      const renderRoleBadge = () => {
        if (user.role === "sub_admin") {
          return (
            <View style={[styles.roleBadge, styles.roleBadgeSubAdmin]}>
              <Text style={styles.roleTextSubAdmin}>Sub Admin</Text>
            </View>
          );
        }
        if (user.role === "receptionist") {
          return (
            <View style={[styles.roleBadge, styles.roleBadgeReception]}>
              <Text style={styles.roleTextReception}>Reception</Text>
            </View>
          );
        }
        if (user.role === "trainer") {
          return (
            <View style={[styles.roleBadge, styles.roleBadgeTrainer]}>
              <Text style={styles.roleTextTrainer}>Trainer</Text>
            </View>
          );
        }
        if (user.role === "gym_owner") {
          return (
            <View style={[styles.roleBadge, styles.roleBadgeGymOwner]}>
              <Text style={styles.roleTextGymOwner}>Gym Owner</Text>
            </View>
          );
        }
        return (
          <View style={[styles.roleBadge, styles.roleBadgeDefault]}>
            <Text style={styles.roleTextDefault}>{formatRole(user.role)}</Text>
          </View>
        );
      };

      return (
        <View style={styles.userRow}>
          {/* USER COLUMN */}
          <View style={styles.userCell}>
            <View style={[styles.avatar, avatarStyle]}>
              <Text style={avatarTextStyle}>{initials(user.name)}</Text>
            </View>
            <View style={styles.userBody}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userMeta} numberOfLines={1}>{user.email}</Text>
              <Text style={styles.userPhone} numberOfLines={1}>{user.phone || "No phone"}</Text>
            </View>
          </View>

          {/* ROLE COLUMN */}
          <View style={styles.roleCell}>
            {renderRoleBadge()}
          </View>

          {/* GYM COLUMN */}
          <View style={styles.gymCell}>
            <Text style={styles.cellText} numberOfLines={1}>
              {relatedDisplayName(user.gym_name, "Assigned gym") || "ZD Fitness"}
            </Text>
            <Text style={styles.gymSubtitle}>Current gym</Text>
          </View>

          {/* STATUS COLUMN */}
          <View style={styles.statusCell}>
            {user.status === "active" ? (
              <View style={styles.statusBadgeActive}>
                <Text style={styles.statusTextActive}>Active</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeInactive}>
                <Text style={styles.statusTextInactive}>Inactive</Text>
              </View>
            )}
          </View>

          {/* JOINED ON COLUMN */}
          <View style={styles.joinCell}>
            <Text style={styles.joinText}>{formatDate(user.created_at)}</Text>
          </View>

          {/* ACTIONS COLUMN */}
          <View style={styles.rowActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onView}
              style={styles.actionCircleButton}
              accessibilityLabel="View user details"
            >
              <EyeSvg size={15} color={colors.iconSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!canEdit || isBusy}
              onPress={onEdit}
              style={[styles.actionCircleButton, (!canEdit || isBusy) && styles.disabledIcon]}
              accessibilityLabel="Edit user"
            >
              <EditPenSvg size={15} color={colors.iconSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isBusy || user.status === "inactive"}
              onPress={onDeactivate}
              style={[styles.actionCircleButton, (isBusy || user.status === "inactive") && styles.disabledIcon]}
              accessibilityLabel="Deactivate user"
            >
              <BanSvg size={15} color={colors.iconSecondary} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}
