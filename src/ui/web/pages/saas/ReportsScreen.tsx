import { RefreshControl, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatCurrency } from "../../../../utils/formatters";
import type { Payment } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useReportsScreenPresentation, useOwnerRevenueViewPresentation, useRevenueVolumeChartPresentation, usePlatformReportViewPresentation, useReportBarPresentation } from "../../../../screens/saas/ReportsScreen";

export function ReportsScreenView({ model }: { model: ReturnType<typeof useReportsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, platformQuery, PlatformReportView } = model.props;
      return ((
      <Screen
        scroll
        contentContainerStyle={styles.screen}
        refreshControl={<RefreshControl refreshing={platformQuery.isFetching} onRefresh={() => platformQuery.refetch()} />}
      >
        <ScreenHeader title="Reports" subtitle="Platform intelligence across every gym" icon="analytics-outline" />
        <DataState loading={platformQuery.isLoading} error={platformQuery.error ? getApiErrorMessage(platformQuery.error) : null} />
        {platformQuery.data ? <PlatformReportView report={platformQuery.data} /> : null}
      </Screen>
    ));
    }
    case "view3": {
      const { styles, dashboardQuery, ReportBar, OwnerRevenueView, ownerPaymentsQuery } = model.props;
      return ((
    <Screen
      scroll
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={dashboardQuery.isFetching} onRefresh={() => dashboardQuery.refetch()} />}
    >
      <ScreenHeader title="Reports" subtitle="Gym-specific performance" icon="analytics-outline" />
      <DataState loading={dashboardQuery.isLoading} error={dashboardQuery.error ? getApiErrorMessage(dashboardQuery.error) : null} />
      {dashboardQuery.data ? (
        <>
          <View style={styles.metrics}>
            <MetricCard label="Active members" value={String(dashboardQuery.data.active_members)} icon="people-outline" footer="Current" />
            <MetricCard label="Check-ins today" value={String(dashboardQuery.data.checkins_today)} icon="walk-outline" footer="Attendance" />
            <MetricCard label="Revenue" value={formatCurrency(dashboardQuery.data.revenue_cents_this_month)} icon="card-outline" footer="This month" />
            <MetricCard label="Trainers" value={String(dashboardQuery.data.trainers)} icon="barbell-outline" footer="Staff" />
          </View>
          <SurfacePanel title="Operational mix" kicker="Live stats" icon="stats-chart-outline">
            <ReportBar label="Members" value={dashboardQuery.data.active_members} max={Math.max(dashboardQuery.data.active_members, dashboardQuery.data.trainers, 1)} tone="success" />
            <ReportBar label="Trainers" value={dashboardQuery.data.trainers} max={Math.max(dashboardQuery.data.active_members, dashboardQuery.data.trainers, 1)} tone="info" />
            <ReportBar label="Check-ins" value={dashboardQuery.data.checkins_today} max={Math.max(dashboardQuery.data.active_members, dashboardQuery.data.checkins_today, 1)} tone="warning" />
          </SurfacePanel>
          <OwnerRevenueView payments={ownerPaymentsQuery.data ?? []} loading={ownerPaymentsQuery.isLoading} />
        </>
      ) : null}
    </Screen>
  ));
    }
  }
}

export function OwnerRevenueViewView({ model }: { model: ReturnType<typeof useOwnerRevenueViewPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, loading, totalRevenue, paidPayments, currentMonthRevenue, currentMonth, RevenueVolumeChart, monthPoints, maxRevenue, colors, methodRows, maxMethodRevenue } = model.props;
      return ((
    <>
      <View style={styles.analyticsHeader}>
        <View>
          <Text style={styles.analyticsKicker}>Revenue intelligence</Text>
          <Text style={styles.analyticsTitle}>Transaction volumes</Text>
        </View>
        <View style={styles.periodPill}><Text style={styles.periodPillText}>Last 6 months</Text></View>
      </View>
      {loading ? <Text style={styles.emptyText}>Loading revenue activity...</Text> : null}
      <View style={styles.metrics}>
        <MetricCard label="All-time revenue" value={formatCurrency(totalRevenue)} icon="cash-outline" footer={`${paidPayments.length} paid transactions`} tone="success" />
        <MetricCard label="This month" value={formatCurrency(currentMonthRevenue)} icon="trending-up-outline" footer={currentMonth.toLocaleDateString("en-IN", { month: "long" })} tone="primary" />
        <MetricCard label="Average transaction" value={formatCurrency(paidPayments.length ? Math.round(totalRevenue / paidPayments.length) : 0)} icon="calculator-outline" footer="Paid transactions" tone="info" />
      </View>
      <View style={styles.chartGrid}>
        <SurfacePanel title="Revenue by month" kicker="Paid transactions" icon="bar-chart-outline" style={styles.wideChart}>
          <RevenueVolumeChart points={monthPoints} max={maxRevenue} styles={styles} colors={colors} />
        </SurfacePanel>
        <SurfacePanel title="Revenue by method" kicker="Payment mix" icon="pie-chart-outline" style={styles.sideChart}>
          {methodRows.length ? methodRows.map(([method, value]) => (
            <View key={method} style={styles.methodRow}>
              <View style={styles.reportTop}><Text style={styles.reportLabel}>{method}</Text><Text style={styles.methodValue}>{formatCurrency(value)}</Text></View>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(4, (value / maxMethodRevenue) * 100)}%`, backgroundColor: colors.info }]} /></View>
            </View>
          )) : <Text style={styles.emptyText}>No paid transactions yet.</Text>}
        </SurfacePanel>
      </View>
      <SurfacePanel title="Recent transactions" kicker="Revenue detail" icon="receipt-outline">
        {paidPayments.slice().sort((a, b) => new Date(b.paid_at ?? b.created_at).getTime() - new Date(a.paid_at ?? a.created_at).getTime()).slice(0, 6).map((payment) => (
          <View key={payment.id} style={styles.transactionRow}>
            <View style={styles.transactionMain}><Text style={styles.reportLabel}>{payment.member_name || "Member payment"}</Text><Text style={styles.transactionMeta}>{payment.method} · {new Date(payment.paid_at ?? payment.created_at).toLocaleDateString("en-IN")}</Text></View>
            <Text style={styles.transactionAmount}>{formatCurrency(payment.amount_cents)}</Text>
          </View>
        ))}
        {!loading && paidPayments.length === 0 ? <Text style={styles.emptyText}>No paid transactions are available yet.</Text> : null}
      </SurfacePanel>
    </>
  ));
    }
  }
}

export function RevenueVolumeChartView({ model }: { model: ReturnType<typeof useRevenueVolumeChartPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, max, points, colors } = model.props;
      return ((
    <View style={styles.volumeChart}>
      <View style={styles.chartGridLine}><Text style={styles.chartAxisLabel}>{formatCurrency(max)}</Text></View>
      <View style={styles.chartGridLine}><Text style={styles.chartAxisLabel}>{formatCurrency(Math.round(max / 2))}</Text></View>
      <View style={styles.volumeColumns}>
        {points.map((point) => (
          <View key={point.period} style={styles.volumeColumn}>
            <Text style={styles.columnValue}>{point.revenue_cents ? formatCurrency(point.revenue_cents) : "-"}</Text>
            <View style={styles.columnTrack}><View style={[styles.columnFill, { height: Math.max(point.revenue_cents ? 8 : 2, (point.revenue_cents / max) * 138), backgroundColor: colors.primary }]} /></View>
            <Text style={styles.columnLabel}>{point.period}</Text>
          </View>
        ))}
      </View>
    </View>
  ));
    }
  }
}

export function PlatformReportViewView({ model }: { model: ReturnType<typeof usePlatformReportViewPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, report, maxRevenue, colors, ReportBar, maxGymRevenue } = model.props;
      return ((
    <>
      <View style={styles.metrics}>
        <MetricCard label="All gyms" value={String(report.total_gyms)} icon="business-outline" footer={`${report.active_gyms} active`} tone="primary" />
        <MetricCard label="Active gyms" value={String(report.active_gyms)} icon="checkmark-circle-outline" footer="Operating tenants" tone="success" />
        <MetricCard label="Suspended gyms" value={String(report.suspended_gyms)} icon="pause-circle-outline" footer="Restricted tenants" tone="warning" />
        <MetricCard label="Free-trial gyms" value={String(report.free_trial_gyms)} icon="gift-outline" footer="Within trial period" tone="info" />
        <MetricCard label="Gym owners" value={String(report.total_gym_owners)} icon="people-outline" footer="Owner accounts" tone="accent" />
        <MetricCard label="All members" value={String(report.total_members)} icon="person-outline" footer={`${report.active_members} active`} tone="primary" />
        <MetricCard label="Gross revenue" value={formatCurrency(report.revenue_cents_total)} icon="cash-outline" footer="Paid payments" tone="success" />
        <MetricCard label="This month" value={formatCurrency(report.revenue_cents_this_month)} icon="trending-up-outline" footer="Paid this month" tone="info" />
      </View>

      <View style={styles.chartGrid}>
        <SurfacePanel title="Revenue trend" kicker="Last 6 months" icon="bar-chart-outline" style={styles.wideChart}>
          <View style={styles.columnChart}>
            {report.revenue_by_month.map((point) => {
              const height = Math.max(8, Math.round((point.revenue_cents / maxRevenue) * 148));
              return (
                <View key={point.period} style={styles.columnItem}>
                  <Text style={styles.columnValue}>{point.revenue_cents ? formatCurrency(point.revenue_cents) : "—"}</Text>
                  <View style={styles.columnTrack}><View style={[styles.columnFill, { height, backgroundColor: colors.primary }]} /></View>
                  <Text style={styles.columnLabel}>{point.period.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        </SurfacePanel>

        <SurfacePanel title="Tenant health" kicker="Portfolio mix" icon="pulse-outline" style={styles.sideChart}>
          <ReportBar label="Active gyms" value={report.active_gyms} max={Math.max(report.total_gyms, 1)} tone="success" />
          <ReportBar label="Suspended gyms" value={report.suspended_gyms} max={Math.max(report.total_gyms, 1)} tone="warning" />
          <ReportBar label="Free-trial gyms" value={report.free_trial_gyms} max={Math.max(report.total_gyms, 1)} tone="info" />
        </SurfacePanel>
      </View>

      <SurfacePanel title="Revenue by gym" kicker="Top tenants" icon="business-outline">
        <View style={styles.gymReportHeader}><Text style={styles.gymReportHeaderText}>Gym</Text><Text style={styles.gymReportHeaderText}>Members</Text><Text style={styles.gymReportHeaderText}>Revenue</Text></View>
        {report.gyms.slice(0, 8).map((gym) => (
          <View key={gym.gym_id} style={styles.gymReportRow}>
            <View style={styles.gymReportName}><View style={[styles.statusDot, { backgroundColor: gym.status === "active" ? colors.success : colors.warning }]} /><Text style={styles.reportLabel}>{gym.gym_name}</Text></View>
            <Text style={styles.gymReportNumber}>{gym.members}</Text>
            <View style={styles.gymRevenue}><View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.max(3, (gym.revenue_cents / maxGymRevenue) * 100)}%`, backgroundColor: colors.info }]} /></View><Text style={styles.gymReportNumber}>{formatCurrency(gym.revenue_cents)}</Text></View>
          </View>
        ))}
        {report.gyms.length === 0 ? <Text style={styles.emptyText}>No tenant data is available yet.</Text> : null}
      </SurfacePanel>
    </>
  ));
    }
  }
}

export function ReportBarView({ model }: { model: ReturnType<typeof useReportBarPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, value, tone, percent, color } = model.props;
      return ((
    <View style={styles.reportRow}>
      <View style={styles.reportTop}>
        <Text style={styles.reportLabel}>{label}</Text>
        <StatusBadge label={String(value)} tone={tone} />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  ));
    }
  }
}
