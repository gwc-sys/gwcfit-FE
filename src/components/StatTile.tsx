import type { ReactNode } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "./icons";

import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type StatTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
};

export function StatTile({ icon, label, value, suffix }: StatTileProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.tile}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>
        {value}
        {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
      </Text>
      <View style={styles.divider} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>This week</Text>
        <ChevronRight size={22} color={colors.muted} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 164,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.subtle
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    color: colors.muted,
    ...typography.body,
    fontWeight: "800"
  },
  value: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 24
  },
  suffix: {
    color: colors.muted,
    ...typography.body,
    fontWeight: "700"
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  footerText: {
    color: colors.muted,
    ...typography.body,
    fontWeight: "800"
  }
  });
