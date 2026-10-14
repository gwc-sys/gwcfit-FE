import { StyleSheet } from "react-native";
import { colors, controlMetrics, radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (c: ThemeColors) => StyleSheet.create({
  background: { flex: 1, backgroundColor: c.background },
  overlay: { flexGrow: 1, justifyContent: "space-between", gap: spacing.xxl },
  overlayCompact: {},
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  skip: { minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, paddingHorizontal: spacing.lg, justifyContent: "center", borderRadius: radius.pill, backgroundColor: c.surface },
  skipText: { ...typography.body, fontWeight: "500", color: c.primary },
  heroImageFrame: { borderRadius: radius.container, overflow: "hidden", backgroundColor: c.primarySoft, width: "100%", maxWidth: 520, alignSelf: "center" },
  heroImage: { width: "100%", aspectRatio: 1.1 },
  content: { gap: spacing.lg, width: "100%", maxWidth: 560, alignSelf: "center" },
  contentCompact: {},
  heroCard: {},
  title: { ...typography.title, color: c.ink, letterSpacing: -0.7, textAlign: "center" },
  titleCompact: {},
  body: { ...typography.body, color: c.muted, textAlign: "center" },
  bodyCompact: {},
  dots: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: c.surfaceStrong },
  activeDot: { width: 26, backgroundColor: c.primary },
  signIn: { minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", paddingVertical: spacing.sm },
  signInText: { ...typography.body, color: c.primary, textAlign: "center" },
  pressed: { opacity: 0.65 }
});
// Preserve the style export expected by the existing shared presentation model.
export const styles = createStyles(colors);
