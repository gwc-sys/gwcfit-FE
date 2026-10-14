import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 112
  },
  hero: {
    minHeight: 138,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  avatarText: {
    ...typography.h2,
    color: colors.primaryDark
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  name: {
    ...typography.h1,
    color: colors.ink
  },
  meta: {
    ...typography.body,
    color: colors.muted
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  detailList: {
    gap: spacing.sm
  },
  formPanel: {
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  formTitle: {
    ...typography.h3,
    color: colors.ink
  },
  inputRow: {
    gap: spacing.md
  }
  });
