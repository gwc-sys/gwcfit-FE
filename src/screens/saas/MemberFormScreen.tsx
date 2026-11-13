import type * as React from "react";
import { MemberFormScreenView, FieldView } from "./MemberFormScreen.presentation";
import { createStyles } from "./MemberFormScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import {
  Controller,
  useForm,
  type Path,
  type UseFormSetError,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  RelationshipSelectField,
  type RelationshipOption,
} from "../../components/RelationshipSelectField";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useUpdateMember } from "../../hooks/useRbac";
import { membersApi } from "../../services/api/members";
import {
  membershipPlansApi,
  trainersApi,
} from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { MemberUpdatePayload } from "../../types/saas";
import { planDisplayName, trainerDisplayName } from "../../utils/displayNames";
import { formatCurrency } from "../../utils/formatters";
import {
  memberUpdateSchema,
  type MemberUpdateFormValues,
} from "../../validation/rbac";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

type MemberFormValues = MemberUpdateFormValues;

function formatDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function computeEndDate(startDateStr: string, durationDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDateStr);
  if (!match || durationDays <= 0) return "";
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  d.setDate(d.getDate() + durationDays - 1);
  return formatDateString(d);
}

const defaultValues: MemberFormValues = {
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
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageMembers = hasPermission("manage_members");
  const todayStr = useMemo(() => formatDateString(new Date()), []);

  const memberQuery = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => membersApi.get(memberId ?? ""),
    enabled: canManageMembers && Boolean(memberId),
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

  const updateMember = useUpdateMember();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberFormValues>({
    defaultValues,
  });

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
      const initialStart = memberQuery.data.membership_starts_at || todayStr;
      let initialEnd = memberQuery.data.membership_ends_at || "";

      if (!initialEnd && memberQuery.data.membership_plan_id && plansQuery.data) {
        const currentPlan = plansQuery.data.find(
          (p) => p.id === memberQuery.data.membership_plan_id,
        );
        if (currentPlan?.duration_days) {
          initialEnd = computeEndDate(initialStart, currentPlan.duration_days);
        }
      }

      reset({
        first_name: memberQuery.data.first_name,
        last_name: memberQuery.data.last_name,
        email: memberQuery.data.email ?? "",
        phone: memberQuery.data.phone ?? "",
        status: memberQuery.data.status,
        trainer_id: memberQuery.data.trainer_id ?? "",
        membership_plan_id: memberQuery.data.membership_plan_id ?? "",
        membership_starts_at: initialStart,
        membership_ends_at: initialEnd,
      });
    }
  }, [memberQuery.data, plansQuery.data, reset, todayStr]);

  const handlePlanChange = (nextPlanId: string) => {
    setValue("membership_plan_id", nextPlanId, { shouldValidate: true, shouldDirty: true });
    if (!nextPlanId || !plansQuery.data) return;
    const plan = plansQuery.data.find((p) => p.id === nextPlanId);
    if (plan?.duration_days) {
      const currentStart = String(watch("membership_starts_at") || todayStr);
      if (!watch("membership_starts_at")) {
        setValue("membership_starts_at", currentStart, { shouldValidate: true, shouldDirty: true });
      }
      const newEnd = computeEndDate(currentStart, plan.duration_days);
      setValue("membership_ends_at", newEnd, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleStartDateChange = (newStart: string) => {
    const cleanStart = String(newStart);
    setValue("membership_starts_at", cleanStart, { shouldValidate: true, shouldDirty: true });
    const selectedPlanId = watch("membership_plan_id");
    if (!selectedPlanId || !plansQuery.data || !cleanStart) return;
    const plan = plansQuery.data.find((p) => p.id === selectedPlanId);
    if (plan?.duration_days) {
      const newEnd = computeEndDate(cleanStart, plan.duration_days);
      setValue("membership_ends_at", newEnd, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setValue("membership_ends_at", String(newEnd), { shouldValidate: true, shouldDirty: true });
  };

  if (!canManageMembers) {
    return { kind: "view1" as const, props: {} };
  }

  if (!memberId) {
    return {
      kind: "viewNoMember" as const,
      props: {
        styles,
        navigation,
        onBack: () => navigation.goBack(),
        onGoToMembers: () => navigation.replace("MemberList"),
      },
    };
  }

  const submit = handleSubmit((values) => {
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
  });

  return {
    kind: "view2" as const,
    props: {
      styles,
      navigation,
      memberQuery,
      Field,
      control,
      errors,
      plansQuery,
      planOptions,
      trainersQuery,
      trainerOptions,
      handlePlanChange,
      handleStartDateChange,
      handleEndDateChange,
      updateMember,
      submit,
    },
  };
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
