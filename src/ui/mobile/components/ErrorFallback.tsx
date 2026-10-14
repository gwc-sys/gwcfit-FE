import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { PrimaryButton } from "./PrimaryButton";

export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View accessibilityRole="alert" style={[styles.container, { backgroundColor: colors.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.muted }]}>The app hit an unexpected error. Try loading this screen again.</Text>
      <PrimaryButton title="Try Again" icon="refresh-outline" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  message: { maxWidth: 420, fontSize: 17, lineHeight: 25, textAlign: "center" },
});
