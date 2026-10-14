import type * as React from "react";
import { FeaturePlaceholderScreenView } from "./FeaturePlaceholderScreen.presentation";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import type { RootStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { spacing, typography } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "FeaturePlaceholder">;

export function useFeaturePlaceholderScreenPresentation({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { gap: spacing.lg, paddingTop: spacing.md, paddingBottom: 112 },
        body: { ...typography.body, color: colors.muted, lineHeight: 22 },
      }),
    [colors],
  );
  const title = route.params?.title ?? "Coming soon";
  const message = route.params?.message ?? "This feature is not available yet.";

  return { kind: "view1" as const, props: { styles, title, navigation, message } };
}

export function FeaturePlaceholderScreen(...args: Parameters<typeof useFeaturePlaceholderScreenPresentation>): React.JSX.Element {
  return <FeaturePlaceholderScreenView model={useFeaturePlaceholderScreenPresentation(...args)} />;
}
