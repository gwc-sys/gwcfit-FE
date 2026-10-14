import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import { InvitationManagementScreen } from "../../../../screens/saas/InvitationManagementScreen";
import type * as React from "react";
import type { useCreateGymAdminScreenPresentation } from "../../../../screens/saas/CreateGymAdminScreen";

export function CreateGymAdminScreenView({ model }: { model: ReturnType<typeof useCreateGymAdminScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      
      return (<InvitationManagementScreen />);
    }
  }
}
