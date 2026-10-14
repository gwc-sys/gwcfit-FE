import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import type * as React from "react";
import type { useAccessDeniedScreenPresentation } from "../../../../screens/saas/AccessDeniedScreen";

export function AccessDeniedScreenView({ model }: { model: ReturnType<typeof useAccessDeniedScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, reason, navigation } = model.props;
      return ((
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="lock-closed-outline" size={34} color={colors.danger} />
        </View>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.copy}>{reason}</Text>
        <PrimaryButton title="Back to dashboard" icon="home-outline" onPress={() => navigation.navigate("AppTabs")} />
      </View>
    </Screen>
  ));
    }
  }
}
