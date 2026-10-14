import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GymDetailsPanel, GymManagementPanel } from "../../../../features/operations/GymPanels";
import type { Gym } from "../../../../types/saas";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useManageGymsScreenPresentation } from "../../../../screens/saas/ManageGymsScreen";

export function ManageGymsScreenView({ model }: { model: ReturnType<typeof useManageGymsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, selectedGym, setSelectedGym, route, navigation } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader
        title={selectedGym ? selectedGym.name : "Manage Gyms"}
        subtitle={selectedGym ? "Gym overview and membership activity" : "All active platform tenants"}
        onBack={selectedGym ? () => setSelectedGym(null) : route.name === "ManageGyms" ? () => navigation.goBack() : undefined}
        actionIcon={selectedGym ? undefined : "person-add-outline"}
        onAction={selectedGym ? undefined : () => navigation.navigate("Invitations")}
      />
      {selectedGym ? <GymDetailsPanel gym={selectedGym} /> : <GymManagementPanel onSelectGym={setSelectedGym} />}
    </Screen>
  ));
    }
  }
}
