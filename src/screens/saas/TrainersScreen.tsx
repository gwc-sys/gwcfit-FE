import type * as React from "react";
import { TrainersScreenView, StatView, TrainerRowView } from "./TrainersScreen.presentation";
import { createStyles } from "./TrainersScreen.styles";
import { showAlert } from "../../utils/appAlert";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { StatusBadge } from "../../components/StatusBadge";
import { useCrudResource } from "../../hooks/useOperations";
import { getApiErrorMessage } from "../../services/api/client";
import { trainersApi } from "../../services/api/operations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";
import type { Trainer } from "../../types/saas";
import { AccessDeniedScreen } from "./AccessDeniedScreen";

type TrainerFilter = "all" | "active" | "inactive";

export function useTrainersScreenPresentation() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canManage = useAuthStore((state) => state.hasPermission("manage_trainers"));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TrainerFilter>("all");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState("");
  const resource = useCrudResource("trainers", trainersApi, { skip: page * 50, limit: 50 }, canManage);
  const trainers = resource.listQuery.data ?? [];
  const visible = trainers.filter((trainer) => {
    const term = search.trim().toLowerCase();
    return (filter === "all" || (filter === "active" ? trainer.is_active : !trainer.is_active)) &&
      (!term || `${trainer.full_name} ${trainer.email ?? ""} ${trainer.phone ?? ""} ${trainer.specialties.join(" ")}`.toLowerCase().includes(term));
  });

  if (!canManage) return { kind: "view1" as const, props: {  } };

  const openCreate = () => { setEditing(null); setName(""); setEmail(""); setPhone(""); setSpecialties(""); setFormOpen(true); };
  const openEdit = (trainer: Trainer) => { setEditing(trainer); setName(trainer.full_name); setEmail(trainer.email ?? ""); setPhone(trainer.phone ?? ""); setSpecialties(trainer.specialties.join(", ")); setFormOpen(true); };
  const save = () => {
    if (!name.trim()) return showAlert("Trainer name required");
    const payload = { full_name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, specialties: specialties.split(",").map((item) => item.trim()).filter(Boolean), hourly_rate_cents: editing?.hourly_rate_cents ?? 0, commission_rate: editing?.commission_rate ?? 0 };
    if (editing) resource.updateMutation.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    else resource.createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
  };
  const remove = (trainer: Trainer) => showAlert("Deactivate trainer", trainer.full_name, [{ text: "Cancel", style: "cancel" }, { text: "Deactivate", style: "destructive", onPress: () => resource.deleteMutation.mutate(trainer.id) }]);

  return { kind: "view2" as const, props: { styles, resource, colors, search, setSearch, setPage, setFilter, filter, openCreate, Stat, trainers, visible, TrainerRow, openEdit, remove, page, formOpen, setFormOpen, editing, name, setName, email, setEmail, phone, setPhone, specialties, setSpecialties, save , activeTrainerCount: trainers.filter((item) => item.is_active).length, inactiveTrainerCount: trainers.filter((item) => !item.is_active).length, newTrainerCount: trainers.filter((item) => { const date = new Date(item.created_at); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }).length} };
}

export function TrainersScreen(...args: Parameters<typeof useTrainersScreenPresentation>): React.JSX.Element {
  return <TrainersScreenView model={useTrainersScreenPresentation(...args)} />;
}

export function useStatPresentation({ icon, label, value, tone, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string; styles: ReturnType<typeof createStyles> }) { return { kind: "view1" as const, props: { styles, tone, icon, label, value } }; }

function Stat(...args: Parameters<typeof useStatPresentation>): React.JSX.Element {
  return <StatView model={useStatPresentation(...args)} />;
}
export function useTrainerRowPresentation({ trainer, styles, colors, onEdit, onDelete }: { trainer: Trainer; styles: ReturnType<typeof createStyles>; colors: ThemeColors; onEdit: () => void; onDelete: () => void }) { return { kind: "view1" as const, props: { styles, trainer, onEdit, colors, onDelete } }; }

function TrainerRow(...args: Parameters<typeof useTrainerRowPresentation>): React.JSX.Element {
  return <TrainerRowView model={useTrainerRowPresentation(...args)} />;
}


