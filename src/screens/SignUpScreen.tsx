import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Eye, Lock, Mail, Phone, User } from "../components/icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppScreen } from "../components/AppScreen";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import type { RootStackParamList } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [name, setName] = useState("Aaron Ramsdale");
  const [phone, setPhone] = useState("(409) 487-1935");
  const [email, setEmail] = useState("aaronramsdale@gmail.com");
  const [password, setPassword] = useState("strongpassword");

  return (
    <AppScreen keyboard>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: colors.ink }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Start with one clear profile so every plan, reminder, and check-in feels personal.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.card }]}> 
        <TextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" left={<User color={colors.muted} size={22} />} />
        <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" left={<Phone color={colors.muted} size={22} />} />
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" left={<Mail color={colors.muted} size={22} />} />
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
        <PrimaryButton label="Create account" onPress={() => navigation.replace("MainTabs")} />
      </View>

      <Text style={[styles.terms, { color: colors.muted }]}>By registering you agree to <Text style={[styles.link, { color: colors.primary }]}>Terms & Conditions</Text> and <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>.</Text>
      <Pressable onPress={() => navigation.navigate("Login")} style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>Already have an account? <Text style={[styles.link, { color: colors.primary }]}>Sign in</Text></Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 40,
    gap: spacing.md
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
  terms: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.lg
  },
  link: {
    fontWeight: "800"
  },
  footer: {
    marginTop: 36,
    alignItems: "center"
  },
  footerText: {
    ...typography.body,
    fontWeight: "700"
  }
});
