import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useLoginScreenPresentation } from "../../../../screens/auth/LoginScreen";

export function LoginScreenView({ model }: { model: ReturnType<typeof useLoginScreenPresentation> }) {
  const { navigation, canGoBack, control, errors, passwordVisible, setPasswordVisible, colors, loginMutation, submit } = model.props;
  return <Screen scroll keyboard contentContainerStyle={styles.page}>
    <AppHeader title="PulseFit" subtitle="Your gym, connected" onBack={canGoBack ? () => navigation.goBack() : undefined} />
    <View style={styles.intro}><View style={[styles.mark, { backgroundColor: colors.primarySoft }]}><Ionicons name="pulse" size={36} color={colors.primary} /></View><Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>Welcome back</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to your gym workspace.</Text></View>
    <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Controller control={control} name="email" render={({ field: { onBlur, onChange, value } }) => <FormTextField label="Email" autoComplete="email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" leftIcon="mail-outline" placeholder="you@example.com" required onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />} />
      <Controller control={control} name="password" render={({ field: { onBlur, onChange, value } }) => <FormTextField label="Password" autoComplete="password" leftIcon="lock-closed-outline" placeholder="Your password" required maxLength={72} secureTextEntry={!passwordVisible} onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} right={<Pressable accessibilityRole="button" accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setPasswordVisible(value => !value)} style={styles.iconButton}><Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} /></Pressable>} />} />
      <NoticeBanner message={loginMutation.error ? getApiErrorMessage(loginMutation.error) : null} tone="error" />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("AccountRecovery")} style={styles.linkButton}><Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text></Pressable>
      <PrimaryButton title="Sign In" icon="log-in-outline" loading={loginMutation.isPending} onPress={submit} />
    </View>
    <Pressable accessibilityRole="button" onPress={() => navigation.navigate("SignUp")} style={styles.footer}><Text style={{ color: colors.muted }}>New to PulseFit? <Text style={[styles.link, { color: colors.primary }]}>Create account</Text></Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { maxWidth: 580, alignSelf: "center", width: "100%", gap: 24, paddingBottom: 32 },
  intro: { alignItems: "flex-start", gap: 10, paddingTop: 32, paddingBottom: 16 },
  mark: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 36, lineHeight: 43, fontWeight: "700", letterSpacing: -1 },
  subtitle: { fontSize: 17, lineHeight: 25, textAlign: "left" },
  form: { gap: 24, padding: 20, borderRadius: 24, borderWidth: 0 },
  iconButton: { minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" },
  linkButton: { minHeight: controlMetrics.minimumTouchSize, justifyContent: "center", alignSelf: "flex-end" },
  link: { fontSize: 17, fontWeight: "600" },
  footer: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
});
