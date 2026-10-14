import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  accentColor?: string;
  activeBackgroundColor?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accentColor,
  activeBackgroundColor
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option)}
            style={[
              styles.item,
              active && styles.active,
              active && activeBackgroundColor ? { backgroundColor: activeBackgroundColor } : null
            ]}
          >
            <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.1} numberOfLines={1} style={[styles.label, active && styles.activeLabel, active && accentColor ? { color: accentColor } : null]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: 4
  },
  item: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs
  },
  active: {
    backgroundColor: colors.surface
  },
  label: {
    maxWidth: "100%",
    color: colors.muted,
    ...typography.small,
    fontWeight: "800"
  },
  activeLabel: {
    color: colors.primary
  }
});
