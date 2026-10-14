import { SuperAdminDashboardScreen } from "../../../../screens/saas/SuperAdminDashboardScreen";
import { GymAdminDashboardScreen } from "../../../../screens/saas/GymAdminDashboardScreen";
import { TrainerDashboardScreen } from "../../../../screens/saas/TrainerDashboardScreen";
import { MemberDashboardScreen } from "../../../../screens/member/MemberDashboardScreen";
import type * as React from "react";
import type { useRoleDashboardScreenPresentation } from "../../../../screens/saas/RoleDashboardScreen";

export function RoleDashboardScreenView({ model }: { model: ReturnType<typeof useRoleDashboardScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<SuperAdminDashboardScreen />);
    }
    case "view2": {
      
      return (<MemberDashboardScreen />);
    }
    case "view3": {
      
      return (<TrainerDashboardScreen />);
    }
    case "view4": {
      
      return (<GymAdminDashboardScreen />);
    }
    case "view5": {
      
      return (<GymAdminDashboardScreen />);
    }
  }
}
