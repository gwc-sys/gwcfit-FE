import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type GymOption = {
  id: string;
  name: string;
};

type GymSelectFieldProps = {
  label?: string;
  value?: string | null;
  loading?: boolean;
  error?: string | null;
  options?: GymOption[];
  helperText?: string | null;
  onSelect?: (value: string) => void;
};

export function GymSelectField({ label = "Gym", value, loading = false, error, options = [], helperText, onSelect }: GymSelectFieldProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width, height, insets.top, insets.bottom), [colors, height, insets.bottom, insets.top, width]);
  const [visible, setVisible] = useState(false);
  const safeOptions = useMemo(() => options.filter((option) => option?.name?.trim()), [options]);
  const selectedOption = safeOptions.find((option) => option.id === value || option.name === value);
  const displayValue = selectedOption?.name ?? (value?.trim() ? value : "Select a gym");

  const handleSelect = (option: GymOption) => {
    onSelect?.(option.name);
    setVisible(false);
  };

  return (
    <View style={styles.wrap}>
      <Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.selector}>
        <View style={styles.selectorContent}>
          <View style={styles.selectorIconWrap}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.selectorTextWrap}>
            <Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={styles.selectorValue}>
              {loading ? "Loading gym..." : displayValue}
            </Text>
            {helperText ? (
              <Text maxFontSizeMultiplier={1.15} numberOfLines={2} style={styles.helperText}>
                {helperText}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-down-outline" size={18} color={colors.muted} />
        </View>
      </Pressable>
      {error ? (
        <Text maxFontSizeMultiplier={1.15} style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Close gym selector"
            accessibilityRole="button"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Text maxFontSizeMultiplier={1.15} style={styles.modalTitle}>Select gym</Text>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text maxFontSizeMultiplier={1.15} style={styles.emptyText}>Loading gyms...</Text>
              </View>
            ) : safeOptions.length === 0 ? (
              <Text maxFontSizeMultiplier={1.15} style={styles.emptyText}>No gym options are available yet.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false}>
                {safeOptions.map((option) => {
                  const selected = option.id === value || option.name === displayValue;
                  return (
                    <Pressable accessibilityRole="button" key={option.id} onPress={() => handleSelect(option)} style={[styles.optionRow, selected && styles.optionRowSelected]}>
                      <Ionicons name="business-outline" size={18} color={selected ? colors.white : colors.primary} />
                      <Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {option.name}
                      </Text>
                      {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.white} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ThemeColors, width: number, height: number, topInset: number, bottomInset: number) => {
  const centered = Platform.OS === "web" || width >= 768;
  const maxModalHeight = Math.max(240, height - topInset - bottomInset - 64);

  return StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    ...typography.small,
    color: colors.ink,
    fontWeight: "700"
  },
  selector: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  selectorIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  selectorTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  selectorValue: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "700"
  },
  helperText: {
    ...typography.small,
    color: colors.muted
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: centered ? "center" : "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    paddingHorizontal: centered ? spacing.lg : spacing.md,
    paddingTop: Math.max(spacing.lg, topInset + spacing.sm),
    paddingBottom: centered ? spacing.lg : Math.max(spacing.md, bottomInset + spacing.sm)
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: centered ? Math.min(maxModalHeight, 480) : maxModalHeight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  loadingRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  modalTitle: {
    ...typography.h3,
    color: colors.ink
  },
  optionList: {
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  optionText: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "700",
    flex: 1,
    minWidth: 0
  },
  optionTextSelected: {
    color: colors.white
  },
  emptyText: {
    ...typography.small,
    color: colors.muted
  }
  });
};
