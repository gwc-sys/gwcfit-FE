import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  container: { width: "100%", maxWidth: 720, alignSelf: "center", gap: spacing.lg, paddingVertical: spacing.md },
  card: { gap: spacing.lg, padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  headingRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  headingCopy: { flex: 1, gap: spacing.xs },
  title: { ...typography.h2, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  form: { gap: spacing.md },
  assignment: { gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  assignmentLabel: { ...typography.small, fontWeight: "800", color: colors.muted },
  assignmentValue: { ...typography.h3, color: colors.ink },
  expiry: { ...typography.small, color: colors.muted },
  signIn: { ...typography.body, textAlign: "center", color: colors.primary, fontWeight: "700" }
}));
