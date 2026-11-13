import type * as React from "react";
import { OwnerSettingsComprehensiveHub } from "./OwnerSettingsComprehensiveHub";
import type { useOwnerSettingsHubPresentation } from "../../../../screens/saas/SettingsScreen";

export function ProfileScreenView({
  model,
}: {
  model: ReturnType<typeof useOwnerSettingsHubPresentation>;
}): React.JSX.Element | null {
  return <OwnerSettingsComprehensiveHub model={model} />;
}

export function InfoRowView(): null {
  return null;
}
