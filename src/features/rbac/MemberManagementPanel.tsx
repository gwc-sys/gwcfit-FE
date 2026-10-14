import { showAlert } from "../../utils/appAlert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Controller,
  useForm,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState } from "../../components/EmptyState";
import { FormTextField } from "../../components/FormTextField";
import { GymSelectField } from "../../components/GymSelectField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useUpdateMember,
} from "../../hooks/useRbac";
import { getApiErrorMessage } from "../../services/api/client";
import { gymsApi } from "../../services/api/operations";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type {
  Member,
  MemberCreatePayload,
  MemberUpdatePayload,
} from "../../types/saas";
import {
  memberCreateSchema,
  memberUpdateSchema,
  type MemberCreateFormValues,
  type MemberUpdateFormValues,
} from "../../validation/rbac";

type SortDirection = "az" | "za";

export function MemberManagementPanel() {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("az");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedGymName, setSelectedGymName] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const listParams = useMemo(
    () => ({
      q: deferredSearch || undefined,
      limit: 50,
    }),
    [deferredSearch],
  );
  const membersQuery = useMembers(listParams);
  const gymQuery = useQuery({
    queryKey: ["operations", "my-gym"],
    queryFn: () => gymsApi.getMyGym(),
    retry: false,
  });
  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const deleteMemberMutation = useDeleteMember();

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<MemberCreateFormValues, unknown, MemberCreatePayload>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      member_code: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  const {
    control: updateControl,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<MemberUpdateFormValues, unknown, MemberUpdatePayload>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  const gymOptions = useMemo(() => {
    if (!gymQuery.data?.name) {
      return [];
    }

    return [{ id: gymQuery.data.id, name: gymQuery.data.name }];
  }, [gymQuery.data]);
  const gymLoadError = gymQuery.error
    ? getApiErrorMessage(gymQuery.error)
    : null;

  useEffect(() => {
    if (gymQuery.data?.name) {
      setSelectedGymName(gymQuery.data.name);
    }
  }, [gymQuery.data?.name]);

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((left, right) => {
      const leftName = `${left.first_name} ${left.last_name}`;
      const rightName = `${right.first_name} ${right.last_name}`;
      const comparison = leftName.localeCompare(rightName);
      return sortDirection === "az" ? comparison : -comparison;
    });
  }, [membersQuery.data, sortDirection]);

  const beginCreate = useCallback(() => {
    setNotice(null);
    setEditingMember(null);
    setShowForm(true);
    resetCreate({
      member_code: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
    });
  }, [resetCreate]);

  const startEditing = useCallback(
    (member: Member) => {
      setNotice(null);
      setEditingMember(member);
      setShowForm(true);
      resetUpdate({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email ?? "",
        phone: member.phone ?? "",
        status: member.status,
      });
    },
    [resetUpdate],
  );

  const closeForm = useCallback(() => {
    setEditingMember(null);
    setShowForm(false);
    resetUpdate({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
    });
  }, [resetUpdate]);

  const submitCreate = handleCreateSubmit((values) => {
    setNotice(null);
    createMemberMutation.mutate(values, {
      onSuccess: (member) => {
        resetCreate({
          member_code: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          status: "active",
        });
        setNotice(`${member.first_name} ${member.last_name} was created.`);
        closeForm();
      },
    });
  });

  const submitUpdate = handleUpdateSubmit((values) => {
    if (!editingMember) {
      return;
    }

    setNotice(null);
    updateMemberMutation.mutate(
      {
        memberId: editingMember.id,
        payload: values,
      },
      {
        onSuccess: (member) => {
          setNotice(`${member.first_name} ${member.last_name} was updated.`);
          closeForm();
        },
      },
    );
  });

  const confirmDelete = useCallback(
    (member: Member) => {
      showAlert(
        "Deactivate member",
        `Deactivate ${member.first_name} ${member.last_name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: () => {
              setNotice(null);
              deleteMemberMutation.mutate(member.id, {
                onSuccess: (response) => {
                  setNotice(response.message);
                  if (editingMember?.id === member.id) {
                    closeForm();
                  }
                },
              });
            },
          },
        ],
      );
    },
    [closeForm, deleteMemberMutation, editingMember?.id],
  );

  const renderMember = useCallback(
    ({ item }: { item: Member }) => (
      <MemberRow
        isBusy={deleteMemberMutation.isPending}
        member={item}
        compact={compact}
        onDelete={() => confirmDelete(item)}
        onEdit={() => startEditing(item)}
      />
    ),
    [compact, confirmDelete, deleteMemberMutation.isPending, startEditing],
  );

  return (
    <SurfacePanel
      title="Member Management"
      kicker="Gym Admin"
      icon="people-outline"
      actionLabel={showForm ? undefined : "New"}
      onAction={showForm ? undefined : beginCreate}
    >
      <View style={styles.summaryRow}>
        <StatusBadge label={`${members.length} loaded`} />
        <StatusBadge label="searchable" tone="info" />
      </View>

      <View style={[styles.toolbar, compact && styles.toolbarCompact]}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            autoCapitalize="none"
            maxLength={120}
            onChangeText={setSearch}
            placeholder="Search code, name, email, or phone"
            placeholderTextColor={colors.subtle}
            style={styles.searchInput}
            value={search}
          />
          {search ? (
            <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            setSortDirection((value) => (value === "az" ? "za" : "az"))
          }
          style={styles.sortButton}
        >
          <Ionicons
            name={sortDirection === "az" ? "arrow-down" : "arrow-up"}
            size={18}
            color={colors.ink}
          />
          <Text style={styles.sortText}>{sortDirection.toUpperCase()}</Text>
        </Pressable>
      </View>

      {showForm ? (
        <View style={styles.formBlock}>
          <View style={styles.formHeader}>
            <Text style={styles.blockTitle}>
              {editingMember ? "Update member" : "Create member"}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={closeForm}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>
          {editingMember ? (
            <View style={styles.formGrid}>
              <UpdateField
                control={updateControl}
                error={updateErrors.first_name?.message}
                label="First name"
                name="first_name"
                required
              />
              <UpdateField
                control={updateControl}
                error={updateErrors.last_name?.message}
                label="Last name"
                name="last_name"
                required
              />
              <UpdateField
                autoCapitalize="none"
                control={updateControl}
                error={updateErrors.email?.message}
                keyboardType="email-address"
                label="Email"
                leftIcon="mail-outline"
                name="email"
              />
              <UpdateField
                control={updateControl}
                error={updateErrors.phone?.message}
                keyboardType="phone-pad"
                label="Phone"
                leftIcon="call-outline"
                name="phone"
              />
              <UpdateField
                control={updateControl}
                error={updateErrors.status?.message}
                label="Status"
                name="status"
              />
              {updateMemberMutation.error ? (
                <Text style={styles.error}>
                  {getApiErrorMessage(updateMemberMutation.error)}
                </Text>
              ) : null}
              <View
                style={[styles.actionRow, compact && styles.actionRowCompact]}
              >
                <PrimaryButton
                  disabled={updateMemberMutation.isPending}
                  loading={updateMemberMutation.isPending}
                  onPress={submitUpdate}
                  style={styles.actionButton}
                  title="Save"
                />
                <PrimaryButton
                  disabled={updateMemberMutation.isPending}
                  onPress={closeForm}
                  style={styles.actionButton}
                  title="Cancel"
                  variant="secondary"
                />
              </View>
            </View>
          ) : (
            <View style={styles.formGrid}>
              <GymSelectField
                error={gymLoadError}
                helperText={
                  gymLoadError
                    ? null
                    : gymQuery.data
                      ? `Members will be created under ${gymQuery.data.name}.`
                      : "Loading your gym..."
                }
                label="Gym"
                loading={gymQuery.isLoading || gymQuery.isFetching}
                onSelect={setSelectedGymName}
                options={gymOptions}
                value={selectedGymName}
              />
              <CreateField
                control={createControl}
                error={createErrors.member_code?.message}
                label="Member code"
                name="member_code"
                required
              />
              <CreateField
                control={createControl}
                error={createErrors.first_name?.message}
                label="First name"
                name="first_name"
                required
              />
              <CreateField
                control={createControl}
                error={createErrors.last_name?.message}
                label="Last name"
                name="last_name"
                required
              />
              <CreateField
                autoCapitalize="none"
                control={createControl}
                error={createErrors.email?.message}
                keyboardType="email-address"
                label="Email"
                leftIcon="mail-outline"
                name="email"
              />
              <CreateField
                control={createControl}
                error={createErrors.phone?.message}
                keyboardType="phone-pad"
                label="Phone"
                leftIcon="call-outline"
                name="phone"
              />
              <CreateField
                control={createControl}
                error={createErrors.status?.message}
                label="Status"
                name="status"
              />
              {createMemberMutation.error ? (
                <Text style={styles.error}>
                  {getApiErrorMessage(createMemberMutation.error)}
                </Text>
              ) : null}
              <PrimaryButton
                disabled={createMemberMutation.isPending}
                icon="person-add-outline"
                loading={createMemberMutation.isPending}
                onPress={submitCreate}
                title="Create Member"
              />
            </View>
          )}
        </View>
      ) : null}

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {membersQuery.error ? (
        <Text style={styles.error}>
          {getApiErrorMessage(membersQuery.error)}
        </Text>
      ) : null}
      {deleteMemberMutation.error ? (
        <Text style={styles.error}>
          {getApiErrorMessage(deleteMemberMutation.error)}
        </Text>
      ) : null}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          membersQuery.isLoading ? (
            <Text style={styles.empty}>Loading members...</Text>
          ) : (
            <EmptyState
              icon="people-outline"
              title={search ? "No members match" : "No members yet"}
              message={
                search
                  ? "Clear the search or try another term."
                  : "Create the first member profile for this gym."
              }
              actionLabel={search ? "Clear Search" : "Create Member"}
              onAction={search ? () => setSearch("") : beginCreate}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={renderMember}
        scrollEnabled={false}
      />
    </SurfacePanel>
  );
}

type CreateFieldName = Path<MemberCreateFormValues>;
type UpdateFieldName = Path<MemberUpdateFormValues>;

type BaseFieldProps<Name extends string> = {
  name: Name;
  label: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
};

type CreateFieldProps = BaseFieldProps<CreateFieldName> & {
  control: Control<MemberCreateFormValues, unknown, MemberCreatePayload>;
};

type UpdateFieldProps = BaseFieldProps<UpdateFieldName> & {
  control: Control<MemberUpdateFormValues, unknown, MemberUpdatePayload>;
};

function CreateField(props: CreateFieldProps) {
  return <ControlledField {...props} />;
}

function UpdateField(props: UpdateFieldProps) {
  return <ControlledField {...props} />;
}

function ControlledField<
  TValues extends FieldValues,
  TOutput extends FieldValues | undefined,
>({
  control,
  name,
  label,
  error,
  autoCapitalize,
  keyboardType = "default",
  leftIcon,
  required,
}: {
  control: Control<TValues, unknown, TOutput>;
  name: Path<TValues>;
  label: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <FormTextField
          autoCapitalize={autoCapitalize}
          error={error}
          keyboardType={keyboardType}
          label={label}
          leftIcon={leftIcon}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={label}
          required={required}
          value={String(value ?? "")}
        />
      )}
    />
  );
}

type MemberRowProps = {
  member: Member;
  compact?: boolean;
  isBusy: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function MemberRow({
  member,
  compact,
  isBusy,
  onEdit,
  onDelete,
}: MemberRowProps) {
  const fullName = `${member.first_name} ${member.last_name}`;
  const statusTone =
    member.status === "active"
      ? "success"
      : member.status === "paused"
        ? "warning"
        : "neutral";

  return (
    <View style={[styles.memberRow, compact && styles.memberRowCompact]}>
      <View style={styles.memberIcon}>
        <Text style={styles.memberInitial}>
          {member.first_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberBody}>
        <View style={styles.memberTopLine}>
          <Text style={styles.memberName} numberOfLines={1}>
            {fullName}
          </Text>
          <StatusBadge label={member.status} tone={statusTone} />
        </View>
        <Text style={styles.memberMeta} numberOfLines={1}>
          {member.member_code}
        </Text>
        {member.email ? (
          <Text style={styles.memberMeta} numberOfLines={1}>
            {member.email}
          </Text>
        ) : null}
      </View>
      <View style={[styles.rowActions, compact && styles.rowActionsCompact]}>
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={styles.iconButton}
        >
          <Ionicons name="create-outline" size={19} color={colors.ink} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={onDelete}
          style={styles.iconButton}
        >
          <Ionicons name="trash-outline" size={19} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toolbarCompact: {
    flexDirection: "column",
  },
  searchWrap: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.darkCard,
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    ...typography.body,
  },
  sortButton: {
    minWidth: 74,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.darkCard,
  },
  sortText: {
    ...typography.small,
    color: colors.ink,
  },
  formBlock: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  blockTitle: {
    ...typography.h3,
    color: colors.ink,
    flex: 1,
  },
  formGrid: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionRowCompact: {
    flexDirection: "column",
  },
  actionButton: {
    flex: 1,
  },
  error: {
    ...typography.small,
    color: colors.danger,
  },
  notice: {
    ...typography.small,
    color: colors.primaryDark,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    paddingVertical: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  memberRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: colors.darkCard,
  },
  memberRowCompact: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  memberIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  memberInitial: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  memberBody: {
    flex: 1,
    minWidth: 0,
  },
  memberTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  memberName: {
    ...typography.h3,
    color: colors.ink,
    flex: 1,
  },
  memberMeta: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  rowActionsCompact: {
    justifyContent: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
});
