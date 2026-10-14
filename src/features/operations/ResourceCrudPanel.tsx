import type * as React from "react";
import { ResourceCrudPanelView, GenderWorkoutSessionPickerView, LoadingRowsView } from "./ResourceCrudPanel.presentation";
import { createStyles } from "./ResourceCrudPanel.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import type { ZodType } from "zod";

import { EmptyState } from "../../components/EmptyState";
import { DatePickerField } from "../../components/DatePickerField";
import { FoodNutritionMealPicker } from "../../components/FoodNutritionMealPicker";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  RelationshipSelectField,
  type RelationshipOption,
} from "../../components/RelationshipSelectField";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { useCrudResource } from "../../hooks/useOperations";
import { getApiErrorMessage } from "../../services/api/client";
import { membersApi } from "../../services/api/members";
import {
  membershipPlansApi,
  trainersApi,
  usersApi,
  type ListParams,
} from "../../services/api/operations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { MessageResponse, PermissionCode } from "../../types/saas";
import {
  memberDisplayName,
  planDisplayName,
  trainerDisplayName,
  userDisplayName,
} from "../../utils/displayNames";
import { formatCurrency, formatRole } from "../../utils/formatters";
import {
  genderExerciseCounts,
  genderExerciseGroups,
  genderExerciseLibrary,
  genderExercisesByGroup,
  type GenderExerciseAsset,
  type GenderExerciseGroup,
} from "../../data/genderExerciseLibrary";
import { parseWorkoutSessions } from "../../data/workoutExerciseCatalog";
import type { WorkoutGender } from "../../types/fitness";

type FormValues = Record<string, string>;
type RelationKind = "member" | "trainer" | "membershipPlan" | "user";
type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

type CrudApi<TRead, TCreate, TUpdate> = {
  list: (params?: ListParams) => Promise<TRead[]>;
  get: (id: string) => Promise<TRead>;
  create: (payload: TCreate) => Promise<TRead>;
  update: (id: string, payload: TUpdate) => Promise<TRead>;
  remove: (id: string) => Promise<MessageResponse>;
};

export type ResourceField<TRead> = {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
  multiline?: boolean;
  createOnly?: boolean;
  relation?: RelationKind;
  allowClear?: boolean;
  defaultValue?: string;
  valueFromRecord?: (record: TRead) => string;
  catalog?: "workout" | "food";
  datePicker?: boolean;
  choices?: readonly string[];
  hidden?: boolean;
  syncField?: string;
};

export type ResourceCrudConfig<
  TRead extends { id: string },
  TCreate,
  TUpdate,
> = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  permission: PermissionCode;
  api: CrudApi<TRead, TCreate, TUpdate>;
  createSchema: ZodType<TCreate>;
  updateSchema: ZodType<TUpdate>;
  fields: ResourceField<TRead>[];
  getTitle: (record: TRead) => string;
  getMeta: (record: TRead) => string;
  getDetails?: (record: TRead) => string[];
  getStatus?: (record: TRead) => { label: string; tone?: BadgeTone } | null;
  deleteLabel: string;
  deleteSuccessFallback: string;
};

type ResourceCrudPanelProps<TRead extends { id: string }, TCreate, TUpdate> = {
  config: ResourceCrudConfig<TRead, TCreate, TUpdate>;
  editRecordId?: string | null;
  onEditRecordOpened?: () => void;
  createRequest?: number;
  formOnly?: boolean;
  onRecordSaved?: (record: TRead, mode: "create" | "edit") => void;
  onFormClosed?: () => void;
};

type SortDirection = "az" | "za";
type DietScheduleMode = "single" | "range";

const dietCaloriesByTitle: Record<string, string> = {
  "Weight Loss": "1500",
  "Muscle Gain": "2800",
  Maintenance: "2000",
  Medical: "1800",
  Custom: "",
};

export function useResourceCrudPanelPresentation<
  TRead extends { id: string },
  TCreate,
  TUpdate,
>({
  config,
  editRecordId,
  onEditRecordOpened,
  createRequest,
  formOnly = false,
  onRecordSaved,
  onFormClosed,
}: ResourceCrudPanelProps<TRead, TCreate, TUpdate>) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const currentUser = useAuthStore((state) => state.user);
  const canAccess = hasPermission(config.permission);
  const autoAssignCurrentTrainer =
    config.key === "diet-plans" && currentUser?.role === "trainer";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("az");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TRead | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dietScheduleMode, setDietScheduleMode] =
    useState<DietScheduleMode>("range");
  const lastCreateRequest = useRef(0);
  const params = useMemo(() => ({ skip: page * 50, limit: 50 }), [page]);
  const { listQuery, createMutation, updateMutation, deleteMutation } =
    useCrudResource(config.key, config.api, params, canAccess);
  const relationNeeds = useMemo(
    () => ({
      member: config.fields.some((field) => field.relation === "member"),
      trainer:
        !autoAssignCurrentTrainer &&
        config.fields.some((field) => field.relation === "trainer"),
      membershipPlan: config.fields.some(
        (field) => field.relation === "membershipPlan",
      ),
      user: config.fields.some((field) => field.relation === "user"),
    }),
    [autoAssignCurrentTrainer, config.fields],
  );
  const membersReferenceQuery = useQuery({
    queryKey: ["members", "resource-picker", config.key],
    queryFn: () => membersApi.list({ limit: 200 }),
    enabled: canAccess && relationNeeds.member,
    retry: false,
  });
  const trainersReferenceQuery = useQuery({
    queryKey: ["operations", "trainers", "resource-picker", config.key],
    queryFn: () => trainersApi.list({ limit: 200 }),
    enabled: canAccess && relationNeeds.trainer,
    retry: false,
  });
  const plansReferenceQuery = useQuery({
    queryKey: ["operations", "membership-plans", "resource-picker", config.key],
    queryFn: () => membershipPlansApi.list({ limit: 200 }),
    enabled: canAccess && relationNeeds.membershipPlan,
    retry: false,
  });
  const usersReferenceQuery = useQuery({
    queryKey: ["users", "resource-picker", config.key],
    queryFn: () => usersApi.list({ limit: 200 }),
    enabled: canAccess && relationNeeds.user,
    retry: false,
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: getCreateDefaults(config.fields),
  });
  const dietTargetCalories = Number(watch("calories_per_day") || 0);
  const dietStartDate = watch("starts_at") || "";
  const dietEndDate = watch("ends_at") || "";

  const relationOptions = useMemo<Record<RelationKind, RelationshipOption[]>>(
    () => ({
      member: (membersReferenceQuery.data ?? []).map((member) => ({
        value: member.id,
        label: memberDisplayName(member),
        description: [
          member.member_code,
          member.gym_name,
          member.membership_plan_name,
        ]
          .filter(Boolean)
          .join(" - "),
        status: member.status,
      })),
      trainer: (trainersReferenceQuery.data ?? []).map((trainer) => ({
        value: trainer.id,
        label: trainerDisplayName(trainer),
        description: [trainer.email, trainer.gym_name]
          .filter(Boolean)
          .join(" - "),
      })),
      membershipPlan: (plansReferenceQuery.data ?? []).map((plan) => ({
        value: plan.id,
        label: planDisplayName(plan),
        description: [
          formatCurrency(plan.price_cents, plan.currency),
          `${plan.duration_days} days`,
          plan.gym_name,
        ]
          .filter(Boolean)
          .join(" - "),
      })),
      user: (usersReferenceQuery.data ?? []).map((user) => ({
        value: user.id,
        label: userDisplayName(user),
        description: [user.email, formatRole(user.role), user.gym_name]
          .filter(Boolean)
          .join(" - "),
        status: user.status,
      })),
    }),
    [
      membersReferenceQuery.data,
      plansReferenceQuery.data,
      trainersReferenceQuery.data,
      usersReferenceQuery.data,
    ],
  );

  const records = listQuery.data ?? [];
  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const visible = normalizedSearch
      ? records.filter((record) =>
          `${config.getTitle(record)} ${config.getMeta(record)}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : records;

    return [...visible].sort((left, right) => {
      const comparison = config
        .getTitle(left)
        .localeCompare(config.getTitle(right));
      return sortDirection === "az" ? comparison : -comparison;
    });
  }, [config, records, search, sortDirection]);

  const visibleFields = config.fields.filter(
    (field) =>
      !field.hidden &&
      !(autoAssignCurrentTrainer && field.relation === "trainer") &&
      (!editingRecord || !field.createOnly),
  );
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const formTitle = editingRecord
    ? `Edit ${config.getTitle(editingRecord)}`
    : `New ${config.title}`;

  const beginCreate = () => {
    setEditingRecord(null);
    setNotice(null);
    setShowForm(true);
    setDietScheduleMode("range");
    reset(getCreateDefaults(config.fields));
  };

  const closeForm = () => {
    setEditingRecord(null);
    setShowForm(false);
    reset(getCreateDefaults(config.fields));
    onFormClosed?.();
  };

  const beginEdit = (record: TRead) => {
    setEditingRecord(record);
    setNotice(null);
    setShowForm(true);
    const defaults = getUpdateDefaults(config.fields, record);
    reset(defaults);
    if (config.key === "diet-plans") {
      setDietScheduleMode(
        defaults.starts_at && defaults.starts_at === defaults.ends_at
          ? "single"
          : "range",
      );
    }
  };

  useEffect(() => {
    if (!editRecordId) return;
    const record = records.find((item) => item.id === editRecordId);
    if (!record) return;
    beginEdit(record);
    onEditRecordOpened?.();
  }, [editRecordId, records, onEditRecordOpened]);

  useEffect(() => {
    if (!createRequest || createRequest === lastCreateRequest.current) return;
    lastCreateRequest.current = createRequest;
    beginCreate();
  }, [createRequest]);

  if (!canAccess) {
    return null;
  }

  const submit = handleSubmit((values) => {
    setNotice(null);
    const schema = editingRecord ? config.updateSchema : config.createSchema;
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name) {
          setError(name, { message: issue.message });
        }
      }
      return;
    }

    if (editingRecord) {
      updateMutation.mutate(
        {
          id: editingRecord.id,
          payload: parsed.data as TUpdate,
        },
        {
          onSuccess: (record) => {
            setNotice(`${config.getTitle(record)} was updated.`);
            closeForm();
            onRecordSaved?.(record, "edit");
          },
        },
      );
      return;
    }

    createMutation.mutate(parsed.data as TCreate, {
      onSuccess: (record) => {
        setNotice(`${config.getTitle(record)} was created.`);
        closeForm();
        onRecordSaved?.(record, "create");
      },
    });
  });

  const confirmDelete = (record: TRead) => {
    showAlert(config.deleteLabel, config.getTitle(record), [
      { text: "Cancel", style: "cancel" },
      {
        text: config.deleteLabel,
        style: "destructive",
        onPress: () => {
          setNotice(null);
          deleteMutation.mutate(record.id, {
            onSuccess: (response) => {
              setNotice(response.message || config.deleteSuccessFallback);
              if (editingRecord?.id === record.id) {
                closeForm();
              }
            },
          });
        },
      },
    ]);
  };

  const getRelationState = (relation: RelationKind) => {
    const query =
      relation === "member"
        ? membersReferenceQuery
        : relation === "trainer"
          ? trainersReferenceQuery
          : relation === "membershipPlan"
            ? plansReferenceQuery
            : usersReferenceQuery;

    return {
      loading: query.isLoading || query.isFetching,
      error: query.error ? getApiErrorMessage(query.error) : null,
    };
  };

  if (
    formOnly &&
    !showForm &&
    !notice &&
    !listQuery.error &&
    !deleteMutation.error
  ) {
    return null;
  }

  return { kind: "view1" as const, props: { config, formOnly, showForm, beginCreate, styles, records, formTitle, closeForm, colors, autoAssignCurrentTrainer, currentUser, visibleFields, control, errors, setDietScheduleMode, setValue, dietStartDate, dietScheduleMode, dietEndDate, dietCaloriesByTitle, getRelationState, getRelationIcon, relationOptions, GenderWorkoutSessionPicker, dietTargetCalories, createMutation, updateMutation, isMutating, submit, editingRecord, notice, listQuery, deleteMutation, setSearch, search, setSortDirection, sortDirection, filteredRecords, LoadingRows, beginEdit, confirmDelete, page, setPage } };
}

export function ResourceCrudPanel<TRead extends { id: string }, TCreate, TUpdate>(...args: Parameters<typeof useResourceCrudPanelPresentation<TRead, TCreate, TUpdate>>): React.JSX.Element {
  return <ResourceCrudPanelView<TRead, TCreate, TUpdate> model={useResourceCrudPanelPresentation<TRead, TCreate, TUpdate>(...args)} />;
}

export function useGenderWorkoutSessionPickerPresentation({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  const [gender, setGender] = useState<WorkoutGender>("Male");
  const [category, setCategory] = useState<GenderExerciseGroup>(
    genderExerciseGroups[0],
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const selected = parseWorkoutSessions(value) as Array<{
    name: string;
    exerciseId?: string;
    gender?: WorkoutGender;
    group?: string;
  }>;
  const selectedKeys = new Set(
    selected.map(
      (item) => `${item.gender ?? "Unisex"}:${item.exerciseId ?? item.name}`,
    ),
  );
  const normalizedSearch = exerciseSearch.trim().toLowerCase();
  const visibleExercises = genderExercisesByGroup[gender][category].filter(
    (item) => item.title.toLowerCase().includes(normalizedSearch),
  );

  const toggle = (exercise: GenderExerciseAsset) => {
    const item = {
      exerciseId: exercise.slug,
      name: exercise.title,
      gender: exercise.gender,
      group: exercise.group,
      focus: exercise.focus,
      equipment: exercise.equipment,
      image: exercise.assetPath,
    };
    const itemKey = `${item.gender}:${item.exerciseId}`;
    const next = selectedKeys.has(itemKey)
      ? selected.filter(
          (selectedItem) =>
            `${selectedItem.gender ?? "Unisex"}:${selectedItem.exerciseId ?? selectedItem.name}` !==
            itemKey,
        )
      : [...selected, item];
    onChange(JSON.stringify(next));
  };

  return { kind: "view1" as const, props: { colors, setGender, gender, exerciseSearch, setExerciseSearch, setCategory, category, visibleExercises, selectedKeys, toggle, selected } };
}

function GenderWorkoutSessionPicker(...args: Parameters<typeof useGenderWorkoutSessionPickerPresentation>): React.JSX.Element {
  return <GenderWorkoutSessionPickerView model={useGenderWorkoutSessionPickerPresentation(...args)} />;
}

export function useLoadingRowsPresentation() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);

  return { kind: "view1" as const, props: { styles } };
}

function LoadingRows(...args: Parameters<typeof useLoadingRowsPresentation>): React.JSX.Element {
  return <LoadingRowsView model={useLoadingRowsPresentation(...args)} />;
}

function getRelationIcon(
  relation: RelationKind,
): keyof typeof Ionicons.glyphMap {
  if (relation === "member") {
    return "person-outline";
  }
  if (relation === "trainer") {
    return "barbell-outline";
  }
  if (relation === "membershipPlan") {
    return "pricetag-outline";
  }
  return "people-circle-outline";
}

function getCreateDefaults<TRead>(fields: ResourceField<TRead>[]): FormValues {
  return Object.fromEntries(
    fields.map((field) => [field.name, field.defaultValue ?? ""]),
  );
}

function getUpdateDefaults<TRead>(
  fields: ResourceField<TRead>[],
  record: TRead,
): FormValues {
  return Object.fromEntries(
    fields
      .filter((field) => !field.createOnly)
      .map((field) => [
        field.name,
        field.valueFromRecord
          ? field.valueFromRecord(record)
          : (field.defaultValue ?? ""),
      ]),
  );
}


