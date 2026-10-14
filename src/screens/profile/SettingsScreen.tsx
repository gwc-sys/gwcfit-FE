import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { InfoRow } from "../../components/InfoRow";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useChangePassword, useLogout } from "../../hooks/useAuthActions";
import type { RootStackParamList } from "../../navigation/types";
import { getApiErrorMessage } from "../../services/api/client";
import { useFitnessStore } from "../../store/useFitnessStore";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { ChangePasswordPayload } from "../../types/saas";
import { changePasswordSchema } from "../../validation/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: () => void;
};

function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.surfaceStrong }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const settings = useFitnessStore((state) => state.settings);
  const toggleSetting = useFitnessStore((state) => state.toggleSetting);
  const changePasswordMutation = useChangePassword();
  const logoutMutation = useLogout();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<ChangePasswordPayload>({
    defaultValues: {
      old_password: "",
      new_password: ""
    }
  });

  const submitPasswordChange = handleSubmit((values) => {
    const parsed = changePasswordSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name === "old_password" || name === "new_password") {
          setError(name, { message: issue.message });
        }
      }
      return;
    }

    changePasswordMutation.mutate(parsed.data, {
      onSuccess: () => reset({ old_password: "", new_password: "" })
    });
  });

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <AppHeader title="Settings" onBack={() => navigation.goBack()} />

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.card}>
        <ToggleRow label="Notifications" value={settings.notifications} onValueChange={() => toggleSetting("notifications")} />
        <ToggleRow label="Haptic feedback" value={settings.haptics} onValueChange={() => toggleSetting("haptics")} />
        <ToggleRow label="Metric units" value={settings.metricUnits} onValueChange={() => toggleSetting("metricUnits")} />
        <ToggleRow label="Meal reminders" value={settings.mealReminders} onValueChange={() => toggleSetting("mealReminders")} />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <InfoRow icon="shield-checkmark-outline" label="Privacy & Policy" value="Updated" onPress={() => undefined} />
        <InfoRow icon="card-outline" label="Subscription" value="Starter" onPress={() => undefined} />
        <InfoRow icon="cloud-upload-outline" label="Connect AI API" value="Ready" onPress={() => undefined} />
      </View>

      <Text style={styles.sectionTitle}>Security</Text>
      <View style={styles.securityCard}>
        <PasswordField control={control} error={errors.old_password?.message} label="Old password" name="old_password" />
        <PasswordField control={control} error={errors.new_password?.message} label="New password" name="new_password" />
        {changePasswordMutation.error ? <Text style={styles.error}>{getApiErrorMessage(changePasswordMutation.error)}</Text> : null}
        {changePasswordMutation.data ? <Text style={styles.success}>{changePasswordMutation.data.message}</Text> : null}
        <PrimaryButton loading={changePasswordMutation.isPending} onPress={submitPasswordChange} title="Change Password" />
        <PrimaryButton loading={logoutMutation.isPending} onPress={() => logoutMutation.mutate()} title="Logout" variant="secondary" />
      </View>

      <View style={styles.apiBox}>
        <Text style={styles.apiTitle}>OpenAI Integration Slot</Text>
        <Text style={styles.apiText}>
          The dummy planner is isolated in src/services/aiPlanner.ts, so a secure backend endpoint can replace it without changing screens.
        </Text>
      </View>
    </Screen>
  );
}

type PasswordFieldProps = {
  control: ReturnType<typeof useForm<ChangePasswordPayload>>["control"];
  name: keyof ChangePasswordPayload;
  label: string;
  error?: string;
};

function PasswordField({ control, name, label, error }: PasswordFieldProps) {
  return (
    <View style={styles.passwordField}>
      <Text style={styles.passwordLabel}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            maxLength={72}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={label}
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[styles.passwordInput, error && styles.passwordInputError]}
            value={value}
          />
        )}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white
  },
  securityCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white
  },
  passwordField: {
    gap: spacing.xs
  },
  passwordLabel: {
    ...typography.small,
    color: colors.ink
  },
  passwordInput: {
    minHeight: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    backgroundColor: colors.white,
    ...typography.body
  },
  passwordInputError: {
    borderColor: colors.danger
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  success: {
    ...typography.small,
    color: colors.primaryDark
  },
  toggleRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  toggleLabel: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "700"
  },
  apiBox: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink
  },
  apiTitle: {
    ...typography.h3,
    color: colors.white
  },
  apiText: {
    ...typography.body,
    color: "rgba(255,255,255,0.68)",
    marginTop: spacing.sm
  }
});
