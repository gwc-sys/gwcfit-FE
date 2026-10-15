import { Pressable } from "../../components/NativePressable";
import { pulseEffects } from "../../theme/referenceTokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { pulseStyles } from "../../components/PulseReference";
import { KeyboardAvoidingView, Modal, Platform, ScrollView } from "react-native";
import Constants from "expo-constants";
import { PulseAvatar, PulseChips } from "../../components/PulseReference";
import { SettingsRow } from "../../components/SettingsRow";
import { MyGymPanel } from "../../../../features/operations/GymPanels";
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
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);
  const [sheet, setSheet] = useState<"gym" | "preferences" | "help" | "about" | null>(null);
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const ps = pulseStyles(colors);
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, user, navigation, canManageStaff, InfoRow, logout, confirmLogout } = model.props;
      return ((
    <Screen reference scroll contentContainerStyle={styles.screen}>
      <ScreenHeader
        title="Profile"
        icon="person-circle-outline"
        actionIcon={user.role === "trainer" ? undefined : "create-outline"}
        actionLabel="Edit account settings"
        onAction={user.role === "trainer" ? undefined : () => navigation.navigate("Settings")}
      />

      <View style={[styles.hero, { backgroundColor: "transparent", paddingVertical: 8 }]}>
        <PulseAvatar name={user.full_name} size={84} />
        <View style={[styles.heroBody, { gap: 4 }]}>
          <Text style={[styles.name, { fontSize: 20, lineHeight: 26 }]}>{user.full_name}</Text>
          <Text style={ps.meta}>{formatRole(user.role)}</Text>
          <Text style={ps.meta}>{user.email}</Text>
        </View>
      </View>
      <View style={[ps.card, { padding: 0, gap: 0 }]}>
        {user.role !== "trainer" && <><SettingsRow icon="settings-outline" title="Account Settings" onPress={() => navigation.navigate("Settings")} /><View style={ps.separator} /></>}
        <SettingsRow icon="business-outline" title="Gym Information" onPress={() => setSheet("gym")} />
        {canManageStaff && <><View style={ps.separator} /><SettingsRow icon="people-outline" title="Manage Staff" onPress={() => navigation.navigate("Staff")} /></>}
        {user.permissions.includes("manage_membership_plans") && <><View style={ps.separator} /><SettingsRow icon="card-outline" title="Subscription & Billing" onPress={() => navigation.navigate("MembershipPlans")} /></>}
      </View>
      <View style={[ps.card, { padding: 0, gap: 0 }]}>
        <SettingsRow icon="settings-outline" title="App Preferences" onPress={() => setSheet("preferences")} />
        <View style={ps.separator} />
        <SettingsRow icon="help-circle-outline" title="Help & Support" onPress={() => setSheet("help")} />
        <View style={ps.separator} />
        <SettingsRow icon="information-circle-outline" title="About" onPress={() => setSheet("about")} />
      </View>
      <Modal visible={sheet !== null} transparent animationType="none" onRequestClose={() => setSheet(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: pulseEffects.scrim, justifyContent: "flex-end" }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close settings" onPress={() => setSheet(null)} style={{ flex: 1, minHeight: 44 }} />
          <View style={{ maxHeight: "85%", backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Math.max(20, insets.bottom + 16) }}>
            <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              <ScreenHeader title={sheet === "gym" ? "Gym Information" : sheet === "preferences" ? "App Preferences" : sheet === "help" ? "Help & Support" : "About"} onBack={() => setSheet(null)} />
              {sheet === "gym" && (user.permissions.includes("configure_gym") ? <MyGymPanel /> : <Text style={ps.meta}>{user.gym_name || "Platform account"}</Text>)}
              {sheet === "preferences" && <><Text style={ps.name}>Appearance</Text><PulseChips options={["Light", "Dark", "System"]} value={themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"} onChange={value => setThemeMode(value === "System" ? "system" : value === "Dark" ? "dark" : "light")} /><Text style={ps.meta}>System follows your device appearance.</Text><SettingsRow icon="notifications-outline" title="Notifications" onPress={() => { setSheet(null); navigation.navigate("Notifications"); }} /></>}
              {sheet === "help" && <><Text style={[ps.meta, { fontSize: 15, lineHeight: 24 }]}>Use Members to find and manage memberships. Operations contains your gym workflows. Analytics shows revenue and member activity. Account Settings contains your security controls.</Text><SettingsRow icon="notifications-outline" title="View updates" onPress={() => { setSheet(null); navigation.navigate("Notifications"); }} /></>}
              {sheet === "about" && <><Text style={ps.heading}>PulseFit</Text><Text style={ps.meta}>Gym Management</Text><Text style={ps.meta}>Version {Constants.expoConfig?.version ?? "1.0.0"}</Text><Text style={[ps.meta, { fontSize: 15, lineHeight: 24 }]}>Manage your gym, memberships, attendance and payments in one place.</Text></>}
              <PrimaryButton title="Done" onPress={() => setSheet(null)} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showDetails }} onPress={() => setShowDetails(value => !value)} style={ps.setting}><Text style={ps.meta}>{showDetails ? "Hide account details" : "Account details & permissions"}</Text></Pressable>
      {showDetails && <>
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

      </>}
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
