import type * as React from "react";
import { AccountRecoveryScreenView, ForgotPasswordFormView, ResetPasswordFormView, VerifyEmailFormView, FieldView } from "./AccountRecoveryScreen.presentation";
import { styles } from "./AccountRecoveryScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useForgotPassword, useResetPassword, useVerifyEmail } from "../../hooks/useAuthActions";
import type { RootStackParamList } from "../../navigation/types";
import { getApiErrorMessage } from "../../services/api/client";
import { colors, spacing, typography } from "../../theme/theme";
import type { ForgotPasswordPayload, ResetPasswordPayload, VerifyEmailPayload } from "../../types/saas";
import { forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from "../../validation/auth";

type Props = NativeStackScreenProps<RootStackParamList, "AccountRecovery">;
type Mode = "Forgot" | "Reset" | "Verify";

export function useAccountRecoveryScreenPresentation({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>("Forgot");
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const verifyEmailMutation = useVerifyEmail();

  return { kind: "view1" as const, props: { styles, navigation, mode, setMode, ForgotPasswordForm, forgotPasswordMutation, ResetPasswordForm, resetPasswordMutation, VerifyEmailForm, verifyEmailMutation } };
}

export function AccountRecoveryScreen(...args: Parameters<typeof useAccountRecoveryScreenPresentation>): React.JSX.Element {
  return <AccountRecoveryScreenView model={useAccountRecoveryScreenPresentation(...args)} />;
}

export function useForgotPasswordFormPresentation({ mutation }: { mutation: ReturnType<typeof useForgotPassword> }) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ForgotPasswordPayload>({
    defaultValues: { email: "" }
  });

  const submit = handleSubmit((values) => {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError("email", { message: parsed.error.issues[0]?.message });
      return;
    }
    mutation.mutate(parsed.data);
  });

  return { kind: "view1" as const, props: { Field, control, errors, mutation, styles, submit } };
}

function ForgotPasswordForm(...args: Parameters<typeof useForgotPasswordFormPresentation>): React.JSX.Element {
  return <ForgotPasswordFormView model={useForgotPasswordFormPresentation(...args)} />;
}

export function useResetPasswordFormPresentation({ mutation }: { mutation: ReturnType<typeof useResetPassword> }) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<ResetPasswordPayload>({
    defaultValues: { token: "", new_password: "" }
  });

  const submit = handleSubmit((values) => {
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name === "token" || name === "new_password") {
          setError(name, { message: issue.message });
        }
      }
      return;
    }
    mutation.mutate(parsed.data, { onSuccess: () => reset({ token: "", new_password: "" }) });
  });

  return { kind: "view1" as const, props: { Field, control, errors, mutation, styles, submit } };
}

function ResetPasswordForm(...args: Parameters<typeof useResetPasswordFormPresentation>): React.JSX.Element {
  return <ResetPasswordFormView model={useResetPasswordFormPresentation(...args)} />;
}

export function useVerifyEmailFormPresentation({ mutation }: { mutation: ReturnType<typeof useVerifyEmail> }) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<VerifyEmailPayload>({
    defaultValues: { token: "" }
  });

  const submit = handleSubmit((values) => {
    const parsed = verifyEmailSchema.safeParse(values);
    if (!parsed.success) {
      setError("token", { message: parsed.error.issues[0]?.message });
      return;
    }
    mutation.mutate(parsed.data, { onSuccess: () => reset({ token: "" }) });
  });

  return { kind: "view1" as const, props: { Field, control, errors, mutation, styles, submit } };
}

function VerifyEmailForm(...args: Parameters<typeof useVerifyEmailFormPresentation>): React.JSX.Element {
  return <VerifyEmailFormView model={useVerifyEmailFormPresentation(...args)} />;
}

type FieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
};

export function useFieldPresentation<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  keyboardType,
  leftIcon,
  required
}: FieldProps<T>) {
  return { kind: "view1" as const, props: { control, name, error, keyboardType, label, leftIcon, required, secureTextEntry } };
}

function Field<T extends FieldValues>(...args: Parameters<typeof useFieldPresentation<T>>): React.JSX.Element {
  return <FieldView<T> model={useFieldPresentation<T>(...args)} />;
}


