import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useLoginScreenPresentation } from "../../../../screens/auth/LoginScreen";

export function LoginScreenView({ model }: { model: ReturnType<typeof useLoginScreenPresentation> }) {
  const { navigation, canGoBack, control, errors, passwordVisible, setPasswordVisible, colors, loginMutation, submit } = model.props;
  return <Screen scroll keyboard noPadding reference={false} contentContainerStyle={styles.page}>
    <View style={styles.brandRow}>
      {canGoBack ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}><Ionicons name="chevron-back" size={24} color={colors.ink} /></Pressable> : null}
      <Ionicons name="pulse" size={24} color={colors.primary} />
      <Text style={[styles.brand, { color: colors.ink }]}>PulseFit</Text>
    </View>
    <View style={styles.intro}><Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>Welcome back</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Sign in to your gym workspace.</Text></View>
    <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Controller control={control} name="email" render={({ field: { onBlur, onChange, value } }) => <FormTextField label="Email" accessibilityLabel="Email, required" autoComplete="email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" leftIcon="mail-outline" placeholder="you@example.com" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />} />
      <Controller control={control} name="password" render={({ field: { onBlur, onChange, value } }) => <FormTextField label="Password" accessibilityLabel="Password, required" autoComplete="password" leftIcon="lock-closed-outline" placeholder="Your password" maxLength={72} secureTextEntry={!passwordVisible} onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} right={<Pressable accessibilityRole="button" accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setPasswordVisible(value => !value)} style={styles.iconButton}><Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} /></Pressable>} />} />
      <NoticeBanner message={loginMutation.error ? getApiErrorMessage(loginMutation.error) : null} tone="error" />
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("AccountRecovery")} style={styles.linkButton}><Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text></Pressable>
      <PrimaryButton title="Sign in" loading={loginMutation.isPending} onPress={submit} />
    </View>
    <Pressable accessibilityRole="button" onPress={() => navigation.navigate("SignUp")} style={styles.footer}><Text style={[styles.footerText, { color: colors.muted }]}>New to PulseFit? <Text style={[styles.link, { color: colors.primary }]}>Create account</Text></Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, maxWidth: 480, alignSelf: "center", width: "100%", gap: 24, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  brand: { fontSize: 20, fontWeight: "600", letterSpacing: -0.4 },
  intro: { alignItems: "flex-start", gap: 8, paddingTop: 20, paddingBottom: 4 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: "700", letterSpacing: -0.8 },
  subtitle: { fontSize: 17, lineHeight: 24 },
  form: { gap: 16, padding: 20, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  iconButton: { minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" },
  linkButton: { minHeight: controlMetrics.minimumTouchSize, justifyContent: "center", alignSelf: "flex-end" },
  link: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  footerText: { fontSize: 15, lineHeight: 24, textAlign: "center" },
  footer: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
});
