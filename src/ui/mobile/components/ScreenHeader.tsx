import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { getResponsiveFontSize, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  actionLabel?: string;
};

export function ScreenHeader({ title, subtitle, onBack, actionIcon, onAction, actionLabel }: ScreenHeaderProps) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canAutomaticallyGoBack = navigation.getState().type === "stack" && navigation.canGoBack();
  const backHandler = onBack ?? (canAutomaticallyGoBack ? () => navigation.goBack() : undefined);

  return (
    <View style={styles.header}>
      {backHandler ? (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={backHandler} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.title, { fontSize: getResponsiveFontSize(width, 28), lineHeight: getResponsiveFontSize(width, 34) }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      {actionIcon && onAction ? (
        <Pressable accessibilityLabel={actionLabel ?? `${title} action`} accessibilityRole="button" onPress={onAction} style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.65 }]}>
          <Ionicons name={actionIcon} size={20} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: { gap: 8, paddingBottom: 4, flexDirection: "row", alignItems: "center" },
  utilityRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  copy: { minWidth: 0, gap: 6, flex: 1 },
  title: { ...typography.title, fontSize: 28, lineHeight: 34, letterSpacing: -0.8, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.surface },
  actionButton: { marginLeft: "auto", width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.primarySoft }
});
