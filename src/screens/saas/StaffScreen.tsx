import type * as React from "react";
import { StaffScreenView, CountCardView, DetailView, UserRowView } from "./StaffScreen.presentation";
import { createStyles } from "./StaffScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { usersApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useGyms } from "../../hooks/useOperations";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { JoinableRoleName, ManagedUser, ManagedUserRole, UserCreatePayload, UserStatus, UserUpdatePayload } from "../../types/saas";
import { relatedDisplayName } from "../../utils/displayNames";
import { formatDate, formatRole, initials } from "../../utils/formatters";
import { userCreateSchema, userUpdateSchema } from "../../validation/users";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

type RoleFilter = "all" | "super_admin" | "gym_owner" | JoinableRoleName;
type UserFormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: ManagedUserRole;
  status: UserStatus;
  gym_id?: string;
};

const roleOptions: Array<{ value: RoleFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: "all", label: "All Staff", icon: "people-outline" },
  { value: "trainer", label: "Trainers", icon: "barbell-outline" },
  { value: "receptionist", label: "Reception", icon: "headset-outline" },
  { value: "sub_admin", label: "Sub Admins", icon: "shield-checkmark-outline" }
];

const platformRoleOptions: Array<{ value: RoleFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: "all", label: "All Admins", icon: "people-outline" },
  { value: "super_admin", label: "Application Developers", icon: "code-slash-outline" },
  { value: "gym_owner", label: "Gym Owners", icon: "business-outline" }
];

const createRoleOptions = roleOptions.filter((option): option is { value: JoinableRoleName; label: string; icon: keyof typeof Ionicons.glyphMap } => option.value !== "all");

const defaultFormValues: UserFormValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "receptionist",
  status: "active",
  gym_id: ""
};

export function useStaffScreenPresentation() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const compact = width < 900;
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super_admin";
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageUsers = user?.role === "gym_owner" || hasPermission("manage_staff");
  const gymsQuery = useGyms({ limit: 200 }, user?.role === "super_admin");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const listParams = useMemo(
    () => ({
      q: deferredSearch || undefined,
      role: isSuperAdmin || roleFilter === "all" ? undefined : roleFilter as ManagedUserRole,
      limit: 200
    }),
    [deferredSearch, roleFilter, isSuperAdmin]
  );

  const usersQuery = useQuery({
    queryKey: ["users", "management", listParams],
    queryFn: () => usersApi.list(listParams),
    enabled: canManageUsers,
    retry: false,
    refetchOnMount: "always"
  });
  const countsQuery = useQuery({
    queryKey: ["users", "counts"],
    queryFn: () => usersApi.counts(),
    enabled: canManageUsers,
    retry: false,
    refetchOnMount: "always"
  });
  const refetchUsers = usersQuery.refetch;
  const refetchCounts = countsQuery.refetch;

  useFocusEffect(
    useCallback(() => {
      if (canManageUsers) {
        void refetchUsers();
        void refetchCounts();
      }
    }, [canManageUsers, refetchCounts, refetchUsers])
  );

  const createUser = useMutation({
    mutationFn: (payload: UserCreatePayload) => usersApi.create(payload),
    onSuccess: (createdUser) => {
      setNotice(`${createdUser.name} was created.`);
      closeForm();
      invalidateUserCaches();
    }
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UserUpdatePayload }) => usersApi.update(userId, payload),
    onSuccess: (updatedUser) => {
      setNotice(`${updatedUser.name} was updated.`);
      closeForm();
      invalidateUserCaches();
    }
  });

  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: (response) => {
      setNotice(response.message);
      invalidateUserCaches();
    }
  });

  const invalidateUserCaches = () => {
    void queryClient.invalidateQueries({ queryKey: ["users"] });
    void queryClient.invalidateQueries({ queryKey: ["users", "counts"] });
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some((part) => part === "dashboard" || part === "gym-admin-dashboard")
    });
  };

  const users = useMemo(() => {
    const scopedList = (usersQuery.data ?? []).filter((target) => isSuperAdmin ? (target.role as string) === "super_admin" || target.role === "gym_owner" : target.role === "trainer" || target.role === "receptionist" || target.role === "sub_admin");
    const list = roleFilter === "all" ? scopedList : scopedList.filter((target) => (target.role as string) === roleFilter);
    return [...list].sort((left, right) => left.name.localeCompare(right.name));
  }, [usersQuery.data, isSuperAdmin]);

  const counts = useMemo(
    () => ({
      member: countsQuery.data?.member ?? 0,
      trainer: countsQuery.data?.trainer ?? 0,
      receptionist: countsQuery.data?.receptionist ?? 0,
      sub_admin: countsQuery.data?.sub_admin ?? 0
    }),
    [countsQuery.data]
  );

  if (!canManageUsers) {
    return { kind: "view1" as const, props: {  } };
  }

  const beginCreate = () => {
    setEditingUser(null);
    setSelectedUser(null);
    setFormErrors({});
    setFormValues(defaultFormValues);
    setShowForm(true);
  };

  const beginEdit = (target: ManagedUser) => {
    if ((target.role as string) === "super_admin") {
      return;
    }
    setEditingUser(target);
    setSelectedUser(null);
    setFormErrors({});
    setFormValues({
      name: target.name,
      email: target.email,
      password: "",
      phone: target.phone ?? "",
      role: target.role,
      status: target.status,
      gym_id: target.gym_id ?? ""
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormErrors({});
    setFormValues(defaultFormValues);
  };

  const submitForm = () => {
    setNotice(null);
    setFormErrors({});
    const schema = editingUser ? userUpdateSchema : userCreateSchema;
    const valuesToValidate = editingUser && (editingUser.role as string) === "super_admin" ? { ...formValues, role: undefined } : formValues;
    const parsed = schema.safeParse(valuesToValidate);

    if (!parsed.success) {
      setFormErrors(
        Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]))
      );
      return;
    }

    if (editingUser) {
      updateUser.mutate({ userId: editingUser.id, payload: parsed.data as UserUpdatePayload });
      return;
    }

    createUser.mutate(parsed.data as UserCreatePayload);
  };

  const confirmDeactivate = (target: ManagedUser) => {
    showAlert("Deactivate user", `Deactivate ${target.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: () => {
          setNotice(null);
          deactivateUser.mutate(target.id);
        }
      }
    ]);
  };

  const isMutating = createUser.isPending || updateUser.isPending || deactivateUser.isPending;

  return { kind: "view2" as const, props: { styles, compact, usersQuery, countsQuery, isSuperAdmin, colors, beginCreate, CountCard, users, counts, platformRoleOptions, roleOptions, roleFilter, setRoleFilter, setSearch, search, showForm, editingUser, formErrors, setFormValues, formValues, user, createRoleOptions, gymsQuery, createUser, updateUser, isMutating, submitForm, closeForm, selectedUser, setSelectedUser, Detail, beginEdit, notice, deactivateUser, UserRow, confirmDeactivate, setShowForm , developerCount: users.filter((item) => (item.role as string) === "super_admin").length, gymOwnerCount: users.filter((item) => item.role === "gym_owner").length} };
}

export function StaffScreen(...args: Parameters<typeof useStaffScreenPresentation>): React.JSX.Element {
  return <StaffScreenView model={useStaffScreenPresentation(...args)} />;
}

function isJoinableRole(role: string): boolean {
  return role === "member" || role === "trainer" || role === "receptionist" || role === "sub_admin" || role === "gym_owner";
}

function roleTone(role: string) {
  if (role === "trainer") {
    return "info" as const;
  }
  if (role === "receptionist") {
    return "warning" as const;
  }
  if (role === "sub_admin") {
    return "success" as const;
  }
  if (role === "gym_owner") {
    return "danger" as const;
  }
  return "neutral" as const;
}

function statusTone(status: UserStatus) {
  return status === "active" ? "success" as const : "warning" as const;
}

export function useCountCardPresentation({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return { kind: "view1" as const, props: { styles, icon, colors, value, label } };
}

function CountCard(...args: Parameters<typeof useCountCardPresentation>): React.JSX.Element {
  return <CountCardView model={useCountCardPresentation(...args)} />;
}

export function useDetailPresentation({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return { kind: "view1" as const, props: { styles, label, value } };
}

function Detail(...args: Parameters<typeof useDetailPresentation>): React.JSX.Element {
  return <DetailView model={useDetailPresentation(...args)} />;
}

export function useUserRowPresentation({
  user,
  compact,
  isBusy,
  onDeactivate,
  onEdit,
  onView
}: {
  user: ManagedUser;
  compact?: boolean;
  isBusy: boolean;
  onDeactivate: () => void;
  onEdit: () => void;
  onView: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canEdit = isJoinableRole(user.role);

  return { kind: "view1" as const, props: { styles, user, roleTone, statusTone, onView, colors, canEdit, isBusy, onEdit, onDeactivate } };
}

function UserRow(...args: Parameters<typeof useUserRowPresentation>): React.JSX.Element {
  return <UserRowView model={useUserRowPresentation(...args)} />;
}


