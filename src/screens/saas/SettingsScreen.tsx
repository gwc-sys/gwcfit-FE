import type * as React from "react";
import { SettingsScreenView, GymOwnerSettingsScreenView, OwnerSettingsHubView, SuperAdminSettingsHubView, SettingsOptionGridView, SettingsOptionView, SettingsLinkView, GymOwnerSettingsDashboardView, LegacySuperAdminSettingsHubView, SidePanelView, OverviewRowView, HealthRowView } from "./SettingsScreen.presentation";
import { createSimpleSettingsStyles, createClubSettingsStyles, createOwnerDashboardStyles, createOwnerStyles, createHubStyles } from "./SettingsScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";

import { authApi } from "../../services/api/auth";
import { gymsApi } from "../../services/api/operations";
import { notificationsApi } from "../../services/api/notifications";
import { membershipCheckoutApi } from "../../services/api/membershipCheckout";
import { platformPlansApi } from "../../services/api/platformPlans";
import { queryClient } from "../../services/queryClient";

import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfacePanel } from "../../components/SurfacePanel";
import { PulseDashboardLayout } from "../../components/dashboard/PulseDashboardLayout";
import { MyGymPanel } from "../../features/operations/GymPanels";
import { useChangePassword, useLogout } from "../../hooks/useAuthActions";
import { useMyGym, useUpdateMyGym } from "../../hooks/useOperations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { ChangePasswordPayload } from "../../types/saas";
import { requestLogoutConfirmation } from "../../utils/logoutConfirmation";
import { changePasswordSchema } from "../../validation/auth";

export function useSettingsScreenPresentation() {
  const navigation = useNavigation<any>();
  return { kind: "view1" as const, props: { SuperAdminSettingsHub, navigation } };
}

export function SettingsScreen(...args: Parameters<typeof useSettingsScreenPresentation>): React.JSX.Element {
  return <SettingsScreenView model={useSettingsScreenPresentation(...args)} />;
}

export function useGymOwnerSettingsScreenPresentation() {
  return { kind: "view1" as const, props: { OwnerSettingsHub } };
  /*
  const { isDark, colors, setColorScheme } = useAppTheme();
  const styles = useMemo(() => createOwnerStyles(colors), [colors]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const changePassword = useChangePassword();
  const logout = useLogout();
  const { control, handleSubmit, reset, setError, formState: { errors } } =
    useForm<ChangePasswordPayload>({ defaultValues: { old_password: "", new_password: "" } });

  const submitPasswordChange = handleSubmit((values) => {
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name === "old_password" || name === "new_password") setError(name, { message: issue.message });
      }
      return;
    }
    changePassword.mutate(parsed.data, { onSuccess: () => reset({ old_password: "", new_password: "" }) });
  });

  return (
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <ScreenHeader title="Settings" subtitle="Account and workspace" onBack={() => navigation.goBack()} />
      <SurfacePanel title="Preferences" kicker="Theme" icon="options-outline">
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Appearance</Text>
            <Text style={styles.settingText}>{isDark ? "Dark mode is on." : "Light mode is on."}</Text>
          </View>
          <Switch value={isDark} onValueChange={(enabled) => setColorScheme(enabled ? "dark" : "light")} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} ios_backgroundColor={colors.surfaceStrong} />
        </View>
      </SurfacePanel>
      {hasPermission("configure_gym") ? <MyGymPanel /> : null}
      <SurfacePanel title="Security" kicker="Password" icon="lock-closed-outline">
        <Controller control={control} name="old_password" render={({ field: { onBlur, onChange, value } }) => <FormTextField error={errors.old_password?.message} label="Old password" leftIcon="lock-open-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="Current password" secureTextEntry value={value} />} />
        <Controller control={control} name="new_password" render={({ field: { onBlur, onChange, value } }) => <FormTextField error={errors.new_password?.message} label="New password" leftIcon="lock-closed-outline" maxLength={72} onBlur={onBlur} onChangeText={onChange} placeholder="At least 8 characters" secureTextEntry value={value} />} />
        <NoticeBanner message={changePassword.error ? getApiErrorMessage(changePassword.error) : null} tone="error" />
        <NoticeBanner message={changePassword.data?.message ?? null} />
        <PrimaryButton title="Change Password" icon="key-outline" loading={changePassword.isPending} onPress={submitPasswordChange} />
      </SurfacePanel>
      <SurfacePanel title="Session" kicker="Device" icon="phone-portrait-outline">
        <View style={styles.sessionRow}><View style={styles.sessionIcon}><Ionicons name="shield-checkmark-outline" size={22} color={colors.primaryDark} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>Token storage</Text><Text style={styles.settingText}>Native sessions use encrypted device storage.</Text></View></View>
        <PrimaryButton title="Logout" icon="log-out-outline" variant="danger" loading={logout.isPending} onPress={() => requestLogoutConfirmation(() => logout.mutate())} />
      </SurfacePanel>
    </Screen>
  );
  */
}

export function GymOwnerSettingsScreen(...args: Parameters<typeof useGymOwnerSettingsScreenPresentation>): React.JSX.Element {
  return <GymOwnerSettingsScreenView model={useGymOwnerSettingsScreenPresentation(...args)} />;
}

export function useOwnerSettingsHubPresentation() {
  const navigation = useNavigation<any>();
  let route: any = null;
  try {
    route = useRoute<any>();
  } catch {
    route = null;
  }
  const { colors, isDark, setColorScheme, themeMode, setThemeMode } = useAppTheme();
  const styles = useMemo(() => createSimpleSettingsStyles(colors), [colors]);
  const clubStyles = useMemo(() => createClubSettingsStyles(colors), [colors]);
  const logout = useLogout();
  const changePassword = useChangePassword();
  const user = useAuthStore((state) => state.user);

  // Queries
  const gymQuery = useMyGym();
  const subscriptionQuery = useQuery({
    queryKey: ["owner", "subscription"],
    queryFn: gymsApi.getSubscription,
    enabled: Boolean(user?.gym_id),
  });
  const securityEventsQuery = useQuery({
    queryKey: ["owner", "security-events"],
    queryFn: authApi.getSecurityEvents,
  });
  const ticketsQuery = useQuery({
    queryKey: ["owner", "support-tickets"],
    queryFn: gymsApi.getSupportTickets,
    enabled: Boolean(user?.gym_id),
  });
  const notificationPrefsQuery = useQuery({
    queryKey: ["owner", "notification-preferences"],
    queryFn: notificationsApi.getPreferences,
  });
  const checkoutSettingsQuery = useQuery({
    queryKey: ["owner", "checkout-settings"],
    queryFn: membershipCheckoutApi.settings,
    enabled: Boolean(user?.gym_id),
  });
  const publicPlansQuery = useQuery({
    queryKey: ["platform-plans", "public"],
    queryFn: platformPlansApi.listPublic,
  });

  // Mutations
  const updateGymMutation = useUpdateMyGym();
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      useAuthStore.setState({ user: updatedUser });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
  const confirmContactMutation = useMutation({
    mutationFn: authApi.confirmPendingContact,
    onSuccess: (updatedUser) => {
      useAuthStore.setState({ user: updatedUser });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
  const verifyStepUpMutation = useMutation({
    mutationFn: authApi.verifyStepUp,
  });
  const revokeSessionsMutation = useMutation({
    mutationFn: authApi.revokeOtherSessions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "security-events"] });
    },
  });
  const updateNotificationPrefMutation = useMutation({
    mutationFn: notificationsApi.updatePreference,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "notification-preferences"] });
    },
  });
  const saveCheckoutSettingsMutation = useMutation({
    mutationFn: membershipCheckoutApi.saveSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "checkout-settings"] });
    },
  });
  const uploadQrMutation = useMutation({
    mutationFn: membershipCheckoutApi.uploadQr,
  });
  const createTicketMutation = useMutation({
    mutationFn: gymsApi.createSupportTicket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "support-tickets"] });
    },
  });
  const requestDeletionMutation = useMutation({
    mutationFn: gymsApi.requestDeletion,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gyms", "me"] });
    },
  });

  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<ChangePasswordPayload>({
    defaultValues: { old_password: "", new_password: "" }
  });
  const submitPasswordChange = handleSubmit((values) => {
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field === "old_password" || field === "new_password") setError(field, { message: issue.message });
      }
      return;
    }
    changePassword.mutate(parsed.data, { onSuccess: () => reset({ old_password: "", new_password: "" }) });
  });

  return {
    kind: "view1" as const,
    props: {
      styles,
      clubStyles,
      navigation,
      route,
      isDark,
      setColorScheme,
      themeMode,
      setThemeMode,
      colors,
      control,
      errors,
      changePassword,
      submitPasswordChange,
      logout,
      user,
      gymQuery,
      updateGymMutation,
      subscriptionQuery,
      securityEventsQuery,
      ticketsQuery,
      notificationPrefsQuery,
      checkoutSettingsQuery,
      publicPlansQuery,
      updateProfileMutation,
      confirmContactMutation,
      verifyStepUpMutation,
      revokeSessionsMutation,
      updateNotificationPrefMutation,
      saveCheckoutSettingsMutation,
      uploadQrMutation,
      createTicketMutation,
      requestDeletionMutation,
    }
  };
}

function OwnerSettingsHub(...args: Parameters<typeof useOwnerSettingsHubPresentation>): React.JSX.Element {
  return <OwnerSettingsHubView model={useOwnerSettingsHubPresentation(...args)} />;
}

export function useSuperAdminSettingsHubPresentation({
  onNavigate,
}: {
  onNavigate: (route: string, params?: object) => void;
}) {
  const { colors, isDark, setColorScheme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const styles = useMemo(() => createSimpleSettingsStyles(colors), [colors]);
  const logout = useLogout();
  const changePassword = useChangePassword();
  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<ChangePasswordPayload>({
    defaultValues: { old_password: "", new_password: "" }
  });
  const submitPasswordChange = handleSubmit((values) => {
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field === "old_password" || field === "new_password") setError(field, { message: issue.message });
      }
      return;
    }
    changePassword.mutate(parsed.data, { onSuccess: () => reset({ old_password: "", new_password: "" }) });
  });

  return { kind: "view1" as const, props: { styles, SettingsOptionGrid, onNavigate, isDark, setColorScheme, colors, user, control, errors, changePassword, submitPasswordChange, SettingsLink, logout } };
}

function SuperAdminSettingsHub(...args: Parameters<typeof useSuperAdminSettingsHubPresentation>): React.JSX.Element {
  return <SuperAdminSettingsHubView model={useSuperAdminSettingsHubPresentation(...args)} />;
}

/* Removed from the Settings UI: public pricing is codebase-managed. function PlatformPlanEditor({ plan, styles, colors, onSaved }: { plan: PlatformPlan; styles: ReturnType<typeof createSimpleSettingsStyles>; colors: ThemeColors; onSaved: () => void }) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [price, setPrice] = useState(plan.price_cents == null ? "" : String(plan.price_cents / 100));
  const [currency, setCurrency] = useState(plan.currency);
  const [billingPeriod, setBillingPeriod] = useState(plan.billing_period ?? "month");
  const [memberLimit, setMemberLimit] = useState(plan.member_limit);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [ctaLabel, setCtaLabel] = useState(plan.cta_label);
  const [trialDays, setTrialDays] = useState(String(plan.trial_days));
  const [displayOrder, setDisplayOrder] = useState(String(plan.display_order));
  const [isPopular, setIsPopular] = useState(plan.is_popular);
  const [isActive, setIsActive] = useState(plan.is_active);
  const mutation = useMutation({
    mutationFn: () => platformPlansApi.update(plan.id, {
      name: name.trim(), description: description.trim(), price_cents: price.trim() ? Math.round(Number(price) * 100) : null,
      currency: currency.trim().toUpperCase(), billing_period: billingPeriod.trim() || null, member_limit: memberLimit.trim(),
      features: features.split("\n").map((item) => item.trim()).filter(Boolean), cta_label: ctaLabel.trim(), trial_days: Math.max(0, Math.round(Number(trialDays) || 0)),
      display_order: Math.max(0, Math.round(Number(displayOrder) || 0)), is_popular: isPopular, is_active: isActive,
    }),
    onSuccess: onSaved,
  });
  const field = (label: string, value: string, setter: (next: string) => void, numeric = false) => <View style={styles.controlField} key={label}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={setter} keyboardType={numeric ? "numeric" : "default"} multiline={label === "Description" || label.startsWith("Features")} style={[styles.controlInput, (label === "Description" || label.startsWith("Features")) && styles.controlInputMultiline]} placeholderTextColor={colors.textMuted} /></View>;
  return (
    <View style={styles.planEditor}>
      <View style={styles.planEditorHeader}><View><Text style={styles.planSlug}>{plan.slug}</Text><Text style={styles.planEditorTitle}>{plan.name}</Text></View><Text style={styles.planStatus}>{isActive ? "Public" : "Hidden"}</Text></View>
      {field("Plan name", name, setName)}
      {field("Description", description, setDescription)}
      <View style={styles.controlGrid}>{field("Price (₹)", price, setPrice, true)}{field("Currency", currency, setCurrency)}{field("Billing period", billingPeriod, setBillingPeriod)}{field("Display order", displayOrder, setDisplayOrder, true)}{field("Member limit", memberLimit, setMemberLimit)}{field("Button label", ctaLabel, setCtaLabel)}{field("Free trial days", trialDays, setTrialDays, true)}</View>
      {field("Features (one per line)", features, setFeatures)}
      <View style={styles.switchRow}><Text style={styles.settingTitle}>Show “Most popular” badge</Text><Switch value={isPopular} onValueChange={setIsPopular} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} /></View>
      <View style={styles.switchRow}><Text style={styles.settingTitle}>Show plan in public pricing</Text><Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: colors.primary, false: colors.surfaceStrong }} thumbColor={colors.white} /></View>
      {mutation.error ? <Text style={styles.errorText}>{getApiErrorMessage(mutation.error)}</Text> : null}
      <PrimaryButton title={mutation.isPending ? "Saving..." : "Save plan"} icon="save-outline" loading={mutation.isPending} onPress={() => mutation.mutate()} />
    </View>
  );
}
*/

export function useSettingsOptionGridPresentation({ onNavigate, isDark, onToggleTheme, subscriptionRoute }: { onNavigate: (route: string) => void; isDark: boolean; onToggleTheme: (enabled: boolean) => void; subscriptionRoute: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createSimpleSettingsStyles(colors), [colors]);
  return { kind: "view1" as const, props: { styles, SettingsOption, onNavigate, colors, subscriptionRoute, isDark, onToggleTheme } };
}

function SettingsOptionGrid(...args: Parameters<typeof useSettingsOptionGridPresentation>): React.JSX.Element {
  return <SettingsOptionGridView model={useSettingsOptionGridPresentation(...args)} />;
}

export function useSettingsOptionPresentation({ icon, title, description, onPress, colors, styles }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; onPress: () => void; colors: ThemeColors; styles: ReturnType<typeof createSimpleSettingsStyles> }) {
  return { kind: "view1" as const, props: { onPress, styles, icon, colors, title, description } };
}

function SettingsOption(...args: Parameters<typeof useSettingsOptionPresentation>): React.JSX.Element {
  return <SettingsOptionView model={useSettingsOptionPresentation(...args)} />;
}

export function useSettingsLinkPresentation({ icon, title, description, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createSimpleSettingsStyles(colors), [colors]);
  return { kind: "view1" as const, props: { styles, onPress, icon, colors, title, description } };
}

function SettingsLink(...args: Parameters<typeof useSettingsLinkPresentation>): React.JSX.Element {
  return <SettingsLinkView model={useSettingsLinkPresentation(...args)} />;
}



const ownerDashboardCards = [
  ["Gym Profile", "Update gym name, address, contact details and logo.", "business-outline", "#E91E63"],
  ["Business Information", "Manage business type, GST details and registration info.", "briefcase-outline", "#E91E63"],
  ["Working Hours", "Set gym opening and closing hours and working days.", "time-outline", "#34C759"],
  ["Subscription", "View and manage your current subscription plan.", "trophy-outline", "#007AFF"],
  ["Membership Settings", "Configure membership rules, expiry, freeze and auto renewal.", "person-outline", "#E91E63"],
  ["Attendance Settings", "Manage check-in/out rules, late mark and auto checkout.", "calendar-outline", "#E91E63"],
  ["Payment Methods", "Enable or disable payment methods and manage details.", "card-outline", "#34C759"],
  ["Receipt & Invoice", "Customize invoice, receipt, prefix and tax settings.", "document-text-outline", "#E91E63"],
  ["Notification Preferences", "Configure email, SMS and in-app notification settings.", "notifications-outline", "#007AFF"],
  ["Trainer Settings", "Set trainer commission, sessions and availability.", "person-circle-outline", "#E91E63"],
  ["Goal Settings", "Manage default goals for members and tracking rules.", "locate-outline", "#34C759"],
  ["Workout Settings", "Customize default workout categories and options.", "barbell-outline", "#E91E63"],
  ["Nutrition Settings", "Manage default diet plans, meals and nutrition goals.", "restaurant-outline", "#007AFF"],
  ["Document Settings", "Manage document types and upload requirements.", "folder-outline", "#E91E63"],
  ["QR Code Settings", "Configure QR for attendance check-in and check-out.", "qr-code-outline", "#34C759"],
  ["Data & Privacy", "Manage member data, privacy and data export.", "shield-checkmark-outline", "#E91E63"],
  ["Backup & Restore", "Backup gym data and restore if required.", "cloud-upload-outline", "#007AFF"],
  ["Delete Gym", "Permanently delete gym and all associated data.", "trash-outline", "#FF3B30"]
] as const;

const ownerDashboardNav = [["Dashboard", "grid-outline", "AppTabs"], ["Members", "people-outline", "MemberList"], ["Trainers", "people-circle-outline", "Trainers"], ["Receptionists", "person-outline", "Staff"], ["Attendance", "calendar-outline", "Attendance"], ["Workouts", "barbell-outline", "WorkoutPlans"], ["Nutrition", "restaurant-outline", "DietPlans"], ["Payments", "card-outline", "Payments"], ["Reports", "document-text-outline", "Reports"], ["Messages", "mail-outline", "Notifications"]] as const;

export function useGymOwnerSettingsDashboardPresentation({ onNavigate }: { onNavigate: (route: string, params?: object) => void }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createOwnerDashboardStyles(colors, width), [colors, width]);
  const user = useAuthStore((state) => state.user);
  const gymQuery = useMyGym();
  const updateGym = useUpdateMyGym();
  const [selectedCard, setSelectedCard] = useState<(typeof ownerDashboardCards)[number] | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "", address: "", timezone: "", value: "" });
  const [activeTab, setActiveTab] = useState("Gym Settings");
  const tabs = ["Gym Settings", "Staff Roles", "Membership Plans", "Notification Settings", "Payment Settings", "Custom Fields"];
  const openCard = (card: (typeof ownerDashboardCards)[number]) => {
    const key = card[0].toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    setSelectedCard(card);
    setDraft({ name: gymQuery.data?.name ?? "", email: gymQuery.data?.email ?? "", phone: gymQuery.data?.phone ?? "", address: gymQuery.data?.address ?? "", timezone: gymQuery.data?.timezone ?? "UTC", value: String(gymQuery.data?.settings?.[key] ?? "") });
  };
  const save = () => {
    if (!selectedCard) return;
    const title = selectedCard[0];
    if (title === "Gym Profile" || title === "Business Information") updateGym.mutate({ name: draft.name, email: draft.email || null, phone: draft.phone || null, address: draft.address || null, timezone: draft.timezone || "UTC" }, { onSuccess: () => setSelectedCard(null) });
    else {
      const key = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      updateGym.mutate({ settings: { ...(gymQuery.data?.settings ?? {}), [key]: draft.value } }, { onSuccess: () => setSelectedCard(null) });
    }
  };
  return { kind: "view1" as const, props: { styles, gymQuery, colors, ownerDashboardNav, onNavigate, tabs, setActiveTab, activeTab, user, ownerDashboardCards, openCard, selectedCard, setSelectedCard, draft, setDraft, updateGym, save } };
}

function GymOwnerSettingsDashboard(...args: Parameters<typeof useGymOwnerSettingsDashboardPresentation>): React.JSX.Element {
  return <GymOwnerSettingsDashboardView model={useGymOwnerSettingsDashboardPresentation(...args)} />;
}





const settingCards = [
  [
    "General Settings",
    "Application name, branding, timezone, language, currency and basic configuration.",
    "settings-outline",
    "#E91E63",
  ],
  [
    "Security Settings",
    "JWT, 2FA, rate limiting, IP whitelist, password policy and security configurations.",
    "shield-checkmark-outline",
    "#34C759",
  ],
  [
    "Role & Permission Settings",
    "Manage roles, permissions, custom roles and feature access control.",
    "people-outline",
    "#E91E63",
  ],
  [
    "Multi-Tenant Settings",
    "Tenant isolation, limits, branding, custom domains and default configurations.",
    "business-outline",
    "#007AFF",
  ],
  [
    "Database Settings",
    "Database connection, backup, optimization, migrations and performance.",
    "server-outline",
    "#E91E63",
  ],
  [
    "Cache Settings",
    "Redis status, cache configuration, expiration and queue management.",
    "layers-outline",
    "#007AFF",
  ],
  [
    "Storage Settings",
    "Local and cloud storage, file limits, compression and cleanup.",
    "cloud-outline",
    "#E91E63",
  ],
  [
    "Notification Settings",
    "Email, SMS, push, WhatsApp and in-app notification settings.",
    "notifications-outline",
    "#E91E63",
  ],
  [
    "Payment Settings",
    "Payment gateways, GST, invoices, refunds and subscription billing.",
    "card-outline",
    "#34C759",
  ],
  [
    "API Settings",
    "API keys, webhooks, rate limits, logs and API versioning.",
    "code-slash-outline",
    "#E91E63",
  ],
  [
    "AI Settings",
    "AI providers, models, usage limits, logs and cost monitoring.",
    "hardware-chip-outline",
    "#E91E63",
  ],
  [
    "QR Code Settings",
    "QR rotation, expiry, check-in/out rules and branding.",
    "qr-code-outline",
    "#007AFF",
  ],
  [
    "Attendance Settings",
    "Attendance rules, working hours, auto checkout and verification.",
    "calendar-outline",
    "#E91E63",
  ],
  [
    "Membership Settings",
    "Auto renewal, grace period, freeze, upgrade and discount rules.",
    "trophy-outline",
    "#E91E63",
  ],
  [
    "Email Settings",
    "SMTP configuration, templates, queue and delivery logs.",
    "mail-outline",
    "#34C759",
  ],
  [
    "Backup & Recovery",
    "Backups, restore, schedules and cloud backup management.",
    "cloud-upload-outline",
    "#E91E63",
  ],
  [
    "Logs & Monitoring",
    "System logs, error logs, audit logs and security monitoring.",
    "analytics-outline",
    "#FF3B30",
  ],
  [
    "Performance Settings",
    "System performance, resources usage and optimization.",
    "speedometer-outline",
    "#E91E63",
  ],
  [
    "Feature Management",
    "Enable/disable modules, feature flags and maintenance mode.",
    "flag-outline",
    "#E91E63",
  ],
  [
    "Integrations",
    "Third-party integrations and external service configurations.",
    "extension-puzzle-outline",
    "#34C759",
  ],
  [
    "Licensing",
    "License key, status, plan details and renewal configurations.",
    "ribbon-outline",
    "#007AFF",
  ],
  [
    "Analytics",
    "Users, revenue, growth, API usage and AI analytics.",
    "pie-chart-outline",
    "#E91E63",
  ],
  [
    "Maintenance",
    "System maintenance, cleanup, optimization and health check.",
    "construct-outline",
    "#E91E63",
  ],
  [
    "About System",
    "System information, versions, environment and license details.",
    "information-circle-outline",
    "#007AFF",
  ],
] as const;

export function useLegacySuperAdminSettingsHubPresentation({
  onNavigate,
}: {
  onNavigate: (route: string, params?: object) => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHubStyles(colors), [colors]);
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<
    (typeof settingCards)[number] | null
  >(null);
  const gyms = useQuery({
    queryKey: ["settings", "gyms"],
    queryFn: async () => ({ total: 0 }),
  });
  const users = useQuery({
    queryKey: ["settings", "users"],
    queryFn: async () => ({ total: 0 }),
  });
  const resources = useQuery({
    queryKey: ["settings", "resources"],
    queryFn: async () => ({ items: [] as Array<{ label: string; percentage: number }> }),
  });
  const activities = useQuery({
    queryKey: ["settings", "activities"],
    queryFn: async () => ({ items: [] as Array<{ title: string; occurred_at: string }> }),
  });
  const filteredCards = settingCards.filter(([name, description]) =>
    `${name} ${description}`
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  );

  return { kind: "view1" as const, props: { styles, colors, search, setSearch, filteredCards, setSelectedCard, settingCards, SidePanel, OverviewRow, users, gyms, resources, HealthRow, activities, selectedCard, onNavigate } };
}

function LegacySuperAdminSettingsHub(...args: Parameters<typeof useLegacySuperAdminSettingsHubPresentation>): React.JSX.Element {
  return <LegacySuperAdminSettingsHubView model={useLegacySuperAdminSettingsHubPresentation(...args)} />;
}

export function useSidePanelPresentation({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHubStyles(colors), [colors]);
  return { kind: "view1" as const, props: { styles, title, children } };
}

function SidePanel(...args: Parameters<typeof useSidePanelPresentation>): React.JSX.Element {
  return <SidePanelView model={useSidePanelPresentation(...args)} />;
}
export function useOverviewRowPresentation({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: string;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHubStyles(colors), [colors]);
  return { kind: "view1" as const, props: { styles, icon, colors, label, tone, value } };
}

function OverviewRow(...args: Parameters<typeof useOverviewRowPresentation>): React.JSX.Element {
  return <OverviewRowView model={useOverviewRowPresentation(...args)} />;
}
export function useHealthRowPresentation({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHubStyles(colors), [colors]);
  return { kind: "view1" as const, props: { styles, tone, label, value } };
}

function HealthRow(...args: Parameters<typeof useHealthRowPresentation>): React.JSX.Element {
  return <HealthRowView model={useHealthRowPresentation(...args)} />;
}


