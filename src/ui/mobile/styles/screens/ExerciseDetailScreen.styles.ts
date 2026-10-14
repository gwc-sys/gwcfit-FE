import { adaptPageStyles } from "../adaptPageStyles";
import { StyleSheet } from "react-native";
import { palette, radii, spacing, type } from "../../theme/theme";

export const styles = adaptPageStyles(StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white
  },
  hero: {
    height: 360,
    backgroundColor: palette.dark
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    justifyContent: "space-between"
  },
  heroCopy: {
    paddingBottom: 36,
    gap: spacing.sm
  },
  kicker: {
      color: palette.green,
      fontSize: type.body,
      fontWeight: "700"
    },
  title: {
      color: palette.white,
      fontSize: 40,
      fontWeight: "700"
    },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  meta: {
    color: palette.white,
    fontSize: type.body,
    fontWeight: "800",
    marginRight: 8
  },
  sheet: {
    flex: 1,
    marginTop: -22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: palette.white,
    padding: spacing.lg,
    gap: spacing.lg
  },
  timerCard: {
    borderRadius: radii.lg,
    backgroundColor: palette.subtle,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm
  },
  timerLabel: {
      color: palette.muted,
      fontWeight: "700"
    },
  timer: {
      color: palette.text,
      fontSize: 52,
      fontWeight: "700"
    },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center"
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionTitle: {
      color: palette.text,
      fontSize: type.h2,
      fontWeight: "700"
    },
  description: {
    color: palette.muted,
    fontSize: type.body,
    lineHeight: 25
  },
  steps: {
    gap: spacing.md
  },
  step: {
    flexDirection: "row",
    gap: spacing.md
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4
  },
  stepCopy: {
    flex: 1
  },
  stepTitle: {
      color: palette.text,
      fontSize: type.body,
      fontWeight: "700",
      marginBottom: 4
    },
  stepText: {
    color: palette.muted,
    fontSize: type.body,
    lineHeight: 24
  }
}));
