import type * as React from "react";
import { MemberProfileScreenView, MemberProfileBodyView, DetailView } from "./MemberProfileScreen.presentation";
import { createStyles } from "./MemberProfileScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { NoticeBanner } from "../../components/NoticeBanner";
import { useMyMemberProfile, useUpdateMember } from "../../hooks/useRbac";
import { membersApi } from "../../services/api/members";
import { trainersApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { Member } from "../../types/saas";
import { relatedDisplayName } from "../../utils/displayNames";
import { formatDate, getMembershipState, initials, memberStatusTone } from "../../utils/formatters";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useMemberProfileScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const memberId = route.params?.memberId as string | undefined;
  const isSelf = !memberId;
  const canViewMember = isSelf ? user?.role === "member" : hasPermission("manage_members");
  const memberQuery = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => membersApi.get(memberId ?? ""),
    enabled: Boolean(memberId) && hasPermission("manage_members"),
    retry: false
  });
  const ownProfileQuery = useMyMemberProfile(isSelf && user?.role === "member");
  const member = isSelf ? ownProfileQuery.data : memberQuery.data;
  const isLoading = isSelf ? ownProfileQuery.isLoading : memberQuery.isLoading;
  const error = isSelf ? ownProfileQuery.error : memberQuery.error;

  if (!canViewMember) {
    return { kind: "view1" as const, props: {  } };
  }

  return { kind: "view2" as const, props: { styles, member, route, navigation, isSelf, isLoading, error, MemberProfileBody, user } };
}

export function MemberProfileScreen(...args: Parameters<typeof useMemberProfileScreenPresentation>): React.JSX.Element {
  return <MemberProfileScreenView model={useMemberProfileScreenPresentation(...args)} />;
}

export function useMemberProfileBodyPresentation({ member, isSelf, canAssignTrainer }: { member: Member; isSelf: boolean; canAssignTrainer: boolean }) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const membership = getMembershipState(member.membership_ends_at);
  const fullName = `${member.first_name} ${member.last_name}`;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(member.trainer_id);
  const [notice, setNotice] = useState<string | null>(null);
  const trainersQuery = useQuery({
    queryKey: ["operations", "trainers", "assignment-picker"],
    queryFn: () => trainersApi.list({ limit: 200 }),
    enabled: canAssignTrainer && pickerVisible,
    retry: false
  });
  const updateMember = useUpdateMember();
  const trainers = trainersQuery.data ?? [];

  const confirmAssignment = () => {
    updateMember.mutate(
      { memberId: member.id, payload: { trainer_id: selectedTrainerId } },
      {
        onSuccess: () => {
          setPickerVisible(false);
          setNotice(selectedTrainerId ? "Trainer assigned successfully." : "Trainer assignment removed.");
        }
      }
    );
  };

  return { kind: "view1" as const, props: { styles, fullName, member, membership, isSelf, navigation, canAssignTrainer, setSelectedTrainerId, setPickerVisible, notice, updateMember, pickerVisible, colors, trainersQuery, trainers, selectedTrainerId, confirmAssignment, Detail } };
}

function MemberProfileBody(...args: Parameters<typeof useMemberProfileBodyPresentation>): React.JSX.Element {
  return <MemberProfileBodyView model={useMemberProfileBodyPresentation(...args)} />;
}

export function useDetailPresentation({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return { kind: "view1" as const, props: { styles, icon, colors, label, value } };
}

function Detail(...args: Parameters<typeof useDetailPresentation>): React.JSX.Element {
  return <DetailView model={useDetailPresentation(...args)} />;
}


