import type * as React from "react";
import { MemberAttendanceScreenView, StatCardView, ActionCardView, HistoryRowView } from "./MemberAttendanceScreen.presentation";
import { styles } from "./MemberAttendanceScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";

import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { useCheckInMember, useCheckOutMember, useMemberAttendance, useMemberMembership, useMemberNotifications, useMemberProfile, memberQueryKeys } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { memberApi } from "../../services/api/member";
import { attendanceApi } from "../../services/api/operations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { MemberAttendance } from "../../types/member";

type AttendanceAction = "check_in" | "check_out";
const MOBILE_STAT_INTERVAL = 192;
const formatDate = (value: Date | string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
const formatTime = (value: Date | string) => new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function useMemberAttendanceScreenPresentation() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const query = useMemberAttendance();
  const profileQuery = useMemberProfile();
  const membershipQuery = useMemberMembership();
  const notificationsQuery = useMemberNotifications(true);
  const queryClient = useQueryClient();
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const checkIn = useCheckInMember();
  const checkOut = useCheckOutMember();
  const [qrAction, setQrAction] = useState<AttendanceAction | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const statsScrollRef = useRef<ScrollView>(null);
  const statsIndexRef = useRef(0);
  const data = query.data;
  const compact = width < 720;
  const active = data?.history.find((record) => !record.check_out_at);
  const gymName = active?.gym_name ?? data?.history[0]?.gym_name ?? user?.gym_name ?? "Main Branch";
  const homeGymId =
    (profileQuery.data as any)?.gym_uuid ??
    (profileQuery.data as any)?.gym_id ??
    (membershipQuery.data as any)?.gym_uuid ??
    (membershipQuery.data as any)?.gym_id ??
    user?.gym_id ??
    (active as any)?.gym_uuid ??
    (active as any)?.gym_id ??
    (data?.history?.[0] as any)?.gym_uuid ??
    (data?.history?.[0] as any)?.gym_id ??
    undefined;
  const weeklyCount = data?.history.filter((record) => Date.now() - new Date(record.check_in_at).getTime() <= 604_800_000).length ?? 0;
  const qrMutation = useMutation({ mutationFn: memberApi.createAttendanceQr });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const scanMutation = useMutation({
    mutationFn: attendanceApi.scanDailyQr,
    onSuccess: (record) => {
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.attendance() });
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.activity() });
      void queryClient.invalidateQueries({ queryKey: ["memberAttendance"] });
      void queryClient.invalidateQueries({ queryKey: ["recentCheckIns"] });
    },
  });
  const openScanner = async () => {
    setCameraError(null);
    try {
      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          setCameraError(new Error("Camera access is required to scan the gym QR. Enable camera permission in your device settings, then try again."));
          setScannerOpen(true);
          return;
        }
      }
      setScannerOpen(true);
    } catch {
      setCameraError(new Error("The camera could not be opened. Check device permissions and try again."));
      setScannerOpen(true);
    }
  };

  const showQr = (action: AttendanceAction) => {
    qrMutation.mutate(action, { onSuccess: (result) => { setQrAction(action); setQrToken(result.token); } });
  };
  const confirm = () => qrAction === "check_in"
    ? checkIn.mutate(undefined, { onSuccess: () => setQrAction(null) })
    : checkOut.mutate(undefined, { onSuccess: () => setQrAction(null) });
  const error = cameraError ?? query.error ?? scanMutation.error ?? checkIn.error ?? checkOut.error ?? qrMutation.error;

  return {
    kind: "view1" as const,
    props: {
      styles,
      query,
      profile: profileQuery.data,
      membership: membershipQuery.data,
      unreadNotifications: notificationsQuery.data ?? [],
      user,
      navigation,
      colors,
      formatDate,
      error,
      data,
      compact,
      statsScrollRef,
      MOBILE_STAT_INTERVAL,
      statsIndexRef,
      StatCard,
      weeklyCount,
      openScanner,
      HistoryRow,
      scannerOpen,
      setScannerOpen,
      scanMutation,
      cameraPermission,
      requestCameraPermission,
      cameraError,
      setCameraError,
      showQr,
      qrMutation,
      qrAction,
      setQrAction,
      qrToken,
      gymName,
      homeGymId,
      checkIn,
      checkOut,
      confirm,
    },
  };
}

export function MemberAttendanceScreen(...args: Parameters<typeof useMemberAttendanceScreenPresentation>): React.JSX.Element {
  return <MemberAttendanceScreenView model={useMemberAttendanceScreenPresentation(...args)} />;
}

export function useStatCardPresentation({ title, value, detail, icon, tone, colors, mobile }: any) {
  return { kind: "view1" as const, props: { styles, mobile, colors, tone, icon, title, value, detail } };
}

function StatCard(...args: Parameters<typeof useStatCardPresentation>): React.JSX.Element {
  return <StatCardView model={useStatCardPresentation(...args)} />;
}

export function useActionCardPresentation({ title, subtitle, time, gym, icon, enabled, color, colors, onPress }: any) {
  return { kind: "view1" as const, props: { styles, color, icon, colors, title, subtitle, time, formatDate, enabled, onPress, gym } };
}

function ActionCard(...args: Parameters<typeof useActionCardPresentation>): React.JSX.Element {
  return <ActionCardView model={useActionCardPresentation(...args)} />;
}

export function useHistoryRowPresentation({ record, last, colors }: { record: MemberAttendance; last: boolean; colors: any }) {
  const checkedOut = Boolean(record.check_out_at); const tone = checkedOut ? colors.primary : colors.success;
  return { kind: "view1" as const, props: { styles, last, colors, tone, checkedOut, formatDate, record, formatTime } };
}

function HistoryRow(...args: Parameters<typeof useHistoryRowPresentation>): React.JSX.Element {
  return <HistoryRowView model={useHistoryRowPresentation(...args)} />;
}


