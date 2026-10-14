import type * as React from "react";
import { MemberProfileScreenView } from "./MemberProfileScreen.presentation";
import { createStyles } from "./MemberProfileScreen.styles";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { EmptyState, ErrorState, LoadingSkeleton, ScrollListCard, StatusBadge } from "../../components/member";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useMemberProfile, useUpdateMemberProfile } from "../../hooks/useMember";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { JsonObject } from "../../types/saas";
import { formatDate, initials, memberStatusTone } from "../../utils/formatters";

type ProfileForm = {
  phone: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  profilePhoto: string;
};

const blankForm: ProfileForm = {
  phone: "",
  address: "",
  emergencyName: "",
  emergencyPhone: "",
  height: "",
  weight: "",
  fitnessGoal: "",
  profilePhoto: ""
};

function emergencyValue(contact: JsonObject, key: string) {
  const value = contact[key];
  return typeof value === "string" ? value : "";
}

function numericOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useMemberProfileScreenPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profileQuery = useMemberProfile();
  const updateProfile = useUpdateMemberProfile();
  const profile = profileQuery.data;
  const [form, setForm] = useState<ProfileForm>(blankForm);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      emergencyName: emergencyValue(profile.emergency_contact, "name"),
      emergencyPhone: emergencyValue(profile.emergency_contact, "phone"),
      height: profile.height ? String(profile.height) : "",
      weight: profile.weight ? String(profile.weight) : "",
      fitnessGoal: profile.fitness_goal ?? "",
      profilePhoto: profile.profile_photo ?? ""
    });
  }, [profile]);

  const submit = () => {
    updateProfile.mutate({
      phone: form.phone,
      address: form.address,
      height: numericOrNull(form.height),
      weight: numericOrNull(form.weight),
      fitness_goal: form.fitnessGoal,
      profile_photo: form.profilePhoto,
      emergency_contact: {
        name: form.emergencyName.trim(),
        phone: form.emergencyPhone.trim()
      }
    });
  };

  return { kind: "view1" as const, props: { styles, profileQuery, colors, profile, form, setForm, updateProfile, submit, navigation } };
}

export function MemberProfileScreen(...args: Parameters<typeof useMemberProfileScreenPresentation>): React.JSX.Element {
  return <MemberProfileScreenView model={useMemberProfileScreenPresentation(...args)} />;
}


