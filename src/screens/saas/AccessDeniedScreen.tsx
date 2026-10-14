import type * as React from "react";
import { AccessDeniedScreenView } from "./AccessDeniedScreen.presentation";
import { createStyles } from "./AccessDeniedScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

export function useAccessDeniedScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const reason = route.params?.reason ?? "Your role does not have access to this area.";

  return { kind: "view1" as const, props: { styles, colors, reason, navigation } };
}

export function AccessDeniedScreen(...args: Parameters<typeof useAccessDeniedScreenPresentation>): React.JSX.Element {
  return <AccessDeniedScreenView model={useAccessDeniedScreenPresentation(...args)} />;
}


