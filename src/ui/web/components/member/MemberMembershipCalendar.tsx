import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useMemberMembership } from "../../../../hooks/useMember";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { formatDate } from "../../../../utils/formatters";

const dateKey = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

export function MemberMembershipCalendar({ onClose }: { onClose: () => void }) {
  const { colors } = useAppTheme();
  const membership = useMemberMembership();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const today = dateKey(new Date());
  const start = membership.data?.start_date;
  const end = membership.data?.expiry_date;
  const totalDays = start && end ? Math.max(0, Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1) : 0;
  const remainingDays = Math.min(totalDays, Math.max(0, membership.data?.days_remaining ?? 0));
  const completedDays = Math.max(0, totalDays - remainingDays);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (month.getDay() + 6) % 7;
  const cells = Array.from({ length: Math.ceil((leading + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - leading + 1;
    return day >= 1 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
  });
  const statusFor = (key: string) => !start || !end || key < start ? null : key <= end ? key < today ? "completed" : "remaining" : "renewal";
  const status = statusFor(selected);
  const swatches = [
    { label: "Completed", color: colors.warning },
    { label: "Remaining", color: colors.success },
    { label: "Renew plan", color: colors.danger },
  ];
  return <View accessibilityLabel="Membership calendar" style={{ position: "absolute", top: 100, right: 110, width: 370, zIndex: 110, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, boxShadow: "0 16px 48px rgba(0,0,0,0.35)", gap: 16 }}>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View><Text style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>Membership calendar</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{membership.data?.membership_plan_name ?? "No plan assigned"}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close calendar" onPress={onClose}><Ionicons name="close" size={23} color={colors.muted} /></Pressable>
    </View>
    {membership.isLoading ? <Text style={{ color: colors.muted }}>Loading membership dates...</Text> : membership.error ? <Text style={{ color: colors.danger }}>Could not load membership dates.</Text> : <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Ionicons name="chevron-back" size={21} color={colors.ink} /></Pressable>
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Ionicons name="chevron-forward" size={21} color={colors.ink} /></Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <Text key={day} style={{ width: "14.285%", textAlign: "center", color: colors.muted, fontSize: 11 }}>{day}</Text>)}</View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 6 }}>{cells.map((day, index) => {
        if (!day) return <View key={`empty-${index}`} style={{ width: "14.285%", height: 40 }} />;
        const key = dateKey(day);
        const dayStatus = statusFor(key);
        const tone = dayStatus === "completed" ? colors.warning : dayStatus === "remaining" ? colors.success : dayStatus === "renewal" ? colors.danger : colors.muted;
        return <Pressable key={key} accessibilityRole="button" accessibilityLabel={`${day.toLocaleDateString(undefined, { dateStyle: "full" })}${dayStatus ? `, ${dayStatus === "renewal" ? "plan renewal needed" : dayStatus}` : ""}`} accessibilityState={{ selected: key === selected }} onPress={() => setSelected(key)} style={{ width: "14.285%", height: 40, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: key === selected ? 2 : 0, borderColor: tone, backgroundColor: dayStatus ? `${tone}25` : "transparent" }}><Text style={{ color: dayStatus ? tone : colors.ink, fontSize: 13, fontWeight: dayStatus || key === today ? "700" : "400" }}>{day.getDate()}</Text></View>
        </Pressable>;
      })}</View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>{swatches.map(item => <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} /><Text style={{ color: colors.muted, fontSize: 11 }}>{item.label}</Text></View>)}</View>
      {start && end ? <>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: `${colors.warning}20` }}><Text style={{ color: colors.warning, fontSize: 20, fontWeight: "700" }}>{completedDays}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>Days completed</Text></View>
          <View style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: `${colors.success}20` }}><Text style={{ color: colors.success, fontSize: 20, fontWeight: "700" }}>{remainingDays}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>Days remaining</Text></View>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{formatDate(start)} – {formatDate(end)}</Text>
      </> : <Text style={{ color: colors.muted, fontSize: 12 }}>Membership dates are not set yet.</Text>}
      <Text style={{ color: status === "completed" ? colors.warning : status === "remaining" ? colors.success : status === "renewal" ? colors.danger : colors.muted, fontSize: 13, fontWeight: "600" }}>{status === "completed" ? "Membership day completed" : status === "remaining" ? "Membership active" : status === "renewal" ? "Plan ended — renew to continue" : "Outside the membership period"}</Text>
    </>}
  </View>;
}
