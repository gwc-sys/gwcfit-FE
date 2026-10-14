import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type Bar = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: Bar[];
  activeIndex?: number;
};

export function BarChart({ data, activeIndex = 2 }: BarChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.chart}>
      {data.map((item, index) => {
        const height = Math.max(32, (item.value / max) * 118);
        const active = index === activeIndex;

        return (
          <View key={item.label} style={styles.barWrap}>
            <View
              style={[
                styles.bar,
                { height },
                active && styles.activeBar
              ]}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  chart: {
    minHeight: 170,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm
  },
  bar: {
    width: "82%",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong
  },
  activeBar: {
    backgroundColor: colors.primary
  },
  label: {
    ...typography.small,
    color: colors.muted
  },
  activeLabel: {
    color: colors.primary
  }
  });
