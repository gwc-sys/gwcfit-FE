import type * as React from "react";
import { OwnerSettingsWebHub } from "./OwnerSettingsWebHub";
import type { useOwnerSettingsHubPresentation } from "../../../../screens/saas/SettingsScreen";

export function ProfileScreenView({
  model,
}: {
  model: ReturnType<typeof useOwnerSettingsHubPresentation>;
}): React.JSX.Element | null {
  return <OwnerSettingsWebHub model={model} />;
}

export function InfoRowView(): null {
  return null;
}
