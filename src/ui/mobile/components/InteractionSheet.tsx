import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, spacing } from "../theme/theme";
import { Pressable } from "./NativePressable";

type InteractionSheetProps = {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  maxHeight?: `${number}%` | number;
};

const spring = { damping: 30, stiffness: 320, mass: 0.85, overshootClamping: true };

export function InteractionSheet({ visible, onClose, accessibilityLabel, children, maxHeight = "88%" }: InteractionSheetProps) {
  const { colors } = useAppTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(height);
  const dragStart = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    translateY.value = reduceMotion ? 0 : height;
    if (!reduceMotion) translateY.value = withSpring(0, spring);
  }, [height, reduceMotion, translateY, visible]);

  const close = () => {
    if (reduceMotion) {
      onClose();
      return;
    }
    translateY.value = withSpring(height, spring, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onBegin(() => { dragStart.value = translateY.value; })
    .onUpdate((event) => {
      const next = dragStart.value + event.translationY;
      translateY.value = next < 0 ? next * 0.18 : next;
    })
    .onEnd((event) => {
      const projected = translateY.value + event.velocityY * 0.18;
      if (projected > height * 0.32 || event.velocityY > 900) {
        translateY.value = withSpring(height, spring, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, spring);
      }
    }), [dragStart, height, onClose, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: reduceMotion ? 1 : interpolate(translateY.value, [0, height], [1, 0]) }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Close ${accessibilityLabel}`} onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View accessibilityViewIsModal style={[styles.sheet, { maxHeight, backgroundColor: colors.background, paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.sm) }, sheetStyle]}>
            <View accessibilityLabel={`Drag to dismiss ${accessibilityLabel}`} style={[styles.handle, { backgroundColor: colors.border }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...(StyleSheet as any).absoluteFillObject, backgroundColor: "rgba(0,0,0,0.48)" },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  handle: { width: 36, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: spacing.sm }
});
