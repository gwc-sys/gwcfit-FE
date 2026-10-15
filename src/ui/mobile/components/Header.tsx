import { Pressable } from "./NativePressable";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrowLeft } from "./icons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { radius, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type HeaderProps = {
  title?: string;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
};

export function Header({ title, right, transparent = false, onBack }: HeaderProps) {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={handleBack}
        style={({ pressed }) => [
          styles.back,
          transparent && styles.backTransparent,
          pressed && styles.pressed
        ]}
       accessibilityLabel={"Go back"}>
        <ArrowLeft color={transparent ? colors.white : colors.ink} size={28} strokeWidth={3} />
      </Pressable>
      {title ? <Text style={[styles.title, transparent && styles.titleLight]}>{title}</Text> : <View />}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  back: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted
  },
  backTransparent: {
    backgroundColor: "rgba(255,255,255,0.25)"
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    textAlign: "center",
    color: colors.ink,
    ...typography.h2,
    fontWeight: "800"
  },
  titleLight: {
    color: colors.white
  },
  right: {
    width: 64,
    alignItems: "flex-end"
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  }
  });
