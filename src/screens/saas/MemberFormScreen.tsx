import type * as React from "react";
import { MemberFormScreenView, FieldView } from "./MemberFormScreen.presentation";
import { createStyles } from "./MemberFormScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useForm,
  type Path,
  type UseFormSetError,
} from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { GymSelectField } from "../../components/GymSelectField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  RelationshipSelectField,
  type RelationshipOption,
} from "../../components/RelationshipSelectField";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useCreateMember, useUpdateMember } from "../../hooks/useRbac";
import { membersApi } from "../../services/api/members";
import {
  gymsApi,
  membershipPlansApi,
  trainersApi,
} from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type {
  MemberCreatePayload,
  MemberUpdatePayload,
} from "../../types/saas";
import { planDisplayName, trainerDisplayName } from "../../utils/displayNames";
import { formatCurrency } from "../../utils/formatters";
import {
  memberCreateSchema,
  memberUpdateSchema,
  type MemberCreateFormValues,
  type MemberUpdateFormValues,
} from "../../validation/rbac";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

type MemberFormValues = MemberCreateFormValues & MemberUpdateFormValues;

const defaultValues: MemberFormValues = {
  member_code: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  status: "active",
  trainer_id: "",
  membership_plan_id: "",
  membership_starts_at: "",
  membership_ends_at: "",
};

export function useMemberFormScreenPresentation() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const memberId = route.params?.memberId as string | undefined;
  const isEditing = Boolean(memberId);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageMembers = hasPermission("manage_members");
  const [selectedGymName, setSelectedGymName] = useState<string | null>(null);
  const memberQuery = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => membersApi.get(memberId ?? ""),
    enabled: canManageMembers && isEditing,
    retry: false,
  });
  const gymQuery = useQuery({
    queryKey: ["operations", "my-gym"],
    queryFn: () => gymsApi.getMyGym(),
    retry: false,
  });
  const trainersQuery = useQuery({
    queryKey: ["operations", "trainers", "member-form"],
    queryFn: () => trainersApi.list({ limit: 200 }),
    enabled: canManageMembers,
    retry: false,
  });
  const plansQuery = useQuery({
    queryKey: ["operations", "membership-plans", "member-form"],
    queryFn: () => membershipPlansApi.list({ limit: 200 }),
    enabled: canManageMembers,
    retry: false,
  });
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MemberFormValues>({
    defaultValues,
  });

  const gymOptions = useMemo(() => {
    if (!gymQuery.data?.name) {
      return [];
    }

    return [{ id: gymQuery.data.id, name: gymQuery.data.name }];
  }, [gymQuery.data]);
  const gymLoadError = gymQuery.error
    ? getApiErrorMessage(gymQuery.error)
    : null;
  const trainerOptions = useMemo<RelationshipOption[]>(() => {
    const options = (trainersQuery.data ?? []).map((trainer) => ({
      value: trainer.id,
      label: trainerDisplayName(trainer),
      description: [trainer.email, trainer.gym_name]
        .filter(Boolean)
        .join(" - "),
    }));

    if (
      memberQuery.data?.trainer_id &&
      memberQuery.data.trainer_name &&
      !options.some((option) => option.value === memberQuery.data?.trainer_id)
    ) {
      options.unshift({
        value: memberQuery.data.trainer_id,
        label: memberQuery.data.trainer_name,
        description: "Current assignment",
      });
    }

    return options;
  }, [
    memberQuery.data?.trainer_id,
    memberQuery.data?.trainer_name,
    trainersQuery.data,
  ]);
  const planOptions = useMemo<RelationshipOption[]>(() => {
    const options = (plansQuery.data ?? []).map((plan) => ({
      value: plan.id,
      label: planDisplayName(plan),
      description: [
        formatCurrency(plan.price_cents, plan.currency),
        `${plan.duration_days} days`,
        plan.gym_name,
      ]
        .filter(Boolean)
        .join(" - "),
    }));

    if (
      memberQuery.data?.membership_plan_id &&
      memberQuery.data.membership_plan_name &&
      !options.some(
        (option) => option.value === memberQuery.data?.membership_plan_id,
      )
    ) {
      options.unshift({
        value: memberQuery.data.membership_plan_id,
        label: memberQuery.data.membership_plan_name,
        description: "Current plan",
      });
    }

    return options;
  }, [
    memberQuery.data?.membership_plan_id,
    memberQuery.data?.membership_plan_name,
    plansQuery.data,
  ]);

  useEffect(() => {
    if (memberQuery.data) {
      reset({
        member_code: memberQuery.data.member_code,
        first_name: memberQuery.data.first_name,
        last_name: memberQuery.data.last_name,
        email: memberQuery.data.email ?? "",
        phone: memberQuery.data.phone ?? "",
        status: memberQuery.data.status,
        trainer_id: memberQuery.data.trainer_id ?? "",
        membership_plan_id: memberQuery.data.membership_plan_id ?? "",
        membership_starts_at: memberQuery.data.membership_starts_at ?? "",
        membership_ends_at: memberQuery.data.membership_ends_at ?? "",
      });
    }
  }, [memberQuery.data, reset]);

  useEffect(() => {
    if (gymQuery.data?.name) {
      setSelectedGymName(gymQuery.data.name);
    }
  }, [gymQuery.data?.name]);

  if (!canManageMembers) {
    return { kind: "view1" as const, props: {  } };
  }

  const submit = handleSubmit((values) => {
    if (isEditing && memberId) {
      const parsed = memberUpdateSchema.safeParse(values);
      if (!parsed.success) {
        applyFormErrors(parsed.error.issues, setError);
        return;
      }

      updateMember.mutate(
        {
          memberId,
          payload: parsed.data as MemberUpdatePayload,
        },
        {
          onSuccess: (member) =>
            navigation.replace("MemberProfile", { memberId: member.id }),
        },
      );
      return;
    }

    const parsed = memberCreateSchema.safeParse(values);
    if (!parsed.success) {
      applyFormErrors(parsed.error.issues, setError);
      return;
    }

    createMember.mutate(parsed.data as MemberCreatePayload, {
      onSuccess: (member) =>
        navigation.replace("MemberProfile", { memberId: member.id }),
    });
  });

  const title = isEditing ? "Edit Member" : "Add Member";

  return { kind: "view2" as const, props: { styles, title, isEditing, navigation, memberQuery, gymLoadError, gymQuery, setSelectedGymName, gymOptions, selectedGymName, Field, control, errors, plansQuery, planOptions, trainersQuery, trainerOptions, createMember, updateMember, submit } };
}

export function MemberFormScreen(...args: Parameters<typeof useMemberFormScreenPresentation>): React.JSX.Element {
  return <MemberFormScreenView model={useMemberFormScreenPresentation(...args)} />;
}

type FieldName = Path<MemberFormValues>;

type FieldProps = {
  control: ReturnType<typeof useForm<MemberFormValues>>["control"];
  name: FieldName;
  label: string;
  error?: string;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
};

export function useFieldPresentation({
  control,
  name,
  label,
  error,
  placeholder,
  autoCapitalize,
  keyboardType = "default",
  leftIcon,
  required,
}: FieldProps) {
  return { kind: "view1" as const, props: { control, name, autoCapitalize, error, keyboardType, label, leftIcon, placeholder, required } };
}

function Field(...args: Parameters<typeof useFieldPresentation>): React.JSX.Element {
  return <FieldView model={useFieldPresentation(...args)} />;
}

function applyFormErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  setError: UseFormSetError<MemberFormValues>,
) {
  for (const issue of issues) {
    const name = String(issue.path[0] ?? "");
    if (name) {
      setError(name as FieldName, { message: issue.message });
    }
  }
}


