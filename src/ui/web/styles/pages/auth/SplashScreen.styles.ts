import { StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  mark: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)"
  },
  title: {
    ...typography.title,
    color: colors.ink,
    marginTop: spacing.lg
  },
  subtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.xs,
    textAlign: "center"
  },
  pill: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  pillText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700"
  }
});
