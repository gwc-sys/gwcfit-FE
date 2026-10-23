import { Text, View } from "react-native";
import { PrimaryButton } from "../PrimaryButton";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { getApiErrorMessage } from "../../services/api/client";
import { formatDate } from "../../utils/formatters";

export function MemberMembershipDetails({ planName, startDate, endDate, loading, error, onRetry }: {
  planName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  loading?: boolean;
  error?: unknown;
  onRetry: () => void;
}) {
  const { colors } = useAppTheme();
  return <View style={{ gap: 14, padding: 16, borderRadius: 16, backgroundColor: colors.surface }}>
    <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>Your membership</Text>
    {loading ? <Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>Loading membership details...</Text> : error ? <>
      <Text accessibilityRole="alert" style={{ color: colors.danger }}>{getApiErrorMessage(error)}</Text>
      <PrimaryButton title="Retry membership details" variant="secondary" onPress={onRetry} />
    </> : <>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Membership plan</Text>
        <Text selectable style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>{planName?.trim() || "Not assigned"}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {[["Start date", startDate], ["End date", endDate]].map(([label, value]) => <View key={label} style={{ flexGrow: 1, flexBasis: "40%", minWidth: 110, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
          <Text selectable style={{ color: colors.ink, fontSize: 15 }}>{formatDate(value)}</Text>
        </View>)}
      </View>
    </>}
  </View>;
}
