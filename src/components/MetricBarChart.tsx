import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type Bar = {
  day: string;
  value: number;
};

type MetricBarChartProps = {
  bars: Bar[];
  activeDay?: string;
  height?: number;
};

export function MetricBarChart({ bars, activeDay = "Tue", height = 160 }: MetricBarChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.chart, { height }]}>
      {bars.map((bar) => {
        const active = bar.day === activeDay;
        return (
          <View key={bar.day} style={styles.column}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max(18, bar.value)}%`,
                  backgroundColor: active ? colors.success : colors.surfaceStrong
                }
              ]}
            />
            <Text style={[styles.day, active && styles.activeDay]}>{bar.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 8
  },
  bar: {
    width: 34,
    borderRadius: radius.sm
  },
  day: {
    color: colors.muted,
    ...typography.small,
    fontWeight: "700"
  },
  activeDay: {
    color: colors.success
  }
  });
