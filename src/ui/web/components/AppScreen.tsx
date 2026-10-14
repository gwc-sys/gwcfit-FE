import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { breakpoints, getResponsiveBottomInset, getResponsiveScreenPadding, getResponsiveSpacing, layout, resolveContentMaxWidth, spacing } from "../theme/theme";
import type { ScreenContentWidth } from "../theme/theme";

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  backgroundColor?: string;
  maxWidth?: ScreenContentWidth;
};

export function AppScreen({
  children,
  scroll = true,
  padded = true,
  keyboard = false,
  backgroundColor,
  maxWidth = "dashboard"
}: AppScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const resolvedBackgroundColor = backgroundColor ?? colors.background;
  const resolvedMaxWidth = resolveContentMaxWidth(width, maxWidth);
  const topPadding = width < breakpoints.tablet ? getResponsiveSpacing(width, spacing.md) : getResponsiveSpacing(width, spacing.lg);
  const contentStyle = padded
    ? [
        styles.content,
        {
          alignSelf: "center" as const,
          maxWidth: resolvedMaxWidth,
          paddingHorizontal: getResponsiveScreenPadding(width),
          paddingTop: topPadding,
          paddingBottom: getResponsiveBottomInset(width, insets.bottom),
          width: "100%" as const
        }
      ]
    : styles.noPadding;
  const body = scroll ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      contentContainerStyle={contentStyle}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: resolvedBackgroundColor }]}>
      {keyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
          style={styles.root}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 120
  },
  noPadding: {
    paddingBottom: 0
  },
  staticContent: {
    flex: 1
  }
});
