import type * as React from "react";
import { RoleDashboardScreenView } from "./RoleDashboardScreen.presentation";
import { SuperAdminDashboardScreen } from "./SuperAdminDashboardScreen";
import { GymAdminDashboardScreen } from "./GymAdminDashboardScreen";
import { TrainerDashboardScreen } from "./TrainerDashboardScreen";
import { MemberDashboardScreen } from "../member/MemberDashboardScreen";
import { useAuthStore } from "../../store/useAuthStore";

export function useRoleDashboardScreenPresentation() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "super_admin") {
    return { kind: "view1" as const, props: {  } };
  }

  if (user?.role === "member") {
    return { kind: "view2" as const, props: {  } };
  }

  if (user?.role === "trainer") {
    return { kind: "view3" as const, props: {  } };
  }

  if (user?.role === "sub_admin") {
    return { kind: "view4" as const, props: {  } };
  }

  return { kind: "view5" as const, props: {  } };
}

export function RoleDashboardScreen(...args: Parameters<typeof useRoleDashboardScreenPresentation>): React.JSX.Element {
  return <RoleDashboardScreenView model={useRoleDashboardScreenPresentation(...args)} />;
}
