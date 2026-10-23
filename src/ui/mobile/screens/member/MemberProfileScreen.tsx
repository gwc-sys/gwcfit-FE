import { Pressable } from "../../components/NativePressable";
import { MemberMembershipDetails } from "../../../../components/member/MemberMembershipDetails";
import { useRef, useState } from "react";
import { MemberServicesMenu } from "../../components/member/MemberServicesMenu";
import { positiveNumberError } from "../../components/member/formValidation";
import { Keyboard, RefreshControl, Text, TextInput, View } from "react-native";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { EmptyState, ErrorState, LoadingSkeleton, StatusBadge } from "../../components/member/index";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatDate, initials, memberStatusTone } from "../../../../utils/formatters";
import type * as React from "react";
import type { useMemberProfileScreenPresentation } from "../../../../screens/member/MemberProfileScreen";

export function MemberProfileScreenView({ model }: { model: ReturnType<typeof useMemberProfileScreenPresentation> }): React.ReactNode {
  const originalForm = useRef<ReturnType<typeof useMemberProfileScreenPresentation>["props"]["form"] | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showMemberId, setShowMemberId] = useState(false);
  const [validationError, setValidationError] = useState<string>();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, profileQuery, membershipQuery, refreshProfile, colors, profile, form, setForm, updateProfile, submit, navigation } = model.props;
      return ((
    <Screen
      scroll
      keyboard
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={profileQuery.isRefetching || membershipQuery.isRefetching} onRefresh={refreshProfile} tintColor={colors.primary} />}
    >
      <ScreenHeader title="My Profile" subtitle={profile?.gym_name ?? "Member profile"} icon="id-card-outline" />


      {profileQuery.isLoading ? <LoadingSkeleton rows={4} /> : null}
      {profileQuery.error ? <ErrorState message={getApiErrorMessage(profileQuery.error)} onRetry={() => profileQuery.refetch()} /> : null}
      {!profileQuery.isLoading && !profileQuery.error && !profile ? (
        <EmptyState title="Profile not found" message="Ask your gym admin to link your app login to a member record." icon="person-circle-outline" />
      ) : null}

      {profile ? (
        <>
          <View>
            <View style={styles.hero}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(profile.member_name)}</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text accessibilityRole="header" style={styles.name}>{profile.member_name}</Text>
                <View style={styles.badgeRow}>
                  <StatusBadge label={profile.membership_status} tone={memberStatusTone(profile.membership_status)} />
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={showMemberId ? "Hide member ID" : "View member ID"} accessibilityState={{ expanded: showMemberId }} onPress={() => setShowMemberId(value => !value)} style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}>
                  <Text style={[styles.meta, { color: colors.primary }]}>{showMemberId ? "Hide member ID" : "View member ID"}</Text>
                </Pressable>
              </View>
            </View>
            {showMemberId ? <View style={{ paddingHorizontal: 4, paddingBottom: 12, gap: 4 }}>
              <Text style={styles.detailLabel}>Member ID</Text>
              <Text selectable style={[styles.meta, { color: colors.ink }]}>{profile.member_code}</Text>
            </View> : null}
          </View>

          <MemberMembershipDetails
            planName={membershipQuery.data ? membershipQuery.data.membership_plan_name : profile.membership_plan_name}
            startDate={membershipQuery.data?.start_date}
            endDate={membershipQuery.data?.expiry_date}
            loading={membershipQuery.isLoading}
            error={membershipQuery.error}
            onRetry={() => { void membershipQuery.refetch(); }}
          />

          <View style={{ gap: 10 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={editing ? "Editing personal details" : "Edit personal details"} accessibilityState={{ expanded: editing, disabled: updateProfile.isPending }} disabled={editing || updateProfile.isPending} onPress={() => {
              originalForm.current = { ...form }; setSaved(false); setValidationError(undefined); updateProfile.reset(); setEditing(true);
            }} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text accessibilityRole="header" style={styles.formTitle}>Personal details</Text>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "600" }}>{editing ? "Editing" : "Edit"}</Text>
            </Pressable>
            <View style={{ gap: 18 }}>
              {([
                { label: "Email", value: profile.email },
                { label: "Phone", key: "phone", keyboard: "phone-pad", value: profile.phone },
                { label: "Address", key: "address", value: profile.address },
                { label: "Height (cm)", key: "height", keyboard: "decimal-pad", value: profile.height == null ? "" : String(profile.height) },
                { label: "Weight (kg)", key: "weight", keyboard: "decimal-pad", value: profile.weight == null ? "" : String(profile.weight) },
                { label: "Fitness goal", key: "fitnessGoal", value: profile.fitness_goal },
                { label: "Emergency name", key: "emergencyName", value: String(profile.emergency_contact?.name ?? "") },
                { label: "Emergency phone", key: "emergencyPhone", keyboard: "phone-pad", value: String(profile.emergency_contact?.phone ?? "") },
                { label: "Profile photo URL", key: "profilePhoto", keyboard: "url", value: profile.profile_photo },
                { label: "Trainer", value: profile.trainer_name },
                { label: "Membership", value: profile.membership_plan_name },
                { label: "Date of birth", value: profile.date_of_birth ? formatDate(profile.date_of_birth) : "" },
                { label: "BMI", value: profile.bmi != null ? String(profile.bmi) : "" },
                { label: "Medical conditions", value: (Array.isArray(profile.medical_conditions) ? profile.medical_conditions.join(", ") : profile.medical_conditions) || "None listed" },
              ] satisfies Array<{ label: string; key?: keyof typeof form; keyboard?: import("react-native").KeyboardTypeOptions; value: string | null | undefined }>).reduce<Array<{ title: string; items: Array<{ label: string; key?: keyof typeof form; keyboard?: import("react-native").KeyboardTypeOptions; value: string | null | undefined }> }>>((groups, item, index) => {
                const title = index <= 2 || index === 8 ? "Contact" : index <= 5 ? "Fitness" : index <= 7 ? "Emergency contact" : index <= 10 ? "Gym membership" : "Health";
                let group = groups.find(group => group.title === title);
                if (!group) { group = { title, items: [] }; groups.push(group); }
                // Photo links are available in edit mode without adding an empty row to the overview.
                if (index !== 8 || editing || item.value) group.items.push(item);
                return groups;
              }, []).filter(group => !["Fitness", "Emergency contact", "Gym membership"].includes(group.title)).map(group => <View key={group.title} style={{ gap: 7 }}>
                <Text accessibilityRole="header" style={styles.groupLabel}>{group.title}</Text>
                <View style={styles.detailList}>
                  {group.items.map((item, index) => {
                    const fieldKey = item.key;
                    const stacked = item.label === "Email" || item.label === "Address" || item.label === "Medical conditions" || item.label === "Profile photo URL";
                    const missing = !item.value;
                    return <View key={item.label} style={[styles.detailRow, stacked && styles.detailRowStacked, editing && fieldKey && styles.detailRowStacked, index > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
                      <Text style={[styles.detailLabel, stacked && { flexBasis: "auto" }]}>{item.label === "Emergency name" ? "Name" : item.label === "Emergency phone" ? "Phone" : item.label}</Text>
                      {editing && fieldKey ? <TextInput accessibilityLabel={item.label} editable={!updateProfile.isPending} value={form[fieldKey]} onChangeText={value => setForm(current => ({ ...current, [fieldKey]: value }))} keyboardType={item.keyboard ?? "default"} autoCapitalize={fieldKey === "profilePhoto" ? "none" : "sentences"} placeholder={fieldKey === "profilePhoto" ? "https://?" : "Add " + item.label.toLowerCase()} placeholderTextColor={colors.muted} selectionColor={colors.primary} style={styles.detailInput} /> :
                        <Text selectable style={[styles.detailValue, stacked && styles.detailStackedValue, missing && { color: colors.muted }]}>{item.value || "?"}</Text>}
                    </View>;
                  })}
                </View>
              </View>)}
              {editing ? <View style={{ gap: 12, paddingVertical: 4 }}>
                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>Health details are managed by your gym.</Text>
                <NoticeBanner message={validationError ?? null} tone="error" />
                <NoticeBanner message={updateProfile.error ? getApiErrorMessage(updateProfile.error) : null} tone="error" />
                <PrimaryButton title="Save changes" loading={updateProfile.isPending} onPress={async () => {
                  const error = positiveNumberError(form.height, "Height") ?? positiveNumberError(form.weight, "Weight");
                  setValidationError(error);
                  if (!error && !updateProfile.isPending && await submit()) { Keyboard.dismiss(); setEditing(false); setSaved(true); }
                }} />
                <Pressable accessibilityRole="button" disabled={updateProfile.isPending} accessibilityState={{ disabled: updateProfile.isPending }} onPress={() => {
                  if (originalForm.current) setForm(originalForm.current);
                  Keyboard.dismiss(); setEditing(false); setValidationError(undefined); updateProfile.reset();
                }} style={{ minHeight: 44, alignItems: "center", justifyContent: "center", opacity: updateProfile.isPending ? 0.5 : 1 }}><Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text></Pressable>
              </View> : null}
            </View>
            <NoticeBanner message={saved ? "Profile updated." : null} tone="success" />
          </View>
        </>
      ) : null}
      <MemberServicesMenu onNavigate={route => navigation.navigate(route)} />
    </Screen>
  ));
    }
  }
}
