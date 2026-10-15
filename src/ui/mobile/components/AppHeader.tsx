import { Pressable } from "./NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { getResponsiveFontSize, radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  light?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  light,
}: AppHeaderProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconColor = light ? colors.white : colors.ink;

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.iconButton, light && styles.lightIconButton]}
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.center}>
        <Text

          style={[styles.title, { fontSize: getResponsiveFontSize(width, typography.h3.fontSize) }, light && styles.lightText]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text

            style={[styles.subtitle, light && styles.lightSub]}
            >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRightPress}
          style={[styles.iconButton, light && styles.lightIconButton]}
         accessibilityLabel={`${title} action`}>
          <Ionicons name={rightIcon} size={24} color={iconColor} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    iconButton: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
    },
    lightIconButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    placeholder: {
      width: 48,
      height: 48,
    },
    center: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
    },
    title: {
      ...typography.h3,
      color: colors.ink,
    },
    subtitle: {
      ...typography.small,
      color: colors.muted,
      marginTop: 2,
    },
    lightText: {
      color: colors.white,
    },
    lightSub: {
      color: "rgba(255,255,255,0.72)",
    },
  });
