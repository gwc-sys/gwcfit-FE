import { StyleSheet } from "react-native";
import { palette, radii, spacing, type } from "../../theme/theme";

export const styles = StyleSheet.create({
  heroCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.text,
    gap: spacing.md
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.green
  },
  heroTitle: {
    color: palette.white,
    fontSize: type.h2,
    fontWeight: "900"
  },
  heroBody: {
    color: "#C9CED7",
    fontSize: type.body,
    lineHeight: 25
  },
  label: {
    color: palette.text,
    fontSize: type.h3,
    fontWeight: "900",
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  choice: {
    minHeight: 56,
    borderWidth: 1.2,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: palette.white
  },
  choiceActive: {
    borderColor: palette.green,
    backgroundColor: palette.greenSoft
  },
  choiceText: {
    color: palette.muted,
    fontSize: type.body,
    fontWeight: "800"
  },
  choiceTextActive: {
    color: palette.text
  },
  dualRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  numberCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: radii.md,
    borderWidth: 1.2,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    gap: 4
  },
  numberCardActive: {
    borderColor: palette.green,
    backgroundColor: palette.greenSoft
  },
  number: {
    color: palette.text,
    fontSize: type.h2,
    fontWeight: "900"
  },
  numberActive: {
    color: palette.green
  },
  numberLabel: {
    color: palette.muted,
    fontWeight: "800"
  },
  equipment: {
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 1.2,
    borderColor: palette.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cta: {
    marginTop: spacing.xl
  }
});
