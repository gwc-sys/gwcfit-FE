import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { controlMetrics, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type FormTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  required?: boolean;
};

export function FormTextField({
  label,
  error,
  helper,
  leftIcon,
  right,
  required,
  multiline,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: FormTextFieldProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const compact = width < 390;
  const inputHeight = compact ? 54 : 56;
  const inputPadding = compact ? 14 : 16;
  const inputFontSize = 17;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
        </Text>
        {required ? (
          <Text  numberOfLines={1} style={styles.required}>
            Required
          </Text>
        ) : null}
      </View>
      <View style={[styles.inputWrap, { minHeight: inputHeight, paddingHorizontal: inputPadding }, focused && { borderColor: colors.primary, borderWidth: controlMetrics.focusBorderWidth }, multiline && styles.multilineWrap, error && styles.inputError]}>
        {leftIcon ? <Ionicons name={leftIcon} size={20} color={colors.muted} /> : null}
        <TextInput
          multiline={multiline}
          placeholderTextColor={colors.subtle}
          selectionColor={colors.primary}
          style={[styles.input, { fontSize: inputFontSize }, multiline && styles.multilineInput, style]}
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? `${label}${required ? ", required" : ""}${error ? ", invalid entry" : ""}`}
          accessibilityHint={inputProps.accessibilityHint ?? error ?? helper}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        />
        {right}
      </View>
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    gap: spacing.sm
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  label: {
    flex: 1,
    ...typography.small,
    color: colors.ink
  },
  required: {
    ...typography.small,
    color: colors.muted
  },
  inputWrap: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md
  },
  multilineWrap: {
    minHeight: 108,
    alignItems: "flex-start",
    paddingTop: spacing.md
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    includeFontPadding: false,
    paddingVertical: spacing.sm,
    color: colors.ink,
    ...typography.body
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 0,
    textAlignVertical: "top"
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: controlMetrics.focusBorderWidth,
    backgroundColor: colors.dangerSoft
  },
  helper: {
    ...typography.small,
    color: colors.muted
  },
  error: {
    ...typography.small,
    color: colors.danger
  }
  });
