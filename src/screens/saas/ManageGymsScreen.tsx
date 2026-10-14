import type * as React from "react";
import { ManageGymsScreenView } from "./ManageGymsScreen.presentation";
import { styles } from "./ManageGymsScreen.styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GymDetailsPanel, GymManagementPanel } from "../../features/operations/GymPanels";
import { useAuthStore } from "../../store/useAuthStore";
import { spacing } from "../../theme/theme";
import type { Gym } from "../../types/saas";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

export function useManageGymsScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  if (!hasPermission("manage_gyms")) {
    return { kind: "view1" as const, props: {  } };
  }

  return { kind: "view2" as const, props: { styles, selectedGym, setSelectedGym, route, navigation } };
}

export function ManageGymsScreen(...args: Parameters<typeof useManageGymsScreenPresentation>): React.JSX.Element {
  return <ManageGymsScreenView model={useManageGymsScreenPresentation(...args)} />;
}


