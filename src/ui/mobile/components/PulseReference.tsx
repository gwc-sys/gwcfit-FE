import { Pressable } from "./NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import type { ThemeColors } from "../theme/theme";
import { controlMetrics } from "../theme/theme";
import { pulseAccents, pulseEffects, pulseGradients } from "../theme/referenceTokens";
import { initials } from "../../../utils/formatters";

export const pulseStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { gap: 16 },
  heading: { color: c.ink, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.7 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { color: c.ink, fontSize: 14, fontWeight: "600" },
  meta: { color: c.muted, fontSize: 12, lineHeight: 18 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: c.primarySoft },
  initials: { color: c.primary, fontSize: 14, fontWeight: "600" },
  card: { backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: c.borderMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: { flexGrow: 1, flexBasis: "45%", minWidth: 0, alignSelf: "stretch" },
  value: { color: c.ink, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { minHeight: controlMetrics.minimumTouchSize, paddingHorizontal: 14, justifyContent: "center", borderRadius: 12, backgroundColor: c.surfaceMuted },
  selected: { backgroundColor: c.primaryButton },
  chipText: { color: c.textSecondary, fontSize: 12, fontWeight: "500" },
  selectedText: { color: c.white },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: c.borderMuted },
  setting: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  iconButton: { minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: c.surfaceMuted },
  trend: { fontSize: 12, fontWeight: "600", lineHeight: 18 },
});

export function PulseChips<T extends string>({ options, value, onChange, segmented = false }: { options: readonly T[]; value: T; onChange: (value: T) => void; segmented?: boolean }) {
  const { colors } = useAppTheme();
  const s = pulseStyles(colors);
  return <View style={[s.chips, { alignItems: "center", position: "relative" }, segmented && { gap: 0 }]}>
    {segmented && <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 6, bottom: 6, borderRadius: 14, backgroundColor: colors.surfaceMuted }} />}
    {options.map(option => {
      const selected = value === option;
      return <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(option)} style={({ pressed }) => [{ minHeight: controlMetrics.minimumTouchSize, justifyContent: "center", flex: segmented ? 1 : undefined, flexGrow: segmented ? 1 : 0, opacity: pressed ? 0.7 : 1 }]}>
        {selected ? <LinearGradient colors={[pulseAccents.blue, colors.primaryButton]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 32, borderRadius: 10, paddingHorizontal: segmented ? 4 : 14, justifyContent: "center", alignItems: "center" }}><Text style={[s.chipText, s.selectedText]}>{option}</Text></LinearGradient> : <View style={{ minHeight: 32, borderRadius: 10, paddingHorizontal: segmented ? 4 : 14, backgroundColor: segmented ? "transparent" : colors.surfaceMuted, justifyContent: "center", alignItems: "center" }}><Text style={s.chipText}>{option}</Text></View>}
      </Pressable>;
    })}
  </View>;
}

export function PulseTrend({ change, primary = false }: { change: number | null; primary?: boolean }) {
  const { colors } = useAppTheme();
  if (change === null) return null;
  return <View accessible accessibilityLabel={`${change < 0 ? "Down" : "Up"} ${Math.abs(change).toFixed(1)} percent compared with the previous period`} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><Ionicons name={change < 0 ? "arrow-down" : "arrow-up"} size={12} color={primary ? colors.white : change < 0 ? colors.danger : colors.success} /><Text style={[pulseStyles(colors).trend, { color: primary ? colors.white : change < 0 ? colors.danger : colors.success }]}>{Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 1 })}%</Text></View>;
}

export function PulseAvatar({ name, uri, size = 40 }: { name: string; uri?: string | null; size?: number }) {
  const { colors } = useAppTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const s = pulseStyles(colors);
  return <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, overflow: "hidden" }]}>{uri && uri !== failedUri ? <Image accessibilityLabel={name} source={{ uri }} onError={() => setFailedUri(uri)} style={{ width: size, height: size }} /> : <Text style={[s.initials, { fontSize: size * 0.32 }]}>{initials(name)}</Text>}</View>;
}

export function PulseStat({ label, value, primary = false, change, onPress }: { label: string; value: string; primary?: boolean; change?: number | null; onPress?: () => void }) {
  const { colors } = useAppTheme();
  const s = pulseStyles(colors);
  const content = <><View style={{ flex: 1, gap: 6 }}><Text style={[s.meta, primary && { color: colors.white }]}>{label}</Text><View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}><Text style={[s.value, primary && { color: colors.white, fontSize: 32 }]}>{value}</Text>{change !== undefined && <PulseTrend change={change} primary={primary} />}</View></View>{primary && <View style={{ backgroundColor: pulseEffects.heroIcon, padding: 12, borderRadius: 28 }}><Ionicons name="people" size={30} color={colors.white} /></View>}</>;
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? "button" : undefined} onPress={onPress} style={({ pressed }) => [s.stat, primary && { flexBasis: "100%" }, pressed && { opacity: 0.75 }]}>{primary ? <LinearGradient colors={pulseGradients.members} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, { minHeight: 104, flexDirection: "row", alignItems: "center" }]}>{content}</LinearGradient> : <View style={[s.card, { minHeight: 92 }]}>{content}</View>}</Pressable>;
}

export function PulseLine({ values }: { values: number[] }) {
  const { colors } = useAppTheme();
  if (!values.length) return <Text style={{ color: colors.muted }}>No revenue activity yet.</Text>;
  const max = Math.max(...values, 1);
  const path = values.map((value, i) => `${i ? "L" : "M"} ${8 + i * 284 / Math.max(values.length - 1, 1)} ${94 - value / max * 78}`).join(" ");
  return <Svg accessibilityLabel={`Revenue trend. ${values.map(value => value / 100).join(", ")}`} width="100%" height={100} viewBox="0 0 300 100"><Defs><SvgGradient id="pulseRevenueFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={pulseAccents.blue} stopOpacity={0.16} /><Stop offset="1" stopColor={pulseAccents.blue} stopOpacity={0} /></SvgGradient></Defs><Path d={`${path} L 292 100 L 8 100 Z`} fill="url(#pulseRevenueFill)" /><Path d={path} fill="none" stroke={pulseAccents.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
