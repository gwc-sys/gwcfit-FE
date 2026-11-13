import { Text, View } from "react-native";
import { PrimaryButton } from "../PrimaryButton";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { getApiErrorMessage } from "../../services/api/client";
import { formatDate } from "../../utils/formatters";

export function MemberMembershipDetails({ planName, description, dailyVisitLimit, benefits, startDate, endDate, paidAt, loading, error, onRetry }: {
  planName?: string | null;
  description?: string | null;
  dailyVisitLimit?: number | null;
  benefits?: string[];
  startDate?: string | null;
  endDate?: string | null;
  paidAt?: string | null;
  loading?: boolean;
  error?: unknown;
  onRetry: () => void;
}) {
  const { colors } = useAppTheme();
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T00:00:00`) : null;
  const validPeriod = start && end && Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end >= start;
  const totalDays = validPeriod ? Math.round((end.getTime() - start.getTime()) / 86400000) + 1 : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedDays = validPeriod ? Math.min(totalDays, Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000))) : 0;
  const remainingDays = validPeriod ? totalDays - completedDays : 0;
  return <View style={{ gap: 18, padding: 24, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
    <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>Your membership</Text>
    {loading ? <Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>Loading membership details...</Text> : error ? <>
      <Text accessibilityRole="alert" style={{ color: colors.danger }}>{getApiErrorMessage(error)}</Text>
      <PrimaryButton title="Retry membership details" variant="secondary" onPress={onRetry} />
    </> : <>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Membership plan</Text>
        <Text selectable style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>{planName?.trim() || "Not assigned"}</Text>
      </View>
      {description ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{description}</Text> : null}
      {dailyVisitLimit ? <Text style={{ color: colors.ink, fontSize: 14 }}>Up to {dailyVisitLimit} visits per day</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {[["Plan started", startDate], ["Plan ends", endDate], ["Payment received", paidAt]].map(([label, value]) => <View key={label} style={{ flexGrow: 1, flexBasis: "28%", minWidth: 130, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
          <Text selectable style={{ color: colors.ink, fontSize: 15 }}>{formatDate(value)}</Text>
        </View>)}
      </View>
      {validPeriod ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[["Days completed", completedDays], ["Days remaining", remainingDays], ["Plan length", totalDays]].map(([label, value]) => <View key={label} style={{ flexGrow: 1, flexBasis: "28%", minWidth: 130, padding: 14, borderRadius: 12, backgroundColor: colors.surfaceMuted, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
          <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "700" }}>{value}</Text>
        </View>)}
      </View> : <Text style={{ color: colors.muted, fontSize: 13 }}>Membership dates are unavailable. Ask your gym to confirm the activation date.</Text>}
      {benefits?.length ? <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }}>
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>Included features</Text>
        {benefits.map((benefit, index) => <Text key={`${index}-${benefit}`} style={{ color: colors.ink, fontSize: 14 }}>✓ {benefit}</Text>)}
      </View> : null}
    </>}
  </View>;
}
