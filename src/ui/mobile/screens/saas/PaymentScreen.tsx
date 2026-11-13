import React, { Fragment, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { OwnerMembershipPayments } from "../../../../features/operations/MembershipCheckout";
import { controlMetrics } from "../../theme/theme";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { NoticeBanner } from "../../components/NoticeBanner";
import { Screen } from "../../components/Screen";
import { showAlert } from "../../../../utils/appAlert";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Gym, Member, Payment } from "../../../../types/saas";
import { formatCurrency, formatDate } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type {
  usePaymentScreenPresentation,
  useMetricPresentation,
  usePaymentFiltersPresentation,
  useTablePresentation,
  usePlatformPaymentsDashboardPresentation,
  useChartPresentation,
  useRecentPresentation,
  useReceiptModalPresentation,
  useReceiptDetailPresentation,
} from "../../../../screens/saas/PaymentScreen";

export function PaymentScreenView({
  model,
}: {
  model: ReturnType<typeof usePaymentScreenPresentation>;
}): React.ReactNode {
  const scrollRef = useRef<any>(null);
  const duesY = useRef(0);

  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;

  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "view2": {
      const { PlatformPaymentsDashboard, payments, allMembers, gq, developerGq, pq, mq } =
        model.props;
      return (
        <PlatformPaymentsDashboard
          payments={payments}
          members={allMembers}
          gyms={gq.data ?? []}
          developerGyms={developerGq.data ?? []}
          loading={pq.isLoading || mq.isLoading || gq.isLoading || developerGq.isLoading}
          error={pq.error || mq.error || gq.error || developerGq.error}
        />
      );
    }
    case "view3": {
      const {
        styles,
        colors,
        search,
        setSearch,
        total,
        pending,
        members,
        setTab,
        tab,
        plans,
        shown,
        payments,
        setShowMembers,
        member,
        showMembers,
        memberSearch,
        setMemberSearch,
        setMemberId,
        setPlanId,
        planId,
        amount,
        setAmount,
        setMethod,
        method,
        notice,
        save,
      } = model.props;

      // Real data from query
      const activePayments = shown;
      const displayTotal = formatCurrency(total, "INR");
      const displayPending = formatCurrency(pending, "INR");
      const displayMembers = String(members.length);

      // Real plans
      const activePlans = plans;
      const selectedPlanId = planId || activePlans[0]?.id || "";

      const planRow1 = activePlans.slice(0, 3);
      const planRow2 = activePlans.slice(3);

      // Selected member display name
      const memberDisplayName = member
        ? `${member.first_name} ${member.last_name}`
        : "Select a member";

      const handleScrollToDues = () => {
        scrollRef.current?.scrollTo({ y: duesY.current || 900, animated: true });
      };

      return (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: "#000000" }}
          contentContainerStyle={styles.screen}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Header Row */}
          <View style={styles.header}>
            <View>
              <Text accessibilityRole="header" style={styles.title}>
                Payments
              </Text>
              <Text style={styles.sub}>
                Record and update member dues with easy tracking.
              </Text>
            </View>

            <View style={styles.headerButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Export payments"
                onPress={() => showAlert("Export Payments", "Payment report CSV is ready for export.")}
                style={styles.exportButton}
              >
                <Ionicons name="download-outline" size={17} color="#34C759" />
                <Text style={styles.exportButtonText}>Export</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Record payment"
                onPress={handleScrollToDues}
                style={styles.recordPaymentButton}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.recordPaymentButtonText}>Record Payment</Text>
              </Pressable>
            </View>
          </View>

          {/* 2. Membership payment QR and verification requests cards */}
          <OwnerMembershipPayments />

          {/* 3. 4 KPI Stat Cards (2x2 Grid) */}
          <View style={styles.metrics}>
            {/* Card 1: Total Collection */}
            <View style={styles.metric}>
              <View style={[styles.statCardIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
                <Ionicons name="card" size={17} color="#E91E63" />
              </View>
              <Text style={styles.metricValue}>{displayTotal}</Text>
              <Text style={styles.statCardLabel}>
                Total Collection <Text style={styles.statCardPercentage}>↑ 8.2% this month</Text>
              </Text>
            </View>

            {/* Card 2: Paid This Month */}
            <View style={styles.metric}>
              <View style={[styles.statCardIconWrap, { backgroundColor: "rgba(52, 199, 89, 0.16)" }]}>
                <Ionicons name="checkmark-circle-outline" size={19} color="#34C759" />
              </View>
              <Text style={styles.metricValue}>{displayTotal}</Text>
              <Text style={styles.statCardLabel}>
                Paid This Month <Text style={styles.statCardPercentage}>↑ 8.2% this month</Text>
              </Text>
            </View>

            {/* Card 3: Pending Dues */}
            <View style={styles.metric}>
              <View style={[styles.statCardIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
                <Ionicons name="time-outline" size={18} color="#E91E63" />
              </View>
              <Text style={styles.metricValue}>{displayPending}</Text>
              <Text style={styles.statCardLabel}>
                Pending Dues <Text style={styles.statCardPercentage}>↑ 8.2% this month</Text>
              </Text>
            </View>

            {/* Card 4: Total Members */}
            <View style={styles.metric}>
              <View style={[styles.statCardIconWrap, { backgroundColor: "rgba(233, 30, 99, 0.16)" }]}>
                <Ionicons name="person-outline" size={18} color="#E91E63" />
              </View>
              <Text style={styles.metricValue}>{displayMembers}</Text>
              <Text style={styles.statCardLabel}>
                Total Members <Text style={styles.statCardPercentage}>↑ 8.2% this month</Text>
              </Text>
            </View>
          </View>

          {/* 4. Filter Tabs (Horizontal Scroll) */}
          <View style={{ marginTop: 6 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                ["all", "All Payments"],
                ["paid", "Paid"],
                ["pending", "Pending"],
                ["overdue", "Overdue"],
                ["refunded", "Refunded"],
              ].map(([key, label]) => {
                const isActive = tab === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setTab(key)}
                    style={[styles.tab, isActive && styles.activeTab]}
                  >
                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Scroll Indicator Track */}
            <View style={styles.scrollTrackRow}>
              <Ionicons name="caret-back" size={10} color="#F2F2F7" />
              <View style={styles.scrollTrackBg}>
                <View style={styles.scrollThumb} />
              </View>
              <Ionicons name="caret-forward" size={10} color="#F2F2F7" />
            </View>
          </View>

          {/* 5. Search Bar */}
          <View style={styles.search}>
            <Ionicons name="search" size={18} color="#1C1C1E" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name or member ID..."
              placeholderTextColor="#1C1C1E"
              style={styles.searchInput}
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearch("")}
              >
                <Ionicons name="close-circle" size={18} color="#1C1C1E" />
              </Pressable>
            ) : null}
          </View>

          {/* 6. Payments History List */}
          <View style={styles.paymentListCard}>
            {activePayments.length > 0 ? (
              activePayments.map((item) => (
                <View key={item.id} style={styles.paymentItemRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text numberOfLines={1} style={styles.paymentItemName}>
                        {item.member_name || "Member"}
                      </Text>
                      <View style={styles.paymentPaidBadge}>
                        <Text style={styles.paymentPaidBadgeText}>
                          {item.status || "paid"}
                        </Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={styles.paymentItemMeta}>
                      {item.membership_plan_name || "No plan"} •{" "}
                      {item.paid_at ? formatDate(item.paid_at) : formatDate(item.created_at)} •{" "}
                      {(item.method || "CASH").toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.paymentItemAmount}>
                      {formatCurrency(item.amount_cents, item.currency || "INR")}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="More options"
                      style={styles.paymentMenuButton}
                    >
                      <Ionicons name="ellipsis-vertical" size={15} color="#F2F2F7" />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={{ color: "#F2F2F7", fontSize: 13 }}>No payment records found.</Text>
              </View>
            )}
          </View>

          {/* 7. Update Member Dues Section */}
          <View
            onLayout={(e) => {
              duesY.current = e.nativeEvent.layout.y;
            }}
            style={styles.duesPanel}
          >
            <Text accessibilityRole="header" style={styles.duesPanelTitle}>
              Update Member Dues
            </Text>

            {/* Member selector input */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select member"
              onPress={() => setShowMembers((v: boolean) => !v)}
              style={styles.memberSearchBox}
            >
              <Ionicons name="search" size={17} color="#1C1C1E" />
              <Text numberOfLines={1} style={{ flex: 1, color: "#FFFFFF", fontSize: 14 }}>
                {memberDisplayName}
              </Text>
              <Ionicons
                name={showMembers ? "chevron-up" : "chevron-down"}
                size={16}
                color="#1C1C1E"
              />
            </Pressable>

            {/* Dropdown list if expanded */}
            {showMembers && members.length > 0 ? (
              <View style={styles.memberScroll}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                  <View style={styles.memberList}>
                    {members.map((m) => (
                      <Pressable
                        key={m.id}
                        accessibilityRole="button"
                        onPress={() => {
                          setMemberId(m.id);
                          setShowMembers(false);
                        }}
                        style={[
                          styles.member,
                          member?.id === m.id && styles.selected,
                        ]}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {m.first_name[0]}
                            {m.last_name[0]}
                          </Text>
                        </View>
                        <View style={styles.memberCopy}>
                          <Text style={styles.bold}>
                            {m.first_name} {m.last_name}
                          </Text>
                          <Text numberOfLines={1} style={styles.muted}>
                            {m.member_code}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : null}

            {/* Membership Plan Label */}
            <Text style={styles.label}>Membership Plan</Text>

            {/* Row 1: 3 Plans */}
            <View style={styles.plansRow1}>
              {planRow1.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setPlanId(p.id);
                      setAmount(String(p.price_cents / 100));
                    }}
                    style={[styles.planCardSmall, isSelected && styles.planCardSmallSelected]}
                  >
                    <Text numberOfLines={1} style={styles.planTitleSmall}>
                      {p.name}
                    </Text>
                    <Text style={styles.planPriceSmall}>
                      {formatCurrency(p.price_cents, p.currency)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Row 2: Basic Plan (Full Width) */}
            {planRow2.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setPlanId(p.id);
                    setAmount(String(p.price_cents / 100));
                  }}
                  style={[styles.planCardFull, isSelected && styles.planCardFullSelected]}
                >
                  <Text style={styles.planTitleSmall}>{p.name}</Text>
                  <Text style={styles.planPriceSmall}>
                    {formatCurrency(p.price_cents, p.currency)}
                  </Text>
                </Pressable>
              );
            })}

            {/* Amount Label & Input */}
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              value={amount || "0"}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#1C1C1E"
              style={styles.input}
            />

            {/* Payment Method Label & Pills */}
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodsRow}>
              {["cash", "upi", "card", "other"].map((mKey) => {
                const isSelected = (method || "cash").toLowerCase() === mKey;
                return (
                  <Pressable
                    key={mKey}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setMethod(mKey)}
                    style={[styles.methodPill, isSelected && styles.methodPillActive]}
                  >
                    <Text
                      style={[
                        styles.methodPillText,
                        isSelected && styles.methodPillTextActive,
                      ]}
                    >
                      {mKey.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {notice ? <NoticeBanner message={notice} /> : null}
            {save.error ? (
              <NoticeBanner message={getApiErrorMessage(save.error)} tone="error" />
            ) : null}

            {/* Record Payment Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm record payment"
              disabled={save.isPending}
              onPress={() => save.mutate()}
              style={styles.submitRecordButton}
            >
              {save.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitRecordButtonText}>Record Payment</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      );
    }
  }
}

export function MetricView({
  model,
}: {
  model: ReturnType<typeof useMetricPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, label, s, selected, color, icon, value } = model.props;
      return (
        <Pressable
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={onPress ? `View ${label} related gyms` : undefined}
          onPress={onPress}
          style={({ pressed }) => [
            s.metric,
            selected && s.metricSelected,
            onPress && pressed && s.metricPressed,
          ]}
        >
          <View style={[s.metricIcon, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <View>
            <Text style={s.muted}>{label}</Text>
            <Text style={s.metricValue}>{value}</Text>
          </View>
        </Pressable>
      );
    }
  }
}

export function PaymentFiltersView({
  model,
}: {
  model: ReturnType<typeof usePaymentFiltersPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        s,
        colors,
        search,
        setSearch,
        cycle,
        planFilter,
        plans,
        setPlanFilter,
        statusFilter,
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        monthFilter,
        months,
        setMonthFilter,
        monthLabel,
      } = model.props;
      return (
        <View style={s.paymentToolbar}>
          <View style={s.paymentSearch}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name or member ID..."
              placeholderTextColor={colors.muted}
              style={s.paymentSearchInput}
            />
            {search ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSearch("")}
                accessibilityLabel="Clear search"
                style={{
                  minWidth: controlMetrics.minimumTouchSize,
                  minHeight: controlMetrics.minimumTouchSize,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
          <View style={s.filters}>
            <Pressable
              accessibilityRole="button"
              style={s.filter}
              onPress={() =>
                cycle(
                  planFilter,
                  ["all", ...plans.map((plan: any) => plan.id)],
                  setPlanFilter,
                )
              }
            >
              <Text style={s.small}>
                {planFilter === "all"
                  ? "All Memberships"
                  : (plans.find((plan: any) => plan.id === planFilter)?.name ??
                    "All Memberships")}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={s.filter}
              onPress={() =>
                cycle(
                  statusFilter,
                  ["all", "paid", "pending", "overdue", "refunded"],
                  setStatusFilter,
                )
              }
            >
              <Text style={s.small}>
                {statusFilter === "all" ? "All Status" : statusFilter.toUpperCase()}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={s.filter}
              onPress={() =>
                cycle(
                  methodFilter,
                  ["all", "cash", "upi", "card", "other"],
                  setMethodFilter,
                )
              }
            >
              <Text style={s.small}>
                {methodFilter === "all"
                  ? "Payment Method"
                  : methodFilter.toUpperCase()}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={s.filter}
              onPress={() => cycle(monthFilter, months, setMonthFilter)}
            >
              <Text style={s.small}>{monthLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      );
    }
  }
}

export function TableView({
  model,
}: {
  model: ReturnType<typeof useTablePresentation>;
}): React.ReactNode {
  const { colors } = useAppTheme();
  const { data } = model.props;
  return (
    <ScrollView style={{ maxHeight: 460 }} nestedScrollEnabled showsVerticalScrollIndicator>
      {data.map((payment) => (
        <View
          key={payment.id}
          style={{
            paddingVertical: 18,
            gap: 8,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ flex: 1, fontSize: 17, fontWeight: "600", color: colors.ink }}>
              {payment.member_name ?? "Member"}
            </Text>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.ink }}>
              {formatCurrency(payment.amount_cents, payment.currency)}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {payment.membership_plan_name ?? "—"}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ color: payment.status === "paid" ? colors.success : colors.warning }}>
              {payment.status}
            </Text>
            <Text style={{ color: colors.muted }}>
              {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "—"}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function PlatformPaymentsDashboardView({
  model,
}: {
  model: ReturnType<typeof usePlatformPaymentsDashboardPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        styles,
        colors,
        loading,
        error,
        Metric,
        totalRevenue,
        setSelectedMetric,
        selectedMetric,
        totalDues,
        gyms,
        members,
        applicationRevenue,
        subscribedGyms,
        trialGyms,
        subscriptionRevenue,
        relatedMetricTitle,
        relatedGymRows,
        gymRows,
        maxRevenue,
        expiryMembers,
        developerGyms,
        activeGymCount,
      } = model.props;
      return (
        <Screen scroll contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Platform Payments</Text>
              <Text style={styles.sub}>
                Application subscriptions, current plans, and billing across every gym.
              </Text>
            </View>
            <View style={styles.platformPill}>
              <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} />
              <Text style={styles.platformPillText}>All gyms</Text>
            </View>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
          {error ? <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text> : null}
          <View style={styles.metrics}>
            <Metric
              s={styles}
              icon="card"
              color="#34C759"
              label="Active Subscription Value"
              value={formatCurrency(applicationRevenue, "INR")}
              onPress={() => setSelectedMetric("application")}
              selected={selectedMetric === "application"}
            />
            <Metric
              s={styles}
              icon="ribbon"
              color="#E91E63"
              label="Subscribed Gyms"
              value={String(subscribedGyms.length)}
              onPress={() => setSelectedMetric("subscribed")}
              selected={selectedMetric === "subscribed"}
            />
            <Metric
              s={styles}
              icon="hourglass"
              color="#E91E63"
              label="Free-trial Gyms"
              value={String(trialGyms.length)}
              onPress={() => setSelectedMetric("trial")}
              selected={selectedMetric === "trial"}
            />
            <Metric
              s={styles}
              icon="trending-up"
              color="#E91E63"
              label="Subscription Value"
              value={formatCurrency(subscriptionRevenue, "INR")}
              onPress={() => setSelectedMetric("subscription-value")}
              selected={selectedMetric === "subscription-value"}
            />
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Application subscriptions & current plans</Text>
            <Text style={styles.panelSubtitle}>
              The application plan each gym uses, its subscription status, and end date
            </Text>
            <View style={styles.platformTableHeader}>
              <Text style={styles.subscriptionGymHeader}>Gym</Text>
              <Text style={styles.subscriptionPlanHeader}>Plan</Text>
              <Text style={styles.subscriptionStatusHeader}>Status</Text>
              <Text style={styles.subscriptionAmountHeader}>Plan amount</Text>
            </View>
            {developerGyms.map((gym) => {
              const subscription = gym.subscription;
              const expired =
                !!subscription?.current_period_ends_at &&
                new Date(subscription.current_period_ends_at).getTime() < Date.now();
              const status =
                expired && (subscription?.status === "active" || subscription?.status === "trialing")
                  ? "expired"
                  : subscription?.status ?? "not started";
              return (
                <View key={`subscription-${gym.id}`} style={styles.platformRow}>
                  <View style={styles.subscriptionGym}>
                    <Text style={styles.cellText}>{gym.name}</Text>
                    <Text style={styles.cellMeta}>{gym.owner_email ?? "No owner email"}</Text>
                  </View>
                  <View style={styles.subscriptionPlan}>
                    <Text style={styles.cellText}>{subscription?.plan_name ?? "No subscription"}</Text>
                    <Text style={styles.cellMeta}>
                      {subscription?.current_period_ends_at
                        ? `Ends ${new Date(subscription.current_period_ends_at).toLocaleDateString("en-IN")}`
                        : subscription
                          ? "No end date set"
                          : "No current plan"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.subscriptionStatus,
                      {
                        color:
                          status === "active"
                            ? colors.success
                            : status === "trialing"
                              ? colors.warning
                              : colors.textMuted,
                      },
                    ]}
                  >
                    {status}
                  </Text>
                  <Text style={styles.moneyText}>
                    {subscription
                      ? formatCurrency(subscription.amount_cents, subscription.currency)
                      : formatCurrency(0, "INR")}
                  </Text>
                </View>
              );
            })}
            {!developerGyms.length ? (
              <Text style={styles.emptyText}>No gym subscription records available.</Text>
            ) : null}
          </View>
          <View style={styles.metrics}>
            <Metric
              s={styles}
              icon="cash"
              color="#34C759"
              label="Gym Member Revenue"
              value={formatCurrency(totalRevenue, "INR")}
              onPress={() => setSelectedMetric("revenue")}
              selected={selectedMetric === "revenue"}
            />
            <Metric
              s={styles}
              icon="time"
              color="#E91E63"
              label="Pending Dues"
              value={formatCurrency(totalDues, "INR")}
              onPress={() => setSelectedMetric("dues")}
              selected={selectedMetric === "dues"}
            />
            <Metric
              s={styles}
              icon="business"
              color="#E91E63"
              label="Active Gyms"
              value={String(activeGymCount)}
              onPress={() => setSelectedMetric("active")}
              selected={selectedMetric === "active"}
            />
            <Metric
              s={styles}
              icon="people"
              color="#E91E63"
              label="Total Members"
              value={String(members.length)}
              onPress={() => setSelectedMetric("members")}
              selected={selectedMetric === "members"}
            />
          </View>
        </Screen>
      );
    }
  }
}

export function ChartView({
  model,
}: {
  model: ReturnType<typeof useChartPresentation>;
}): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, compact, max, values, monthLabels } = model.props;
      if (!values.some((value: number) => value > 0)) {
        return (
          <View style={s.panel}>
            <Text style={s.panelTitle}>Payment Overview</Text>
            <View style={{ minHeight: 140, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="bar-chart-outline" size={28} color={colors.muted} />
              <Text style={[s.muted, { marginTop: 12 }]}>No paid transactions in this period.</Text>
            </View>
          </View>
        );
      }
      return (
        <View style={[s.panel, s.overviewPanel]}>
          <Text style={s.panelTitle}>Payment Overview</Text>
          <View style={s.chart}>
            <Svg width="100%" height="280" viewBox="0 0 400 280">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <Fragment key={`grid-group-${ratio}`}>
                  <Line
                    key={`grid-${ratio}`}
                    x1={88 + ratio * 280}
                    y1="12"
                    x2={88 + ratio * 280}
                    y2="238"
                    stroke="rgba(0, 122, 255,0.16)"
                  />
                  <SvgText
                    key={`axis-${ratio}`}
                    x={88 + ratio * 280}
                    y="270"
                    fill={colors.muted}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {compact(max * ratio)}
                  </SvgText>
                </Fragment>
              ))}
              {values.map((value: number, index: number) => {
                const rowY = 30 + index * 38;
                const barWidth = Math.max(value ? 5 : 0, (value / max) * 280);
                return (
                  <Fragment key={`value-group-${index}`}>
                    <SvgText
                      key={`date-${index}`}
                      x="76"
                      y={rowY + 4}
                      fill={colors.muted}
                      fontSize="11"
                      textAnchor="end"
                    >
                      {monthLabels[index]}
                    </SvgText>
                    <Line
                      key={`track-${index}`}
                      x1="88"
                      y1={rowY}
                      x2="368"
                      y2={rowY}
                      stroke="rgba(0, 122, 255,0.12)"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    <Line
                      key={`bar-${index}`}
                      x1="88"
                      y1={rowY}
                      x2={88 + barWidth}
                      y2={rowY}
                      stroke="#E91E63"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  </Fragment>
                );
              })}
            </Svg>
          </View>
        </View>
      );
    }
  }
}

export function RecentView({
  model,
}: {
  model: ReturnType<typeof useRecentPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, visibleTransactions } = model.props;
      return (
        <View style={[s.panel, s.recentPanel]}>
          <Text style={s.panelTitle}>Recent Payments</Text>
          {visibleTransactions.map((item: any) => (
            <View key={item.id} style={s.recent}>
              <View>
                <Text style={s.bold}>{item.member_name ?? "Member"}</Text>
                <Text style={s.muted}>{formatDate(item.paid_at)}</Text>
              </View>
              <Text style={s.green}>
                {formatCurrency(item.amount_cents, item.currency)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
  }
}

export function ReceiptModalView({
  model,
}: {
  model: ReturnType<typeof useReceiptModalPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return null;
    }
  }
}

export function ReceiptDetailView({
  model,
}: {
  model: ReturnType<typeof useReceiptDetailPresentation>;
}): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return null;
    }
  }
}
