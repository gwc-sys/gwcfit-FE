import { Controller, type FieldValues } from "react-hook-form";
import { Text } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SurfacePanel } from "../../components/SurfacePanel";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useAccountRecoveryScreenPresentation, useForgotPasswordFormPresentation, useResetPasswordFormPresentation, useVerifyEmailFormPresentation, useFieldPresentation } from "../../../../screens/auth/AccountRecoveryScreen";

export function AccountRecoveryScreenView({ model }: { model: ReturnType<typeof useAccountRecoveryScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, navigation, mode, setMode, ForgotPasswordForm, forgotPasswordMutation, ResetPasswordForm, resetPasswordMutation, VerifyEmailForm, verifyEmailMutation } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <AppHeader title="Account Help" onBack={() => navigation.goBack()} />
      <Text style={styles.copy}>Recover access, set a new password, or verify an email token from your gym workspace.</Text>
      <SegmentedControl options={["Forgot", "Reset", "Verify"]} value={mode} onChange={setMode} />
      {mode === "Forgot" ? (
        <ForgotPasswordForm mutation={forgotPasswordMutation} />
      ) : mode === "Reset" ? (
        <ResetPasswordForm mutation={resetPasswordMutation} />
      ) : (
        <VerifyEmailForm mutation={verifyEmailMutation} />
      )}
    </Screen>
  ));
    }
  }
}

export function ForgotPasswordFormView({ model }: { model: ReturnType<typeof useForgotPasswordFormPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Field, control, errors, mutation, styles, submit } = model.props;
      return ((
    <SurfacePanel title="Request reset" kicker="Forgot password" icon="mail-outline">
      <Field
        control={control}
        error={errors.email?.message}
        keyboardType="email-address"
        label="Email"
        leftIcon="mail-outline"
        name="email"
        required
      />
      {mutation.error ? <Text style={styles.error}>{getApiErrorMessage(mutation.error)}</Text> : null}
      {mutation.data ? (
        <Text style={styles.success}>
          {mutation.data.message}
          {mutation.data.reset_token ? ` Token: ${mutation.data.reset_token}` : ""}
        </Text>
      ) : null}
      <PrimaryButton loading={mutation.isPending} onPress={submit} title="Request Reset" />
    </SurfacePanel>
  ));
    }
  }
}

export function ResetPasswordFormView({ model }: { model: ReturnType<typeof useResetPasswordFormPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Field, control, errors, mutation, styles, submit } = model.props;
      return ((
    <SurfacePanel title="Set new password" kicker="Reset" icon="lock-closed-outline">
      <Field control={control} error={errors.token?.message} label="Reset token" leftIcon="key-outline" name="token" required />
      <Field
        control={control}
        error={errors.new_password?.message}
        label="New password"
        leftIcon="lock-closed-outline"
        name="new_password"
        required
        secureTextEntry
      />
      {mutation.error ? <Text style={styles.error}>{getApiErrorMessage(mutation.error)}</Text> : null}
      {mutation.data ? <Text style={styles.success}>{mutation.data.message}</Text> : null}
      <PrimaryButton loading={mutation.isPending} onPress={submit} title="Reset Password" />
    </SurfacePanel>
  ));
    }
  }
}

export function VerifyEmailFormView({ model }: { model: ReturnType<typeof useVerifyEmailFormPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { Field, control, errors, mutation, styles, submit } = model.props;
      return ((
    <SurfacePanel title="Verify email" kicker="Email token" icon="shield-checkmark-outline">
      <Field
        control={control}
        error={errors.token?.message}
        label="Verification token"
        leftIcon="ticket-outline"
        name="token"
        required
      />
      {mutation.error ? <Text style={styles.error}>{getApiErrorMessage(mutation.error)}</Text> : null}
      {mutation.data ? <Text style={styles.success}>{mutation.data.message}</Text> : null}
      <PrimaryButton loading={mutation.isPending} onPress={submit} title="Verify Email" />
    </SurfacePanel>
  ));
    }
  }
}

export function FieldView<T extends FieldValues>({ model }: { model: ReturnType<typeof useFieldPresentation<T>> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { control, name, error, keyboardType, label, leftIcon, required, secureTextEntry } = model.props;
      return ((
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <FormTextField
          autoCapitalize="none"
          error={error}
          keyboardType={keyboardType}
          label={label}
          leftIcon={leftIcon}
          maxLength={name.includes("password") ? 72 : undefined}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={label}
          required={required}
          secureTextEntry={secureTextEntry}
          value={String(value ?? "")}
        />
      )}
    />
  ));
    }
  }
}
