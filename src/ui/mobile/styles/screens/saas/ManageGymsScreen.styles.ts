import { adaptPageStyles } from "../../adaptPageStyles";
import { StyleSheet } from "react-native";
import { spacing } from "../../../theme/theme";

export const styles = adaptPageStyles(StyleSheet.create({
  screen: {
      gap: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 32
    }
}));
