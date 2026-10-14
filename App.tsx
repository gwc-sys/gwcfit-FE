import "react-native-gesture-handler";
import "./global.css";

import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppProviders } from "./src/providers/AppProviders";
import { useAppTheme } from "./src/theme/AppThemeProvider";
import { PresentationRoot } from "./src/ui/PresentationRoot";

export default function App() {
  const [iconsLoaded, iconFontError] = useFonts(Ionicons.font);

  // Loading the shared icon face once prevents web from briefly rendering every
  // Ionicon with the browser's fallback font (which appears as square boxes).
  if (!iconsLoaded && !iconFontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProviders>
          <PresentationRoot><AppChrome /></PresentationRoot>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppChrome() {
  const { statusBarStyle } = useAppTheme();

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <RootNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
