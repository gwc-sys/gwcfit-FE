import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AccessibilityInfo, findNodeHandle, Modal, StyleSheet, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing } from "../theme/theme";
import { Pressable } from "./NativePressable";

type InteractionDialogProps = {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  children: ReactNode;
};

const spring = { damping: 28, stiffness: 360, mass: 0.8, overshootClamping: true };

export function InteractionDialog({ visible, onClose, accessibilityLabel, children }: InteractionDialogProps) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<any>(null);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!visible) return;
    progress.value = reduceMotion ? 1 : 0;
    if (!reduceMotion) progress.value = withSpring(1, spring);
  }, [progress, reduceMotion, visible]);

  const surfaceStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : progress.value,
    transform: [{ scale: reduceMotion ? 1 : 0.96 + progress.value * 0.04 }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: reduceMotion ? 1 : progress.value }));

  const close = () => {
    if (reduceMotion) {
      onClose();
      return;
    }
    progress.value = withTiming(0, { duration: 140 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const focusDialog = () => {
    const node = findNodeHandle(surfaceRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} onShow={focusDialog} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Close ${accessibilityLabel}`} onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View
          ref={surfaceRef}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal
          style={[styles.surface, { backgroundColor: colors.background, borderColor: colors.border }, surfaceStyle]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  scrim: { ...(StyleSheet as any).absoluteFillObject, backgroundColor: "rgba(0,0,0,0.48)" },
  surface: { width: "100%", maxWidth: 520, maxHeight: "86%", borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
});
