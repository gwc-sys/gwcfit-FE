import { Image, Platform, StyleSheet, View } from "react-native";
import { ALPHA, BASE_COLORS } from "../theme/colors";

type AppLogoProps = {
  size?: number;
  inverted?: boolean;
  framed?: boolean;
  chromeless?: boolean;
};

/**
 * The official PulseFit ribbon "P" app mark from the brand reference logo,
 * shared across all web and mobile product surfaces.
 */
export function AppLogo({
  size = 78,
  inverted = false,
  framed = false,
  chromeless = false,
}: AppLogoProps) {
  const markSize = chromeless ? size : Math.round(size * 0.74);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.wrap,
        !chromeless && styles.badge,
        !chromeless && inverted && styles.badgeInverted,
        framed && styles.frame,
        {
          width: size,
          height: size,
          borderRadius: chromeless ? 0 : Math.round(size * 0.26),
        },
      ]}
    >
      <Image
        source={require("../../assets/images/pulsefit-logo.png")}
        style={{ width: markSize, height: markSize }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badge: {
    backgroundColor: ALPHA.accent10,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.24)",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(233, 30, 99, 0.18)" }
      : {}),
  },
  badgeInverted: {
    backgroundColor: BASE_COLORS.lightSurface,
    borderWidth: 1,
    borderColor: ALPHA.black08,
  },
  frame: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
});
