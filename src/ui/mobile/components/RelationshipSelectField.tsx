import { Pressable } from "./NativePressable";
import { controlMetrics } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

export type RelationshipOption = {
  value: string;
  label: string;
  description?: string | null;
  status?: string | null;
};

type RelationshipSelectFieldProps = {
  label: string;
  value?: string | null;
  options?: RelationshipOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  helperText?: string | null;
  error?: string | null;
  loading?: boolean;
  allowClear?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function RelationshipSelectField({
  label,
  value,
  options = [],
  onChange,
  placeholder = "Select an option",
  helperText,
  error,
  loading = false,
  allowClear = true,
  icon = "link-outline"
}: RelationshipSelectFieldProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width, height, insets.top, insets.bottom), [colors, height, insets.bottom, insets.top, width]);
  const [visible, setVisible] = useState(false);
  const safeOptions = useMemo(
    () => options.filter((option) => option.value.trim() && option.label.trim()),
    [options]
  );
  const selectedOption = safeOptions.find((option) => option.value === value);
  const displayValue = selectedOption?.label ?? (value ? "Selected record" : placeholder);

  const choose = (nextValue: string | null) => {
    onChange(nextValue);
    setVisible(false);
  };

  return (
    <View style={styles.wrap}>
      <Text  numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${displayValue}`} accessibilityState={{ expanded: visible, busy: loading }} onPress={() => setVisible(true)} style={styles.selector}>
        <View style={styles.selectorContent}>
          <View style={styles.selectorIconWrap}>
            <Ionicons name={icon} size={18} color={colors.primary} />
          </View>
          <View style={styles.selectorTextWrap}>
            <Text  numberOfLines={1} style={styles.selectorValue}>
              {loading ? "Loading options..." : displayValue}
            </Text>
            {selectedOption?.description ? (
              <Text  numberOfLines={2} style={styles.helperText}>
                {selectedOption.description}
              </Text>
            ) : null}
            {!selectedOption?.description && helperText ? (
              <Text  numberOfLines={2} style={styles.helperText}>
                {helperText}
              </Text>
            ) : null}
          </View>
          {allowClear && value ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${label}`} onPress={(event) => { event.stopPropagation(); choose(null); }} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
          <Ionicons name="chevron-down-outline" size={18} color={colors.muted} />
        </View>
      </Pressable>
      {error ? (
        <Text  style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Modal animationType="fade" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel={`Close ${label} selector`}
            accessibilityRole="button"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text  numberOfLines={2} style={styles.modalTitle}>
                {label}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Close ${label} selector`} onPress={() => setVisible(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text  style={styles.emptyText}>Loading options...</Text>
              </View>
            ) : safeOptions.length === 0 ? (
              <Text  style={styles.emptyText}>No options are available.</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.optionList}>
                {allowClear ? (
                  <Pressable accessibilityRole="button" accessibilityState={{ selected: !value }} onPress={() => choose(null)} style={[styles.optionRow, !value && styles.optionRowSelected]}>
                    <Ionicons name="remove-circle-outline" size={18} color={!value ? colors.white : colors.primary} />
                    <View style={styles.optionBody}>
                      <Text  numberOfLines={1} style={[styles.optionText, !value && styles.optionTextSelected]}>
                        Not assigned
                      </Text>
                    </View>
                    {!value ? <Ionicons name="checkmark-circle" size={18} color={colors.white} /> : null}
                  </Pressable>
                ) : null}
                {safeOptions.map((option) => {
                  const selected = option.value === value;
                  return (
                    <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => choose(option.value)} style={[styles.optionRow, selected && styles.optionRowSelected]}>
                      <Ionicons name={icon} size={18} color={selected ? colors.white : colors.primary} />
                      <View style={styles.optionBody}>
                        <Text  numberOfLines={1} style={[styles.optionText, selected && styles.optionTextSelected]}>
                          {option.label}
                        </Text>
                        {option.description ? (
                          <Text  numberOfLines={2} style={[styles.optionMeta, selected && styles.optionMetaSelected]}>
                            {option.description}
                          </Text>
                        ) : null}
                      </View>
                      {option.status ? (
                        <Text  numberOfLines={1} style={[styles.statusText, selected && styles.statusTextSelected]}>
                          {option.status}
                        </Text>
                      ) : null}
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
  const maxModalHeight = Math.max(260, height - topInset - bottomInset - 64);

  return StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    ...typography.small,
    color: colors.ink,
    fontWeight: "700"
  },
  selector: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: controlMetrics.minimumTouchSize },
  selectorContent: {
    minHeight: 36,
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
  clearButton: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" },
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
    maxWidth: 420,
    maxHeight: centered ? Math.min(maxModalHeight, 560) : maxModalHeight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  modalTitle: {
    ...typography.h3,
    color: colors.ink,
    flex: 1
  },
  modalClose: { width: controlMetrics.minimumTouchSize, height: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: colors.surface },
  loadingRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  optionList: {
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  optionRow: {
    minHeight: 56,
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
  optionBody: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  optionText: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "700"
  },
  optionTextSelected: {
    color: colors.white
  },
  optionMeta: {
    ...typography.small,
    color: colors.muted
  },
  optionMetaSelected: {
    color: "rgba(255,255,255,0.76)"
  },
  statusText: {
    ...typography.small,
    maxWidth: 92,
    color: colors.muted
  },
  statusTextSelected: {
    color: colors.white
  },
  emptyText: {
    ...typography.small,
    color: colors.muted
  }
  });
};
