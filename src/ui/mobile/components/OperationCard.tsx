import { Pressable } from "./NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { pulseAccents, pulseDarkAccents, pulseLayout } from "../theme/referenceTokens";
import { controlMetrics } from "../theme/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  accent: keyof typeof pulseAccents;
  onPress: () => void;
  hint?: string;
};

export function OperationCard({ icon, title, accent, onPress, hint }: Props) {
  const { colors, isDark } = useAppTheme();
  const tint = (isDark ? pulseDarkAccents : pulseAccents)[accent];
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={hint} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
    <View style={[styles.glow, { backgroundColor: `${tint}${isDark ? "15" : "0A"}` }]}><View style={[styles.icon, { backgroundColor: `${tint}${isDark ? "14" : "0C"}` }]}><Ionicons name={icon} size={36} color={tint} /></View></View>
    <Text style={[styles.label, { color: colors.ink }]}>{title}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: "45%", minWidth: controlMetrics.minimumTouchSize, minHeight: pulseLayout.operationHeight, borderRadius: pulseLayout.radius, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 16 },
  glow: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600", textAlign: "center" },
});
