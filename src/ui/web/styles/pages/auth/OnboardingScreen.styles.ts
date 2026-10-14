import { StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../../../theme/theme";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.dark
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  overlayCompact: {
    paddingHorizontal: spacing.md
  },
  skip: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  skipText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "800"
  },
  content: {
    gap: spacing.lg
  },
  heroCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)"
  },
  contentCompact: {
    gap: spacing.md
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: "center"
  },
  titleCompact: {
    fontSize: 32,
    lineHeight: 38
  },
  body: {
    ...typography.body,
    color: "rgba(255,255,255,0.74)",
    textAlign: "center"
  },
  bodyCompact: {
    fontSize: 15,
    lineHeight: 22
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: spacing.sm
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.32)"
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.primary
  },
  signIn: {
    alignItems: "center",
    paddingVertical: spacing.sm
  },
  signInText: {
    ...typography.body,
    color: "rgba(255,255,255,0.78)"
  }
});
