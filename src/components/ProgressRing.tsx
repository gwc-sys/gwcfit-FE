import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useAppTheme } from "../theme/AppThemeProvider";
import { typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type ProgressRingProps = {
  value: number | string;
  label: string;
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

export function ProgressRing({
  value,
  label,
  progress,
  size = 132,
  strokeWidth = 14,
  color
}: ProgressRingProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ringColor = color ?? colors.success;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const inferredValue = typeof value === "number" ? value : Number.parseFloat(value);
  const percent = progress === undefined ? inferredValue : progress * 100;
  const clamped = Math.min(100, Math.max(0, Number.isNaN(percent) ? 0 : percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceStrong}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  value: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  label: {
    color: colors.muted,
    ...typography.small,
    marginTop: 2
  }
  });
