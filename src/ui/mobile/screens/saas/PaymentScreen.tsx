import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Fragment } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, View } from "react-native";
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
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.sub}>
            Record and update member dues with easy tracking.
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search member..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
          </View>
          <PrimaryButton
            title="Export"
            icon="download-outline"
            variant="secondary"
          />
          <PrimaryButton title="Record Payment" icon="add" />
        </View>
      </View>
      <View style={styles.metrics}>
        <Metric
          s={styles}
          icon="wallet"
          color="#0066CC"
          label="Total Collection"
          value={formatCurrency(total, "INR")}
        />
        <Metric
          s={styles}
          icon="checkmark-circle"
          color="#16A34A"
          label="Paid This Month"
          value={formatCurrency(total, "INR")}
        />
        <Metric
          s={styles}
          icon="time"
          color="#F97316"
          label="Pending Dues"
          value={formatCurrency(pending, "INR")}
        />
        <Metric
          s={styles}
          icon="people"
          color="#2563EB"
          label="Total Members"
          value={String(members.length)}
        />
      </View>
      <View style={styles.layout}>
        <View style={styles.main}>
          <View style={styles.panel}>
            <View style={styles.tabs}>
              {["all", "paid", "pending", "overdue", "refunded"].map((x) => (
                <Pressable accessibilityRole="button"
                  key={x}
                  onPress={() => setTab(x)}
                  style={[styles.tab, tab === x && styles.activeTab]}
                >
                  <Text
                    style={[styles.tabText, tab === x && styles.activeTabText]}
                  >
                    {x === "all"
                      ? "All Payments"
                      : x[0].toUpperCase() + x.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <PaymentFilters
              s={styles}
              colors={colors}
              search={search}
              setSearch={setSearch}
              plans={plans}
              planFilter={planFilter}
              setPlanFilter={setPlanFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              methodFilter={methodFilter}
              setMethodFilter={setMethodFilter}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
            />
            <Table data={shown} s={styles} />
          </View>
          <View style={styles.lower}>
            <Chart s={styles} />
            <Recent data={payments.slice(0, 4)} s={styles} />
          </View>
        </View>
        <View style={styles.side}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Update Member Dues</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowMembers((v) => !v)}
              style={styles.memberToggle}
            >
              <View>
                <Text style={styles.label}>Member</Text>
                <Text style={styles.selectedMemberText}>
                  {member
                    ? `${member.first_name} ${member.last_name}`
                    : "Select a member"}
                </Text>
              </View>
              <Ionicons
                name={showMembers ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.muted}
              />
            </Pressable>
            {showMembers ? (
              <View style={styles.memberDropdown}>
                <View style={styles.memberSearch}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={colors.muted}
                  />
                  <TextInput
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    placeholder="Search name or member ID..."
                    placeholderTextColor={colors.muted}
                    style={styles.memberSearchInput}
                  />
                  {memberSearch ? (
                    <Pressable accessibilityRole="button" onPress={() => setMemberSearch("")} accessibilityLabel={"Clear member search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={colors.muted}
                      />
                    </Pressable>
                  ) : null}
                </View>
                <ScrollView
                  style={styles.memberScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  <View style={styles.memberList}>
                    {members
                      .filter((m) =>
                        `${m.first_name} ${m.last_name} ${m.member_code}`
                          .toLowerCase()
                          .includes(memberSearch.trim().toLowerCase()),
                      )
                      .map((m) => (
                        <Pressable accessibilityRole="button"
                          key={m.id}
                          onPress={() => {
                            setMemberId(m.id);
                            setShowMembers(false);
                            setMemberSearch("");
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
            <Text style={styles.label}>Membership Plan</Text>
            <View style={styles.planList}>
              {plans.map((p) => (
                <Pressable accessibilityRole="button"
                  key={p.id}
                  onPress={() => setPlanId(p.id)}
                  style={[styles.plan, planId === p.id && styles.selected]}
                >
                  <Text style={styles.bold}>{p.name}</Text>
                  <Text style={styles.muted}>
                    {formatCurrency(p.price_cents, p.currency)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="₹0"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methods}>
              {["cash", "upi", "card", "other"].map((x) => (
                <Pressable accessibilityRole="button"
                  key={x}
                  onPress={() => setMethod(x)}
                  style={[styles.method, method === x && styles.selected]}
                >
                  <Ionicons
                    name={
                      x === "cash"
                        ? "wallet-outline"
                        : x === "card"
                          ? "card-outline"
                          : "phone-portrait-outline"
                    }
                    size={19}
                    color={colors.ink}
                  />
                  <Text style={styles.muted}>{x.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <NoticeBanner message={notice} />
            <NoticeBanner
              message={save.error ? getApiErrorMessage(save.error) : null}
              tone="error"
            />
            <PrimaryButton
              title="Record Payment"
              icon="checkmark-circle"
              loading={save.isPending}
              onPress={() => save.mutate()}
            />
          </View>
          <Quick s={styles} />
        </View>
      </View>
    </Screen>
  ));
    }
  }
}

export function MetricView({ model }: { model: ReturnType<typeof useMetricPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, label, s, selected, color, icon, value } = model.props;
      return ((
  <Pressable accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={onPress ? `View ${label} related gyms` : undefined} onPress={onPress} style={({ pressed }) => [s.metric, selected && s.metricSelected, onPress && pressed && s.metricPressed]}>
    <View style={[s.metricIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View>
      <Text style={s.muted}>{label}</Text>
      <Text style={s.metricValue}>{value}</Text>
    </View>
  </Pressable>
));
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
          <Pressable accessibilityRole="button" onPress={() => setSearch("")} accessibilityLabel={"Clear search"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
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
  const { colors } = useAppTheme();
  const { data } = model.props;
  return <ScrollView style={{ maxHeight: 460 }} nestedScrollEnabled showsVerticalScrollIndicator>
    {data.map(payment => <View key={payment.id} style={{ paddingVertical: 18, gap: 8, borderBottomWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><Text style={{ flex: 1, fontSize: 17, fontWeight: "600", color: colors.ink }}>{payment.member_name ?? "Member"}</Text><Text style={{ fontSize: 17, fontWeight: "600", color: colors.ink }}>{formatCurrency(payment.amount_cents, payment.currency)}</Text></View>
      <Text style={{ fontSize: 14, color: colors.muted }}>{payment.membership_plan_name ?? "—"}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><Text style={{ color: payment.status === "paid" ? colors.success : colors.warning }}>{payment.status}</Text><Text style={{ color: colors.muted }}>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "—"}</Text></View>
    </View>)}
  </ScrollView>;
}

export function PlatformPaymentsDashboardView({ model }: { model: ReturnType<typeof usePlatformPaymentsDashboardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, loading, error, Metric, totalRevenue, setSelectedMetric, selectedMetric, totalDues, gyms, members, applicationRevenue, subscribedGyms, trialGyms, subscriptionRevenue, relatedMetricTitle, relatedGymRows, gymRows, maxRevenue, expiryMembers, developerGyms , activeGymCount } = model.props;
      return (<Screen scroll contentContainerStyle={styles.screen}>
    <View style={styles.header}><View><Text style={styles.title}>Platform Payments</Text><Text style={styles.sub}>Revenue, outstanding dues, and subscriptions across every gym.</Text></View><View style={styles.platformPill}><Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} /><Text style={styles.platformPillText}>All gyms</Text></View></View>
    {loading ? <ActivityIndicator color={colors.primary} /> : null}
    {error ? <Text style={styles.errorText}>{getApiErrorMessage(error)}</Text> : null}
    <View style={styles.metrics}><Metric s={styles} icon="cash" color="#16A34A" label="Gym Member Revenue" value={formatCurrency(totalRevenue, "INR")} onPress={() => setSelectedMetric("revenue")} selected={selectedMetric === "revenue"} /><Metric s={styles} icon="time" color="#F97316" label="Pending Dues" value={formatCurrency(totalDues, "INR")} onPress={() => setSelectedMetric("dues")} selected={selectedMetric === "dues"} /><Metric s={styles} icon="business" color="#2563EB" label="Active Gyms" value={String(activeGymCount)} onPress={() => setSelectedMetric("active")} selected={selectedMetric === "active"} /><Metric s={styles} icon="people" color="#0066CC" label="Total Members" value={String(members.length)} onPress={() => setSelectedMetric("members")} selected={selectedMetric === "members"} /></View>
    <View style={styles.metrics}><Metric s={styles} icon="card" color="#22C55E" label="Application Earnings" value={formatCurrency(applicationRevenue, "INR")} onPress={() => setSelectedMetric("application")} selected={selectedMetric === "application"} /><Metric s={styles} icon="ribbon" color="#007AFF" label="Subscribed Gyms" value={String(subscribedGyms.length)} onPress={() => setSelectedMetric("subscribed")} selected={selectedMetric === "subscribed"} /><Metric s={styles} icon="hourglass" color="#F97316" label="Free-trial Gyms" value={String(trialGyms.length)} onPress={() => setSelectedMetric("trial")} selected={selectedMetric === "trial"} /><Metric s={styles} icon="trending-up" color="#38BDF8" label="Subscription Value" value={formatCurrency(subscriptionRevenue, "INR")} onPress={() => setSelectedMetric("subscription-value")} selected={selectedMetric === "subscription-value"} /></View>
    {selectedMetric ? <View style={styles.panel}><View style={styles.relatedHeader}><View><Text style={styles.panelTitle}>{relatedMetricTitle}</Text><Text style={styles.panelSubtitle}>{relatedGymRows.length} related gym{relatedGymRows.length === 1 ? "" : "s"}</Text></View><Pressable accessibilityRole="button" onPress={() => setSelectedMetric(null)} accessibilityLabel={"Close payment details"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="close-circle-outline" size={22} color={colors.muted} /></Pressable></View>{relatedGymRows.map((item: any) => { const row = "gym" in item ? item : null; const gym = row?.gym ?? item; const subscription = gym.subscription; const revenue = row?.revenue ?? 0; const dues = row?.dues ?? 0; const membersCount = row?.members ?? gym.member_count ?? 0; const metricValue = selectedMetric === "revenue" ? formatCurrency(revenue, "INR") : selectedMetric === "dues" ? formatCurrency(dues, "INR") : selectedMetric === "application" || selectedMetric === "subscription-value" ? formatCurrency(subscription?.amount_cents ?? 0, subscription?.currency ?? "INR") : String(membersCount); const metricLabel = selectedMetric === "revenue" ? "member revenue" : selectedMetric === "dues" ? "pending dues" : selectedMetric === "application" || selectedMetric === "subscription-value" ? subscription?.plan_name ?? "subscription" : `${membersCount} members`; return <View key={`related-${gym.id}`} style={styles.relatedGymRow}><View style={styles.relatedGymCopy}><Text style={styles.cellText}>{gym.name}</Text><Text style={styles.cellMeta}>{subscription?.status ?? gym.status} Â· {gym.owner_email ?? "Platform gym"}</Text></View><View style={styles.relatedGymValue}><Text style={styles.moneyText}>{metricValue}</Text><Text style={styles.cellMeta}>{metricLabel}</Text></View></View>; })}{!relatedGymRows.length ? <Text style={styles.emptyText}>No gyms match this metric yet.</Text> : null}</View> : null}
    <View style={styles.panel}><Text style={styles.panelTitle}>Gym-wise revenue & dues</Text><Text style={styles.panelSubtitle}>Paid collections and outstanding payment records</Text><View style={styles.platformTableHeader}><Text style={styles.platformHeaderText}>Gym</Text><Text style={styles.platformHeaderText}>Revenue</Text><Text style={styles.platformHeaderText}>Dues</Text></View>{gymRows.map((row) => <View key={row.gym.id} style={styles.platformRow}><View style={styles.gymCell}><View style={styles.gymStatusDot} /><View><Text style={styles.cellText}>{row.gym.name}</Text><Text style={styles.cellMeta}>{row.members} members</Text></View></View><View style={styles.moneyCell}><View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.max(row.revenue ? 4 : 0, row.revenue / maxRevenue * 100)}%`, backgroundColor: colors.success }]} /></View><Text style={styles.moneyText}>{formatCurrency(row.revenue, "INR")}</Text></View><Text style={[styles.moneyText, { color: row.dues ? colors.warning : colors.textMuted }]}>{formatCurrency(row.dues, "INR")}</Text></View>)}{!gymRows.length ? <Text style={styles.emptyText}>No gym billing records available.</Text> : null}</View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Upcoming expiries</Text><Text style={styles.panelSubtitle}>Members with the nearest membership end dates</Text>{expiryMembers.map((member) => { const date = new Date(`${member.membership_ends_at}T00:00:00`); const days = Math.ceil((date.getTime() - Date.now()) / 86400000); return <View key={member.id} style={styles.expiryRow}><View><Text style={styles.cellText}>{member.member_name ?? `${member.first_name} ${member.last_name}`}</Text><Text style={styles.cellMeta}>{member.gym_name ?? "Gym"} · {member.membership_plan_name ?? "Membership plan"}</Text></View><View style={styles.expiryValue}><Text style={styles.expiryDate}>{date.toLocaleDateString("en-IN")}</Text><Text style={[styles.cellMeta, { color: days <= 7 ? colors.danger : colors.warning }]}>{days < 0 ? "Expired" : `${days} days left`}</Text></View></View>})}{!expiryMembers.length ? <Text style={styles.emptyText}>No membership expiry dates are available.</Text> : null}</View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Gym subscriptions & application earnings</Text><Text style={styles.panelSubtitle}>Platform subscription status and the amount collected by the application</Text><View style={styles.platformTableHeader}><Text style={styles.subscriptionGymHeader}>Gym</Text><Text style={styles.subscriptionPlanHeader}>Plan</Text><Text style={styles.subscriptionStatusHeader}>Status</Text><Text style={styles.subscriptionAmountHeader}>Earned</Text></View>{developerGyms.map((gym) => { const subscription = gym.subscription; return <View key={`subscription-${gym.id}`} style={styles.platformRow}><View style={styles.subscriptionGym}><Text style={styles.cellText}>{gym.name}</Text><Text style={styles.cellMeta}>{gym.owner_email ?? "No owner email"}</Text></View><Text style={styles.subscriptionPlan}>{subscription?.plan_name ?? "No subscription"}</Text><Text style={[styles.subscriptionStatus, { color: subscription?.status === "active" ? colors.success : subscription?.status === "trialing" ? colors.warning : colors.textMuted }]}>{subscription?.status ?? "not started"}</Text><Text style={styles.moneyText}>{subscription ? formatCurrency(subscription.amount_cents, subscription.currency) : formatCurrency(0, "INR")}</Text></View>; })}{!developerGyms.length ? <Text style={styles.emptyText}>No gym subscription records available.</Text> : null}</View>
  </Screen>);
    }
  }
}

export function ChartView({ model }: { model: ReturnType<typeof useChartPresentation> }): React.ReactNode {
  const { colors } = useAppTheme();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { s, compact, max, values, monthLabels } = model.props;
      if (!values.some(value => value > 0)) return <View style={s.panel}><Text style={s.panelTitle}>Payment Overview</Text><View style={{ minHeight: 140, alignItems: "center", justifyContent: "center" }}><Ionicons name="bar-chart-outline" size={28} color={colors.muted} /><Text style={[s.muted, { marginTop: 12 }]}>No paid transactions in this period.</Text></View></View>;
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
                stroke="rgba(148,163,184,0.16)"
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
          {values.map((value, index) => {
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
                  stroke="rgba(148,163,184,0.12)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <Line
                  key={`bar-${index}`}
                  x1="88"
                  y1={rowY}
                  x2={88 + barWidth}
                  y2={rowY}
                  stroke="#0A84FF"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <SvgText
                  key={`amount-${index}`}
                  x={Math.min(392, 98 + barWidth)}
                  y={rowY + 4}
                  fill="#64D2FF"
                  fontSize="11"
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
        {!visibleTransactions.length && <Text style={s.muted}>Your recent transactions will appear here.</Text>}
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
              <Ionicons name={i as any} size={22} color="#0A84FF" />
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
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowPaidRecords(false)} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={25} color="#94A3B8" />
              </Pressable>
            </View>
            <ScrollView style={s.recordsList}>
              {paidRecords.map((payment) => (
                <View key={payment.id} style={s.recordCard}>
                  <View style={s.recordAvatar}>
                    <Ionicons name="person" size={20} color="#0A84FF" />
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
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowReminders(false)} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={25} color="#94A3B8" />
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
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setShowReceiptMembers(false)} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={25} color="#94A3B8" />
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
                    <Ionicons name="receipt" size={20} color="#0A84FF" />
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
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="close" size={26} color="#94A3B8" />
            </Pressable>
          </View>
          <View style={s.receiptColumns}>
            <View style={s.receiptSidebar}>
              <View style={s.receiptMember}>
                <View style={s.recordAvatar}>
                  <Ionicons name="person" size={22} color="#0A84FF" />
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
