import type * as React from "react";
import { InvitationSignUpScreenView } from "./InvitationSignUpScreen.presentation";
import { createStyles } from "./InvitationSignUpScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import type { RootStackParamList } from "../../navigation/types";
import { authApi } from "../../services/api/auth";
import { getApiErrorMessage } from "../../services/api/client";
import { invitationApi } from "../../services/api/invitations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

const roleLabels: Record<string, string> = {
  gym_owner: "Gym owner",
  sub_admin: "Sub admin",
  trainer: "Trainer",
  receptionist: "Receptionist",
  member: "Member"
};

export function useInvitationSignUpScreenPresentation({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setSession = useAuthStore((state) => state.setSession);
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validation = useMutation({
    mutationFn: invitationApi.validate,
    onSuccess: (invite) => {
      setFormError(null);
      if (invite.email) setEmail(invite.email);
    }
  });
  const registration = useMutation({
    mutationFn: async () => {
      const invite = validation.data;
      if (!invite) throw new Error("Verify your invitation first.");
      if (fullName.trim().length < 2) throw new Error("Enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new Error("Enter a valid email address.");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (invite.role === "gym_owner") {
        if (gymName.trim().length < 2) throw new Error("Enter your gym name.");
        return authApi.registerOwner({
          gym_name: gymName,
          full_name: fullName,
          email,
          password,
          invitation_token: token
        });
      }
      return authApi.registerExistingGymUser({
        full_name: fullName,
        email,
        password,
        invitation_token: token
      });
    },
    onSuccess: setSession,
    onError: (error) => setFormError(getApiErrorMessage(error))
  });

  const updateToken = (value: string) => {
    setToken(value);
    validation.reset();
    registration.reset();
    setFormError(null);
  };
  const invite = validation.data;

  return { kind: "view1" as const, props: { styles, navigation, colors, token, updateToken, invite, validation, roleLabels, gymName, setGymName, fullName, setFullName, email, setEmail, password, setPassword, passwordVisible, setPasswordVisible, formError, registration } };
}

export function InvitationSignUpScreen(...args: Parameters<typeof useInvitationSignUpScreenPresentation>): React.JSX.Element {
  return <InvitationSignUpScreenView model={useInvitationSignUpScreenPresentation(...args)} />;
}


