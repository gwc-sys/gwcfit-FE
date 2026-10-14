import type * as React from "react";
import { OperationsHubScreenView } from "./OperationsHubScreen.presentation";
import { styles } from "./OperationsHubScreen.styles";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { QuickAction } from "../../components/QuickAction";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useAuthStore } from "../../store/useAuthStore";
import { spacing } from "../../theme/theme";

export function useOperationsHubScreenPresentation() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageStaff =
    user?.role === "gym_owner" || hasPermission("manage_staff");

  return { kind: "view1" as const, props: { styles, hasPermission, navigation, canManageStaff } };
}

export function OperationsHubScreen(...args: Parameters<typeof useOperationsHubScreenPresentation>): React.JSX.Element {
  return <OperationsHubScreenView model={useOperationsHubScreenPresentation(...args)} />;
}


