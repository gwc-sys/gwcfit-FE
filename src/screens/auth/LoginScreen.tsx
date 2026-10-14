import type * as React from "react";
import { LoginScreenView } from "./LoginScreen.presentation";
import { createStyles } from "./LoginScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { images } from "../../data/media";
import type { RootStackParamList } from "../../navigation/types";
import { authApi } from "../../services/api/auth";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, shadows, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { LoginPayload } from "../../types/saas";
import { loginSchema } from "../../validation/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function useLoginScreenPresentation({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const compact = width < 390 || height < 720;
  const wide = width >= 768;
  const phone = !wide;
  const setSession = useAuthStore((state) => state.setSession);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canGoBack = navigation.canGoBack();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session);
    }
  });

  const submit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return { kind: "view1" as const, props: { phone, styles, wide, height, compact, canGoBack, navigation, control, errors, passwordVisible, setPasswordVisible, colors, loginMutation, submit } };
}

export function LoginScreen(...args: Parameters<typeof useLoginScreenPresentation>): React.JSX.Element {
  return <LoginScreenView model={useLoginScreenPresentation(...args)} />;
}


