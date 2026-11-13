import * as SystemUI from "expo-system-ui";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Platform, useColorScheme } from "react-native";

import { useFitnessStore } from "../store/useFitnessStore";
import { useAuthStore } from "../store/useAuthStore";
import { useMyGym } from "../hooks/useOperations";
import { getThemeColors } from "./theme";
import type { AppColorScheme, AppThemeMode } from "./theme";

type AppThemeContextValue = {
  colorScheme: AppColorScheme;
  themeMode: AppThemeMode;
  isDark: boolean;
  colors: ReturnType<typeof getThemeColors>;
  statusBarStyle: "light" | "dark";
  setColorScheme: (colorScheme: AppColorScheme) => void;
  setThemeMode: (mode: AppThemeMode) => void;
  toggleColorScheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const user = useAuthStore(state => state.user);
  const gym = useMyGym(Boolean(user?.gym_id));
  useEffect(() => {
    if (user && gym.data?.id === user.gym_id && gym.data.name !== user.gym_name) {
      useAuthStore.setState({ user: { ...user, gym_name: gym.data.name } });
    }
  }, [gym.data, user]);
  const deviceColorScheme = useColorScheme();
  const themeMode = useFitnessStore((state) => state.themeMode);
  const setThemeMode = useFitnessStore((state) => state.setThemeMode);
  const setDarkMode = useFitnessStore((state) => state.setDarkMode);
  const systemColorScheme: AppColorScheme = deviceColorScheme === "dark" ? "dark" : "light";
  const colorScheme: AppColorScheme = themeMode === "system" ? systemColorScheme : themeMode;
  const themeColors = getThemeColors(colorScheme);
  const isDark = colorScheme === "dark";
  const statusBarStyle: AppThemeContextValue["statusBarStyle"] = isDark ? "light" : "dark";

  const setColorScheme = useCallback(
    (nextColorScheme: AppColorScheme) => {
      setDarkMode(nextColorScheme === "dark");
    },
    [setDarkMode]
  );

  const toggleColorScheme = useCallback(() => {
    setColorScheme(isDark ? "light" : "dark");
  }, [isDark, setColorScheme]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(themeColors.background);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", colorScheme);
      document.documentElement.style.colorScheme = colorScheme;
      document.documentElement.style.backgroundColor = themeColors.background;
      document.body.style.backgroundColor = themeColors.background;
      document.body.style.color = themeColors.ink;
    }
  }, [themeColors.background, themeColors.ink, colorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      themeMode,
      isDark,
      colors: themeColors,
      statusBarStyle,
      setColorScheme,
      setThemeMode,
      toggleColorScheme
    }),
    [colorScheme, themeMode, isDark, themeColors, statusBarStyle, setColorScheme, setThemeMode, toggleColorScheme]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return value;
}

/** Override presentation colors for a subtree while retaining theme controls. */
export function AppThemeColorScope({ children, colors }: {
  children: ReactNode;
  colors: AppThemeContextValue["colors"];
}) {
  const theme = useAppTheme();
  const value = useMemo(() => ({ ...theme, colors }), [theme, colors]);
  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}
