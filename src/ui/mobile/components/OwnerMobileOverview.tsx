import { Pressable } from "./NativePressable";
import { createContext, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { Member, Payment } from "../../../types/saas";
import { formatCurrency } from "../../../utils/formatters";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { rangeStart, relativeTime, summarizeMembers } from "../data/referenceMetrics";
import { PulseAvatar, PulseStat, pulseStyles } from "./PulseReference";
import { DataState } from "./DataState";

export const OwnerMobileDataContext = createContext<{ members: Member[]; payments: Payment[]; loading: boolean; error: string | null }>({ members: [], payments: [], loading: false, error: null });

type Props = {
  totalMembers: number;
  activeMembers: number;
  revenue: number;
  onMembers: () => void;
  onReports: () => void;
  onMember: (id: string) => void;
};

export function OwnerMobileOverview({ totalMembers, activeMembers, revenue, onMembers, onReports, onMember }: Props) {
  const { colors } = useAppTheme();
  const { members, loading, error } = useContext(OwnerMobileDataContext);
  const s = pulseStyles(colors);
  const now = new Date();
  const summary = summarizeMembers(members, rangeStart("30D", now), now);
  const recent = [...members].sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()).slice(0, 3);
  const value = (count: number) => loading || error ? "\u2014" : String(count);
  return <View style={{ gap: 16 }}>
    <DataState loading={loading} error={error} />
    <View style={s.grid}>
      <PulseStat primary label="Total Members" value={value(totalMembers)} onPress={onMembers} />
      <PulseStat label="Active Members" value={value(activeMembers)} onPress={onMembers} />
      <PulseStat label="Revenue" value={loading || error ? "\u2014" : formatCurrency(revenue)} onPress={onReports} />
      <PulseStat label="New Members" value={value(summary.newMembers)} change={loading || error ? null : summary.newMemberChange} onPress={onMembers} />
      <PulseStat label="Expiring Soon" value={value(summary.expiring)} onPress={onMembers} />
    </View>
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={[s.name, { fontSize: 17 }]}>Recent Activity</Text><Pressable accessibilityRole="button" onPress={onMembers} style={{ minHeight: 44, minWidth: 44, justifyContent: "center" }}><Text style={{ color: colors.primary, fontSize: 13 }}>See All</Text></Pressable></View>
      <View style={[s.card, { paddingVertical: 4 }]}>{recent.map((member, index) => {
        const name = `${member.first_name} ${member.last_name}`;
        const photo = member.extra_data?.profile_photo;
        return <View key={member.id}>{index > 0 && <View style={s.separator} />}<Pressable accessibilityRole="button" accessibilityLabel={`View ${name}`} onPress={() => onMember(member.id)} style={({ pressed }) => [s.row, pressed && { opacity: 0.65 }]}><PulseAvatar name={name} uri={typeof photo === "string" ? photo : undefined} /><View style={s.copy}><Text style={s.name}>New member joined</Text><Text style={s.meta}>{name}</Text><Text style={s.meta}>{relativeTime(member.joined_at)}</Text></View><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable></View>;
      })}{!recent.length && <Text style={[s.meta, { paddingVertical: 16 }]}>{loading ? "Loading activity..." : "No recent activity yet."}</Text>}</View>
    </View>
  </View>;
}
