import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { images } from "../../data/media";
import type { RootStackParamList } from "../../navigation/types";
import { authApi } from "../../services/api/auth";
import { getApiErrorMessage, getApiStatus } from "../../services/api/client";
import { useAuthStore } from "../../store/useAuthStore";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { GymOption, GymUserRegistrationPayload, JoinableRoleName, OwnerRegistrationPayload } from "../../types/saas";
import { gymUserRegistrationSchema, ownerRegistrationSchema } from "../../validation/auth";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;
type Mode = "Owner" | "Gym User";

const joinableRoles: JoinableRoleName[] = ["member", "trainer", "receptionist", "sub_admin"];
const roleLabels: Record<JoinableRoleName, string> = {
  member: "Member",
  trainer: "Trainer",
  receptionist: "Reception",
  sub_admin: "Sub Admin"
};
const roleIcons: Record<JoinableRoleName, keyof typeof Ionicons.glyphMap> = {
  member: "id-card-outline",
  trainer: "barbell-outline",
  receptionist: "headset-outline",
  sub_admin: "shield-checkmark-outline"
};

function getGymOptionsErrorMessage(error: unknown) {
  if (getApiStatus(error) === 404) {
    return "Gym choices could not be loaded from the API. Type the exact gym name below or tap Retry after checking the backend URL.";
  }

  return getApiErrorMessage(error);
}

export function SignUpScreen({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const compact = width < 390 || height < 720;
  const wide = width >= 768;
  const phone = !wide;
  const [mode, setMode] = useState<Mode>("Owner");
  const [ownerPasswordVisible, setOwnerPasswordVisible] = useState(false);
  const [gymUserPasswordVisible, setGymUserPasswordVisible] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const ownerForm = useForm<OwnerRegistrationPayload>({
    mode: "onTouched",
    defaultValues: {
      gym_name: "",
      full_name: "",
      email: "",
      password: "",
      phone: "",
      invitation_token: ""
    }
  });
  const gymUserForm = useForm<GymUserRegistrationPayload>({
    mode: "onTouched",
    defaultValues: {
      gym_id: "",
      gym_name: "",
      full_name: "",
      email: "",
      password: "",
      role: "member",
      invitation_token: ""
    }
  });

  const ownerMutation = useMutation({
    mutationFn: authApi.registerOwner,
    onSuccess: (session) => {
      setSession(session);
    }
  });
  const gymUserMutation = useMutation({
    mutationFn: authApi.registerExistingGymUser,
    onSuccess: (session) => {
      setSession(session);
    }
  });
  const gymOptionsQuery = useQuery({
    queryKey: ["auth", "gym-options"],
    queryFn: authApi.listGymOptions,
    enabled: mode === "Gym User",
    staleTime: 60_000
  });
  const gymOptions = useMemo(
    () =>
      (gymOptionsQuery.data ?? [])
        .filter((gym) => gym.id?.trim() && gym.name?.trim())
        .map((gym) => ({ ...gym, name: gym.name.trim() })),
    [gymOptionsQuery.data]
  );

  const submitOwner = ownerForm.handleSubmit((values) => {
    const parsed = ownerRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name in values) {
          ownerForm.setError(name as Path<OwnerRegistrationPayload>, { message: issue.message });
        }
      }
      return;
    }
    ownerMutation.mutate(parsed.data);
  });

  const submitGymUser = gymUserForm.handleSubmit((values) => {
    const parsed = gymUserRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0] ?? "");
        if (name in values) {
          gymUserForm.setError(name as Path<GymUserRegistrationPayload>, { message: issue.message });
        }
      }
      return;
    }
    gymUserMutation.mutate(parsed.data);
  });
  const watchedRole = (gymUserForm.watch("role") ?? "member") as JoinableRoleName;
  const selectedGymId = gymUserForm.watch("gym_id") ?? "";
  const selectedGymName = gymUserForm.watch("gym_name") ?? "";
  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    ownerForm.clearErrors();
    gymUserForm.clearErrors();
    ownerMutation.reset();
    gymUserMutation.reset();
  };
  const handleGymSelect = (gym: GymOption) => {
    gymUserForm.setValue("gym_id", gym.id, { shouldDirty: true, shouldValidate: true });
    gymUserForm.setValue("gym_name", gym.name, { shouldDirty: true, shouldValidate: true });
    gymUserForm.clearErrors("gym_id");
    gymUserForm.clearErrors("gym_name");
  };
  const handleManualGymNameChange = (name: string) => {
    gymUserForm.setValue("gym_id", "", { shouldDirty: true, shouldValidate: true });
    gymUserForm.setValue("gym_name", name, { shouldDirty: true, shouldValidate: true });
    if (name.trim()) {
      gymUserForm.clearErrors("gym_name");
    }
  };

  return (
    <Screen scroll noPadding keyboard dark contentContainerStyle={phone && styles.screenContentPhone}>
      <View style={[styles.page, wide && styles.pageWide, wide && { minHeight: Math.max(height, 720) }]}> 
        <ImageBackground
          source={images.gymHero}
          resizeMode="cover"
          style={[styles.hero, phone && styles.heroPhone, compact && styles.heroCompact, wide && styles.heroWide]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={["rgba(7,5,2,0.06)", "rgba(7,5,2,0.24)", "rgba(7,5,2,0.94)"]}
            locations={[0, 0.52, 1]}
            style={[styles.heroOverlay, compact && styles.heroOverlayCompact, wide && styles.heroOverlayWide]}
          >
            <AppHeader title="PulseFit" subtitle="Secure gym operations" onBack={() => navigation.goBack()} light />
            <View style={styles.heroContent}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>{mode === "Owner" ? "CREATE WORKSPACE" : "JOIN YOUR TEAM"}</Text>
              </View>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{mode === "Owner" ? "Open your gym command center" : "Join your team workspace"}</Text>
              <Text style={[styles.heroCopy, compact && styles.heroCopyCompact]}>
                {mode === "Owner"
                  ? "Register the gym and owner account together, then manage members, staff, payments, and reports."
                  : "Enter the gym name shared by your admin to access the tools for your role."}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
        <View style={[styles.content, phone && styles.contentPhone, compact && styles.contentCompact, wide && styles.contentWide]}>
          <SegmentedControl
            options={["Owner", "Gym User"]}
            value={mode}
            onChange={handleModeChange}
            accentColor="#0A84FF"
            activeBackgroundColor="#12110E"
          />

          {mode === "Owner" ? (
            <View key="owner-form" style={[styles.form, phone && styles.formPhone, wide && styles.formWide]}>
              <View style={styles.formHeader}>
                <Text style={styles.groupTitle}>Owner account</Text>
                <Text style={styles.formSubtitle}>Best for gym owners creating a new tenant in PulseFit.</Text>
              </View>
              <Field
                control={ownerForm.control}
                error={ownerForm.formState.errors.gym_name?.message}
                label="Gym name"
                leftIcon="business-outline"
                name="gym_name"
                required
              />
              <Field
                control={ownerForm.control}
                error={ownerForm.formState.errors.full_name?.message}
                label="Full name"
                leftIcon="person-outline"
                name="full_name"
                required
              />
              <Field
                autoCapitalize="none"
                control={ownerForm.control}
                error={ownerForm.formState.errors.email?.message}
                keyboardType="email-address"
                label="Email"
                leftIcon="mail-outline"
                name="email"
                required
              />
              <Field
                control={ownerForm.control}
                error={ownerForm.formState.errors.password?.message}
                label="Password"
                leftIcon="lock-closed-outline"
                maxLength={72}
                name="password"
                required
                right={
                  <PasswordToggle
                    visible={ownerPasswordVisible}
                    onPress={() => setOwnerPasswordVisible((current) => !current)}
                  />
                }
                secureTextEntry={!ownerPasswordVisible}
              />
              <Field
                control={ownerForm.control}
                error={ownerForm.formState.errors.phone?.message}
                keyboardType="phone-pad"
                label="Phone"
                leftIcon="call-outline"
                name="phone"
              />
              <Field
                autoCapitalize="none"
                control={ownerForm.control}
                error={ownerForm.formState.errors.invitation_token?.message}
                label="Invitation token"
                leftIcon="ticket-outline"
                name="invitation_token"
              />
              <NoticeBanner message={ownerMutation.error ? getApiErrorMessage(ownerMutation.error) : null} tone="error" />
              <PrimaryButton
                title="Create Owner Account"
                icon="person-add-outline"
                foregroundColor="#FFFFFF"
                loading={ownerMutation.isPending}
                onPress={submitOwner}
                style={styles.submitButton}
              />
            </View>
          ) : (
            <View key="gym-user-form" style={[styles.form, phone && styles.formPhone, wide && styles.formWide]}>
              <View style={styles.formHeader}>
                <Text style={styles.groupTitle}>Join gym</Text>
                <Text style={styles.formSubtitle}>Choose the role your gym admin assigned to you.</Text>
              </View>
              <GymOptionPicker
                error={gymUserForm.formState.errors.gym_name?.message}
                gyms={gymOptions}
                loading={gymOptionsQuery.isLoading || gymOptionsQuery.isFetching}
                onRetry={() => gymOptionsQuery.refetch()}
                onManualNameChange={handleManualGymNameChange}
                onSelect={handleGymSelect}
                queryError={gymOptionsQuery.error ? getGymOptionsErrorMessage(gymOptionsQuery.error) : null}
                manualGymName={selectedGymName}
                selectedGymId={selectedGymId}
                selectedGymName={selectedGymName}
              />
              <Field
                control={gymUserForm.control}
                error={gymUserForm.formState.errors.full_name?.message}
                label="Full name"
                leftIcon="person-outline"
                name="full_name"
                required
              />
              <Field
                autoCapitalize="none"
                control={gymUserForm.control}
                error={gymUserForm.formState.errors.email?.message}
                keyboardType="email-address"
                label="Email"
                leftIcon="mail-outline"
                name="email"
                required
              />
              <Field
                control={gymUserForm.control}
                error={gymUserForm.formState.errors.password?.message}
                label="Password"
                leftIcon="lock-closed-outline"
                maxLength={72}
                name="password"
                required
                right={
                  <PasswordToggle
                    visible={gymUserPasswordVisible}
                    onPress={() => setGymUserPasswordVisible((current) => !current)}
                  />
                }
                secureTextEntry={!gymUserPasswordVisible}
              />
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleGrid}>
                {joinableRoles.map((role) => {
                  const selected = watchedRole === role;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={role}
                      onPress={() => gymUserForm.setValue("role", role, { shouldDirty: true, shouldValidate: true })}
                      style={({ pressed }) => [styles.roleCard, selected && styles.roleCardSelected, pressed && styles.pressed]}
                    >
                      <Ionicons name={roleIcons[role]} size={20} color={selected ? colors.white : colors.muted} />
                      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{roleLabels[role]}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Field
                control={gymUserForm.control}
                error={gymUserForm.formState.errors.invitation_token?.message}
                label="Invitation token"
                leftIcon="ticket-outline"
                name="invitation_token"
              />
              <NoticeBanner message={gymUserMutation.error ? getApiErrorMessage(gymUserMutation.error) : null} tone="error" />
              <PrimaryButton
                title="Join Gym"
                icon="log-in-outline"
                foregroundColor="#FFFFFF"
                loading={gymUserMutation.isPending}
                onPress={submitGymUser}
                style={styles.submitButton}
              />
            </View>
          )}

          <Pressable onPress={() => navigation.navigate("Login")} style={[styles.footer, wide && styles.footerWide]}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

type GymOptionPickerProps = {
  gyms: GymOption[];
  selectedGymId?: string | null;
  selectedGymName?: string | null;
  loading: boolean;
  error?: string;
  queryError?: string | null;
  manualGymName?: string | null;
  onManualNameChange: (name: string) => void;
  onSelect: (gym: GymOption) => void;
  onRetry: () => void;
};

function GymOptionPicker({
  gyms,
  selectedGymId,
  selectedGymName,
  loading,
  error,
  queryError,
  manualGymName,
  onManualNameChange,
  onSelect,
  onRetry
}: GymOptionPickerProps) {
  const [open, setOpen] = useState(false);
  const displayName = selectedGymName?.trim() || "Select your gym";

  const selectGym = (gym: GymOption) => {
    onSelect(gym);
    setOpen(false);
  };

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>Gym name</Text>
        <Text style={styles.required}>Required</Text>
      </View>

      <Pressable
        accessibilityLabel="Select gym"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.gymSelect, open && styles.gymSelectOpen, pressed && styles.pressed]}
      >
        <View style={styles.gymSelectIcon}>
          <Ionicons name="business-outline" size={19} color="#0A84FF" />
        </View>
        <Text numberOfLines={1} style={[styles.gymSelectText, !selectedGymName?.trim() && styles.gymSelectPlaceholder]}>
          {displayName}
        </Text>
        {loading ? (
          <ActivityIndicator color="#0A84FF" size="small" />
        ) : (
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
        )}
      </Pressable>

      {open ? (
        loading ? (
          <View style={styles.optionState}>
            <ActivityIndicator color="#0A84FF" />
            <Text style={styles.optionStateText}>Loading gyms...</Text>
          </View>
        ) : queryError ? (
          <View style={styles.queryErrorStack}>
            <View style={styles.optionState}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
              <Text style={styles.optionStateText}>{queryError}</Text>
              <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
            <FormTextField
              error={error}
              label="Type gym name"
              leftIcon="business-outline"
              onChangeText={onManualNameChange}
              placeholder="Exact gym name"
              required
              value={manualGymName ?? ""}
            />
          </View>
        ) : gyms.length === 0 ? (
          <View style={styles.optionState}>
            <Ionicons name="business-outline" size={20} color={colors.muted} />
            <Text style={styles.optionStateText}>No active gyms are available yet.</Text>
          </View>
        ) : (
          <View accessibilityRole="radiogroup" style={styles.gymGrid}>
            {gyms.map((gym) => {
              const selected = selectedGymId ? selectedGymId === gym.id : selectedGymName === gym.name;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={gym.id}
                  onPress={() => selectGym(gym)}
                  style={({ pressed }) => [styles.gymOption, selected && styles.gymOptionSelected, pressed && styles.pressed]}
                >
                  <View style={[styles.gymOptionIcon, selected && styles.gymOptionIconSelected]}>
                    <Ionicons name="business-outline" size={18} color={selected ? "#FFFFFF" : "#0A84FF"} />
                  </View>
                  <Text numberOfLines={2} style={[styles.gymOptionText, selected && styles.gymOptionTextSelected]}>
                    {gym.name}
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
                </Pressable>
              );
            })}
          </View>
        )
      ) : (
        null
      )}

      {error && !queryError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type FieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  right?: ReactNode;
  required?: boolean;
};

function Field<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  maxLength,
  autoCapitalize,
  keyboardType = "default",
  leftIcon,
  right,
  required
}: FieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <FormTextField
          autoCapitalize={autoCapitalize}
          error={error}
          keyboardType={keyboardType}
          label={label}
          leftIcon={leftIcon}
          maxLength={maxLength}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={label}
          required={required}
          right={right}
          secureTextEntry={secureTextEntry}
          value={String(value ?? "")}
        />
      )}
    />
  );
}

function PasswordToggle({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.passwordToggle}
    >
      <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: "#090806"
  },
  pageWide: {
    flexDirection: "row"
  },
  screenContentPhone: {
    paddingBottom: spacing["48"]
  },
  hero: {
    minHeight: 390,
    backgroundColor: "#171006"
  },
  heroCompact: {
    minHeight: 220
  },
  heroPhone: {
    minHeight: 240
  },
  heroWide: {
    flex: 1.12,
    minHeight: 720
  },
  heroImage: {
    backgroundColor: "#171006"
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl
  },
  heroOverlayCompact: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg
  },
  heroOverlayWide: {
    paddingHorizontal: spacing["48"],
    paddingTop: spacing.xxl,
    paddingBottom: spacing["48"]
  },
  heroContent: {
    maxWidth: 560
  },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.42)",
    backgroundColor: "rgba(0,122,255,0.14)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: "#0A84FF"
  },
  eyebrowText: {
    ...typography.small,
    color: "#64D2FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2
  },
  heroTitle: {
    ...typography.title,
    color: colors.white,
    marginTop: spacing.lg,
    fontSize: 44,
    lineHeight: 50
  },
  heroTitleCompact: {
    fontSize: 31,
    lineHeight: 37
  },
  heroCopy: {
    ...typography.body,
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.sm,
    maxWidth: 500,
    fontSize: 16,
    lineHeight: 24
  },
  heroCopyCompact: {
    fontSize: 14,
    lineHeight: 20
  },
  content: {
    alignSelf: "center",
    width: "100%",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    backgroundColor: "#090806"
  },
  contentCompact: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md
  },
  contentPhone: {
    paddingBottom: spacing["48"]
  },
  contentWide: {
    flex: 0.88,
    minWidth: 440,
    maxWidth: 680,
    justifyContent: "center",
    paddingHorizontal: spacing["48"],
    paddingVertical: spacing["48"]
  },
  form: {
    width: "100%",
    gap: spacing.lg,
    borderRadius: radius.container,
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.18)",
    backgroundColor: "#12110E",
    padding: spacing.xxl
  },
  formWide: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center"
  },
  formPhone: {
    gap: spacing.md,
    padding: spacing.lg
  },
  formHeader: {
    gap: spacing.xs
  },
  formSubtitle: {
    ...typography.small,
    color: colors.muted
  },
  pickerWrap: {
    gap: spacing.xs
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  groupTitle: {
    ...typography.h3,
    color: colors.ink
  },
  fieldLabel: {
    ...typography.small,
    color: colors.ink
  },
  required: {
    ...typography.small,
    color: colors.accent
  },
  optionState: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  optionStateText: {
    ...typography.small,
    color: colors.muted,
    flex: 1
  },
  gymSelect: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md
  },
  gymSelectOpen: {
    borderColor: "#0A84FF"
  },
  gymSelectIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,122,255,0.12)"
  },
  gymSelectText: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
    fontWeight: "700"
  },
  gymSelectPlaceholder: {
    color: colors.muted,
    fontWeight: "500"
  },
  queryErrorStack: {
    gap: spacing.sm
  },
  retryButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md
  },
  retryText: {
    ...typography.small,
    color: colors.white
  },
  gymGrid: {
    gap: spacing.sm
  },
  gymOption: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md
  },
  gymOptionSelected: {
    borderColor: "#0A84FF",
    backgroundColor: "#0A84FF"
  },
  gymOptionIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  gymOptionIconSelected: {
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  gymOptionText: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
    fontWeight: "800"
  },
  gymOptionTextSelected: {
    color: "#FFFFFF"
  },
  errorText: {
    ...typography.small,
    color: colors.danger
  },
  passwordToggle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  roleCard: {
    minHeight: 50,
    minWidth: "47%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm
  },
  roleCardSelected: {
    borderColor: "#0A84FF",
    backgroundColor: "#0A84FF"
  },
  roleLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: "800"
  },
  roleLabelSelected: {
    color: "#FFFFFF"
  },
  pressed: {
    opacity: 0.75
  },
  footer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.16)",
    backgroundColor: "#12110E"
  },
  footerWide: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center"
  },
  footerText: {
    ...typography.body,
    color: colors.muted
  },
  link: {
    color: "#0A84FF",
    fontWeight: "800"
  },
  submitButton: {
    backgroundColor: "#0A84FF",
    borderColor: "#0A84FF"
  }
});
