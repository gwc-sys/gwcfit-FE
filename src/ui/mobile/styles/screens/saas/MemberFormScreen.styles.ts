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
    form: {
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
    },
    groupTitle: {
      ...typography.h3,
      color: colors.ink,
      marginTop: spacing.xs,
    },
  }));
