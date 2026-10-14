import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
};

export function ScreenHeader({ title, subtitle, icon, onBack, actionIcon, onAction }: ScreenHeaderProps) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canAutomaticallyGoBack = navigation.getState().type === "stack" && navigation.canGoBack();
  const backHandler = onBack ?? (canAutomaticallyGoBack ? () => navigation.goBack() : undefined);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {backHandler ? (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={backHandler} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
        ) : icon ? (
          <View style={styles.iconButton}>
            <Ionicons name={icon} size={22} color={colors.ink} />
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {actionIcon && onAction ? (
        <Pressable accessibilityLabel={`${title} action`} accessibilityRole="button" onPress={onAction} style={styles.actionButton}>
          <Ionicons name={actionIcon} size={22} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    ...typography.h2,
    color: colors.ink
  },
  subtitle: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primary
  }
  });
