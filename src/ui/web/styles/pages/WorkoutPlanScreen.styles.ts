import { StyleSheet } from "react-native";
import { palette, radii, spacing, type } from "../../theme/theme";

export const styles = StyleSheet.create({
  summary: {
    color: palette.muted,
    fontSize: type.body,
    lineHeight: 25,
    marginTop: spacing.lg
  },
  weekRow: {
    gap: spacing.md,
    paddingVertical: spacing.xl
  },
  weekChip: {
    minWidth: 118,
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1.2,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  weekActive: {
    backgroundColor: palette.green,
    borderColor: palette.green
  },
  weekText: {
    color: palette.muted,
    fontSize: type.body,
    fontWeight: "800"
  },
  weekTextActive: {
    color: palette.white
  },
  planStats: {
    flexDirection: "row",
    gap: spacing.md
  },
  stat: {
    flex: 1,
    minHeight: 112,
    borderRadius: radii.md,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  statValue: {
    color: palette.text,
    fontSize: type.h2,
    fontWeight: "900"
  },
  statLabel: {
    color: palette.muted,
    fontWeight: "800"
  },
  date: {
    color: palette.muted,
    fontSize: type.h3,
    fontWeight: "800",
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  list: {
    gap: spacing.md
  },
  cta: {
    marginTop: spacing.xl
  }
});
