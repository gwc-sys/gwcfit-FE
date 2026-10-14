import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../../theme/theme";

export const styles = StyleSheet.create({
  screen: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 860,
    paddingTop: spacing.md,
    gap: spacing.lg
  },
  copy: {
    ...typography.body,
    color: colors.muted
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  success: {
    ...typography.small,
    color: colors.primaryDark
  }
});
