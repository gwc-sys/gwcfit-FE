import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SurfacePanel } from "../../components/SurfacePanel";
import { NoticeBanner } from "../../components/NoticeBanner";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Member } from "../../../../types/saas";
import { relatedDisplayName } from "../../../../utils/displayNames";
import { formatDate, initials, memberStatusTone } from "../../../../utils/formatters";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useMemberProfileScreenPresentation, useMemberProfileBodyPresentation, useDetailPresentation } from "../../../../screens/saas/MemberProfileScreen";

export function MemberProfileScreenView({ model }: { model: ReturnType<typeof useMemberProfileScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, member, route, navigation, isSelf, isLoading, error, MemberProfileBody, user } = model.props;
      return ((
    <Screen scroll contentContainerStyle={styles.screen}>
      <ScreenHeader
        title="Member Profile"
        subtitle={member ? member.member_code : "Gym member record"}
        onBack={route.name === "MemberProfile" ? () => navigation.goBack() : undefined}
        icon={route.name === "MemberProfile" ? undefined : "id-card-outline"}
        actionIcon={!isSelf && member ? "create-outline" : undefined}
        onAction={!isSelf && member ? () => navigation.navigate("EditMember", { memberId: member.id }) : undefined}
      />

      <DataState
        loading={isLoading}
        error={error ? getApiErrorMessage(error) : null}
        empty={!isLoading && !member}
        emptyTitle="Profile not found"
        emptyMessage="This member record is not available for your role."
      />

      {member ? <MemberProfileBody member={member} isSelf={isSelf} canAssignTrainer={user?.role === "gym_owner"} /> : null}
    </Screen>
  ));
    }
  }
}

export function MemberProfileBodyView({ model }: { model: ReturnType<typeof useMemberProfileBodyPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, fullName, member, membership, isSelf, navigation, canAssignTrainer, setSelectedTrainerId, setPickerVisible, notice, updateMember, pickerVisible, colors, trainersQuery, trainers, selectedTrainerId, confirmAssignment, Detail } = model.props;
      return ((
    <>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(fullName)}</Text>
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.meta}>{member.member_code}</Text>
          <View style={styles.badges}>
            <StatusBadge label={member.status} tone={memberStatusTone(member.status)} />
            <StatusBadge label={membership.label} tone={membership.tone} />
          </View>
        </View>
      </View>

      {!isSelf ? (
        <View style={styles.actionRow}>
          <PrimaryButton title="Edit" icon="create-outline" onPress={() => navigation.navigate("EditMember", { memberId: member.id })} style={styles.actionButton} />
          {canAssignTrainer ? (
            <PrimaryButton
              title={member.trainer_id ? "Change Trainer" : "Assign Trainer"}
              icon="person-add-outline"
              onPress={() => { setSelectedTrainerId(member.trainer_id); setPickerVisible(true); }}
              style={styles.actionButton}
            />
          ) : null}
          <PrimaryButton title="Payment" icon="card-outline" variant="secondary" onPress={() => navigation.navigate("Payments")} style={styles.actionButton} />
        </View>
      ) : null}

      <NoticeBanner message={notice} />
      <NoticeBanner message={updateMember.error ? getApiErrorMessage(updateMember.error) : null} tone="error" />

      <Modal animationType="fade" transparent visible={pickerVisible} onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Trainer</Text>
                <Text style={styles.modalSubtitle}>Select a trainer by their mastery</Text>
              </View>
              <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => setPickerVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            {trainersQuery.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
            {trainersQuery.error ? <Text style={styles.errorText}>{getApiErrorMessage(trainersQuery.error)}</Text> : null}
            {!trainersQuery.isLoading && !trainersQuery.error ? (
              <ScrollView style={styles.trainerList} contentContainerStyle={styles.trainerListContent}>
                {trainers.map((trainer) => {
                  const selected = selectedTrainerId === trainer.id;
                  const mastery = trainer.specialties.length ? trainer.specialties.join(" • ") : "General fitness";
                  return (
                    <Pressable accessibilityRole="button" key={trainer.id} onPress={() => setSelectedTrainerId(trainer.id)} style={[styles.trainerOption, selected && styles.trainerOptionSelected]}>
                      <View style={styles.trainerAvatar}><Text style={styles.trainerAvatarText}>{initials(trainer.full_name)}</Text></View>
                      <View style={styles.trainerInfo}>
                        <Text style={styles.trainerName}>{trainer.full_name}</Text>
                        <Text style={styles.trainerMastery}>Mastery: {mastery}</Text>
                      </View>
                      <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? colors.primary : colors.muted} />
                    </Pressable>
                  );
                })}
                {trainers.length === 0 ? <Text style={styles.emptyText}>No active trainers are available in this gym.</Text> : null}
                {member.trainer_id ? (
                  <Pressable accessibilityRole="button" onPress={() => setSelectedTrainerId(null)} style={[styles.trainerOption, selectedTrainerId === null && styles.trainerOptionSelected]}>
                    <Ionicons name="person-remove-outline" size={26} color={colors.danger} />
                    <View style={styles.trainerInfo}><Text style={styles.trainerName}>Remove assigned trainer</Text><Text style={styles.trainerMastery}>Leave this member unassigned</Text></View>
                  </Pressable>
                ) : null}
              </ScrollView>
            ) : null}
            <View style={styles.modalActions}>
              <PrimaryButton title="Cancel" variant="secondary" onPress={() => setPickerVisible(false)} style={styles.actionButton} />
              <PrimaryButton title="Confirm Assignment" disabled={updateMember.isPending || selectedTrainerId === member.trainer_id} onPress={confirmAssignment} style={styles.actionButton} />
            </View>
          </View>
        </View>
      </Modal>

      <SurfacePanel title="Profile" kicker="Contact" icon="person-outline">
        <View style={styles.detailList}>
          <Detail icon="mail-outline" label="Email" value={member.email ?? "Not set"} />
          <Detail icon="call-outline" label="Phone" value={member.phone ?? "Not set"} />
          <Detail icon="barbell-outline" label="Trainer" value={relatedDisplayName(member.trainer_name, "Not assigned")} />
        </View>
      </SurfacePanel>

      <SurfacePanel title="Membership" kicker="Plan" icon="pricetag-outline">
        <View style={styles.detailList}>
          <Detail icon="calendar-outline" label="Starts" value={formatDate(member.membership_starts_at)} />
          <Detail icon="calendar-number-outline" label="Ends" value={formatDate(member.membership_ends_at)} />
          <Detail icon="ticket-outline" label="Plan" value={relatedDisplayName(member.membership_plan_name, "Not assigned")} />
        </View>
      </SurfacePanel>
    </>
  ));
    }
  }
}

export function DetailView({ model }: { model: ReturnType<typeof useDetailPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, icon, colors, label, value } = model.props;
      return ((
    <View style={styles.detail}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  ));
    }
  }
}
