import type * as React from "react";
import { CreateGymAdminScreenView } from "./CreateGymAdminScreen.presentation";
import { useAuthStore } from "../../store/useAuthStore";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import { InvitationManagementScreen } from "./InvitationManagementScreen";

export function useCreateGymAdminScreenPresentation() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "super_admin") {
    return { kind: "view1" as const, props: {  } };
  }

  return { kind: "view2" as const, props: {  } };
}

export function CreateGymAdminScreen(...args: Parameters<typeof useCreateGymAdminScreenPresentation>): React.JSX.Element {
  return <CreateGymAdminScreenView model={useCreateGymAdminScreenPresentation(...args)} />;
}
