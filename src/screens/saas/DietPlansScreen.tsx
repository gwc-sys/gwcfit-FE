import type * as React from "react";
import { DietPlansScreenView, StatView, PlanCardView } from "./DietPlansScreen.presentation";
import { createSharedStyles, createStyles } from "./DietPlansScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { Screen } from "../../components/Screen";
import { ResourceCrudPanel } from "../../features/operations/ResourceCrudPanel";
import { dietPlanConfig } from "../../features/operations/resourceConfigs";
import { useCrudResource } from "../../hooks/useOperations";
import { getApiErrorMessage } from "../../services/api/client";
import { dietPlansApi } from "../../services/api/operations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { ThemeColors } from "../../theme/theme";
import type { DietPlan } from "../../types/saas";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

const dietImage = require("../../../assets/images/diet-plan-bowls.png");
const categories = ["All Plans", "Weight Loss", "Muscle Gain", "Maintenance", "Medical", "Custom"] as const;
type Category = (typeof categories)[number];

function planCategory(plan: DietPlan): Exclude<Category, "All Plans"> {
  if (plan.category) return plan.category;
  const title = plan.title.toLowerCase();
  if (title.includes("loss") || title.includes("cut")) return "Weight Loss";
  if (title.includes("gain") || title.includes("bulk")) return "Muscle Gain";
  if (title.includes("maintain")) return "Maintenance";
  if (title.includes("diabet") || title.includes("medical") || title.includes("health")) return "Medical";
  return "Custom";
}

export function useDietPlansScreenPresentation() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const styles = useMemo(() => createStyles(compact, colors), [compact, colors]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All Plans");
  const [activeOnly, setActiveOnly] = useState(true);
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(0);
  const [createRequest, setCreateRequest] = useState(0);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const canManage = hasPermission("manage_diet_plans");
  const { listQuery } = useCrudResource("diet-plans", dietPlansApi, { skip: 0, limit: 200 }, canManage);

  if (!canManage) return { kind: "view1" as const, props: {  } };

  const plans = listQuery.data ?? [];
  const activePlans = plans.filter((plan) => plan.is_active);
  const assignedClients = new Set(plans.map((plan) => plan.member_id).filter(Boolean)).size;
  const averageCalories = plans.length ? Math.round(plans.reduce((total, plan) => total + plan.calories_per_day, 0) / plans.length) : 0;
  const filteredPlans = plans
    .filter((plan) => !activeOnly || plan.is_active)
    .filter((plan) => category === "All Plans" || planCategory(plan) === category)
    .filter((plan) => `${plan.title} ${plan.member_name ?? ""} ${plan.trainer_name ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visiblePlans = filteredPlans.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return { kind: "view2" as const, props: { styles, colors, navigation, setEditRecordId, setFormModalOpen, setCreateRequest, Stat, plans, activePlans, assignedClients, averageCalories, search, setSearch, setPage, setActiveOnly, activeOnly, setAscending, ascending, categories, setCategory, category, listQuery, visiblePlans, PlanCard, formModalOpen, editRecordId, createRequest, planCategory, filteredPlans, safePage, pageSize, pageCount } };
}

export function DietPlansScreen(...args: Parameters<typeof useDietPlansScreenPresentation>): React.JSX.Element {
  return <DietPlansScreenView model={useDietPlansScreenPresentation(...args)} />;
}

export function useStatPresentation({ icon, tone, value, label, note }: { icon: keyof typeof Ionicons.glyphMap; tone: string; value: string; label: string; note: string }) {
  const { colors } = useAppTheme();
  const shared = useMemo(() => createSharedStyles(colors), [colors]);
  return { kind: "view1" as const, props: { shared, tone, icon, value, label, note } };
}

function Stat(...args: Parameters<typeof useStatPresentation>): React.JSX.Element {
  return <StatView model={useStatPresentation(...args)} />;
}

export function usePlanCardPresentation({ plan, index, onEdit }: { plan: DietPlan; index: number; onEdit: () => void }) {
  const { colors } = useAppTheme();
  const shared = useMemo(() => createSharedStyles(colors), [colors]);
  const mealCount = new Set(
    (plan.meals ?? []).map((meal) => String(meal.meal_type ?? meal.meal ?? meal.title ?? "Meal")),
  ).size;
  return { kind: "view1" as const, props: { shared, dietImage, index, plan, onEdit, planCategory, mealCount } };
}

function PlanCard(...args: Parameters<typeof usePlanCardPresentation>): React.JSX.Element {
  return <PlanCardView model={usePlanCardPresentation(...args)} />;
}




