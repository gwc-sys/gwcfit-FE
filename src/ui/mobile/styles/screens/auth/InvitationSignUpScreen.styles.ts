import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { radius, spacing, typography } from "../../../theme/theme";
import type { ThemeColors } from "../../../theme/theme";

export const createStyles = (colors: ThemeColors) => adaptPageStyles(StyleSheet.create({
  container: { width: "100%", maxWidth: 480, alignSelf: "center", gap: 24, paddingVertical: 0 },
  card: { gap: 20, padding: 20, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surface },
  headingRow: { gap: 16, alignItems: "flex-start" },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  headingCopy: { width: "100%", gap: 8 },
  title: { fontSize: 24, lineHeight: 30, letterSpacing: -0.5, fontWeight: "700", color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.muted },
  form: { gap: spacing.md },
  assignment: { gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  assignmentLabel: { ...typography.small, fontWeight: "800", color: colors.muted },
  assignmentValue: { ...typography.h3, color: colors.ink },
  expiry: { ...typography.small, color: colors.muted },
  signInButton: { minHeight: 44, justifyContent: "center" },
  signIn: { fontSize: 16, lineHeight: 24, textAlign: "center", color: colors.muted },
  signInLink: { color: colors.primary, fontWeight: "600" }
}));
