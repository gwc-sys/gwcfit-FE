import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius } from "../theme/theme";

type MetricCardProps = {
  label: string;
  value: string;
  suffix?: string;
  icon: keyof typeof Ionicons.glyphMap;
  footer?: string;
  trend?: string;
  tone?: "primary" | "success" | "info" | "warning" | "danger" | "accent";
};

export function MetricCard({ label, value, suffix, icon, footer, trend, tone = "primary" }: MetricCardProps) {
  const { colors } = useAppTheme();
  const tint = tone === "primary" ? colors.primary : tone === "accent" ? colors.accent : colors[tone];
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.header}><Text style={[styles.label, { color: colors.muted }]}>{label}</Text><View style={[styles.icon, { backgroundColor: colors.primarySoft }]}><Ionicons name={icon} size={19} color={tint} /></View></View>
    <View style={styles.valueRow}><Text style={[styles.value, { color: colors.ink }]}>{value}</Text>{suffix ? <Text style={[styles.suffix, { color: colors.muted }]}>{suffix}</Text> : null}</View>
    {trend ?? footer ? <Text style={[styles.footer, { color: trend ? colors.success : colors.muted }]}>{trend ?? footer}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 180, borderWidth: 1, borderRadius: radius.lg, padding: 24, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  label: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 20 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  valueRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 6 },
  value: { fontSize: 34, fontWeight: "600", letterSpacing: -1 },
  suffix: { fontSize: 14 },
  footer: { fontSize: 12, lineHeight: 19 },
});
