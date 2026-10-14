import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatRole, initials } from "../../../../utils/formatters";
import type * as React from "react";
import type { useProfileScreenPresentation, useInfoRowPresentation } from "../../../../screens/saas/ProfileScreen";

export function ProfileScreenView({ model }: { model: ReturnType<typeof useProfileScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, user, navigation, canManageStaff, InfoRow, logout, confirmLogout } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader
        title="Profile"
        subtitle={formatRole(user.role)}
        icon="person-circle-outline"
        actionIcon={user.role === "trainer" ? undefined : "settings-outline"}
        onAction={user.role === "trainer" ? undefined : () => navigation.navigate("Settings")}
      />

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user.full_name)}</Text>
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <StatusBadge
            label={formatRole(user.role)}
            tone={
              user.role === "super_admin"
                ? "info"
                : user.role === "member"
                  ? "neutral"
                  : "success"
            }
          />
        </View>
      </View>

      <View style={styles.quickRow}>
        {user.role === "member" ? (
          <PrimaryButton
            title="Member Card"
            icon="id-card-outline"
            onPress={() => navigation.navigate("MemberProfile")}
            style={styles.quickButton}
          />
        ) : null}
        {canManageStaff ? (
          <PrimaryButton
            title="Gym Users"
            icon="people-circle-outline"
            variant="secondary"
            onPress={() => navigation.navigate("Staff")}
            style={styles.quickButton}
          />
        ) : null}
        <PrimaryButton
          title="Notifications"
          icon="notifications-outline"
          variant="secondary"
          onPress={() => navigation.navigate("Notifications")}
          style={styles.quickButton}
        />
      </View>

      <SurfacePanel
        title="Account"
        kicker="Identity"
        icon="shield-checkmark-outline"
      >
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <InfoRow
          icon="business-outline"
          label="Gym"
          value={
            user.gym_id
              ? relatedDisplayName(user.gym_name, "Assigned gym")
              : "Platform account"
          }
        />
        <InfoRow
          icon="key-outline"
          label="Permissions"
          value={String(user.permissions.length)}
        />
      </SurfacePanel>

      <SurfacePanel
        title="Permissions"
        kicker="Backend claims"
        icon="lock-open-outline"
      >
        <View style={styles.permissions}>
          {user.permissions.map((permission) => (
            <StatusBadge
              key={permission}
              label={permission.replaceAll("_", " ")}
              tone="info"
            />
          ))}
        </View>
      </SurfacePanel>

      <PrimaryButton
        title="Logout"
        icon="log-out-outline"
        variant="danger"
        loading={logout.isPending}
        onPress={confirmLogout}
      />
    </Screen>
  ));
    }
  }
}

export function InfoRowView({ model }: { model: ReturnType<typeof useInfoRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, icon, colors, label, value } = model.props;
      return ((
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  ));
    }
  }
}
