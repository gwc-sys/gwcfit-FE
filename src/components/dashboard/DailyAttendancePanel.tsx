import type * as React from "react";
import { DailyAttendancePanelView, MetricView } from "./DailyAttendancePanel.presentation";
import { makeMetricStyles, makeStyles } from "./DailyAttendancePanel.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { attendanceApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";

export function useDailyAttendancePanelPresentation() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [panelWidth, setPanelWidth] = useState(width);
  const compact = panelWidth < 620;
  const styles = useMemo(() => makeStyles(colors, compact), [colors, compact]);
  const [showQr, setShowQr] = useState(false);
  const qr = useQuery({
    queryKey: ["attendance", "daily-qr"],
    queryFn: attendanceApi.dailyQr,
    refetchInterval: 60_000,
  });
  const stats = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceApi.today,
    refetchInterval: 10_000,
  });
  useEffect(() => {
    if (qr.data) {
      const delay = new Date(qr.data.expires_at).getTime() - Date.now() + 1000;
      const timer = setTimeout(() => void qr.refetch(), Math.max(1000, delay));
      return () => clearTimeout(timer);
    }
  }, [qr.data?.expires_at]);
  const error = qr.error ?? stats.error;
  const expiryLabel = qr.data ? new Date(qr.data.expires_at).toLocaleString([], {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }) : "Loading…";
  return { kind: "view1" as const, props: { styles, setPanelWidth, expiryLabel, qr, stats, colors, error, panelWidth, setShowQr, Metric, showQr, width } };
}

export function DailyAttendancePanel(...args: Parameters<typeof useDailyAttendancePanelPresentation>): React.JSX.Element {
  return <DailyAttendancePanelView model={useDailyAttendancePanelPresentation(...args)} />;
}
export function useMetricPresentation({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: string;
}) {
  const { colors } = useAppTheme();
  const base = useMemo(() => makeMetricStyles(colors), [colors]);
  return { kind: "view1" as const, props: { base, tone, value, label } };
}

function Metric(...args: Parameters<typeof useMetricPresentation>): React.JSX.Element {
  return <MetricView model={useMetricPresentation(...args)} />;
}


