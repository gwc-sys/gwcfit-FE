import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { typography } from "../theme/theme";
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
      {backHandler || (actionIcon && onAction) ? <View style={styles.utilityRow}>
        {backHandler ? (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={backHandler} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
        ) : icon ? (
          <View style={styles.iconButton}>
            <Ionicons name={icon} size={22} color={colors.primary} />
          </View>
        ) : null}
      {actionIcon && onAction ? (
        <Pressable accessibilityLabel={`${title} action`} accessibilityRole="button" onPress={onAction} style={styles.actionButton}>
          <Ionicons name={actionIcon} size={22} color={colors.primary} />
        </Pressable>
      ) : null}
      </View> : null}
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: { gap: 8, paddingBottom: 8 },
  utilityRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  copy: { minWidth: 0, gap: 6 },
  title: { ...typography.title, fontSize: 34, lineHeight: 41, letterSpacing: -0.8, color: colors.ink },
  subtitle: { ...typography.body, color: colors.muted },
  iconButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.surface },
  actionButton: { marginLeft: "auto", width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.primarySoft }
});
