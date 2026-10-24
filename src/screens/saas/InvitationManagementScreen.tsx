import type * as React from "react";
import { InvitationManagementScreenView, InvitationRowView, InviteStatView } from "./InvitationManagementScreen.presentation";
import { createStyles } from "./InvitationManagementScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { PulseDashboardHeader } from "../../components/dashboard/PulseDashboardLayout";
import { getApiErrorMessage } from "../../services/api/client";
import type { GymRegistrationRequest } from "../../services/api/invitations";
import { invitationApi } from "../../services/api/invitations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { Invitation, RoleName } from "../../types/saas";

const gymRoles: Array<Exclude<RoleName, "super_admin" | "gym_owner">> = ["member", "trainer", "receptionist", "sub_admin"];
const labels: Record<string, string> = {
  gym_owner: "Gym owner", member: "Member", trainer: "Trainer", receptionist: "Receptionist", sub_admin: "Sub admin"
};

export function useInvitationManagementScreenPresentation() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const historyInputRef = useRef<TextInput>(null);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const roles = user?.role === "super_admin" ? (["gym_owner"] as const) : gymRoles;
  const [role, setRole] = useState<Exclude<RoleName, "super_admin">>(roles[0]);
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState("168");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<GymRegistrationRequest | null>(null);
  const [section, setSection] = useState<"invitations" | "enquiry">("invitations");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | "active" | "used" | "revoked" | "expired">("all");

  const invitations = useQuery({ queryKey: ["invitations"], queryFn: invitationApi.list });
  const registrations = useQuery({ queryKey: ["gym-registration-requests"], queryFn: invitationApi.registrationRequests, enabled: user?.role === "super_admin" });
  useEffect(() => {
    const enquiryId = route.params?.enquiryId;
    const request = registrations.data?.find((item) => item.id === enquiryId);
    if (request) { setSection("enquiry"); setSelectedEnquiry(request); navigation.setParams({ enquiryId: undefined }); }
  }, [route.params?.enquiryId, registrations.data, navigation]);
  const inviteRegistration = useMutation({
    mutationFn: invitationApi.inviteRegistration,
    onSuccess: (created) => {
      setCreatedToken(created.token);
      setSection("invitations");
      setSelectedEnquiry(null);
      void queryClient.invalidateQueries({ queryKey: ["invitations"] });
      void queryClient.invalidateQueries({ queryKey: ["gym-registration-requests"] });
    }
  });
  const createInvitation = useMutation({
    mutationFn: invitationApi.create,
    onSuccess: (created) => {
      setCreatedToken(created.token);
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["invitations"] });
    }
  });
  const revokeInvitation = useMutation({
    mutationFn: invitationApi.revoke,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["invitations"] })
  });

  const issue = () => {
    const expires = Number(hours);
    if (!Number.isInteger(expires) || expires < 1 || expires > 720) return;
    setCreatedToken(null);
    createInvitation.mutate({ role, email: email || undefined, expires_in_hours: expires });
  };
  const newEnquiries = (registrations.data ?? []).filter((request) => request.status === "new").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const history = (invitations.data ?? []).filter((invite) => (historyFilter === "all" || invite.status === historyFilter) && `${labels[invite.role]} ${invite.email ?? "any email"} ${invite.gym_name ?? "new gym"} ${invite.status}`.toLowerCase().includes(historySearch.trim().toLowerCase()));
  const activeCount = (invitations.data ?? []).filter((invite) => invite.status === "active").length;
  const revokedCount = (invitations.data ?? []).filter((invite) => invite.status === "revoked").length;
  const usedCount = (invitations.data ?? []).filter((invite) => invite.status === "used").length;

  return { kind: "view1" as const, props: { styles, section, setSection, newEnquiries, selectedEnquiry, setSelectedEnquiry, registrations, inviteRegistration, user, historyInputRef, navigation, InviteStat, invitations, colors, historyFilter, setHistoryFilter, activeCount, usedCount, revokedCount, hours, roles, setRole, role, labels, email, setEmail, setHours, createInvitation, issue, createdToken, historySearch, setHistorySearch, revokeInvitation, history, InvitationRow } };
}

export function InvitationManagementScreen(...args: Parameters<typeof useInvitationManagementScreenPresentation>): React.JSX.Element {
  return <InvitationManagementScreenView model={useInvitationManagementScreenPresentation(...args)} />;
}

export function useInvitationRowPresentation({ invite, styles, onRevoke }: { invite: Invitation; styles: ReturnType<typeof createStyles>; onRevoke: () => void }) {

  return { kind: "view1" as const, props: { styles, labels, invite, onRevoke } };
}

function InvitationRow(...args: Parameters<typeof useInvitationRowPresentation>): React.JSX.Element {
  return <InvitationRowView model={useInvitationRowPresentation(...args)} />;
}

export function useInviteStatPresentation({ icon, label, value, color, styles, active, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string; styles: ReturnType<typeof createStyles>; active: boolean; onPress: () => void }) {
  return { kind: "view1" as const, props: { onPress, styles, active, color, icon, label, value } };
}

function InviteStat(...args: Parameters<typeof useInviteStatPresentation>): React.JSX.Element {
  return <InviteStatView model={useInviteStatPresentation(...args)} />;
}


