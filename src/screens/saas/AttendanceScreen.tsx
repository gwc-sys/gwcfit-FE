import type * as React from "react";
import { AttendanceScreenView, ReceptionStatCardView, ActivityItemView } from "./AttendanceScreen.presentation";
import { createDashboardStyles, createStyles } from "./AttendanceScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { DailyAttendancePanel } from "../../components/dashboard/DailyAttendancePanel";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import { attendanceConfig } from "../../features/operations/resourceConfigs";
import { membersApi } from "../../services/api/members";
import { attendanceApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { relatedDisplayName } from "../../utils/displayNames";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useAttendanceScreenPresentation() {
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const statsQuery = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceApi.today,
    refetchInterval: 10_000,
  });
  const membersQuery = useQuery({
    queryKey: ["members", "attendance-picker"],
    queryFn: () => membersApi.list({ limit: 20 }),
    enabled: hasPermission("manage_attendance"),
    retry: false,
  });
  const memberOptions = useMemo(
    () => (membersQuery.data ?? []).filter((member) => {
      const term = memberSearch.trim().toLowerCase();
      return !term || `${member.first_name} ${member.last_name} ${member.email ?? ""} ${member.phone ?? ""}`.toLowerCase().includes(term);
    }),
    [memberSearch, membersQuery.data],
  );
  const checkInMutation = useMutation({
    mutationFn: (memberId?: string) => {
      const targetMemberId = memberId ?? selectedMemberId;
      if (!targetMemberId) {
        throw new Error("Choose a member before recording attendance.");
      }

      return attendanceApi.create({
        member_id: targetMemberId,
        check_in_at: new Date().toISOString(),
        source: "manual",
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setNotice("Attendance was recorded.");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["operations", "attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
  if (!hasPermission("manage_attendance")) {
    return { kind: "view1" as const, props: {  } };
  }

  return { kind: "view2" as const, props: { styles, ReceptionStatCard, statsQuery, queryClient, ActivityItem, colors, memberSearch, setMemberSearch, memberOptions, selectedMemberId, setSelectedMemberId, checkInMutation, membersQuery, setNotes, notes, notice } };
}

export function AttendanceScreen(...args: Parameters<typeof useAttendanceScreenPresentation>): React.JSX.Element {
  return <AttendanceScreenView model={useAttendanceScreenPresentation(...args)} />;
}

export function useReceptionStatCardPresentation({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  icon: any;
  tone: string;
}) {
  const { colors } = useAppTheme();
  const dashboardStyles = useMemo(() => createDashboardStyles(colors), [colors]);
  return { kind: "view1" as const, props: { dashboardStyles, tone, icon, title, value, detail } };
}

function ReceptionStatCard(...args: Parameters<typeof useReceptionStatCardPresentation>): React.JSX.Element {
  return <ReceptionStatCardView model={useReceptionStatCardPresentation(...args)} />;
}

export function useActivityItemPresentation({ icon, label, value, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; tone: string; styles: ReturnType<typeof createStyles> }) {
  return { kind: "view1" as const, props: { styles, tone, icon, label, value } };
}

function ActivityItem(...args: Parameters<typeof useActivityItemPresentation>): React.JSX.Element {
  return <ActivityItemView model={useActivityItemPresentation(...args)} />;
}




