import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useCreateGymAdmin } from "../../hooks/useRbac";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { GymAdminCreatePayload, GymAdminCreateResponse } from "../../types/saas";
import { gymAdminCreateSchema, type GymAdminCreateFormValues } from "../../validation/rbac";

export function CreateGymAdminPanel() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const createGymAdminMutation = useCreateGymAdmin();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GymAdminCreateFormValues, unknown, GymAdminCreatePayload>({
    resolver: zodResolver(gymAdminCreateSchema),
    defaultValues: {
      gym_name: "",
      gym_email: "",
      gym_phone: "",
      gym_address: "",
      gym_timezone: "UTC",
      admin_full_name: "",
      admin_email: "",
      admin_password: "",
      admin_phone: ""
    }
  });

  const created = createGymAdminMutation.data;
  const submit = handleSubmit((values) => {
    createGymAdminMutation.mutate(values, {
      onSuccess: () => {
        reset({
          gym_name: "",
          gym_email: "",
          gym_phone: "",
          gym_address: "",
          gym_timezone: "UTC",
          admin_full_name: "",
          admin_email: "",
          admin_password: "",
          admin_phone: ""
        });
      }
    });
  });

  return (
    <SurfacePanel kicker="Super Admin" title="Create Gym Admin" icon="shield-checkmark-outline">
      <View style={styles.badges}>
        <StatusBadge label="creates gym" tone="info" />
        <StatusBadge label="assigns owner" tone="success" />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Gym details</Text>
        <Field
          control={control}
          error={errors.gym_name?.message}
          label="Gym name"
          leftIcon="business-outline"
          name="gym_name"
          placeholder="PulseFit Downtown"
          required
        />
        <Field
          autoCapitalize="none"
          control={control}
          error={errors.gym_email?.message}
          keyboardType="email-address"
          label="Gym email"
          leftIcon="mail-outline"
          name="gym_email"
          placeholder="gym@example.com"
        />
        <Field
          control={control}
          error={errors.gym_phone?.message}
          keyboardType="phone-pad"
          label="Gym phone"
          leftIcon="call-outline"
          name="gym_phone"
          placeholder="+1 555 0100"
        />
        <Field
          control={control}
          error={errors.gym_address?.message}
          label="Gym address"
          leftIcon="location-outline"
          name="gym_address"
          placeholder="Street, city"
        />
        <Field
          control={control}
          error={errors.gym_timezone?.message}
          label="Timezone"
          leftIcon="time-outline"
          name="gym_timezone"
          placeholder="UTC"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Owner account</Text>
        <Field
          control={control}
          error={errors.admin_full_name?.message}
          label="Admin full name"
          leftIcon="person-outline"
          name="admin_full_name"
          placeholder="Olivia Owner"
          required
        />
        <Field
          autoCapitalize="none"
          control={control}
          error={errors.admin_email?.message}
          keyboardType="email-address"
          label="Admin email"
          leftIcon="mail-outline"
          name="admin_email"
          placeholder="owner@example.com"
          required
        />
        <Field
          control={control}
          error={errors.admin_password?.message}
          label="Admin password"
          leftIcon="lock-closed-outline"
          maxLength={72}
          name="admin_password"
          placeholder="At least 8 characters"
          required
          secureTextEntry
        />
        <Field
          control={control}
          error={errors.admin_phone?.message}
          keyboardType="phone-pad"
          label="Admin phone"
          leftIcon="call-outline"
          name="admin_phone"
          placeholder="+1 555 0101"
        />
      </View>

      {createGymAdminMutation.error ? (
        <Text style={styles.error}>{getApiErrorMessage(createGymAdminMutation.error)}</Text>
      ) : null}
      {created ? <CreatedGymAdminResult result={created} /> : null}

      <PrimaryButton
        disabled={createGymAdminMutation.isPending}
        icon="person-add-outline"
        loading={createGymAdminMutation.isPending}
        onPress={submit}
        title="Create Gym Admin"
      />
    </SurfacePanel>
  );
}

type FieldName = keyof GymAdminCreateFormValues;

type FieldProps = {
  control: Control<GymAdminCreateFormValues, unknown, GymAdminCreatePayload>;
  name: FieldName;
  label: string;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
};

function Field({
  control,
  name,
  label,
  placeholder,
  error,
  secureTextEntry,
  maxLength,
  autoCapitalize,
  keyboardType = "default",
  leftIcon,
  required
}: FieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <FormTextField
          autoCapitalize={autoCapitalize}
          error={error}
          keyboardType={keyboardType}
          label={label}
          leftIcon={leftIcon}
          maxLength={maxLength}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={placeholder}
          required={required}
          secureTextEntry={secureTextEntry}
          value={String(value ?? "")}
        />
      )}
    />
  );
}

function CreatedGymAdminResult({ result }: { result: GymAdminCreateResponse }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.success}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={20} color={colors.white} />
      </View>
      <View style={styles.successText}>
        <Text style={styles.successTitle}>{result.gym.name}</Text>
        <Text style={styles.successCopy}>
          Gym code {result.gym.code} assigned to {result.gym_admin.email}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  group: {
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  groupTitle: {
    ...typography.h3,
    color: colors.ink
  },
  error: {
    ...typography.small,
    color: colors.danger
  },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: colors.successSoft
  },
  successIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary
  },
  successText: {
    flex: 1
  },
  successTitle: {
    ...typography.h3,
    color: colors.ink
  },
  successCopy: {
    ...typography.small,
    color: colors.muted
  }
  });
