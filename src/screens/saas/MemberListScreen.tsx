import type * as React from "react";
import { MemberListScreenView, PlatformUserDirectoryView, PlatformUserRowView, PlatformStatView, UserDetailsModalView, FormFieldView, PlatformDetailView, MemberRowView, MemberStatView } from "./MemberListScreen.presentation";
import { createPlatformDirectoryStyles, createStyles } from "./MemberListScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { DataState } from "../../components/DataState";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { useDeleteMember, useMembers } from "../../hooks/useRbac";
import { useGyms } from "../../hooks/useOperations";
import { usersApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { Gym, ManagedUser, ManagedUserRole, Member, UserStatus } from "../../types/saas";
import { relatedDisplayName } from "../../utils/displayNames";
import {
  formatDate,
  getMembershipState,
  initials,
  memberStatusTone,
} from "../../utils/formatters";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

type SortDirection = "az" | "za";
type MemberFilter = "all" | "active" | "inactive" | "expired" | "frozen";

export function useMemberListScreenPresentation() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const compact = width < 520;
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isTrainer = useAuthStore((state) => state.user?.role === "trainer");
  const isSuperAdmin = useAuthStore((state) => state.user?.role === "super_admin");
  const canManageMembers = hasPermission("manage_members");
  const canViewMembers = isTrainer || canManageMembers;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<SortDirection>("az");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const membersQuery = useMembers(
    {
      q: deferredSearch || undefined,
      skip: page * 50,
      limit: 50,
    },
    canViewMembers && !isSuperAdmin,
  );
  const deleteMember = useDeleteMember();

  const members = useMemo(() => {
    const list = membersQuery.data ?? [];
    return [...list].sort((left, right) => {
      const comparison = `${left.first_name} ${left.last_name}`.localeCompare(
        `${right.first_name} ${right.last_name}`,
      );
      return sortDirection === "az" ? comparison : -comparison;
    });
  }, [membersQuery.data, sortDirection]);
  const visibleMembers = useMemo(() => {
    if (memberFilter === "all") return members;
    return members.filter((member) => {
      const status = member.status.toLowerCase();
      if (memberFilter === "expired") {
        return getMembershipState(member.membership_ends_at).tone === "danger";
      }
      return status === memberFilter;
    });
  }, [memberFilter, members]);
  const activeCount = (membersQuery.data ?? []).filter(
    (member) => member.status.toLowerCase() === "active",
  ).length;
  const expiredCount = (membersQuery.data ?? []).filter(
    (member) => getMembershipState(member.membership_ends_at).tone === "danger",
  ).length;
  const newThisMonthCount = (membersQuery.data ?? []).filter((member) => {
    const joined = new Date(member.joined_at);
    const now = new Date();
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;

  if (!canViewMembers) {
    return { kind: "view1" as const, props: {  } };
  }

  if (isSuperAdmin) {
    return { kind: "view2" as const, props: { PlatformUserDirectory } };
  }

  const confirmDelete = (member: Member) => {
    showAlert(
      "Deactivate member",
      `${member.first_name} ${member.last_name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => {
            setNotice(null);
            deleteMember.mutate(member.id, {
              onSuccess: (response) => setNotice(response.message),
            });
          },
        },
      ],
    );
  };

  return { kind: "view3" as const, props: { styles, compact, membersQuery, isTrainer, colors, setSearch, setPage, search, setMemberFilter, memberFilter, canManageMembers, navigation, MemberStat, activeCount, newThisMonthCount, expiredCount, setSortDirection, sortDirection, notice, deleteMember, visibleMembers, MemberRow, confirmDelete, page } };
}

export function MemberListScreen(...args: Parameters<typeof useMemberListScreenPresentation>): React.JSX.Element {
  return <MemberListScreenView model={useMemberListScreenPresentation(...args)} />;
}

type MemberRowProps = {
  member: Member;
  compact?: boolean;
  isDeleting: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function usePlatformUserDirectoryPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createPlatformDirectoryStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "member" | "trainer" | "receptionist" | "sub_admin">("all");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "", password: "", role: "member" as ManagedUserRole, status: "active" as UserStatus, gym_id: "" });
  const gymsQuery = useGyms({ limit: 200 }, true);
  const deferredSearch = useDeferredValue(search.trim());
  const usersQuery = useInfiniteQuery({
    queryKey: ["platform-users-directory", deferredSearch],
    queryFn: ({ pageParam }) => usersApi.list({ q: deferredSearch || undefined, skip: pageParam * 20, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.length : undefined,
    retry: false,
  });
  const users = (usersQuery.data?.pages.flatMap((page) => page) ?? []).filter((user) => (user.role as string) !== "super_admin" && user.role !== "gym_owner");
  const visibleUsers = users.filter((user) => filter === "all" || user.role === filter);
  const roleCount = (role: string) => users.filter((user) => (user.role as string) === role).length;
  const updateUser = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: { name: string; email: string; phone?: string | null; password?: string; role: ManagedUserRole; status: UserStatus; gym_id?: string | null } }) => usersApi.update(userId, payload),
    onSuccess: (updated) => { setSelectedUser(updated); setEditingUser(null); void queryClient.invalidateQueries({ queryKey: ["platform-users-directory"] }); }
  });
  const openEditor = (user: ManagedUser) => { setSelectedUser(user); setEditingUser(user); setDraft({ name: user.name, email: user.email, phone: user.phone ?? "", password: "", role: user.role, status: user.status, gym_id: user.gym_id ?? "" }); };
  const saveUser = () => { if (!editingUser || !draft.name.trim() || !draft.email.trim()) return; updateUser.mutate({ userId: editingUser.id, payload: { name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() || null, ...(draft.password.trim() ? { password: draft.password } : {}), role: draft.role, status: draft.status, gym_id: draft.gym_id || null } }); };

  return { kind: "view1" as const, props: { styles, colors, setSearch, search, setFilter, navigation, PlatformStat, users, roleCount, filter, usersQuery, visibleUsers, PlatformUserRow, setSelectedUser, openEditor, UserDetailsModal, selectedUser, editingUser, draft, setDraft, gymsQuery, updateUser, setEditingUser, saveUser , activeUserCount: users.filter((user) => user.status === "active").length, inactiveUserCount: users.filter((user) => user.status !== "active").length} };
}

function PlatformUserDirectory(...args: Parameters<typeof usePlatformUserDirectoryPresentation>): React.JSX.Element {
  return <PlatformUserDirectoryView model={usePlatformUserDirectoryPresentation(...args)} />;
}

export function usePlatformUserRowPresentation({ user, styles, colors, onPress, onEdit }: { user: ManagedUser; styles: ReturnType<typeof createPlatformDirectoryStyles>; colors: ThemeColors; onPress: () => void; onEdit: () => void }) {
  return { kind: "view1" as const, props: { onPress, styles, user, onEdit, colors } };
}

function PlatformUserRow(...args: Parameters<typeof usePlatformUserRowPresentation>): React.JSX.Element {
  return <PlatformUserRowView model={usePlatformUserRowPresentation(...args)} />;
}

export function usePlatformStatPresentation({ icon, label, value, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string; styles: ReturnType<typeof createPlatformDirectoryStyles> }) {
  return { kind: "view1" as const, props: { styles, tone, icon, label, value } };
}

function PlatformStat(...args: Parameters<typeof usePlatformStatPresentation>): React.JSX.Element {
  return <PlatformStatView model={usePlatformStatPresentation(...args)} />;
}

export function useUserDetailsModalPresentation({ user, editingUser, draft, setDraft, gyms, saving, error, onClose, onEdit, onSave }: { user: ManagedUser | null; editingUser: ManagedUser | null; draft: { name: string; email: string; phone: string; password: string; role: ManagedUserRole; status: UserStatus; gym_id: string }; setDraft: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; password: string; role: ManagedUserRole; status: UserStatus; gym_id: string }>>; gyms: Gym[]; saving: boolean; error: string | null; onClose: () => void; onEdit: () => void; onSave: () => void }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createPlatformDirectoryStyles(colors), [colors]);
  return { kind: "view1" as const, props: { user, onClose, styles, editingUser, colors, FormField, draft, setDraft, gyms, error, saving, onSave, PlatformDetail, onEdit } };
}

function UserDetailsModal(...args: Parameters<typeof useUserDetailsModalPresentation>): React.JSX.Element {
  return <UserDetailsModalView model={useUserDetailsModalPresentation(...args)} />;
}

export function useFormFieldPresentation({ label, value, onChangeText, secureTextEntry, styles }: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; styles: ReturnType<typeof createPlatformDirectoryStyles> }) {
  return { kind: "view1" as const, props: { styles, label, value, onChangeText, secureTextEntry } };
}

function FormField(...args: Parameters<typeof useFormFieldPresentation>): React.JSX.Element {
  return <FormFieldView model={useFormFieldPresentation(...args)} />;
}

export function usePlatformDetailPresentation({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createPlatformDirectoryStyles> }) { return { kind: "view1" as const, props: { styles, label, value } }; }

function PlatformDetail(...args: Parameters<typeof usePlatformDetailPresentation>): React.JSX.Element {
  return <PlatformDetailView model={usePlatformDetailPresentation(...args)} />;
}

export function useMemberRowPresentation({ member, isDeleting, onView, onEdit, onDelete }: MemberRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fullName = `${member.first_name} ${member.last_name}`;
  const membership = getMembershipState(member.membership_ends_at);

  return { kind: "view1" as const, props: { styles, fullName, onView, member, membership, colors, onEdit, onDelete, isDeleting } };
}

function MemberRow(...args: Parameters<typeof useMemberRowPresentation>): React.JSX.Element {
  return <MemberRowView model={useMemberRowPresentation(...args)} />;
}

export function useMemberStatPresentation({ icon, label, value, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string; styles: ReturnType<typeof createStyles> }) {
  return { kind: "view1" as const, props: { styles, tone, icon, label, value } };
}

function MemberStat(...args: Parameters<typeof useMemberStatPresentation>): React.JSX.Element {
  return <MemberStatView model={useMemberStatPresentation(...args)} />;
}




