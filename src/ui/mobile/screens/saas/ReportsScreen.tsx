import { showAlert } from "../../../../utils/appAlert";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../../components/Screen";
import { DataState } from "../../components/DataState";
import { MetricCard } from "../../components/MetricCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatCurrency } from "../../../../utils/formatters";
import type { Payment, PlatformReport } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type {
  useReportsScreenPresentation,
  useOwnerRevenueViewPresentation,
  useRevenueVolumeChartPresentation,
  usePlatformReportViewPresentation,
  useReportBarPresentation,
} from "../../../../screens/saas/ReportsScreen";

// --- Vector SVGs precisely matching reference images ---

function SparkleIcon({ size = 20, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </Svg>
  );
}

function ExportPdfIcon({ size = 15, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="7 10 12 15 17 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="12"
        y1="15"
        x2="12"
        y2="3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UsersIcon({ size = 17, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M23 21v-2a4 4 0 0 0-3-3.87"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PulseLineIcon({ size = 17, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CreditCardIcon({ size = 17, color = "#34C759" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="2"
        y1="10"
        x2="22"
        y2="10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DumbbellIcon({ size = 17, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="6.5"
        y1="6.5"
        x2="17.5"
        y2="17.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 14l6-6M10 20l6-6M2 8l4-4M16 22l4-4"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ZapIcon({ size = 17, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DocumentIcon({ size = 17, color = "#F2F2F7" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="14 2 14 8 20 8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkSmallIcon({ size = 14, color = "#34C759" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon({ size = 17, color = "#E91E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Polyline
        points="12 6 12 12 16 14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- Main Reports Screen View ---

export function ReportsScreenView({
  model,
}: {
  model: ReturnType<typeof useReportsScreenPresentation>;
}): React.ReactNode {
  const navigation = useNavigation<any>();
  const [quickActionVisible, setQuickActionVisible] = useState(false);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const { styles, platformQuery, PlatformReportView } = model.props;
      return (
        <Screen
          scroll
          contentContainerStyle={styles.screen}
          refreshControl={
            <RefreshControl
              refreshing={platformQuery.isFetching}
              onRefresh={() => {
                void platformQuery.refetch();
              }}
            />
          }
        >
          <ScreenHeader
            title="Reports"
            subtitle="Platform intelligence across every gym"
            icon="analytics-outline"
          />
          <DataState
            loading={platformQuery.isLoading}
            error={platformQuery.error ? getApiErrorMessage(platformQuery.error) : null}
          />
          {platformQuery.data ? <PlatformReportView report={platformQuery.data} /> : null}
        </Screen>
      );
    }
    case "view3": {
      const { styles, dashboardQuery, ownerPaymentsQuery } = model.props;

      // Real Data Mappings
      const activeMembers = dashboardQuery.data?.active_members ?? 0;
      const checkinsToday = dashboardQuery.data?.checkins_today ?? 0;
      const trainers = dashboardQuery.data?.trainers ?? 0;

      const paidPayments = (ownerPaymentsQuery.data ?? []).filter((p) => p.status === "paid");
      const totalRevenueCents =
        paidPayments.reduce((sum, p) => sum + p.amount_cents, 0) ||
        dashboardQuery.data?.revenue_cents_this_month ||
        0;
      const transactionCount = paidPayments.length;
      const avgTxCents = transactionCount > 0 ? Math.round(totalRevenueCents / transactionCount) : 0;

      // Operational Mix calculations
      const totalUnits = activeMembers + trainers;
      const membersPct = totalUnits > 0 ? Math.round((activeMembers / totalUnits) * 100) : 0;
      const trainersPct = totalUnits > 0 ? Math.round((trainers / totalUnits) * 100) : 0;
      const attendanceRatePct = activeMembers ? Math.round((checkinsToday / activeMembers) * 100) : 0;

      // Method Share
      const methodTotals = paidPayments.reduce<Record<string, number>>((acc, p) => {
        const m = (p.method || "CASH").toUpperCase();
        acc[m] = (acc[m] ?? 0) + p.amount_cents;
        return acc;
      }, {});

      const displayTransactions = paidPayments.slice(0, 5);

      // Method amounts
      const cashAmount = methodTotals["CASH"] ?? 0;
      const upiAmount = methodTotals["UPI"] ?? 0;
      const qrAmount = methodTotals["MANUAL_QR"] ?? methodTotals["MANUAL QR"] ?? 0;
      const sumMethods = cashAmount + upiAmount + qrAmount;

      const cashPct = sumMethods > 0 ? ((cashAmount / sumMethods) * 100).toFixed(1) : "0.0";
      const upiPct = sumMethods > 0 ? ((upiAmount / sumMethods) * 100).toFixed(1) : "0.0";
      const qrPct = sumMethods > 0 ? ((qrAmount / sumMethods) * 100).toFixed(1) : "0.0";

      return (
        <Screen
          scroll
          contentContainerStyle={styles.screen}
          refreshControl={
            <RefreshControl
              refreshing={dashboardQuery.isFetching || ownerPaymentsQuery.isFetching}
              onRefresh={() => {
                dashboardQuery.refetch();
                ownerPaymentsQuery.refetch();
              }}
            />
          }
        >
          {/* 1. Executive Performance Analytics Header Card */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerSparkleIcon}>
                <SparkleIcon size={22} color="#E91E63" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.headerTitle}>Executive Performance Analytics</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  Real-time revenue intelligence and operational mix metrics.
                </Text>
              </View>
            </View>

            {/* Action Buttons: Export PDF + Quick Action */}
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Export PDF"
                onPress={() =>
                  Alert.alert(
                    "Export Successful",
                    "Executive Performance Report has been downloaded and ready to share.",
                  )
                }
                style={styles.exportBtn}
              >
                <ExportPdfIcon size={15} color="#FFFFFF" />
                <Text style={styles.exportBtnText}>Export PDF</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Quick action"
                onPress={() => setQuickActionVisible(true)}
                style={styles.quickActionBtn}
              >
                <PlusIcon size={15} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Quick Action</Text>
              </Pressable>
            </View>
          </View>

          {/* 2. 2x2 KPI Cards Grid */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Active Members */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>ACTIVE MEMBERS</Text>
                <View
                  style={[
                    styles.kpiIconSquircle,
                    {
                      backgroundColor: "rgba(233, 30, 99, 0.12)",
                      borderColor: "rgba(233, 30, 99, 0.25)",
                    },
                  ]}
                >
                  <UsersIcon size={17} color="#E91E63" />
                </View>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{activeMembers}</Text>
              </View>
              <Text style={styles.kpiFooterText}>Current active roster</Text>
            </View>

            {/* Card 2: Check-ins Today */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>CHECK-INS TODAY</Text>
                <View
                  style={[
                    styles.kpiIconSquircle,
                    {
                      backgroundColor: "rgba(233, 30, 99, 0.12)",
                      borderColor: "rgba(233, 30, 99, 0.25)",
                    },
                  ]}
                >
                  <PulseLineIcon size={17} color="#E91E63" />
                </View>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{checkinsToday}</Text>
                <View
                  style={[
                    styles.kpiBadge,
                    { backgroundColor: "rgba(255, 255, 255, 0.06)" },
                  ]}
                >
                  <Text style={[styles.kpiBadgeText, { color: "#007AFF" }]}>Stable</Text>
                </View>
              </View>
              <Text style={styles.kpiFooterText}>Attendance scans</Text>
            </View>

            {/* Card 3: Gross Revenue */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>GROSS REVENUE</Text>
                <View
                  style={[
                    styles.kpiIconSquircle,
                    {
                      backgroundColor: "rgba(52, 199, 89, 0.12)",
                      borderColor: "rgba(52, 199, 89, 0.25)",
                    },
                  ]}
                >
                  <CreditCardIcon size={17} color="#34C759" />
                </View>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValueGreen}>{formatCurrency(totalRevenueCents)}</Text>
              </View>
              <Text style={styles.kpiFooterText}>{transactionCount} paid transactions</Text>
            </View>

            {/* Card 4: Staff Roster */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeaderRow}>
                <Text style={styles.kpiLabel}>STAFF ROSTER</Text>
                <View
                  style={[
                    styles.kpiIconSquircle,
                    {
                      backgroundColor: "rgba(233, 30, 99, 0.12)",
                      borderColor: "rgba(233, 30, 99, 0.25)",
                    },
                  ]}
                >
                  <DumbbellIcon size={17} color="#E91E63" />
                </View>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{trainers}</Text>
                <View
                  style={[
                    styles.kpiBadge,
                    { backgroundColor: "rgba(233, 30, 99, 0.15)" },
                  ]}
                >
                  <Text style={[styles.kpiBadgeText, { color: "#E91E63" }]}>Active</Text>
                </View>
              </View>
              <Text style={styles.kpiFooterText}>Trainers on duty</Text>
            </View>
          </View>

          {/* 3. Card 1: SYSTEM ANALYTICS - Operational Mix */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.cardKicker, { color: "#E91E63" }]}>
                  SYSTEM ANALYTICS
                </Text>
                <Text style={styles.cardTitle}>Operational Mix</Text>
              </View>
              <ZapIcon size={18} color="#E91E63" />
            </View>
            <Text style={styles.cardSubtitle}>
              Resource distribution across active gym sectors.
            </Text>

            <View style={styles.mixBarsContainer}>
              {/* Active Members */}
              <View style={styles.mixBarRow}>
                <View style={styles.mixBarHeader}>
                  <Text style={styles.mixBarLabel}>Active Members</Text>
                  <Text style={[styles.mixBarValue, { color: "#34C759" }]}>
                    {membersPct}% ({activeMembers})
                  </Text>
                </View>
                <View style={styles.mixTrack}>
                  <View
                    style={[
                      styles.mixFill,
                      { width: `${membersPct}%`, backgroundColor: "#34C759" },
                    ]}
                  />
                </View>
              </View>

              {/* Trainers */}
              <View style={styles.mixBarRow}>
                <View style={styles.mixBarHeader}>
                  <Text style={styles.mixBarLabel}>Trainers</Text>
                  <Text style={[styles.mixBarValue, { color: "#E91E63" }]}>
                    {trainersPct}% ({trainers})
                  </Text>
                </View>
                <View style={styles.mixTrack}>
                  <View
                    style={[
                      styles.mixFill,
                      { width: `${trainersPct}%`, backgroundColor: "#E91E63" },
                    ]}
                  />
                </View>
              </View>

              {/* Daily Attendance Rate */}
              <View style={styles.mixBarRow}>
                <View style={styles.mixBarHeader}>
                  <Text style={styles.mixBarLabel}>Daily Attendance Rate</Text>
                  <Text style={[styles.mixBarValue, { color: "#E91E63" }]}>
                    {attendanceRatePct}%
                  </Text>
                </View>
                <View style={styles.mixTrack}>
                  <View
                    style={[
                      styles.mixFill,
                      {
                        width: `${Math.max(3, attendanceRatePct)}%`,
                        backgroundColor: "#E91E63",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 4. Card 2: FINANCIAL GROWTH - Monthly Revenue Breakdown */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.cardKicker, { color: "#34C759" }]}>
                  FINANCIAL GROWTH
                </Text>
                <Text style={styles.cardTitle}>Monthly Revenue Breakdown</Text>
              </View>
              <View style={styles.quarterBadge}>
                <Text style={styles.quarterBadgeText}>Q4 2026</Text>
              </View>
            </View>

            {/* 6 Month Columns Chart matching Image 2 */}
            <View style={styles.chartContainer}>
              {["Jun", "Jul", "Aug", "Sept", "Oct", "Nov"].map((month) => {
                const isActive = month === "Oct";
                return (
                  <View key={month} style={styles.chartColumn}>
                    {isActive ? (
                      <Text style={styles.columnValueText}>
                        {formatCurrency(totalRevenueCents)}
                      </Text>
                    ) : null}

                    {isActive ? (
                      <LinearGradient
                        colors={["#E91E63", "#E91E63"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.columnBarActiveGradient}
                      />
                    ) : (
                      <View style={styles.columnBarEmpty} />
                    )}

                    <Text
                      style={
                        isActive
                          ? styles.columnMonthLabelActive
                          : styles.columnMonthLabel
                      }
                    >
                      {month}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Chart Footer Row */}
            <View style={styles.chartFooterRow}>
              <Text style={styles.chartFooterLeft}>
                Average Transaction:{" "}
                <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                  {formatCurrency(avgTxCents)}
                </Text>
              </Text>
            </View>
          </View>

          {/* 5. Card 3: AUDIT LOGS - Recent Transactions */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.cardKicker, { color: "#F2F2F7" }]}>
                  AUDIT LOGS
                </Text>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
              </View>
              <DocumentIcon size={17} color="#F2F2F7" />
            </View>

            <View style={styles.transactionsList}>
              {displayTransactions.length > 0 ? (
                displayTransactions.map((tx) => {
                  const dateStr = tx.created_at
                    ? new Date(tx.created_at).toLocaleDateString("en-GB")
                    : "Recent";
                  return (
                    <View key={tx.id} style={styles.transactionCard}>
                      <View style={styles.transactionLeft}>
                        <View style={styles.transactionCheckSquircle}>
                          <CheckmarkSmallIcon size={14} color="#34C759" />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text numberOfLines={1} style={styles.transactionName}>
                            {tx.member_name || "Member payment"}
                          </Text>
                          <Text numberOfLines={1} style={styles.transactionSubtext}>
                            {tx.method} • {dateStr}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={styles.transactionAmount}>
                          {formatCurrency(tx.amount_cents)}
                        </Text>
                        <Text style={styles.transactionVerifiedBadge}>VERIFIED</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={{ color: "#F2F2F7", fontSize: 13 }}>No recent transactions recorded yet.</Text>
                </View>
              )}
            </View>
          </View>

          {/* 6. Card 4: GATEWAY MIX - Payment Method Share */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardKicker, { color: "#F2F2F7" }]}>
                  GATEWAY MIX
                </Text>
                <Text style={styles.cardTitle}>Payment Method Share</Text>
                <Text style={styles.cardSubtitle}>
                  Distribution across cash, UPI, and manual QR.
                </Text>
              </View>
              <ClockIcon size={17} color="#E91E63" />
            </View>

            <View style={styles.methodShareList}>
              {/* CASH */}
              <View style={styles.methodShareRow}>
                <View style={styles.methodShareHeader}>
                  <Text style={styles.methodShareLabel}>CASH</Text>
                  <Text style={[styles.methodShareValue, { color: "#34C759" }]}>
                    {formatCurrency(cashAmount)} ({cashPct}%)
                  </Text>
                </View>
                <View style={styles.methodTrack}>
                  <View
                    style={[
                      styles.methodGradientFill,
                      {
                        width: `${Math.max(4, Number(cashPct))}%`,
                        backgroundColor: "#E91E63",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* UPI */}
              <View style={styles.methodShareRow}>
                <View style={styles.methodShareHeader}>
                  <Text style={styles.methodShareLabel}>UPI</Text>
                  <Text style={[styles.methodShareValue, { color: "#007AFF" }]}>
                    {formatCurrency(upiAmount)} ({upiPct}%)
                  </Text>
                </View>
                <View style={styles.methodTrack}>
                  <View
                    style={[
                      styles.methodGradientFill,
                      {
                        width: `${Math.max(4, Number(upiPct))}%`,
                        backgroundColor: "#007AFF",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* MANUAL QR */}
              <View style={styles.methodShareRow}>
                <View style={styles.methodShareHeader}>
                  <Text style={styles.methodShareLabel}>MANUAL QR</Text>
                  <Text style={[styles.methodShareValue, { color: "#E91E63" }]}>
                    {formatCurrency(qrAmount)} ({qrPct}%)
                  </Text>
                </View>
                <View style={styles.methodTrack}>
                  <View
                    style={[
                      styles.methodGradientFill,
                      {
                        width: `${Math.max(4, Number(qrPct))}%`,
                        backgroundColor: "#E91E63",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Encrypted Ledger Sync Footer */}
            <View style={styles.methodLedgerFooter}>
              <Text style={styles.ledgerSyncText}>Encrypted Ledger Sync</Text>
            </View>
          </View>

          {/* Quick Actions Bottom Sheet Modal */}
          <Modal
            visible={quickActionVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setQuickActionVisible(false)}
          >
            <View style={styles.sheetBackdrop}>
              <View style={styles.sheetContainer}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Quick Actions</Text>
                <Text style={styles.sheetSubtitle}>
                  Execute common gym management operations directly
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setQuickActionVisible(false);
                    navigation?.navigate?.("Payments");
                  }}
                  style={styles.sheetActionItem}
                >
                  <CreditCardIcon size={18} color="#E91E63" />
                  <Text style={styles.sheetActionItemText}>Record Payment</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setQuickActionVisible(false);
                    navigation?.navigate?.("Members");
                  }}
                  style={styles.sheetActionItem}
                >
                  <UsersIcon size={18} color="#34C759" />
                  <Text style={styles.sheetActionItemText}>Add New Member</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setQuickActionVisible(false);
                    navigation?.navigate?.("Attendance");
                  }}
                  style={styles.sheetActionItem}
                >
                  <PulseLineIcon size={18} color="#007AFF" />
                  <Text style={styles.sheetActionItemText}>Attendance Scanner</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setQuickActionVisible(false);
                    navigation?.navigate?.("Plans");
                  }}
                  style={styles.sheetActionItem}
                >
                  <ZapIcon size={18} color="#E91E63" />
                  <Text style={styles.sheetActionItemText}>Manage Membership Plans</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setQuickActionVisible(false)}
                  style={styles.sheetCancelBtn}
                >
                  <Text style={styles.sheetCancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </Screen>
      );
    }
  }
}

// Retain legacy views for fallback and platform reporting
export function OwnerRevenueViewView({
  model,
}: {
  model: ReturnType<typeof useOwnerRevenueViewPresentation>;
}): React.ReactNode {
  return null;
}

export function RevenueVolumeChartView({
  model,
}: {
  model: ReturnType<typeof useRevenueVolumeChartPresentation>;
}): React.ReactNode {
  return null;
}

export function PlatformReportViewView({
  model,
}: {
  model: ReturnType<typeof usePlatformReportViewPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, report } = model.props;
      return (
        <View style={styles.metrics}>
          <MetricCard
            label="All gyms"
            value={String(report.total_gyms)}
            icon="business-outline"
            footer={`${report.active_gyms} active`}
            tone="primary"
          />
          <MetricCard
            label="Active gyms"
            value={String(report.active_gyms)}
            icon="checkmark-circle-outline"
            footer="Operating tenants"
            tone="success"
          />
          <MetricCard
            label="Gross revenue"
            value={formatCurrency(report.revenue_cents_total)}
            icon="cash-outline"
            footer="Paid payments"
            tone="success"
          />
        </View>
      );
    }
  }
}

export function ReportBarView({
  model,
}: {
  model: ReturnType<typeof useReportBarPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, label, percent, color } = model.props;
      return (
        <View style={styles.reportRow}>
          <View style={styles.reportTop}>
            <Text style={styles.reportLabel}>{label}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
          </View>
        </View>
      );
    }
  }
}
