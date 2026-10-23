import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import type { useMemberSettingsScreenPresentation } from "../../../../screens/member/MemberFeatureScreens";
import { useAppTheme } from "../../../../theme/AppThemeProvider";
import { getApiErrorMessage } from "../../../../services/api/client";
import { changePasswordSchema } from "../../../../validation/auth";
import { requestLogoutConfirmation } from "../../../../utils/logoutConfirmation";
import { Pressable } from "../../components/NativePressable";
import { Screen } from "../../components/Screen";

type Props = { model: ReturnType<typeof useMemberSettingsScreenPresentation> };

export function MemberSettingsView({ model }: Props) {
  const { isDark } = useAppTheme();
  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const p = model.props;
  const tint = isDark ? "#0A84FF" : "#007AFF";
  const ink = isDark ? "#F5F5F7" : "#1C1C1E";
  const muted = isDark ? "#A1A1A8" : "#6C6C70";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const separator = isDark ? "#38383A" : "#E5E5EA";
  const group = [s.group, { backgroundColor: surface }];
  const label = [s.label, { color: ink }];
  const footer = [s.footer, { color: muted }];

  const row = (icon: keyof typeof Ionicons.glyphMap, color: string, title: string, trailing: ReactNode, onPress?: () => void, last = false) => {
    const content = <>
      <View style={[s.icon, { backgroundColor: color }]}><Ionicons name={icon} size={19} color="#FFFFFF" /></View>
      <View style={[s.rowBody, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separator }]}>
        <Text style={[label, s.grow]}>{title}</Text>{trailing}
      </View>
    </>;
    return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.55 }]}>{content}</Pressable> : <View style={s.row}>{content}</View>;
  };

  const submit = () => {
    const parsed = changePasswordSchema.safeParse({ old_password: p.oldPassword, new_password: p.newPassword });
    const message = !p.oldPassword ? "Enter your current password." : !parsed.success ? parsed.error.issues[0]?.message : p.oldPassword === p.newPassword ? "Choose a different new password." : undefined;
    setError(message);
    if (!message && !p.changePassword.isPending) p.submitPassword();
  };

  return <Screen scroll keyboard noPadding reference={false} style={{ backgroundColor: isDark ? "#000000" : "#F2F2F7" }} contentContainerStyle={s.screen}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => p.navigation.canGoBack() ? p.navigation.goBack() : p.navigation.navigate("AppTabs", { screen: "MemberHome" })} style={s.back}>
      <Ionicons name="chevron-back" size={26} color={tint} /><Text style={[s.backLabel, { color: tint }]}>Back</Text>
    </Pressable>
    <Text accessibilityRole="header" style={[s.title, { color: ink }]}>Settings</Text>
    <Text style={[s.subtitle, { color: muted }]}>Make PulseFit your own.</Text>

    <Text accessibilityRole="header" style={[s.section, { color: muted }]}>PREFERENCES</Text>
    <View style={group}>
      {row("notifications", "#FF453A", "Notifications", <Ionicons name="chevron-forward" size={18} color={muted} />, () => p.navigation.navigate("MemberNotifications"))}
      {row("moon", "#5856D6", "Dark mode", <Switch accessibilityLabel="Dark mode" value={p.isDark} onValueChange={enabled => p.setColorScheme(enabled ? "dark" : "light")} trackColor={{ true: "#34C759", false: separator }} thumbColor="#FFFFFF" ios_backgroundColor={separator} />)}
      {row("language", "#007AFF", "Language", <Text style={[s.value, { color: muted }]}>English</Text>, undefined, true)}
    </View>
    <Text style={footer}>Read gym updates in Notifications. Appearance applies only to this app.</Text>

    <Text accessibilityRole="header" style={[s.section, { color: muted }]}>SECURITY</Text>
    <View style={group}>
      <View style={[s.passwordRow, { borderBottomColor: separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <Ionicons name="lock-closed-outline" size={20} color={muted} />
        <TextInput accessibilityLabel="Old password" placeholder="Enter your old password" placeholderTextColor={muted} autoCapitalize="none" autoCorrect={false} autoComplete="off" importantForAutofill="no" secureTextEntry={!showPassword} value={p.oldPassword} onChangeText={p.setOldPassword} style={[s.input, { color: ink }]} />
      </View>
      <View style={s.passwordRow}>
        <Ionicons name="key-outline" size={20} color={muted} />
        <TextInput accessibilityLabel="New password" placeholder="New password" placeholderTextColor={muted} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" secureTextEntry={!showPassword} value={p.newPassword} onChangeText={p.setNewPassword} style={[s.input, { color: ink }]} />
      </View>
    </View>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: showPassword }} onPress={() => setShowPassword(!showPassword)} style={s.reveal}>
      <Ionicons name={showPassword ? "checkbox" : "square-outline"} size={20} color={tint} /><Text style={[s.small, { color: muted }]}>Show passwords</Text>
    </Pressable>
    {error || p.changePassword.error ? <Text accessibilityRole="alert" style={[s.footer, { color: isDark ? "#FF6961" : "#C9342A" }]}>{error ?? getApiErrorMessage(p.changePassword.error)}</Text> : null}
    {p.changePassword.data && !p.changePassword.error ? <Text accessibilityLiveRegion="polite" style={[s.footer, { color: isDark ? "#30D158" : "#248A3D" }]}>{p.changePassword.data.message}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: p.changePassword.isPending, busy: p.changePassword.isPending }} disabled={p.changePassword.isPending} onPress={submit} style={({ pressed }) => [s.primary, { backgroundColor: tint, opacity: pressed || p.changePassword.isPending ? 0.65 : 1 }]}>
      {p.changePassword.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryLabel}>Change password</Text>}
    </Pressable>

    <Text accessibilityRole="header" style={[s.section, { color: muted }]}>DEVICES</Text>
    <View style={group}>{row("watch", "#636366", "Connected devices", <Text style={[s.value, { color: muted }]}>Unavailable</Text>, undefined, true)}</View>
    <Text style={footer}>Device connections are not supported yet.</Text>

    <View style={[group, s.account]}>
      {row("speedometer", "#007AFF", "Dashboard", <Ionicons name="chevron-forward" size={18} color={muted} />, () => p.navigation.navigate("AppTabs", { screen: "MemberHome" }), true)}
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: p.logout.isPending, busy: p.logout.isPending }} disabled={p.logout.isPending} onPress={() => requestLogoutConfirmation(() => p.logout.mutate())} style={({ pressed }) => [group, s.logout, { opacity: pressed ? 0.55 : 1 }]}>
      {p.logout.isPending ? <ActivityIndicator color="#FF453A" /> : <Text style={[s.label, { color: isDark ? "#FF453A" : "#D70015" }]}>Sign out</Text>}
    </Pressable>
  </Screen>;
}

const s = StyleSheet.create({
  screen: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 36, width: "100%", maxWidth: 600, alignSelf: "center" },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginLeft: -8, gap: 2 },
  backLabel: { fontSize: 17 },
  title: { fontSize: 34, fontWeight: "700", letterSpacing: 0.35, marginTop: 6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 4, marginBottom: 6 },
  section: { fontSize: 13, fontWeight: "500", letterSpacing: 0.6, marginTop: 26, marginBottom: 8, marginLeft: 16 },
  group: { borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingLeft: 16, gap: 12, minHeight: 54 },
  icon: { width: 30, height: 30, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, minWidth: 0, minHeight: 54, paddingVertical: 10, paddingRight: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 17, lineHeight: 23 },
  grow: { flex: 1 },
  value: { fontSize: 15, flexShrink: 1, textAlign: "right" },
  footer: { fontSize: 13, lineHeight: 18, marginHorizontal: 16, marginTop: 8 },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 12, marginLeft: 16, paddingRight: 16 },
  input: { flex: 1, minWidth: 0, minHeight: 54, paddingVertical: 14, fontSize: 17 },
  reveal: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 4 },
  small: { fontSize: 14 },
  primary: { minHeight: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 14, marginTop: 4 },
  primaryLabel: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  account: { marginTop: 24 },
  logout: { alignItems: "center", justifyContent: "center", minHeight: 52, padding: 14, marginTop: 12 }
});
