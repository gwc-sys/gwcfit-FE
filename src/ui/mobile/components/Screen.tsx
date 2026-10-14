import type { ReactElement, ReactNode } from "react";
import { createContext, useContext } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, RefreshControlProps, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { breakpoints, getResponsiveBottomInset, getResponsiveScreenPadding, getResponsiveSpacing, resolveContentMaxWidth, spacing } from "../theme/theme";
import type { ScreenContentWidth } from "../theme/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  keyboard?: boolean;
  maxWidth?: ScreenContentWidth;
};

// A workspace supplies the outer safe area; each feature keeps its own scroll
// view and refresh/keyboard behavior instead of nesting inside another scroller.
export const EmbeddedScreenContext = createContext(false);

export function Screen({
  children,
  scroll,
  noPadding,
  dark,
  style,
  contentContainerStyle,
  refreshControl,
  keyboard = false,
  maxWidth = "dashboard"
}: ScreenProps) {
  const { colors } = useAppTheme();
  const embedded = useContext(EmbeddedScreenContext);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const backgroundColor = dark ? colors.dark : colors.background;
  const horizontalPadding = getResponsiveScreenPadding(width);
  const bottomPadding = getResponsiveBottomInset(width, insets.bottom);
  const resolvedMaxWidth = resolveContentMaxWidth(width, maxWidth);
  const topPadding = width < breakpoints.tablet ? getResponsiveSpacing(width, spacing.md) : getResponsiveSpacing(width, spacing.lg);
  const bodyStyle = [
    styles.body,
    noPadding && styles.noPadding,
    contentContainerStyle,
    !noPadding && {
      alignSelf: "center" as const,
      maxWidth: resolvedMaxWidth,
      paddingHorizontal: horizontalPadding,
      paddingTop: topPadding,
      paddingBottom: bottomPadding,
      width: "100%" as const
    }
  ];

  const content = scroll ? (
    <ScrollView
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios" && !keyboard}
      contentContainerStyle={bodyStyle}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={bodyStyle}>{children}</View>
  );

  return (
    <SafeAreaView edges={embedded ? [] : ["top", "right", "bottom", "left"]} style={[styles.safe, { backgroundColor }, style]}>
      {keyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" && !embedded ? insets.top : 0}
          style={styles.safe}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl
  },
  noPadding: {
    paddingHorizontal: 0,
    paddingBottom: 0
  }
});
