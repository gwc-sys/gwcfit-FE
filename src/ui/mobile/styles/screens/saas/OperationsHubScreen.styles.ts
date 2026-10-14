import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { spacing } from "../../../theme/theme";

export const styles = adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
}));
