import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, spacing, typography } from "../theme/theme";
import type { ThemeColors } from "../theme/theme";

type PhotoCardProps = {
  image: ImageSourcePropType;
  title: string;
  meta?: string;
  badge?: string;
  buttonLabel?: string;
  onPress?: () => void;
  compact?: boolean;
};

export function PhotoCard({
  image,
  title,
  meta,
  badge,
  buttonLabel,
  onPress,
  compact
}: PhotoCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <ImageBackground source={image} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient
          colors={["rgba(5,7,10,0.12)", "rgba(5,7,10,0.84)"]}
          style={styles.overlay}
        >
          <View style={styles.topRow}>
            {badge ? <Text style={styles.badge}>{badge}</Text> : <View />}
            <Ionicons name="chevron-forward" size={22} color={colors.white} />
          </View>
          <View>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            {buttonLabel ? (
              <View style={styles.action}>
                <Text style={styles.actionText}>{buttonLabel}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    height: 190,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface
  },
  compact: {
    height: 168,
    flex: 1
  },
  pressed: {
    opacity: 0.86
  },
  image: {
    flex: 1
  },
  imageRadius: {
    borderRadius: radius.md
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.lg
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    ...typography.small,
    color: colors.primary,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  title: {
    ...typography.h2,
    color: colors.white
  },
  meta: {
    ...typography.body,
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.xs
  },
  action: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  actionText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "800"
  }
  });
