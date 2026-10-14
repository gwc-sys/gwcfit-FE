import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useInvitationSignUpScreenPresentation } from "../../../../screens/auth/InvitationSignUpScreen";

export function InvitationSignUpScreenView({ model }: { model: ReturnType<typeof useInvitationSignUpScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, navigation, colors, token, updateToken, invite, validation, roleLabels, gymName, setGymName, fullName, setFullName, email, setEmail, password, setPassword, passwordVisible, setPasswordVisible, formError, registration } = model.props;
      return ((
    <Screen scroll keyboard>
      <View style={styles.container}>
        <AppHeader title="Create account" subtitle="Invitation-only access" onBack={() => navigation.goBack()} />
        <View style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.icon}><Ionicons name="ticket-outline" size={24} color={colors.primary} /></View>
            <View style={styles.headingCopy}>
              <Text style={styles.title}>Use your invitation</Text>
              <Text style={styles.subtitle}>Your invitation securely assigns your gym and role. You cannot select them manually.</Text>
            </View>
          </View>
          <FormTextField
            label="Invitation token"
            value={token}
            onChangeText={updateToken}
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="key-outline"
            required
          />
          <PrimaryButton
            title={invite ? "Invitation verified" : "Verify invitation"}
            icon={invite ? "checkmark-circle-outline" : "shield-checkmark-outline"}
            variant={invite ? "secondary" : "primary"}
            loading={validation.isPending}
            disabled={token.trim().length < 20 || Boolean(invite)}
            onPress={() => validation.mutate(token)}
          />
          <NoticeBanner message={validation.error ? getApiErrorMessage(validation.error) : null} tone="error" />

          {invite ? (
            <View style={styles.form}>
              <View style={styles.assignment}>
                <Text style={styles.assignmentLabel}>ASSIGNED ACCESS</Text>
                <Text style={styles.assignmentValue}>{roleLabels[invite.role]}{invite.gym_name ? ` · ${invite.gym_name}` : " · New gym"}</Text>
                <Text style={styles.expiry}>Expires {new Date(invite.expires_at).toLocaleString()}</Text>
              </View>
              {invite.role === "gym_owner" ? (
                <FormTextField label="Gym name" value={gymName} onChangeText={setGymName} leftIcon="business-outline" required />
              ) : null}
              <FormTextField label="Full name" value={fullName} onChangeText={setFullName} leftIcon="person-outline" required />
              <FormTextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                editable={!invite.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                helper={invite.email ? "This invitation is restricted to this email." : undefined}
                required
              />
              <FormTextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                maxLength={72}
                leftIcon="lock-closed-outline"
                required
                right={
                  <Pressable accessibilityRole="button" onPress={() => setPasswordVisible((value) => !value)} accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={21} color={colors.muted} />
                  </Pressable>
                }
              />
              <NoticeBanner message={formError} tone="error" />
              <PrimaryButton title="Create account" icon="person-add-outline" loading={registration.isPending} onPress={() => registration.mutate()} />
            </View>
          ) : null}
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")}><Text style={styles.signIn}>Already registered? Sign in</Text></Pressable>
      </View>
    </Screen>
  ));
    }
  }
}
