import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Eye, Lock, Mail } from "../components/icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppScreen } from "../components/AppScreen";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import type { RootStackParamList } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("aaronramsdale@gmail.com");
  const [password, setPassword] = useState("strongpassword");

  return (
    <AppScreen keyboard>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}> 
          <Text style={[styles.badgeText, { color: colors.primaryDark }]}>Secure sign-in</Text>
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Continue your coaching flow with a calm, focused workspace.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.card }]}> 
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          left={<Mail color={colors.muted} size={22} />}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          left={<Lock color={colors.muted} size={22} />}
          right={<Eye color={colors.muted} size={24} />}
        />
        <Pressable style={styles.forgot}>
          <Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text>
        </Pressable>
        <PrimaryButton label="Sign in" onPress={() => navigation.replace("MainTabs")} />
      </View>

      <View style={styles.socialWrap}>
        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.or, { color: colors.muted }]}>or continue with</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>
        <PrimaryButton label="Continue with Google" variant="secondary" />
        <PrimaryButton label="Continue with Apple" variant="dark" />
      </View>

      <Pressable onPress={() => navigation.navigate("SignUp")} style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>New here? <Text style={[styles.link, { color: colors.primary }]}>Create account</Text></Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 40,
    gap: spacing.md
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill
  },
  badgeText: {
    ...typography.small,
    fontWeight: "800"
  },
  title: {
    ...typography.title
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 360
  },
  formCard: {
    marginTop: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    gap: spacing.md
  },
  forgot: {
    alignSelf: "flex-end"
  },
  link: {
    ...typography.body,
    fontWeight: "800"
  },
  socialWrap: {
    marginTop: spacing.xl,
    gap: spacing.md
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  divider: {
    flex: 1,
    height: 1
  },
  or: {
    ...typography.small,
    textAlign: "center"
  },
  footer: {
    marginTop: 56,
    alignItems: "center"
  },
  footerText: {
    ...typography.body,
    fontWeight: "700"
  }
});
