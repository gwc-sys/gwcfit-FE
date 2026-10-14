import type * as React from "react";
import { ProfileScreenView, InfoRowView } from "./ProfileScreen.presentation";
import { createStyles } from "./ProfileScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useLogout } from "../../hooks/useAuthActions";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import { relatedDisplayName } from "../../utils/displayNames";
import { formatRole, initials } from "../../utils/formatters";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";

export function useProfileScreenPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageStaff =
    user?.role === "gym_owner" || hasPermission("manage_staff");
  const logout = useLogout();

  const confirmLogout = () => {
    requestLogoutConfirmation(() => logout.mutate());
  };

  if (!user) {
    return null;
  }

  return { kind: "view1" as const, props: { styles, user, navigation, canManageStaff, InfoRow, logout, confirmLogout } };
}

export function ProfileScreen(...args: Parameters<typeof useProfileScreenPresentation>): React.JSX.Element {
  return <ProfileScreenView model={useProfileScreenPresentation(...args)} />;
}

export function useInfoRowPresentation({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return { kind: "view1" as const, props: { styles, icon, colors, label, value } };
}

function InfoRow(...args: Parameters<typeof useInfoRowPresentation>): React.JSX.Element {
  return <InfoRowView model={useInfoRowPresentation(...args)} />;
}


