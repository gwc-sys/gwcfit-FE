import type * as React from "react";
import { GymManagementPanelView, GymMetricView, GymDetailsPanelView, DetailMetricView, MyGymPanelView, GymFieldView } from "./GymPanels.presentation";
import { createStyles, createDetailStyles } from "./GymPanels.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Controller,
  useForm,
  type Path,
  type UseFormSetError,
} from "react-hook-form";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState } from "../../components/EmptyState";
import { FormTextField } from "../../components/FormTextField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import {
  useCreateGym,
  useDeleteGym,
  useGyms,
  useMyGym,
  useSuspendGym,
  useUpdateMyGym,
} from "../../hooks/useOperations";
import { membersApi } from "../../services/api/members";
import {
  paymentsApi,
  membershipPlansApi,
  usersApi,
  gymsApi,
} from "../../services/api/operations";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { Gym, GymCreatePayload, GymUpdatePayload } from "../../types/saas";
import { gymCreateSchema, gymUpdateSchema } from "../../validation/operations";

type GymCreateFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
};

type GymUpdateFormValues = GymCreateFormValues & {
  settings: string;
  business_email: string;
  business_phone: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  description: string;
  facilities: string;
};

type SortDirection = "az" | "za";

export function useGymManagementPanelPresentation({
  onSelectGym,
}: {
  onSelectGym?: (gym: Gym) => void;
}) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManageGyms = hasPermission("manage_gyms");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("az");
  const [gymStatusFilter, setGymStatusFilter] = useState<
    "all" | "active" | "suspended" | "other"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const gymsQuery = useGyms({ skip: page * 50, limit: 50 }, canManageGyms);
  const createGymMutation = useCreateGym();
  const suspendGymMutation = useSuspendGym();
  const deleteGymMutation = useDeleteGym();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<GymCreateFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      timezone: "UTC",
    },
  });

  const gyms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const list = gymsQuery.data ?? [];
    const statusFiltered =
      gymStatusFilter === "all"
        ? list
        : list.filter((gym) =>
            gymStatusFilter === "other"
              ? gym.status !== "active" && gym.status !== "suspended"
              : gym.status === gymStatusFilter,
          );
    const visible = normalizedSearch
      ? statusFiltered.filter((gym) =>
          `${gym.name} ${gym.code} ${gym.status}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : statusFiltered;

    return [...visible].sort((left, right) => {
      const comparison = left.name.localeCompare(right.name);
      return sortDirection === "az" ? comparison : -comparison;
    });
  }, [gymsQuery.data, search, sortDirection, gymStatusFilter]);

  if (!canManageGyms) {
    return null;
  }

  const closeForm = () => {
    setShowForm(false);
    reset({ name: "", email: "", phone: "", address: "", timezone: "UTC" });
  };

  const submit = handleSubmit((values) => {
    setNotice(null);
    const parsed = gymCreateSchema.safeParse(values);

    if (!parsed.success) {
      applyErrors(parsed.error.issues, setError);
      return;
    }

    createGymMutation.mutate(parsed.data as GymCreatePayload, {
      onSuccess: (gym) => {
        setNotice(`${gym.name} was created.`);
        closeForm();
      },
    });
  });

  const confirmSuspend = (gym: Gym) => {
    showAlert("Suspend gym", gym.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Suspend",
        style: "destructive",
        onPress: () =>
          suspendGymMutation.mutate(gym.id, {
            onSuccess: (updatedGym) =>
              setNotice(`${updatedGym.name} was suspended.`),
          }),
      },
    ]);
  };

  const confirmDelete = (gym: Gym) => {
    showAlert("Delete gym", gym.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteGymMutation.mutate(gym.id, {
            onSuccess: (response) => setNotice(response.message),
          }),
      },
    ]);
  };

  const totalGyms = gymsQuery.data?.length ?? 0;
  const activeGyms = (gymsQuery.data ?? []).filter(
    (gym) => gym.status === "active",
  ).length;
  const suspendedGyms = (gymsQuery.data ?? []).filter(
    (gym) => gym.status === "suspended",
  ).length;
  const otherGyms = Math.max(0, totalGyms - activeGyms - suspendedGyms);

  return { kind: "view1" as const, props: { styles, GymMetric, totalGyms, colors, setGymStatusFilter, gymStatusFilter, activeGyms, suspendedGyms, otherGyms, showForm, setShowForm, gymsQuery, setSearch, search, setSortDirection, sortDirection, closeForm, GymField, control, errors, createGymMutation, submit, notice, suspendGymMutation, deleteGymMutation, gyms, onSelectGym, confirmSuspend, confirmDelete, page, setPage } };
}

export function GymManagementPanel(...args: Parameters<typeof useGymManagementPanelPresentation>): React.JSX.Element {
  return <GymManagementPanelView model={useGymManagementPanelPresentation(...args)} />;
}

export function useGymMetricPresentation({
  icon,
  label,
  value,
  color,
  styles,
  onPress,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
  active: boolean;
}) {
  return { kind: "view1" as const, props: { onPress, styles, active, color, icon, value, label } };
}

function GymMetric(...args: Parameters<typeof useGymMetricPresentation>): React.JSX.Element {
  return <GymMetricView model={useGymMetricPresentation(...args)} />;
}

export function useGymDetailsPanelPresentation({ gym }: { gym: Gym }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createDetailStyles(colors, width),
    [colors, width],
  );
  const usersQuery = useQuery({
    queryKey: ["gym-details", gym.id, "users"],
    queryFn: () => usersApi.list({ gym_id: gym.id, limit: 200 }),
  });
  const membersQuery = useQuery({
    queryKey: ["gym-details", gym.id, "members"],
    queryFn: () => membersApi.list({ gym_id: gym.id, limit: 200 }),
  });
  const plansQuery = useQuery({
    queryKey: ["gym-details", gym.id, "plans"],
    queryFn: () => membershipPlansApi.list({ gym_id: gym.id, limit: 200 }),
  });
  const paymentsQuery = useQuery({
    queryKey: ["gym-details", gym.id, "payments"],
    queryFn: () => paymentsApi.list({ gym_id: gym.id, limit: 200 }),
  });
  const developerGymsQuery = useQuery({
    queryKey: ["gym-details", gym.id, "platform-subscription"],
    queryFn: gymsApi.listDeveloper,
  });
  const platformGym = developerGymsQuery.data?.find(
    (item) => item.id === gym.id,
  );
  const trial = platformGym?.subscription;
  const trialDays = 30;
  const trialStartedAt = trial?.trial_started_at
    ? new Date(trial.trial_started_at)
    : null;
  const trialEndsAt = trial?.current_period_ends_at
    ? new Date(trial.current_period_ends_at)
    : trialStartedAt
      ? new Date(trialStartedAt.getTime() + trialDays * 86400000)
      : null;
  const trialCompletedDays = trialStartedAt
    ? Math.min(
        trialDays,
        Math.max(
          0,
          Math.floor((Date.now() - trialStartedAt.getTime()) / 86400000),
        ),
      )
    : 0;
  const trialRemainingDays = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : trialDays;
  const trialProgress = Math.min(
    100,
    Math.round((trialCompletedDays / trialDays) * 100),
  );
  const trialDayState = (day: number) => {
    if (!trialStartedAt || !trialEndsAt || day <= 0) return "none";
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const start = new Date(
      trialStartedAt.getFullYear(),
      trialStartedAt.getMonth(),
      trialStartedAt.getDate(),
    );
    const end = new Date(
      trialEndsAt.getFullYear(),
      trialEndsAt.getMonth(),
      trialEndsAt.getDate(),
    );
    if (date < start || date > end) return "none";
    return date.getTime() <= new Date().setHours(0, 0, 0, 0)
      ? "completed"
      : "remaining";
  };
  const members = membersQuery.data ?? [];
  const activeMembers = members.filter((member) => member.status === "active");
  const expiringSoon = activeMembers.filter((member) => {
    if (!member.membership_ends_at) return false;
    const days = Math.ceil(
      (new Date(member.membership_ends_at).getTime() - Date.now()) / 86400000,
    );
    return days >= 0 && days <= 10;
  });
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const monthDays = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = monthStart.getDay();
  const expiryByDay = new Set(
    activeMembers
      .map((member) => member.membership_ends_at?.slice(0, 10))
      .filter(Boolean),
  );
  const dateLabel = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "No end date";
  const daysRemaining = (value?: string | null) =>
    value
      ? Math.ceil((new Date(value).getTime() - Date.now()) / 86400000)
      : null;

  return { kind: "view1" as const, props: { styles, colors, gym, DetailMetric, usersQuery, activeMembers, plansQuery, expiringSoon, trial, trialProgress, trialCompletedDays, trialRemainingDays, trialEndsAt, monthStart, leadingDays, monthDays, expiryByDay, trialDayState, daysRemaining, dateLabel, paymentsQuery } };
}

export function GymDetailsPanel(...args: Parameters<typeof useGymDetailsPanelPresentation>): React.JSX.Element {
  return <GymDetailsPanelView model={useGymDetailsPanelPresentation(...args)} />;
}

export function useDetailMetricPresentation({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  const { colors } = useAppTheme();
  return { kind: "view1" as const, props: { colors, icon, color, value, label } };
}

function DetailMetric(...args: Parameters<typeof useDetailMetricPresentation>): React.JSX.Element {
  return <DetailMetricView model={useDetailMetricPresentation(...args)} />;
}

export function useMyGymPanelPresentation() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canConfigureGym = hasPermission("configure_gym");
  const myGymQuery = useMyGym(canConfigureGym);
  const updateMyGymMutation = useUpdateMyGym();
  const [notice, setNotice] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<GymUpdateFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      timezone: "",
      settings: "{}",
      business_email: "",
      business_phone: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
      description: "",
      facilities: "",
    },
    values: myGymQuery.data
      ? {
          name: myGymQuery.data.name,
          email: myGymQuery.data.email ?? "",
          phone: myGymQuery.data.phone ?? "",
          address: myGymQuery.data.address ?? "",
          timezone: myGymQuery.data.timezone,
          settings: JSON.stringify(myGymQuery.data.settings ?? {}, null, 2),
          business_email: String(myGymQuery.data.settings?.business_email ?? myGymQuery.data.email ?? ""),
          business_phone: String(myGymQuery.data.settings?.business_phone ?? myGymQuery.data.phone ?? ""),
          city: String(myGymQuery.data.settings?.city ?? ""),
          state: String(myGymQuery.data.settings?.state ?? ""),
          pincode: String(myGymQuery.data.settings?.pincode ?? ""),
          latitude: myGymQuery.data.settings?.latitude == null ? "" : String(myGymQuery.data.settings.latitude),
          longitude: myGymQuery.data.settings?.longitude == null ? "" : String(myGymQuery.data.settings.longitude),
          description: String(myGymQuery.data.settings?.description ?? ""),
          facilities: Array.isArray(myGymQuery.data.settings?.facilities) ? myGymQuery.data.settings.facilities.join(", ") : "",
        }
      : undefined,
  });

  if (!canConfigureGym) {
    return null;
  }

  const submit = handleSubmit((values) => {
    setNotice(null);
    const latitude = values.latitude.trim() ? Number(values.latitude) : null;
    const longitude = values.longitude.trim() ? Number(values.longitude) : null;
    if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      setError("latitude", { message: "Latitude must be between -90 and 90" });
      return;
    }
    if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      setError("longitude", { message: "Longitude must be between -180 and 180" });
      return;
    }
    const existingSettings = myGymQuery.data?.settings ?? {};
    const parsed = gymUpdateSchema.safeParse({
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      timezone: values.timezone || null,
      settings: JSON.stringify({
        ...existingSettings,
        business_email: values.business_email.trim() || null,
        business_phone: values.business_phone.trim() || null,
        city: values.city.trim() || null,
        state: values.state.trim() || null,
        pincode: values.pincode.trim() || null,
        latitude,
        longitude,
        description: values.description.trim() || null,
        facilities: values.facilities.split(",").map((item) => item.trim()).filter(Boolean),
      }),
    });

    if (!parsed.success) {
      applyErrors(parsed.error.issues, setError);
      return;
    }

    updateMyGymMutation.mutate(parsed.data as GymUpdatePayload, {
      onSuccess: (gym) => {
        setNotice(`${gym.name} was updated.`);
        reset({
          name: gym.name,
          email: gym.email ?? "",
          phone: gym.phone ?? "",
          address: gym.address ?? "",
          timezone: gym.timezone,
          settings: JSON.stringify(gym.settings ?? {}, null, 2),
          business_email: String(gym.settings?.business_email ?? gym.email ?? ""),
          business_phone: String(gym.settings?.business_phone ?? gym.phone ?? ""),
          city: String(gym.settings?.city ?? ""),
          state: String(gym.settings?.state ?? ""),
          pincode: String(gym.settings?.pincode ?? ""),
          latitude: gym.settings?.latitude == null ? "" : String(gym.settings.latitude),
          longitude: gym.settings?.longitude == null ? "" : String(gym.settings.longitude),
          description: String(gym.settings?.description ?? ""),
          facilities: Array.isArray(gym.settings?.facilities) ? gym.settings.facilities.join(", ") : "",
        });
      },
    });
  });

  return { kind: "view1" as const, props: { myGymQuery, styles, GymField, control, errors, colors, setValue, setNotice, updateMyGymMutation, notice, submit } };
}

export function MyGymPanel(...args: Parameters<typeof useMyGymPanelPresentation>): React.JSX.Element {
  return <MyGymPanelView model={useMyGymPanelPresentation(...args)} />;
}

type GymFieldProps<T extends GymCreateFormValues | GymUpdateFormValues> = {
  control: ReturnType<typeof useForm<T>>["control"];
  name: Path<T>;
  label: string;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  required?: boolean;
};

export function useGymFieldPresentation<T extends GymCreateFormValues | GymUpdateFormValues>({
  control,
  name,
  label,
  error,
  keyboardType,
  multiline,
  leftIcon,
  autoCapitalize,
  required,
}: GymFieldProps<T>) {
  return { kind: "view1" as const, props: { control, name, autoCapitalize, error, keyboardType, label, leftIcon, multiline, required } };
}

function GymField<T extends GymCreateFormValues | GymUpdateFormValues>(...args: Parameters<typeof useGymFieldPresentation<T>>): React.JSX.Element {
  return <GymFieldView<T> model={useGymFieldPresentation<T>(...args)} />;
}

function applyErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  setError: UseFormSetError<GymCreateFormValues | GymUpdateFormValues>,
) {
  for (const issue of issues) {
    const name = String(issue.path[0] ?? "");
    if (name) {
      setError(name as Path<GymCreateFormValues | GymUpdateFormValues>, {
        message: issue.message,
      });
    }
  }
}




