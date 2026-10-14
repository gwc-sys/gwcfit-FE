import { Text } from "react-native";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import type * as React from "react";
import type { useFeaturePlaceholderScreenPresentation } from "../../../../screens/saas/FeaturePlaceholderScreen";

export function FeaturePlaceholderScreenView({ model }: { model: ReturnType<typeof useFeaturePlaceholderScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, title, navigation, message } = model.props;
      return ((
    <Screen contentContainerStyle={styles.screen}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <SurfacePanel title={title} kicker="Coming soon" icon="time-outline">
        <Text style={styles.body}>{message}</Text>
      </SurfacePanel>
    </Screen>
  ));
    }
  }
}
