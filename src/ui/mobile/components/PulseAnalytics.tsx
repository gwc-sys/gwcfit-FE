import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { Payment } from "../../../types/saas";
import { formatCurrency } from "../../../utils/formatters";
import { getApiErrorMessage } from "../../../services/api/client";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { PulseChips, PulseLine, PulseStat, PulseTrend, pulseStyles } from "./PulseReference";
import { DataState } from "./DataState";
import { analyticsRanges, summarizeRevenue, summarizeMembers } from "../data/referenceMetrics";
import type { AnalyticsRange } from "../data/referenceMetrics";
import { useAnalyticsMembers } from "../hooks/useAnalyticsMembers";
import { pulseAccents } from "../theme/referenceTokens";

export function PulseAnalytics({ payments }: { payments: Payment[] }) {
  const [range, setRange] = useState<AnalyticsRange>("30D");
  const { colors } = useAppTheme();
  const { query: membersQuery, permitted } = useAnalyticsMembers();
  const s = pulseStyles(colors);
  const summary = useMemo(() => summarizeRevenue(payments, range), [payments, range]);
  const members = summarizeMembers(membersQuery.data ?? [], summary.start);
  const memberDataReady = permitted && !membersQuery.isLoading && !membersQuery.error;
  const hasRevenue = summary.values.some(value => value !== 0);
  const max = Math.max(...summary.values, 100);
  let cumulative = 0;
  const line = summary.values.map(value => cumulative += value);
  const now = new Date();
  const dateLabel = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return <View style={{ gap: 16 }}>
    <PulseChips options={analyticsRanges} value={range} onChange={setRange} segmented />
    <View style={s.card}><Text style={s.meta}>Total Revenue</Text><Text style={s.value}>{formatCurrency(summary.total)}</Text><PulseTrend change={summary.change} /><PulseLine values={line} /></View>
    <DataState loading={permitted && membersQuery.isLoading} error={membersQuery.error ? getApiErrorMessage(membersQuery.error) : null} />
    <View style={s.grid}>
      <PulseStat label="New Members" value={memberDataReady ? String(members.newMembers) : "\u2014"} change={memberDataReady ? members.newMemberChange : null} />
      <PulseStat label="Member Growth" value={memberDataReady && members.growth !== null ? `${members.growth.toLocaleString(undefined, { maximumFractionDigits: 1 })}%` : "\u2014"} />
    </View>
    <View style={s.card}>
      <Text style={[s.name, { fontSize: 17 }]}>Revenue Trend</Text>
      {!hasRevenue ? <View style={{ minHeight: 120, justifyContent: "center", alignItems: "center" }}><Text style={s.meta}>No paid revenue in this period.</Text></View> : <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <View style={{ width: 44, height: 120, justifyContent: "space-between" }}><Text style={[s.meta, { fontSize: 10 }]}>{formatCurrency(max)}</Text><Text style={[s.meta, { fontSize: 10 }]}>{formatCurrency(Math.round(max / 2))}</Text><Text style={[s.meta, { fontSize: 10 }]}>{formatCurrency(0)}</Text></View>
        <View accessibilityRole="image" accessibilityLabel={`Revenue for ${range}: ${summary.values.map(value => formatCurrency(value)).join(", ")}`} style={{ flex: 1, height: 120 }}>
          {[0, 0.5, 1].map(position => <View key={position} style={{ position: "absolute", top: position * 119, left: 0, right: 0, height: 0.5, backgroundColor: colors.borderMuted }} />)}
          <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>{summary.values.map((value, index) => <View key={index} style={{ flex: 1, height: value ? Math.max(3, value / max * 116) : 0, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: pulseAccents.blue }} />)}</View>
        </View>
      </View>
      }
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingLeft: hasRevenue ? 52 : 0 }}><Text style={[s.meta, { fontSize: 10 }]}>{dateLabel(summary.start)}</Text><Text style={[s.meta, { fontSize: 10 }]}>{dateLabel(new Date((summary.start.getTime() + now.getTime()) / 2))}</Text><Text style={[s.meta, { fontSize: 10 }]}>{dateLabel(now)}</Text></View>
    </View>
  </View>;
}
