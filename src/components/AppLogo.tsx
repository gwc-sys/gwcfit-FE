import { StyleSheet, Text, View } from "react-native";

import { palette } from "../theme/theme";

type AppLogoProps = {
  size?: number;
  inverted?: boolean;
};

export function AppLogo({ size = 78, inverted = false }: AppLogoProps) {
  const barColor = inverted ? palette.white : palette.green;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.vertical, { backgroundColor: barColor, height: size * 0.92 }]} />
      <View
        style={[
          styles.loop,
          {
            borderColor: barColor,
            width: size * 0.8,
            height: size * 0.34,
            top: size * 0.22
          }
        ]}
      />
      <View
        style={[
          styles.loop,
          {
            borderColor: barColor,
            width: size * 0.8,
            height: size * 0.34,
            bottom: size * 0.18
          }
        ]}
      />
      <Text style={[styles.cut, { color: inverted ? palette.green : palette.white }]}>S</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  vertical: {
    position: "absolute",
    width: 12
  },
  loop: {
    position: "absolute",
    borderWidth: 10,
    borderRadius: 999
  },
  cut: {
    fontSize: 0,
    lineHeight: 0
  }
});
