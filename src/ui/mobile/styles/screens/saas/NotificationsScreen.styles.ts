import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { spacing, typography } from "../../../theme/theme";

export const styles = adaptPageStyles(StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingTop: spacing.md
  },
  body: { ...typography.body },
  emptyText: { ...typography.body },
  meta: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.sm },
  date: { ...typography.small },
  gym: { ...typography.small, fontWeight: "800" },
}));
