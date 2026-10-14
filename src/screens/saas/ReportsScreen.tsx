import type * as React from "react";
import { ReportsScreenView, OwnerRevenueViewView, RevenueVolumeChartView, PlatformReportViewView, ReportBarView } from "./ReportsScreen.presentation";
import { createStyles } from "./ReportsScreen.styles";
import { useMemo } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { reportsApi } from "../../services/api/reports";
import { paymentsApi } from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { formatCurrency } from "../../utils/formatters";
import type { Payment, PlatformReport } from "../../types/saas";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useReportsScreenPresentation() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = user?.role === "super_admin";
  const dashboardQuery = useQuery({
    queryKey: ["reports", "dashboard", "screen"],
    queryFn: reportsApi.dashboard,
    enabled: !isSuperAdmin && hasPermission("manage_reports"),
    retry: false
  });
  const ownerPaymentsQuery = useQuery({
    queryKey: ["reports", "owner-payments", "screen"],
    queryFn: () => paymentsApi.list({ limit: 200 }),
    enabled: !isSuperAdmin && hasPermission("manage_reports"),
    retry: false
  });
  const platformQuery = useQuery({
    queryKey: ["reports", "platform", "screen"],
    queryFn: reportsApi.platform,
    enabled: isSuperAdmin && hasPermission("view_platform_analytics"),
    retry: false
  });

  if (!isSuperAdmin && !hasPermission("manage_reports")) {
    return { kind: "view1" as const, props: {  } };
  }

  if (isSuperAdmin) {
    return { kind: "view2" as const, props: { styles, platformQuery, PlatformReportView } };
  }

  return { kind: "view3" as const, props: { styles, dashboardQuery, ReportBar, OwnerRevenueView, ownerPaymentsQuery } };
}

export function ReportsScreen(...args: Parameters<typeof useReportsScreenPresentation>): React.JSX.Element {
  return <ReportsScreenView model={useReportsScreenPresentation(...args)} />;
}

export function useOwnerRevenueViewPresentation({ payments, loading }: { payments: Payment[]; loading: boolean }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount_cents, 0);
  const currentMonth = new Date();
  const monthPoints = getRevenuePoints(paidPayments);
  const currentMonthRevenue = monthPoints[monthPoints.length - 1]?.revenue_cents ?? 0;
  const maxRevenue = Math.max(...monthPoints.map((point) => point.revenue_cents), 1);
  const paymentMethods = paidPayments.reduce<Record<string, number>>((summary, payment) => {
    const method = payment.method || "Other";
    summary[method] = (summary[method] ?? 0) + payment.amount_cents;
    return summary;
  }, {});
  const methodRows = Object.entries(paymentMethods).sort(([, left], [, right]) => right - left).slice(0, 5);
  const maxMethodRevenue = Math.max(...methodRows.map(([, value]) => value), 1);

  return { kind: "view1" as const, props: { styles, loading, totalRevenue, paidPayments, currentMonthRevenue, currentMonth, RevenueVolumeChart, monthPoints, maxRevenue, colors, methodRows, maxMethodRevenue } };
}

function OwnerRevenueView(...args: Parameters<typeof useOwnerRevenueViewPresentation>): React.JSX.Element {
  return <OwnerRevenueViewView model={useOwnerRevenueViewPresentation(...args)} />;
}

function getRevenuePoints(payments: Payment[]) {
  const now = new Date();
  const points: { period: string; revenue_cents: number }[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const revenue_cents = payments.filter((payment) => {
      if (!payment.paid_at) return false;
      const paidAt = new Date(payment.paid_at);
      return paidAt.getFullYear() === date.getFullYear() && paidAt.getMonth() === date.getMonth();
    }).reduce((sum, payment) => sum + payment.amount_cents, 0);
    points.push({ period: date.toLocaleDateString("en-IN", { month: "short" }), revenue_cents });
  }
  return points;
}

export function useRevenueVolumeChartPresentation({ points, max, styles, colors }: { points: { period: string; revenue_cents: number }[]; max: number; styles: ReturnType<typeof createStyles>; colors: ThemeColors }) {
  return { kind: "view1" as const, props: { styles, max, points, colors } };
}

function RevenueVolumeChart(...args: Parameters<typeof useRevenueVolumeChartPresentation>): React.JSX.Element {
  return <RevenueVolumeChartView model={useRevenueVolumeChartPresentation(...args)} />;
}

export function usePlatformReportViewPresentation({ report }: { report: PlatformReport }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const maxRevenue = Math.max(...report.revenue_by_month.map((point) => point.revenue_cents), 1);
  const maxGymRevenue = Math.max(...report.gyms.map((gym) => gym.revenue_cents), 1);

  return { kind: "view1" as const, props: { styles, report, maxRevenue, colors, ReportBar, maxGymRevenue } };
}

function PlatformReportView(...args: Parameters<typeof usePlatformReportViewPresentation>): React.JSX.Element {
  return <PlatformReportViewView model={usePlatformReportViewPresentation(...args)} />;
}

export function useReportBarPresentation({ label, value, max, tone }: { label: string; value: number; max: number; tone: "success" | "warning" | "info" }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const percent = Math.max(4, Math.min(100, (value / max) * 100));
  const color = tone === "success" ? colors.success : tone === "warning" ? colors.warning : colors.info;

  return { kind: "view1" as const, props: { styles, label, value, tone, percent, color } };
}

function ReportBar(...args: Parameters<typeof useReportBarPresentation>): React.JSX.Element {
  return <ReportBarView model={useReportBarPresentation(...args)} />;
}


