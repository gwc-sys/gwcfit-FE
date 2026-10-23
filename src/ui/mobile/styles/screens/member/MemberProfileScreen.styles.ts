import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
  hero: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 0
  },
  avatar: {
    width: 64,
    height: 64,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  avatarText: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.primary
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: colors.ink
  },
  meta: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  detailList: { backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", paddingHorizontal: 16 },
  detailRow: { minHeight: 48, paddingVertical: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: 16, rowGap: 5 },
  detailStackedValue: { flex: 0, textAlign: "left" },
  detailRowStacked: { flexDirection: "column", alignItems: "stretch", gap: 6 },
  detailInput: { color: colors.ink, fontSize: 16, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surfaceMuted, borderRadius: 9, borderWidth: 0.5, borderColor: colors.border },
  detailLabel: { fontSize: 14, lineHeight: 20, color: colors.muted },
  detailValue: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 21, textAlign: "right", color: colors.ink },
  groupLabel: { fontSize: 13, lineHeight: 19, fontWeight: "600", color: colors.muted, paddingHorizontal: 4 },
  formPanel: {
    gap: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16
  },
  formTitle: {
    ...typography.h3,
    color: colors.ink
  },
  inputRow: {
    gap: spacing.md
  }
  }));
