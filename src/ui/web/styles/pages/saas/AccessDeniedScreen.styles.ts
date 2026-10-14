import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    justifyContent: "center",
    paddingTop: spacing.xl
  },
  card: {
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl
  },
  icon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: "center"
  },
  copy: {
    ...typography.body,
    color: colors.muted,
    textAlign: "center"
  }
  });
