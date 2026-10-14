import type * as React from "react";
import { MembershipPlanScreenView, PlanCardView, PlatformPlanCrudModalView, PlanActionModalView, PlanEditModalView } from "./MembershipPlanScreen.presentation";
import { createPlatformModalStyles, createStyles } from "./MembershipPlanScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PulseDashboardLayout } from "../../components/dashboard/PulseDashboardLayout";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import { membershipPlanConfig } from "../../features/operations/resourceConfigs";
import { membershipPlansApi } from "../../services/api/operations";
import { platformPlansApi } from "../../services/api/platformPlans";
import { getApiErrorMessage } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import { formatCurrency } from "../../utils/formatters";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import type { PlatformPlan } from "../../types/saas";

type DisplayPlan = {
  id: string;
  slug?: string;
  member_limit?: string;
  billing_period?: string | null;
  cta_label?: string;
  trial_days?: number;
  is_popular?: boolean;
  is_active?: boolean;
  gym_id?: string;
  gym_name?: string | null;
  name: string;
  description: string | null;
  duration_days: number;
  price_cents: number;
  currency: string;
  features: string[];
};
const starterPlans: DisplayPlan[] = [
  {
    id: "basic-template",
    name: "Basic Plan",
    description: "Perfect for getting started",
    duration_days: 30,
    price_cents: 99900,
    currency: "INR",
    features: [
      "Gym Access",
      "Basic Gym Equipment",
      "Locker Room Access",
      "Diet Plan (Basic)",
    ],
  },
  {
    id: "standard-template",
    name: "Standard Plan",
    description: "Most popular choice",
    duration_days: 90,
    price_cents: 199900,
    currency: "INR",
    features: [
      "Gym Access",
      "All Gym Equipment",
      "3 Group Classes / Week",
      "Progress Tracking",
    ],
  },
  {
    id: "premium-template",
    name: "Premium Plan",
    description: "For serious fitness lovers",
    duration_days: 180,
    price_cents: 299900,
    currency: "INR",
    features: [
      "Gym Access (24/7)",
      "Unlimited Group Classes",
      "Diet Plan (Premium)",
      "2 Personal Training Sessions",
    ],
  },
  {
    id: "elite-template",
    name: "Elite Plan",
    description: "The ultimate fitness experience",
    duration_days: 365,
    price_cents: 499900,
    currency: "INR",
    features: [
      "All Premium Equipment",
      "Unlimited Group Classes",
      "Diet Plan (Elite)",
      "4 Personal Training Sessions",
    ],
  },
];

export function useMembershipPlanScreenPresentation() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super_admin";
  const allowed = useAuthStore((state) =>
    state.hasPermission("manage_membership_plans"),
  );
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [detailsPlan, setDetailsPlan] = useState<DisplayPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DisplayPlan | null>(null);
  const [platformPlanDraft, setPlatformPlanDraft] = useState<PlatformPlan | "new" | null>(null);
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const query = useQuery({
    queryKey: ["operations", "membership-plans", "showcase", isSuperAdmin ? "platform" : "gym"],
    queryFn: () => membershipPlansApi.list({ limit: 200 }),
    enabled: allowed,
    retry: false,
  });
  const platformQuery = useQuery({
    queryKey: ["platform-plans", "membership-showcase"],
    queryFn: platformPlansApi.list,
    enabled: allowed && isSuperAdmin,
    retry: false,
  });
  const installStarters = useMutation({
    mutationFn: async () => {
      const existingNames = new Set(
        (query.data ?? []).map((plan) => plan.name.trim().toLowerCase()),
      );
      const missing = starterPlans.filter(
        (plan) => !existingNames.has(plan.name.toLowerCase()),
      );
      await Promise.all(
        missing.map(({ id: _id, ...payload }) =>
          membershipPlansApi.create(payload),
        ),
      );
      return missing.length;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["operations", "membership-plans"],
      }),
  });
  if (!allowed) return { kind: "view1" as const, props: {  } };
  const plans: DisplayPlan[] = isSuperAdmin
    ? (platformQuery.data ?? []).map((plan) => ({
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        duration_days: plan.billing_period === "year" ? 365 : 30,
        price_cents: plan.price_cents ?? 0,
        currency: plan.currency,
        features: plan.features,
        member_limit: plan.member_limit,
        billing_period: plan.billing_period,
        cta_label: plan.cta_label,
        trial_days: plan.trial_days,
        is_popular: plan.is_popular,
        is_active: plan.is_active,
      }))
    : query.data?.length
      ? query.data
      : starterPlans;
  return { kind: "view2" as const, props: { isSuperAdmin, styles, query, installStarters, setPlatformPlanDraft, platformQuery, colors, plans, PlanCard, setEditingPlan, setDetailsPlan, PlanActionModal, detailsPlan, PlanEditModal, editingPlan, queryClient, PlatformPlanCrudModal, platformPlanDraft } };
}

export function MembershipPlanScreen(...args: Parameters<typeof useMembershipPlanScreenPresentation>): React.JSX.Element {
  return <MembershipPlanScreenView model={useMembershipPlanScreenPresentation(...args)} />;
}

export function usePlanCardPresentation({
  plan,
  index,
  styles,
  onEdit,
  onView,
}: {
  plan: DisplayPlan;
  index: number;
  styles: ReturnType<typeof createStyles>;
  onEdit?: (plan: DisplayPlan) => void;
  onView: (plan: DisplayPlan) => void;
}) {
  const accent = ["#2563EB", "#0066CC", "#059669", "#EA580C"][index % 4];
  const icon = (
    [
      "star-outline",
      "diamond-outline",
      "trophy-outline",
      "rocket-outline",
    ] as const
  )[index % 4];
  return { kind: "view1" as const, props: { styles, index, accent, icon, plan, onEdit, onView } };
}

function PlanCard(...args: Parameters<typeof usePlanCardPresentation>): React.JSX.Element {
  return <PlanCardView model={usePlanCardPresentation(...args)} />;
}

export function usePlatformPlanCrudModalPresentation({
  plan,
  onClose,
  onSaved,
}: {
  plan: PlatformPlan | "new" | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createPlatformModalStyles(colors), [colors]);
  const existing = plan && plan !== "new" ? plan : null;
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing?.price_cents == null ? "" : String(existing.price_cents / 100));
  const [currency, setCurrency] = useState(existing?.currency ?? "INR");
  const [billingPeriod, setBillingPeriod] = useState(existing?.billing_period ?? "month");
  const [memberLimit, setMemberLimit] = useState(existing?.member_limit ?? "");
  const [features, setFeatures] = useState(existing?.features.join("\n") ?? "");
  const [ctaLabel, setCtaLabel] = useState(existing?.cta_label ?? "Get started");
  const [trialDays, setTrialDays] = useState(String(existing?.trial_days ?? 30));
  const [displayOrder, setDisplayOrder] = useState(String(existing?.display_order ?? 0));
  const [isPopular, setIsPopular] = useState(existing?.is_popular ?? false);
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);
  useEffect(() => {
    const item = plan && plan !== "new" ? plan : null;
    setSlug(item?.slug ?? ""); setName(item?.name ?? ""); setDescription(item?.description ?? "");
    setPrice(item?.price_cents == null ? "" : String(item.price_cents / 100)); setCurrency(item?.currency ?? "INR");
    setBillingPeriod(item?.billing_period ?? "month"); setMemberLimit(item?.member_limit ?? ""); setFeatures(item?.features.join("\n") ?? "");
    setCtaLabel(item?.cta_label ?? "Get started"); setTrialDays(String(item?.trial_days ?? 30)); setDisplayOrder(String(item?.display_order ?? 0));
    setIsPopular(item?.is_popular ?? false); setIsActive(item?.is_active ?? true);
  }, [plan]);
  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(), description: description.trim(), price_cents: price.trim() ? Math.round(Number(price) * 100) : null,
        currency: currency.trim().toUpperCase(), billing_period: billingPeriod.trim() || null, member_limit: memberLimit.trim(),
        features: features.split("\n").map((item) => item.trim()).filter(Boolean), cta_label: ctaLabel.trim(), trial_days: Math.max(0, Math.round(Number(trialDays) || 0)),
        display_order: Math.max(0, Math.round(Number(displayOrder) || 0)), is_popular: isPopular, is_active: isActive,
      };
      return existing ? platformPlansApi.update(existing.id, payload) : platformPlansApi.create({ slug: slug.trim().toLowerCase(), ...payload });
    },
    onSuccess: onSaved,
  });
  const remove = useMutation({ mutationFn: () => platformPlansApi.remove(existing!.id), onSuccess: onSaved });
  if (!plan) return null;
  const input = (label: string, value: string, setter: (next: string) => void, numeric = false, compact = false) => <View style={[styles.field, compact && styles.gridField]} key={label}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setter} keyboardType={numeric ? "numeric" : "default"} multiline={label === "Description" || label.startsWith("Features")} style={[styles.input, (label === "Description" || label.startsWith("Features")) && styles.multiline]} placeholderTextColor={colors.textMuted} /></View>;
  return { kind: "view1" as const, props: { onClose, styles, existing, colors, input, slug, setSlug, name, setName, description, setDescription, price, setPrice, currency, setCurrency, billingPeriod, setBillingPeriod, displayOrder, setDisplayOrder, memberLimit, setMemberLimit, ctaLabel, setCtaLabel, trialDays, setTrialDays, features, setFeatures, isPopular, setIsPopular, isActive, setIsActive, save, remove } };
}

function PlatformPlanCrudModal(...args: Parameters<typeof usePlatformPlanCrudModalPresentation>): React.JSX.Element {
  return <PlatformPlanCrudModalView model={usePlatformPlanCrudModalPresentation(...args)} />;
}



export function usePlanActionModalPresentation({
  plan,
  onClose,
  styles,
}: {
  plan: DisplayPlan | null;
  onClose: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!plan) return null;
  return { kind: "view1" as const, props: { onClose, styles, plan } };
}

function PlanActionModal(...args: Parameters<typeof usePlanActionModalPresentation>): React.JSX.Element {
  return <PlanActionModalView model={usePlanActionModalPresentation(...args)} />;
}

export function usePlanEditModalPresentation({
  plan,
  onClose,
  onSaved,
  styles,
}: {
  plan: DisplayPlan | null;
  onClose: () => void;
  onSaved: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description ?? "");
      setDuration(String(plan.duration_days));
      setPrice(String(plan.price_cents / 100));
      setFeatures(plan.features.join(", "));
    }
  }, [plan]);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error("No plan selected.");
      const days = Number(duration);
      const amount = Number(price);
      if (
        !name.trim() ||
        !Number.isFinite(days) ||
        days <= 0 ||
        !Number.isFinite(amount) ||
        amount <= 0
      )
        throw new Error("Enter a valid name, price, and duration.");
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        duration_days: Math.round(days),
        price_cents: Math.round(amount * 100),
        currency: plan.currency,
        features: features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      return plan.id.endsWith("-template")
        ? membershipPlansApi.create(payload)
        : membershipPlansApi.update(plan.id, payload);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });
  if (!plan) return null;
  const fields: Array<[string, string, (value: string) => void]> = [
    ["Plan name", name, setName],
    ["Description", description, setDescription],
    ["Price", price, setPrice],
    ["Duration (days)", duration, setDuration],
    ["Features (comma separated)", features, setFeatures],
  ];
  return { kind: "view1" as const, props: { onClose, styles, plan, fields, mutation } };
}

function PlanEditModal(...args: Parameters<typeof usePlanEditModalPresentation>): React.JSX.Element {
  return <PlanEditModalView model={usePlanEditModalPresentation(...args)} />;
}


