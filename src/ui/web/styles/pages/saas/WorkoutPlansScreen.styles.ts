import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: 112 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg },
  title: { ...typography.h1, color: colors.ink }, subtitle: { ...typography.body, color: colors.muted, marginTop: 4 }, createButton: { minHeight: 46, paddingHorizontal: spacing.lg },
  stats: { flexDirection: "row", gap: spacing.md },
  stat: { flex: 1, minWidth: 170, minHeight: 112, flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  statIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 28 }, statLabel: { ...typography.small, color: colors.muted }, statValue: { ...typography.h2, color: colors.ink }, statDetail: { ...typography.small, marginTop: 4 },
  manageHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.md }, kicker: { ...typography.small, color: colors.primary }, manageTitle: { ...typography.h2, color: colors.ink, marginTop: 3 }
});
