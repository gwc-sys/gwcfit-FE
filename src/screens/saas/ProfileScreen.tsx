import type * as React from "react";
import { ProfileScreenView, InfoRowView } from "./ProfileScreen.presentation";
import { useOwnerSettingsHubPresentation } from "./SettingsScreen";

export function useProfileScreenPresentation() {
  return useOwnerSettingsHubPresentation();
}

export function ProfileScreen(...args: Parameters<typeof useProfileScreenPresentation>): React.JSX.Element {
  return <ProfileScreenView model={useProfileScreenPresentation(...args)} />;
}

export function useInfoRowPresentation() {
  return { kind: "view1" as const, props: {} };
}

export function InfoRow(): React.JSX.Element | null {
  return <InfoRowView />;
}
