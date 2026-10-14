import { RefreshControl, Text, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { EmptyState, ErrorState, LoadingSkeleton, ScrollListCard, StatusBadge } from "../../components/member/index";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import { formatDate, initials, memberStatusTone } from "../../../../utils/formatters";
import type * as React from "react";
import type { useMemberProfileScreenPresentation } from "../../../../screens/member/MemberProfileScreen";

export function MemberProfileScreenView({ model }: { model: ReturnType<typeof useMemberProfileScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, profileQuery, colors, profile, form, setForm, updateProfile, submit, navigation } = model.props;
      return ((
    <Screen
      scroll
      keyboard
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={profileQuery.isRefetching} onRefresh={() => profileQuery.refetch()} tintColor={colors.primary} />}
    >
      <ScreenHeader title="My Profile" subtitle={profile?.gym_name ?? "Member profile"} icon="id-card-outline" />

      {profileQuery.isLoading ? <LoadingSkeleton rows={4} /> : null}
      {profileQuery.error ? <ErrorState message={getApiErrorMessage(profileQuery.error)} onRetry={() => profileQuery.refetch()} /> : null}
      {!profileQuery.isLoading && !profileQuery.error && !profile ? (
        <EmptyState title="Profile not found" message="Ask your gym admin to link your app login to a member record." icon="person-circle-outline" />
      ) : null}

      {profile ? (
        <>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(profile.member_name)}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.name}>{profile.member_name}</Text>
              <Text style={styles.meta}>{profile.member_code}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge label={profile.membership_status} tone={memberStatusTone(profile.membership_status)} />
                <StatusBadge label={profile.gym_name ?? "Gym"} tone="info" />
              </View>
            </View>
          </View>

          <View style={styles.detailList}>
            <ScrollListCard title="Email" subtitle={profile.email ?? "Not set"} icon="mail-outline" />
            <ScrollListCard title="Assigned trainer" subtitle={profile.trainer_name ?? "Not assigned"} icon="barbell-outline" status="Trainer" statusTone="info" />
            <ScrollListCard title="Membership plan" subtitle={profile.membership_plan_name ?? "Not assigned"} icon="ribbon-outline" />
            <ScrollListCard title="Date of birth" subtitle={formatDate(profile.date_of_birth)} icon="calendar-outline" />
            <ScrollListCard title="BMI" subtitle={profile.bmi ? `${profile.bmi}` : "Not available"} icon="pulse-outline" />
            <ScrollListCard
              title="Medical conditions"
              subtitle={Array.isArray(profile.medical_conditions) ? profile.medical_conditions.join(", ") : profile.medical_conditions ?? "None listed"}
              icon="medkit-outline"
            />
          </View>

          <View style={styles.formPanel}>
            <Text style={styles.formTitle}>Editable Details</Text>
            <FormTextField label="Phone" value={form.phone} onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} leftIcon="call-outline" />
            <FormTextField
              label="Address"
              value={form.address}
              onChangeText={(address) => setForm((current) => ({ ...current, address }))}
              leftIcon="home-outline"
              multiline
            />
            <View style={styles.inputRow}>
              <FormTextField
                label="Height"
                value={form.height}
                keyboardType="numeric"
                onChangeText={(height) => setForm((current) => ({ ...current, height }))}
                leftIcon="resize-outline"
              />
              <FormTextField
                label="Weight"
                value={form.weight}
                keyboardType="numeric"
                onChangeText={(weight) => setForm((current) => ({ ...current, weight }))}
                leftIcon="scale-outline"
              />
            </View>
            <FormTextField
              label="Fitness goal"
              value={form.fitnessGoal}
              onChangeText={(fitnessGoal) => setForm((current) => ({ ...current, fitnessGoal }))}
              leftIcon="flag-outline"
            />
            <View style={styles.inputRow}>
              <FormTextField
                label="Emergency name"
                value={form.emergencyName}
                onChangeText={(emergencyName) => setForm((current) => ({ ...current, emergencyName }))}
                leftIcon="person-outline"
              />
              <FormTextField
                label="Emergency phone"
                value={form.emergencyPhone}
                onChangeText={(emergencyPhone) => setForm((current) => ({ ...current, emergencyPhone }))}
                leftIcon="call-outline"
              />
            </View>
            <FormTextField
              label="Profile photo URL"
              value={form.profilePhoto}
              onChangeText={(profilePhoto) => setForm((current) => ({ ...current, profilePhoto }))}
              leftIcon="image-outline"
            />
            <NoticeBanner message={updateProfile.data ? "Profile updated." : null} />
            <NoticeBanner message={updateProfile.error ? getApiErrorMessage(updateProfile.error) : null} tone="error" />
            <PrimaryButton title="Save Profile" icon="save-outline" loading={updateProfile.isPending} onPress={submit} />
          </View>

          <PrimaryButton title="View Settings" icon="settings-outline" variant="secondary" onPress={() => navigation.navigate("MemberSettings")} />
        </>
      ) : null}
    </Screen>
  ));
    }
  }
}
