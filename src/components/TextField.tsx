import type { ReactNode } from "react";
import { useState } from "react";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { useAppTheme } from "../theme/AppThemeProvider";
import { getResponsiveFontSize, radius, spacing, typography } from "../theme/theme";

type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  left?: ReactNode;
  right?: ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  textContentType?: "emailAddress" | "password" | "name" | "telephoneNumber";
  helperText?: string;
  error?: string;
};

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  left,
  right,
  autoCapitalize = "none",
  autoCorrect = false,
  returnKeyType = "done",
  textContentType,
  helperText,
  error
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const compact = width < 390;
  const inputHeight = compact ? 56 : 60;
  const inputPadding = compact ? 14 : 18;
  const inputFontSize = getResponsiveFontSize(width, 16, 15, 17);

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: colors.ink }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            minHeight: inputHeight,
            paddingHorizontal: inputPadding,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border
          }
        ]}
      >
        {left}
        <TextInput
          accessibilityLabel={label ?? placeholder}
          accessibilityHint={error ?? helperText}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { fontSize: inputFontSize, color: colors.ink }]}
          textContentType={textContentType}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          keyboardType={keyboardType}
        />
        {right}
      </View>
      {error || helperText ? (
        <Text accessibilityRole={error ? "alert" : undefined} accessibilityLiveRegion="polite" style={[styles.helper, { color: error ? colors.danger : colors.textSecondary }]}>
          {error ?? helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm
  },
  label: {
    ...typography.body,
    fontWeight: "700"
  },
  inputWrap: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    flex: 1,
    minWidth: 0,
    includeFontPadding: false,
    paddingVertical: 0,
    fontWeight: "500"
  },
  helper: {
    ...typography.small,
    marginTop: -spacing.xs
  }
});
