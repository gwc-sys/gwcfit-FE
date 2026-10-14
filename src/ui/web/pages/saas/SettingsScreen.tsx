import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardLayout } from "../../../../components/dashboard/PulseDashboardLayout";
import { MyGymPanel } from "../../../../features/operations/GymPanels";
import { getApiErrorMessage } from "../../../../services/api/client";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import type * as React from "react";
import type { useSettingsScreenPresentation, useGymOwnerSettingsScreenPresentation, useOwnerSettingsHubPresentation, useSuperAdminSettingsHubPresentation, useSettingsOptionGridPresentation, useSettingsOptionPresentation, useSettingsLinkPresentation, useGymOwnerSettingsDashboardPresentation, useLegacySuperAdminSettingsHubPresentation, useSidePanelPresentation, useOverviewRowPresentation, useHealthRowPresentation } from "../../../../screens/saas/SettingsScreen";

export function SettingsScreenView({ model }: { model: ReturnType<typeof useSettingsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { SuperAdminSettingsHub, navigation } = model.props;
      return ((
    <SuperAdminSettingsHub
      onNavigate={(route, params) => navigation.navigate(route, params)}
    />
  ));
    }
  }
}

export function GymOwnerSettingsScreenView({ model }: { model: ReturnType<typeof useGymOwnerSettingsScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { OwnerSettingsHub } = model.props;
      return ((
    <PulseDashboardLayout activeLabel="Settings" roleLabel="Gym Owner">
      <OwnerSettingsHub />
    </PulseDashboardLayout>
  ));
    }
  }
}

export function OwnerSettingsHubView({ model }: { model: ReturnType<typeof useOwnerSettingsHubPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, navigation, SettingsOptionGrid, isDark, setColorScheme, colors, control, errors, changePassword, submitPasswordChange, logout } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <ScreenHeader title="Settings" subtitle="Account preferences and security" onBack={() => navigation.goBack()} />
      <SettingsOptionGrid onNavigate={(route) => navigation.navigate(route)} isDark={isDark} onToggleTheme={(enabled) => setColorScheme(enabled ? "dark" : "light")} subscriptionRoute="MembershipPlans" />
      <SurfacePanel title="Appearance" kicker="Preferences" icon="options-outline">
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}><Text style={styles.settingTitle}>Theme</Text><Text style={styles.settingText}>{isDark ? "Dark theme is enabled." : "Light theme is enabled."}</Text></View>
          <Switch value={isDark} onValueChange={(enabled) => setColorScheme(enabled ? "dark" : "light")} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} ios_backgroundColor={colors.surfaceStrong} />
        </View>
      </SurfacePanel>
      <MyGymPanel />
      <SurfacePanel title="Change password" kicker="Security" icon="lock-closed-outline">
        <Controller control={control} name="old_password" render={({ field: { onBlur, onChange, value } }) => <FormTextField error={errors.old_password?.message} label="Current password" leftIcon="lock-open-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="Enter current password" secureTextEntry value={value} />} />
        <Controller control={control} name="new_password" render={({ field: { onBlur, onChange, value } }) => <FormTextField error={errors.new_password?.message} label="New password" leftIcon="lock-closed-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="Use at least 8 characters" secureTextEntry value={value} />} />
        <NoticeBanner message={changePassword.error ? getApiErrorMessage(changePassword.error) : null} tone="error" />
        <NoticeBanner message={changePassword.data?.message ?? null} />
        <PrimaryButton title="Update password" icon="key-outline" loading={changePassword.isPending} onPress={submitPasswordChange} />
      </SurfacePanel>
      <SurfacePanel title="Session" kicker="Account security" icon="shield-checkmark-outline">
        <Text style={styles.bodyText}>Sign out of this device when you finish managing your gym.</Text>
        <PrimaryButton title="Sign out" icon="log-out-outline" variant="danger" loading={logout.isPending} onPress={() => requestLogoutConfirmation(() => logout.mutate())} />
      </SurfacePanel>
    </Screen>
  ));
    }
  }
}

export function SuperAdminSettingsHubView({ model }: { model: ReturnType<typeof useSuperAdminSettingsHubPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SettingsOptionGrid, onNavigate, isDark, setColorScheme, colors, user, control, errors, changePassword, submitPasswordChange, SettingsLink, logout } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader title="Settings" subtitle="Platform preferences and account access" />
      <SettingsOptionGrid onNavigate={onNavigate} isDark={isDark} onToggleTheme={(enabled) => setColorScheme(enabled ? "dark" : "light")} subscriptionRoute="MembershipPlans" />

      <SurfacePanel title="Preferences" kicker="Workspace" icon="options-outline">
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Appearance</Text>
            <Text style={styles.settingText}>{isDark ? "Dark theme is enabled." : "Light theme is enabled."}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(enabled) => setColorScheme(enabled ? "dark" : "light")}
            trackColor={{ true: colors.primary, false: colors.surfaceStrong }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.surfaceStrong}
          />
        </View>
      </SurfacePanel>

      <SurfacePanel title="Account access" kicker="Your account" icon="person-circle-outline">
        <Text style={styles.bodyText}>Manage your profile details and sign-in credentials from your account page.</Text>
        <PrimaryButton title="Open profile" icon="arrow-forward-outline" onPress={() => onNavigate("Profile")} />
      </SurfacePanel>

      {user?.role !== "super_admin" ? <SurfacePanel title="Change password" kicker="Authentication" icon="lock-closed-outline">
        <Controller control={control} name="old_password" render={({ field: { onBlur, onChange, value } }) => (
          <FormTextField error={errors.old_password?.message} label="Current password" leftIcon="lock-open-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="Enter current password" secureTextEntry value={value} />
        )} />
        <Controller control={control} name="new_password" render={({ field: { onBlur, onChange, value } }) => (
          <FormTextField error={errors.new_password?.message} label="New password" leftIcon="lock-closed-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="Use at least 8 characters" secureTextEntry value={value} />
        )} />
        <NoticeBanner message={changePassword.error ? getApiErrorMessage(changePassword.error) : null} tone="error" />
        <NoticeBanner message={changePassword.data?.message ?? null} />
        <PrimaryButton title="Update password" icon="key-outline" loading={changePassword.isPending} onPress={submitPasswordChange} />
      </SurfacePanel> : <SurfacePanel title="Authentication protected" kicker="Security" icon="shield-checkmark-outline"><Text style={styles.bodyText}>Application Developer credentials are protected. Super Admin account information and passwords can only be changed in the codebase.</Text></SurfacePanel>}

      <SurfacePanel title="Platform administration" kicker="Super Admin" icon="shield-checkmark-outline">
        <Text style={styles.bodyText}>Control access for every gym, owner, and member through the platform workflows.</Text>
        <View style={styles.controlList}>
          <SettingsLink icon="business-outline" title="Tenant access" description="Review gym status and ownership" onPress={() => onNavigate("ManageGyms")} />
          <SettingsLink icon="ticket-outline" title="Owner invitations" description="Issue or revoke secure invitations" onPress={() => onNavigate("Invitations")} />
          <SettingsLink icon="analytics-outline" title="Reports and audit view" description="Review platform activity and health" onPress={() => onNavigate("Reports")} />
        </View>
      </SurfacePanel>

      <SurfacePanel title="Active session" kicker="Account security" icon="shield-checkmark-outline">
        <Text style={styles.bodyText}>Sign out of this device when you finish administering the platform.</Text>
        <PrimaryButton title="Sign out" icon="log-out-outline" variant="danger" loading={logout.isPending} onPress={() => requestLogoutConfirmation(() => logout.mutate())} />
      </SurfacePanel>
    </Screen>
  ));
    }
  }
}

export function SettingsOptionGridView({ model }: { model: ReturnType<typeof useSettingsOptionGridPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, SettingsOption, onNavigate, colors, subscriptionRoute, isDark, onToggleTheme } = model.props;
      return ((
    <View style={styles.optionGrid}>
      <SettingsOption icon="person-circle-outline" title="Profile" description="View your account details" onPress={() => onNavigate("Profile")} colors={colors} styles={styles} />
      <SettingsOption icon="card-outline" title="Subscription" description="Manage plans and free-trial settings" onPress={() => onNavigate(subscriptionRoute)} colors={colors} styles={styles} />
      <View style={styles.optionCard}><View style={styles.optionIcon}><Ionicons name="color-palette-outline" size={20} color={colors.primary} /></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>Theme</Text><Text style={styles.optionDescription}>{isDark ? "Dark theme" : "Light theme"}</Text></View><Switch value={isDark} onValueChange={onToggleTheme} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} /></View>
      <View style={styles.optionCard}><View style={styles.optionIcon}><Ionicons name="lock-closed-outline" size={20} color={colors.primary} /></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>Authentication</Text><Text style={styles.optionDescription}>Change your password in the security section below.</Text></View></View>
    </View>
  ));
    }
  }
}

export function SettingsOptionView({ model }: { model: ReturnType<typeof useSettingsOptionPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, icon, colors, title, description } = model.props;
      return (<Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}><View style={styles.optionIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>{title}</Text><Text style={styles.optionDescription}>{description}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></Pressable>);
    }
  }
}

export function SettingsLinkView({ model }: { model: ReturnType<typeof useSettingsLinkPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, onPress, icon, colors, title, description } = model.props;
      return ((
    <Pressable style={({ pressed }) => [styles.controlRow, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      <View style={styles.controlIcon}><Ionicons name={icon} size={19} color={colors.primary} /></View>
      <View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingText}>{description}</Text></View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  ));
    }
  }
}

export function GymOwnerSettingsDashboardView({ model }: { model: ReturnType<typeof useGymOwnerSettingsDashboardPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, gymQuery, colors, ownerDashboardNav, onNavigate, tabs, setActiveTab, activeTab, user, ownerDashboardCards, openCard, selectedCard, setSelectedCard, draft, setDraft, updateGym, save } = model.props;
      return (<View style={styles.page}><View style={styles.shell}>
    <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}><View style={styles.brandRow}><View style={styles.brandMark}><Ionicons name="pulse" size={24} color="#FFF" /></View><View><Text style={styles.brandName}>Pulse<Text style={styles.brandAccent}>Fit</Text></Text><Text style={styles.brandRole}>Gym Owner Panel</Text></View></View><View style={styles.gymSwitcher}><View style={styles.gymLogo}><Ionicons name="barbell" size={18} color="#FFF" /></View><View style={styles.gymCopy}><Text style={styles.gymName}>{gymQuery.data?.name ?? "FitZone Gym"}</Text><Text style={styles.gymMeta}>Change Gym</Text></View><Ionicons name="chevron-down" size={16} color={colors.ink} /></View><View style={styles.navList}>{ownerDashboardNav.map(([label, icon, route]) => <Pressable accessibilityRole="button" key={label} style={styles.navItem} onPress={() => onNavigate(route, route === "AppTabs" ? { screen: "Dashboard" } : undefined)}><Ionicons name={icon} size={17} color={colors.textSecondary} /><Text style={styles.navLabel}>{label}</Text></Pressable>)}</View><View style={styles.settingsNav}><View style={styles.settingsHeader}><Ionicons name="settings-outline" size={17} color={colors.primary} /><Text style={styles.settingsTitle}>Settings</Text><Ionicons name="chevron-up" size={15} color={colors.primary} /></View>{tabs.map((tab) => <Pressable accessibilityRole="button" key={tab} onPress={() => setActiveTab(tab)} style={[styles.subNav, activeTab === tab && styles.subNavActive]}><View style={[styles.subDot, activeTab === tab && styles.subDotActive]} /><Text style={[styles.subText, activeTab === tab && styles.subTextActive]}>{tab}</Text></Pressable>)}</View><Pressable accessibilityRole="button" style={styles.support} onPress={() => onNavigate("FeaturePlaceholder", { title: "Support" })}><Ionicons name="help-circle-outline" size={17} color={colors.textSecondary} /><Text style={styles.navLabel}>Support</Text></Pressable><View style={styles.quickActions}><Text style={styles.quickTitle}>Quick Actions</Text>{[["Add Member", "person-add-outline", "AddMember"], ["Add Trainer", "person-add-outline", "Trainers"], ["Mark Attendance", "checkmark-circle-outline", "Attendance"], ["Create Plan", "document-outline", "MembershipPlans"]].map(([label, icon, route]) => <Pressable accessibilityRole="button" key={label} style={styles.quickRow} onPress={() => onNavigate(route)}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.primary} /><Text style={styles.quickText}>{label}</Text></Pressable>)}</View></ScrollView>
    <View style={styles.content}><View style={styles.header}><View><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Manage your gym preferences and configurations</Text></View><View style={styles.headerActions}><Pressable accessibilityRole="button" style={styles.websiteButton} onPress={() => onNavigate("FeaturePlaceholder", { title: "Gym Website" })}><Text style={styles.websiteText}>Visit Gym Website</Text><Ionicons name="open-outline" size={15} color={colors.ink} /></Pressable><Pressable accessibilityRole="button" style={styles.notificationButton} onPress={() => onNavigate("Notifications")}><Ionicons name="notifications-outline" size={22} color={colors.ink} /><View style={styles.badge}><Text style={styles.badgeText}>12</Text></View></Pressable><Pressable accessibilityRole="button" style={styles.account} onPress={() => onNavigate("Profile")}><View style={styles.avatar}><Text style={styles.avatarText}>{(user?.full_name ?? "R").charAt(0).toUpperCase()}</Text></View><View><Text style={styles.accountName}>{user?.full_name ?? "Gym Owner"}</Text><Text style={styles.accountRole}>Gym Owner</Text></View><Ionicons name="chevron-down" size={15} color={colors.ink} /></Pressable></View></View><View style={styles.tabs}>{tabs.map((tab) => <Pressable accessibilityRole="button" key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}><Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text></Pressable>)}</View><ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}><View style={styles.cardGrid}>{ownerDashboardCards.map((card) => <Pressable accessibilityRole="button" key={card[0]} onPress={() => openCard(card)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={[styles.cardIcon, { backgroundColor: `${card[3]}18` }]}><Ionicons name={card[2]} size={25} color={card[3]} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>{card[0]}</Text><Text style={styles.cardDescription}>{card[1]}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.ink} /></Pressable>)}</View><View style={styles.overview}><Text style={styles.panelTitle}>Gym Overview</Text><View style={styles.overviewRow}>{[["Total Members", "1,248"], ["Active Members", "856"], ["Trainers", "12"], ["Receptionists", "4"], ["Revenue (This Month)", "₹2,48,500"]].map(([label, value]) => <View key={label} style={styles.overviewItem}><Text style={styles.overviewLabel}>{label}</Text><Text style={styles.overviewValue}>{label === "Total Members" && gymQuery.isLoading ? "..." : value}</Text></View>)}</View></View></ScrollView></View>
  </View><Modal visible={!!selectedCard} transparent animationType="fade" onRequestClose={() => setSelectedCard(null)}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{selectedCard?.[0]}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSelectedCard(null)}><Ionicons name="close" size={22} color={colors.ink} /></Pressable></View>{selectedCard && (selectedCard[0] === "Gym Profile" || selectedCard[0] === "Business Information") ? <><FormTextField label="Gym name" value={draft.name} onChangeText={(name) => setDraft((current) => ({ ...current, name }))} /><FormTextField label="Email" value={draft.email} onChangeText={(email) => setDraft((current) => ({ ...current, email }))} /><FormTextField label="Phone" value={draft.phone} onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))} /><FormTextField label="Address" value={draft.address} onChangeText={(address) => setDraft((current) => ({ ...current, address }))} /><FormTextField label="Timezone" value={draft.timezone} onChangeText={(timezone) => setDraft((current) => ({ ...current, timezone }))} /></> : <FormTextField label="Setting value" placeholder="Enter a value" value={draft.value} onChangeText={(value) => setDraft((current) => ({ ...current, value }))} />}{updateGym.error ? <Text style={styles.error}>{getApiErrorMessage(updateGym.error)}</Text> : null}<PrimaryButton title="Save Settings" loading={updateGym.isPending} onPress={save} /></View></View></Modal></View>);
    }
  }
}

export function LegacySuperAdminSettingsHubView({ model }: { model: ReturnType<typeof useLegacySuperAdminSettingsHubPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, colors, search, setSearch, filteredCards, setSelectedCard, settingCards, SidePanel, OverviewRow, users, gyms, resources, HealthRow, activities, selectedCard, onNavigate } = model.props;
      return ((
    <View style={styles.hub}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage and configure all system settings and preferences
          </Text>
        </View>
        <View style={styles.search}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search settings..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
          <Text style={styles.shortcut}>Ctrl /</Text>
        </View>
        <View style={styles.topStatus}>
          <Ionicons
            name="notifications-outline"
            size={21}
            color={colors.textSecondary}
          />
          <View style={styles.help}>
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.muted}>Help</Text>
          </View>
          <View style={styles.system}>
            <View style={styles.dot} />
            <Text style={styles.muted}>System Status</Text>
            <Text style={styles.statusText}>All Systems Operational</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.cardGrid}>
          {filteredCards.map(([name, description, icon, tone], index) => (
            <Pressable accessibilityRole="button"
              key={name}
              onPress={() =>
                setSelectedCard(
                  settingCards.find((card) => card[0] === name) ?? null,
                )
              }
              style={({ pressed }) => [
                styles.settingCard,
                name === "About System" && styles.aboutCard,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${tone}18` }]}
              >
                <Ionicons name={icon} size={25} color={tone} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>
                  {settingCards.findIndex((card) => card[0] === name) + 1}.{" "}
                  {name}
                </Text>
                <Text style={styles.cardDescription}>{description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.sideColumn}>
          <SidePanel title="Quick Overview">
            <OverviewRow
              icon="pulse-outline"
              label="System Status"
              value="Operational"
              tone={colors.success}
            />
            <OverviewRow
              icon="globe-outline"
              label="Environment"
              value="Production"
            />
            <OverviewRow icon="code-outline" label="Version" value="v2.5.1" />
            <OverviewRow
              icon="cloud-done-outline"
              label="Last Backup"
              value="2 hours ago"
            />
            <OverviewRow
              icon="person-outline"
              label="Active Users"
              value={users.data?.total?.toLocaleString() ?? "—"}
            />
            <OverviewRow
              icon="business-outline"
              label="Active Gyms"
              value={gyms.data?.total?.toLocaleString() ?? "—"}
            />
          </SidePanel>
          <SidePanel title="System Health">
            {(resources.data?.items?.length
              ? resources.data.items.slice(0, 5)
              : [
                  { label: "CPU Usage", percentage: 23 },
                  { label: "Memory Usage", percentage: 45 },
                  { label: "Disk Usage", percentage: 62 },
                  { label: "Database", percentage: 98 },
                  { label: "Redis Cache", percentage: 99 },
                ]
            ).map((item, index) => (
              <HealthRow
                key={item.label}
                label={item.label}
                value={`${item.percentage ?? "—"}%`}
                tone={
                  ["#22C55E", "#FBBF24", "#EF4444", "#22C55E", "#22C55E"][index]
                }
              />
            ))}
          </SidePanel>
          <SidePanel title="Recent Activities">
            {(activities.data?.items?.length
              ? activities.data.items
              : [
                  "System backup completed",
                  "New gym registered",
                  "Database optimization",
                  "API rate limit updated",
                  "System maintenance",
                ].map((title) => ({ title, occurred_at: "" }))
            )
              .slice(0, 5)
              .map((item, i) => (
                <View key={item.title + i} style={styles.activity}>
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor: [
                          "#22C55E",
                          "#3B9BFF",
                          "#FBBF24",
                          "#0A84FF",
                          "#EF4444",
                        ][i],
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.activityText}>{item.title}</Text>
                    <Text style={styles.activityTime}>
                      {item.occurred_at
                        ? new Date(item.occurred_at).toLocaleString()
                        : [
                            "2 hours ago",
                            "3 hours ago",
                            "5 hours ago",
                            "8 hours ago",
                            "1 day ago",
                          ][i]}
                    </Text>
                  </View>
                </View>
              ))}
            <Text style={styles.logs}>View All Logs →</Text>
          </SidePanel>
        </View>
      </View>
      <Text style={styles.footer}>
        © 2025 PulseFit Super Admin. All rights reserved.
      </Text>
      <Modal
        visible={!!selectedCard}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCard(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailPanel}>
            {selectedCard ? (
              <>
                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: `${selectedCard[3]}18` },
                    ]}
                  >
                    <Ionicons
                      name={selectedCard[2]}
                      size={25}
                      color={selectedCard[3]}
                    />
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setSelectedCard(null)}>
                    <Ionicons
                      name="close"
                      size={22}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
                <Text style={styles.detailTitle}>{selectedCard[0]}</Text>
                <Text style={styles.detailDescription}>{selectedCard[1]}</Text>
                <Text style={styles.detailHint}>
                  Configure this system area using the controls and permissions
                  assigned to your Super Admin account.
                </Text>
                <Pressable accessibilityRole="button"
                  style={styles.openButton}
                  onPress={() => {
                    setSelectedCard(null);
                    onNavigate("FeaturePlaceholder", {
                      title: selectedCard[0],
                    });
                  }}
                >
                  <Text style={styles.openButtonText}>
                    Open {selectedCard[0]}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.white}
                  />
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  ));
    }
  }
}

export function SidePanelView({ model }: { model: ReturnType<typeof useSidePanelPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, title, children } = model.props;
      return ((
    <View style={styles.sidePanel}>
      <Text style={styles.sideTitle}>{title}</Text>
      {children}
    </View>
  ));
    }
  }
}

export function OverviewRowView({ model }: { model: ReturnType<typeof useOverviewRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, icon, colors, label, tone, value } = model.props;
      return ((
    <View style={styles.overviewRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={[styles.overviewValue, tone ? { color: tone } : null]}>
        {value}
      </Text>
    </View>
  ));
    }
  }
}

export function HealthRowView({ model }: { model: ReturnType<typeof useHealthRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, tone, label, value } = model.props;
      return ((
    <View style={styles.healthRow}>
      <View style={[styles.healthRing, { borderColor: tone }]} />
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.healthValue}>{value}</Text>
    </View>
  ));
    }
  }
}
