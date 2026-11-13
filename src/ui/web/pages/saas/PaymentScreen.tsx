import { OwnerMembershipPayments } from "../../../../features/operations/MembershipCheckout";
import { Ionicons } from "@expo/vector-icons";
import { Fragment } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Gym, Member, Payment } from "../../../../types/saas";
import { formatCurrency } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { usePaymentScreenPresentation, useMetricPresentation, usePaymentFiltersPresentation, useTablePresentation, usePlatformPaymentsDashboardPresentation, useChartPresentation, useRecentPresentation, useReceiptModalPresentation, useReceiptDetailPresentation } from "../../../../screens/saas/PaymentScreen";

export function PaymentScreenView({ model }: { model: ReturnType<typeof usePaymentScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { PlatformPaymentsDashboard, payments, allMembers, gq, developerGq, pq, mq } = model.props;
      return (<PlatformPaymentsDashboard payments={payments} members={allMembers} gyms={gq.data ?? []} developerGyms={developerGq.data ?? []} loading={pq.isLoading || mq.isLoading || gq.isLoading || developerGq.isLoading} error={pq.error || mq.error || gq.error || developerGq.error} />);
    }
    case "view3": {
      const { styles, colors, search, setSearch, Metric, total, pending, members, setTab, tab, PaymentFilters, plans, planFilter, setPlanFilter, statusFilter, setStatusFilter, methodFilter, setMethodFilter, monthFilter, setMonthFilter, Table, shown, Chart, Recent, payments, setShowMembers, member, showMembers, memberSearch, setMemberSearch, setMemberId, setPlanId, planId, amount, setAmount, setMethod, method, notice, save, Quick } = model.props;
      return (
        <Screen scroll keyboard contentContainerStyle={styles.screen}>
          {/* Header Card */}
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Payments</Text>
              <Text style={styles.sub}>
                Record and update member dues with easy tracking.
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {}}
                style={styles.exportButton}
              >
                <Ionicons name="document-text-outline" size={17} color="#34C759" />
                <Text style={styles.exportText}>Export</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {}}
                style={styles.recordPaymentButton}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.recordPaymentText}>Record Payment</Text>
              </Pressable>
            </View>
          </View>

          {/* Membership payment QR & verification requests */}
          <OwnerMembershipPayments />

          {/* 4 KPI Stat Cards */}
          <View style={styles.metrics}>
            <Metric
              s={styles}
              icon="card-outline"
              color="#E91E63"
              label="Total Collection"
              value={formatCurrency(total, "INR")}
            />
            <Metric
              s={styles}
              icon="checkmark-circle-outline"
              color="#34C759"
              label="Paid This Month"
              value={formatCurrency(total, "INR")}
            />
            <Metric
              s={styles}
              icon="time-outline"
              color="#E91E63"
              label="Pending Dues"
              value={formatCurrency(pending, "INR")}
            />
            <Metric
              s={styles}
              icon="people-outline"
              color="#E91E63"
              label="Total Members"
              value={String(members.length)}
            />
          </View>

          {/* 2-Column Layout */}
          <View style={styles.layout}>
            {/* Left: Table Card */}
            <View style={styles.main}>
              <View style={styles.tableCard}>
                <View style={styles.tabs}>
                  {["all", "paid", "pending", "overdue", "refunded"].map((x) => (
                    <Pressable
                      accessibilityRole="button"
                      key={x}
                      onPress={() => setTab(x)}
                      style={[styles.tab, tab === x && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, tab === x && styles.activeTabText]}>
                        {x === "all" ? "All Payments" : x[0].toUpperCase() + x.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.paymentSearch}>
                  <Ionicons name="search" size={18} color="#F2F2F7" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search name or member ID..."
                    placeholderTextColor="#F2F2F7"
                    style={styles.paymentSearchInput}
                  />
                  {search ? (
                    <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
                      <Ionicons name="close-circle" size={18} color="#F2F2F7" />
                    </Pressable>
                  ) : null}
                </View>

                <Table data={shown} s={styles} />
              </View>
            </View>

            {/* Right: Update Member Dues */}
            <View style={styles.side}>
              <View style={styles.sideCard}>
                <Text style={styles.sideCardTitle}>Update Member Dues</Text>

                <View style={styles.paymentSearch}>
                  <Ionicons name="search" size={18} color="#F2F2F7" />
                  <TextInput
                    value={memberSearch}
                    onChangeText={(v) => {
                      setMemberSearch(v);
                      if (!showMembers) setShowMembers(true);
                    }}
                    placeholder="Search name or member ID..."
                    placeholderTextColor="#F2F2F7"
                    style={styles.paymentSearchInput}
                  />
                  {memberSearch ? (
                    <Pressable accessibilityRole="button" onPress={() => setMemberSearch("")}>
                      <Ionicons name="close-circle" size={18} color="#F2F2F7" />
                    </Pressable>
                  ) : null}
                </View>

                {memberSearch ? (
                  <ScrollView style={styles.memberScroll} nestedScrollEnabled>
                    <View style={styles.memberList}>
                      {members
                        .filter((m) =>
                          `${m.first_name} ${m.last_name} ${m.member_code}`
                            .toLowerCase()
                            .includes(memberSearch.trim().toLowerCase()),
                        )
                        .map((m) => (
                          <Pressable
                            accessibilityRole="button"
                            key={m.id}
                            onPress={() => {
                              setMemberId(m.id);
                              setMemberSearch("");
                            }}
                            style={[styles.member, member?.id === m.id && styles.selected]}
                          >
                            <Text style={styles.bold}>
                              {m.first_name} {m.last_name} ({m.member_code})
                            </Text>
                          </Pressable>
                        ))}
                    </View>
                  </ScrollView>
                ) : null}

                {member ? (
                  <View style={styles.selectedMemberChip}>
                    <Text style={styles.selectedMemberName}>
                      Selected:{" "}
                      <Text style={styles.boldWhite}>
                        {member.first_name} {member.last_name}
                      </Text>{" "}
                      ({member.member_code})
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.formFieldLabel}>Membership Plan</Text>
                <View style={styles.planGrid}>
                  {plans.map((p) => (
                    <Pressable
                      accessibilityRole="button"
                      key={p.id}
                      onPress={() => setPlanId(p.id)}
                      style={[styles.planCard, planId === p.id && styles.planCardSelected]}
                    >
                      <Text numberOfLines={1} style={styles.planCardName}>{p.name}</Text>
                      <Text style={styles.planCardPrice}>
                        {formatCurrency(p.price_cents, p.currency)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formFieldLabel}>Amount (₹)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#F2F2F7"
                  style={styles.amountInput}
                />

                <Text style={styles.formFieldLabel}>Payment Method</Text>
                <View style={styles.methodRow}>
                  {["cash", "upi", "card", "other"].map((x) => (
                    <Pressable
                      accessibilityRole="button"
                      key={x}
                      onPress={() => setMethod(x)}
                      style={[styles.methodPill, method === x && styles.methodPillSelected]}
                    >
                      <Text
                        style={[
                          styles.methodPillText,
                          method === x && styles.methodPillTextSelected,
                        ]}
                      >
                        {x.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <NoticeBanner message={notice} />
                <NoticeBanner
                  message={save.error ? getApiErrorMessage(save.error) : null}
                  tone="error"
                />

                <Pressable
                  accessibilityRole="button"
                  disabled={save.isPending}
                  onPress={() => save.mutate()}
                  style={[
                    styles.recordSubmitButton,
                    save.isPending && { opacity: 0.7 },
                  ]}
                >
                  {save.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.recordSubmitText}>Record Payment</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Screen>
      );
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
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
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <Text style={s.metricValue}>{value}</Text>
          <View style={s.metricSubRow}>
            <Text style={s.metricLabel}>{label}</Text>
            <Text style={s.metricIncrease}>↑ 8.2% this month</Text>
          </View>
        </Pressable>
      );
    }
  }
}

export function PaymentFiltersView({ model }: { model: ReturnType<typeof usePaymentFiltersPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, colors, search, setSearch, cycle, planFilter, plans, setPlanFilter, statusFilter, setStatusFilter, methodFilter, setMethodFilter, monthFilter, months, setMonthFilter, monthLabel } = model.props;
      return ((
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
          <Pressable accessibilityRole="button" onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <View style={s.filters}>
        <Pressable accessibilityRole="button"
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
        <Pressable accessibilityRole="button"
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
        <Pressable accessibilityRole="button"
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
        <Pressable accessibilityRole="button"
          style={s.filter}
          onPress={() => cycle(monthFilter, months, setMonthFilter)}
        >
          <Text style={s.small}>{monthLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  ));
    }
  }
}

export function TableView({ model }: { model: ReturnType<typeof useTablePresentation> }): React.ReactNode {
  const { data, s } = model.props;
  if (!data || !data.length) {
    return (
      <View style={{ paddingVertical: 40, alignItems: "center", justifyContent: "center" }}>
        <Text style={[s.emptyText, { fontSize: 13 }]}>No payment records found.</Text>
      </View>
    );
  }

  return (
    <View style={{ width: "100%" }}>
      {/* Table Header */}
      <View style={s.tableHeader}>
        <Text style={[s.thText, { flex: 2 }]}>MEMBER</Text>
        <Text style={[s.thText, { flex: 1.5 }]}>MEMBERSHIP PLAN</Text>
        <Text style={[s.thText, { flex: 1 }]}>AMOUNT</Text>
        <Text style={[s.thText, { flex: 1 }]}>STATUS</Text>
        <Text style={[s.thText, { flex: 1.2 }]}>PAYMENT DATE</Text>
        <Text style={[s.thText, { width: 50, textAlign: "right" }]}>ACTION</Text>
      </View>

      {/* Table Rows */}
      {data.map((payment) => (
        <View key={payment.id} style={s.tableRow}>
          <Text numberOfLines={1} style={[s.memberText, { flex: 2 }]}>
            {payment.member_name ?? "Member"}
          </Text>
          <Text numberOfLines={1} style={[s.planText, { flex: 1.5 }]}>
            {payment.membership_plan_name ?? "—"}
          </Text>
          <Text style={[s.amountText, { flex: 1 }]}>
            {formatCurrency(payment.amount_cents, payment.currency)}
          </Text>
          <View style={{ flex: 1 }}>
            <View
              style={[
                s.statusPill,
                payment.status !== "paid" && { backgroundColor: "rgba(233, 30, 99, 0.12)" },
              ]}
            >
              <Text
                style={[
                  s.statusPillText,
                  payment.status !== "paid" && { color: "#E91E63" },
                ]}
              >
                {payment.status}
              </Text>
            </View>
          </View>
          <Text style={[s.dateText, { flex: 1.2 }]}>
            {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("en-US") : "—"}
          </Text>
          <View style={{ width: 50, alignItems: "flex-end" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              style={s.actionButton}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

export function PlatformPaymentsDashboardView({ model }: { model: ReturnType<typeof usePlatformPaymentsDashboardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, loading, error, Metric, totalRevenue, setSelectedMetric, selectedMetric, totalDues, gyms, members, applicationRevenue, subscribedGyms, trialGyms, subscriptionRevenue, relatedMetricTitle, relatedGymRows, gymRows, maxRevenue, expiryMembers, developerGyms , activeGymCount } = model.props;
      return (<Screen scroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><View><Text style={styles.title}>Platform Payments</Text><Text style={styles.sub}>Application subscriptions, current plans, and billing across every gym.</Text></View><View style={styles.platformPill}><Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} /><Text style={styles.platformPillText}>All gyms</Text></View></View>
    {loading ? <ActivityIndicator color={colors.primary} /> : null}
    {error ? <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text> : null}
    <View style={styles.metrics}><Metric s={styles} icon="card" color="#34C759" label="Active Subscription Value" value={formatCurrency(applicationRevenue, "INR")} onPress={() => setSelectedMetric("application")} selected={selectedMetric === "application"} /><Metric s={styles} icon="ribbon" color="#E91E63" label="Subscribed Gyms" value={String(subscribedGyms.length)} onPress={() => setSelectedMetric("subscribed")} selected={selectedMetric === "subscribed"} /><Metric s={styles} icon="hourglass" color="#E91E63" label="Free-trial Gyms" value={String(trialGyms.length)} onPress={() => setSelectedMetric("trial")} selected={selectedMetric === "trial"} /><Metric s={styles} icon="trending-up" color="#E91E63" label="Subscription Value" value={formatCurrency(subscriptionRevenue, "INR")} onPress={() => setSelectedMetric("subscription-value")} selected={selectedMetric === "subscription-value"} /></View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Application subscriptions & current plans</Text><Text style={styles.panelSubtitle}>The application plan each gym uses, its subscription status, and end date</Text><View style={styles.platformTableHeader}><Text style={styles.subscriptionGymHeader}>Gym</Text><Text style={styles.subscriptionPlanHeader}>Plan</Text><Text style={styles.subscriptionStatusHeader}>Status</Text><Text style={styles.subscriptionAmountHeader}>Plan amount</Text></View>{developerGyms.map((gym) => { const subscription = gym.subscription; const expired = !!subscription?.current_period_ends_at && new Date(subscription.current_period_ends_at).getTime() < Date.now(); const status = expired && (subscription?.status === "active" || subscription?.status === "trialing") ? "expired" : subscription?.status ?? "not started"; return <View key={`subscription-${gym.id}`} style={styles.platformRow}><View style={styles.subscriptionGym}><Text style={styles.cellText}>{gym.name}</Text><Text style={styles.cellMeta}>{gym.owner_email ?? "No owner email"}</Text></View><View style={styles.subscriptionPlan}><Text style={styles.cellText}>{subscription?.plan_name ?? "No subscription"}</Text><Text style={styles.cellMeta}>{subscription?.current_period_ends_at ? `Ends ${new Date(subscription.current_period_ends_at).toLocaleDateString("en-IN")}` : subscription ? "No end date set" : "No current plan"}</Text></View><Text style={[styles.subscriptionStatus, { color: status === "active" ? colors.success : status === "trialing" ? colors.warning : colors.textMuted }]}>{status}</Text><Text style={styles.moneyText}>{subscription ? formatCurrency(subscription.amount_cents, subscription.currency) : formatCurrency(0, "INR")}</Text></View>; })}{!developerGyms.length ? <Text style={styles.emptyText}>No gym subscription records available.</Text> : null}</View>
    <View style={styles.metrics}><Metric s={styles} icon="cash" color="#34C759" label="Gym Member Revenue" value={formatCurrency(totalRevenue, "INR")} onPress={() => setSelectedMetric("revenue")} selected={selectedMetric === "revenue"} /><Metric s={styles} icon="time" color="#E91E63" label="Pending Dues" value={formatCurrency(totalDues, "INR")} onPress={() => setSelectedMetric("dues")} selected={selectedMetric === "dues"} /><Metric s={styles} icon="business" color="#E91E63" label="Active Gyms" value={String(activeGymCount)} onPress={() => setSelectedMetric("active")} selected={selectedMetric === "active"} /><Metric s={styles} icon="people" color="#E91E63" label="Total Members" value={String(members.length)} onPress={() => setSelectedMetric("members")} selected={selectedMetric === "members"} /></View>
    {selectedMetric ? <View style={styles.panel}><View style={styles.relatedHeader}><View><Text style={styles.panelTitle}>{relatedMetricTitle}</Text><Text style={styles.panelSubtitle}>{relatedGymRows.length} related gym{relatedGymRows.length === 1 ? "" : "s"}</Text></View><Pressable accessibilityRole="button" onPress={() => setSelectedMetric(null)}><Ionicons name="close-circle-outline" size={22} color={colors.muted} /></Pressable></View>{relatedGymRows.map((item: any) => { const row = "gym" in item ? item : null; const gym = row?.gym ?? item; const subscription = gym.subscription; const revenue = row?.revenue ?? 0; const dues = row?.dues ?? 0; const membersCount = row?.members ?? gym.member_count ?? 0; const metricValue = selectedMetric === "revenue" ? formatCurrency(revenue, "INR") : selectedMetric === "dues" ? formatCurrency(dues, "INR") : selectedMetric === "application" || selectedMetric === "subscription-value" ? formatCurrency(subscription?.amount_cents ?? 0, subscription?.currency ?? "INR") : String(membersCount); const metricLabel = selectedMetric === "revenue" ? "member revenue" : selectedMetric === "dues" ? "pending dues" : selectedMetric === "application" || selectedMetric === "subscription-value" ? subscription?.plan_name ?? "subscription" : `${membersCount} members`; return <View key={`related-${gym.id}`} style={styles.relatedGymRow}><View style={styles.relatedGymCopy}><Text style={styles.cellText}>{gym.name}</Text><Text style={styles.cellMeta}>{subscription?.status ?? gym.status} Â· {gym.owner_email ?? "Platform gym"}</Text></View><View style={styles.relatedGymValue}><Text style={styles.moneyText}>{metricValue}</Text><Text style={styles.cellMeta}>{metricLabel}</Text></View></View>; })}{!relatedGymRows.length ? <Text style={styles.emptyText}>No gyms match this metric yet.</Text> : null}</View> : null}
    <View style={styles.panel}><Text style={styles.panelTitle}>Gym-wise revenue & dues</Text><Text style={styles.panelSubtitle}>Paid collections and outstanding payment records</Text><View style={styles.platformTableHeader}><Text style={styles.platformHeaderText}>Gym</Text><Text style={styles.platformHeaderText}>Revenue</Text><Text style={styles.platformHeaderText}>Dues</Text></View>{gymRows.map((row) => <View key={row.gym.id} style={styles.platformRow}><View style={styles.gymCell}><View style={styles.gymStatusDot} /><View><Text style={styles.cellText}>{row.gym.name}</Text><Text style={styles.cellMeta}>{row.members} members</Text></View></View><View style={styles.moneyCell}><View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.max(row.revenue ? 4 : 0, row.revenue / maxRevenue * 100)}%`, backgroundColor: colors.success }]} /></View><Text style={styles.moneyText}>{formatCurrency(row.revenue, "INR")}</Text></View><Text style={[styles.moneyText, { color: row.dues ? colors.warning : colors.textMuted }]}>{formatCurrency(row.dues, "INR")}</Text></View>)}{!gymRows.length ? <Text style={styles.emptyText}>No gym billing records available.</Text> : null}</View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Upcoming expiries</Text><Text style={styles.panelSubtitle}>Members with the nearest membership end dates</Text>{expiryMembers.map((member) => { const date = new Date(`${member.membership_ends_at}T00:00:00`); const days = Math.ceil((date.getTime() - Date.now()) / 86400000); return <View key={member.id} style={styles.expiryRow}><View><Text style={styles.cellText}>{member.member_name ?? `${member.first_name} ${member.last_name}`}</Text><Text style={styles.cellMeta}>{member.gym_name ?? "Gym"} · {member.membership_plan_name ?? "Membership plan"}</Text></View><View style={styles.expiryValue}><Text style={styles.expiryDate}>{date.toLocaleDateString("en-IN")}</Text><Text style={[styles.cellMeta, { color: days <= 7 ? colors.danger : colors.warning }]}>{days < 0 ? "Expired" : `${days} days left`}</Text></View></View>})}{!expiryMembers.length ? <Text style={styles.emptyText}>No membership expiry dates are available.</Text> : null}</View>
  </Screen>);
    }
  }
}

export function ChartView({ model }: { model: ReturnType<typeof useChartPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, compact, max, values, monthLabels } = model.props;
      return ((
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
                fill="#F2F2F7"
                fontSize="8"
                textAnchor="middle"
              >
                {compact(max * ratio)}
              </SvgText>
            </Fragment>
          ))}
          {values.map((value, index) => {
            const rowY = 30 + index * 38;
            const barWidth = Math.max(value ? 5 : 0, (value / max) * 280);
            return (
              <Fragment key={`value-group-${index}`}>
                <SvgText
                  key={`date-${index}`}
                  x="76"
                  y={rowY + 4}
                  fill="#F2F2F7"
                  fontSize="9"
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
                <SvgText
                  key={`amount-${index}`}
                  x={Math.min(392, 98 + barWidth)}
                  y={rowY + 4}
                  fill="#E91E63"
                  fontSize="9"
                >
                  {compact(value)}
                </SvgText>
              </Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  ));
    }
  }
}

export function RecentView({ model }: { model: ReturnType<typeof useRecentPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, visibleTransactions, setShowPaidRecords, setShowReminders, setShowReceiptMembers, showPaidRecords, paidRecords, showReminders, reminderMembers, showReceiptMembers, monthlyPaidRecords, setReceiptPayment, ReceiptModal, receiptPayment } = model.props;
      return ((
    <>
      <View style={[s.panel, s.recentPanel]}>
        <Text style={s.panelTitle}>Recent Transactions</Text>
        {visibleTransactions.map((p) => (
          <View key={p.id} style={s.recent}>
            <View>
              <Text style={s.bold}>{p.member_name ?? "Member"}</Text>
              <Text style={s.muted}>{p.membership_plan_name ?? p.method}</Text>
            </View>
            <Text style={s.green}>
              + {formatCurrency(p.amount_cents, p.currency)}
            </Text>
          </View>
        ))}
      </View>
      <View style={[s.panel, s.quickPanel]}>
        <Text style={s.panelTitle}>Quick Actions</Text>
        <View style={s.quickRow}>
          {[
            ["wallet", "Record"],
            ["pricetag", "Discount"],
            ["notifications", "Reminder"],
            ["print", "Receipt"],
          ].map(([i, l]) => (
            <Pressable
              accessibilityRole="button"
              key={l}
              onPress={() => {
                if (l === "Record") setShowPaidRecords(true);
                if (l === "Reminder") setShowReminders(true);
                if (l === "Receipt") setShowReceiptMembers(true);
              }}
              style={({ pressed }) => [s.quick, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={i as any} size={22} color="#E91E63" />
              <Text style={s.muted}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Modal
        transparent
        visible={showPaidRecords}
        animationType="fade"
        onRequestClose={() => setShowPaidRecords(false)}
      >
        <View style={s.recordsBackdrop}>
          <View style={s.recordsModal}>
            <View style={s.recordsHeader}>
              <View>
                <Text style={s.recordsTitle}>Paid Member Records</Text>
                <Text style={s.muted}>
                  {paidRecords.length} successful payments
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowPaidRecords(false)}>
                <Ionicons name="close" size={25} color="#F2F2F7" />
              </Pressable>
            </View>
            <ScrollView style={s.recordsList}>
              {paidRecords.map((payment) => (
                <View key={payment.id} style={s.recordCard}>
                  <View style={s.recordAvatar}>
                    <Ionicons name="person" size={20} color="#E91E63" />
                  </View>
                  <View style={s.recordCopy}>
                    <Text style={s.bold}>
                      {payment.member_name ?? "Member"}
                    </Text>
                    <Text style={s.muted}>
                      {payment.membership_plan_name ?? "No plan"} ·{" "}
                      {payment.method.toUpperCase()}
                    </Text>
                    <Text style={s.muted}>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : "Date unavailable"}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.green}>
                      {formatCurrency(payment.amount_cents, payment.currency)}
                    </Text>
                    <Text style={s.paidLabel}>PAID</Text>
                  </View>
                </View>
              ))}
              {!paidRecords.length ? (
                <Text style={s.emptyRecords}>No paid records found.</Text>
              ) : null}
            </ScrollView>
            <PrimaryButton
              title="Close"
              onPress={() => setShowPaidRecords(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={showReminders}
        animationType="fade"
        onRequestClose={() => setShowReminders(false)}
      >
        <View style={s.recordsBackdrop}>
          <View style={s.recordsModal}>
            <View style={s.recordsHeader}>
              <Text style={s.recordsTitle}>Membership Reminders</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowReminders(false)}>
                <Ionicons name="close" size={25} color="#F2F2F7" />
              </Pressable>
            </View>
            <ScrollView style={s.recordsList}>
              {reminderMembers.map(({ member, days }) => (
                <View key={member.id} style={s.recordCard}>
                  <View style={s.recordCopy}>
                    <Text style={s.bold}>
                      {member.first_name} {member.last_name}
                    </Text>
                    <Text style={s.muted}>
                      {member.email ?? "No email"} ·{" "}
                      {member.phone ?? "No phone"}
                    </Text>
                    <Text style={s.muted}>
                      Expires {member.membership_ends_at}
                    </Text>
                  </View>
                  <Text style={days === 0 ? s.orange : s.green}>
                    {days === 0 ? "Today" : `${days} days left`}
                  </Text>
                </View>
              ))}
              {!reminderMembers.length ? (
                <Text style={s.emptyRecords}>
                  No memberships expire within 5 days.
                </Text>
              ) : null}
            </ScrollView>
            <PrimaryButton
              title="Close"
              onPress={() => setShowReminders(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={showReceiptMembers}
        animationType="fade"
        onRequestClose={() => setShowReceiptMembers(false)}
      >
        <View style={s.recordsBackdrop}>
          <View style={s.recordsModal}>
            <View style={s.recordsHeader}>
              <View>
                <Text style={s.recordsTitle}>Paid Members This Month</Text>
                <Text style={s.muted}>Select a member to generate receipt</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowReceiptMembers(false)}>
                <Ionicons name="close" size={25} color="#F2F2F7" />
              </Pressable>
            </View>
            <ScrollView style={s.recordsList}>
              {monthlyPaidRecords.map((payment) => (
                <Pressable accessibilityRole="button"
                  key={payment.id}
                  onPress={() => {
                    setShowReceiptMembers(false);
                    setReceiptPayment(payment);
                  }}
                  style={s.recordCard}
                >
                  <View style={s.recordAvatar}>
                    <Ionicons name="receipt" size={20} color="#E91E63" />
                  </View>
                  <View style={s.recordCopy}>
                    <Text style={s.bold}>
                      {payment.member_name ?? "Member"}
                    </Text>
                    <Text style={s.muted}>
                      {payment.membership_plan_name ?? "No plan"}
                    </Text>
                    <Text style={s.muted}>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : ""}
                    </Text>
                  </View>
                  <Text style={s.green}>
                    {formatCurrency(payment.amount_cents, payment.currency)}
                  </Text>
                </Pressable>
              ))}
              {!monthlyPaidRecords.length ? (
                <Text style={s.emptyRecords}>
                  No fees were paid this month.
                </Text>
              ) : null}
            </ScrollView>
            <PrimaryButton
              title="Close"
              onPress={() => setShowReceiptMembers(false)}
            />
          </View>
        </View>
      </Modal>
      <ReceiptModal
        payment={receiptPayment}
        onClose={() => setReceiptPayment(null)}
        s={s}
      />
    </>
  ));
    }
  }
}

export function ReceiptModalView({ model }: { model: ReturnType<typeof useReceiptModalPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onClose, s, payment, ReceiptDetail, paidDate, downloadReceipt, receiptNumber, printReceipt, shareReceipt } = model.props;
      return ((
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={s.recordsBackdrop}>
        <ScrollView
          style={s.receiptWorkspace}
          contentContainerStyle={s.receiptWorkspaceContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <View style={s.receiptTop}>
            <Text style={s.receiptTitle}>Generate Receipt</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <Ionicons name="close" size={26} color="#F2F2F7" />
            </Pressable>
          </View>
          <View style={s.receiptColumns}>
            <View style={s.receiptSidebar}>
              <View style={s.receiptMember}>
                <View style={s.recordAvatar}>
                  <Ionicons name="person" size={22} color="#E91E63" />
                </View>
                <View>
                  <Text style={s.receiptBold}>
                    {payment.member_name ?? "Member"}
                  </Text>
                  <Text style={s.receiptMuted}>
                    #{payment.member_id.slice(0, 10).toUpperCase()}
                  </Text>
                  <Text style={s.paidLabel}>ACTIVE MEMBER</Text>
                </View>
              </View>
              <Text style={s.receiptSectionTitle}>Payment Details</Text>
              <ReceiptDetail
                s={s}
                label="Membership Plan"
                value={payment.membership_plan_name ?? "No plan"}
              />
              <ReceiptDetail s={s} label="Payment Date" value={paidDate} />
              <ReceiptDetail
                s={s}
                label="Payment Method"
                value={payment.method.toUpperCase()}
              />
              <ReceiptDetail
                s={s}
                label="Transaction ID"
                value={
                  payment.provider_reference ??
                  payment.id.slice(0, 16).toUpperCase()
                }
              />
              <View style={s.totalBox}>
                <Text style={s.receiptMuted}>Total Paid</Text>
                <Text style={s.totalAmount}>
                  {formatCurrency(payment.amount_cents, payment.currency)}
                </Text>
                <PrimaryButton
                  title="Generate Receipt"
                  icon="receipt-outline"
                  onPress={downloadReceipt}
                />
              </View>
            </View>
            <View style={s.receiptPreview}>
              <View style={s.receiptBrandRow}>
                <View>
                  <Text style={s.receiptBrand}>PULSEFIT</Text>
                  <Text style={s.receiptBrandSub}>ENTERPRISE</Text>
                </View>
                <View>
                  <Text style={s.receiptHeading}>Receipt</Text>
                  <Text style={s.receiptMuted}>#{receiptNumber}</Text>
                </View>
              </View>
              <Text style={s.receiptBold}>PulseFit Gym</Text>
              <Text style={s.receiptMuted}>
                123 Fitness Street, Pune, Maharashtra 411001\nPhone: +91 98765
                43210 | Email: info@pulsefit.com
              </Text>
              <View style={s.receiptDivider} />
              <Text style={s.receiptSectionTitle}>Member Details</Text>
              <ReceiptDetail
                s={s}
                label="Name"
                value={payment.member_name ?? "Member"}
              />
              <ReceiptDetail
                s={s}
                label="Member ID"
                value={payment.member_id.slice(0, 12).toUpperCase()}
              />
              <View style={s.receiptDivider} />
              <Text style={s.receiptSectionTitle}>Payment Details</Text>
              <ReceiptDetail
                s={s}
                label="Membership Plan"
                value={payment.membership_plan_name ?? "No plan"}
              />
              <ReceiptDetail s={s} label="Payment Date" value={paidDate} />
              <ReceiptDetail
                s={s}
                label="Payment Method"
                value={payment.method.toUpperCase()}
              />
              <ReceiptDetail
                s={s}
                label="Transaction ID"
                value={
                  payment.provider_reference ??
                  payment.id.slice(0, 16).toUpperCase()
                }
              />
              <View style={s.receiptTotalRow}>
                <Text style={s.receiptSectionTitle}>Total Paid</Text>
                <Text style={s.totalAmount}>
                  {formatCurrency(payment.amount_cents, payment.currency)}
                </Text>
              </View>
              <Text style={s.receiptThanks}>
                Thank you for being with PulseFit!{"\n"}Stay fit, stay healthy.
              </Text>
              <View style={s.signatureBlock}>
                <Text style={s.signature}>PulseFit</Text>
                <Text style={s.receiptMuted}>Authorized Signature</Text>
              </View>
            </View>
          </View>
          <View style={s.receiptActions}>
            <PrimaryButton
              title="Download"
              icon="download-outline"
              variant="secondary"
              onPress={downloadReceipt}
            />
            <PrimaryButton
              title="Print"
              icon="print-outline"
              variant="secondary"
              onPress={printReceipt}
            />
            <PrimaryButton
              title="Share"
              icon="share-social-outline"
              onPress={() => {
                void shareReceipt();
              }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  ));
    }
  }
}

export function ReceiptDetailView({ model }: { model: ReturnType<typeof useReceiptDetailPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, label, value } = model.props;
      return ((
  <View style={s.receiptDetail}>
    <Text style={s.receiptMuted}>{label}</Text>
    <Text style={s.receiptDetailValue}>{value}</Text>
  </View>
));
    }
  }
}
