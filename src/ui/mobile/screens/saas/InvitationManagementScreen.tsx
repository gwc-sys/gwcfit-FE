import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Share, Text, TextInput, View } from "react-native";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { PulseDashboardHeader } from "../../../../components/dashboard/PulseDashboardLayout";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Invitation } from "../../../../types/saas";
import type * as React from "react";
import type { useInvitationManagementScreenPresentation, useInvitationRowPresentation, useInviteStatPresentation } from "../../../../screens/saas/InvitationManagementScreen";

export function InvitationManagementScreenView({ model }: { model: ReturnType<typeof useInvitationManagementScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, section, setSection, newEnquiries, selectedEnquiry, setSelectedEnquiry, registrations, inviteRegistration, user, historyInputRef, navigation, InviteStat, invitations, colors, historyFilter, setHistoryFilter, activeCount, usedCount, revokedCount, hours, roles, setRole, role, labels, email, setEmail, setHours, createInvitation, issue, createdToken, historySearch, setHistorySearch, revokeInvitation, history, InvitationRow } = model.props;
      return ((
    <Screen scroll keyboard>
      <View style={styles.page}>
        <PulseDashboardHeader
          title="Invitations"
          subtitle={user?.role === "super_admin" ? "Invite gym owners to create their workspace." : "Invite people into your gym with a fixed role."}
          onSearch={() => historyInputRef.current?.focus()}
          onNotifications={() => navigation.navigate("Notifications")}
        />
        {user?.role === "super_admin" ? <View style={styles.segments} accessibilityRole="tablist">
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: section === "invitations" }} onPress={() => setSection("invitations")} style={[styles.segment, section === "invitations" && styles.segmentSelected]}><Text style={[styles.segmentText, section === "invitations" && styles.segmentTextSelected]}>Invitations</Text></Pressable>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: section === "enquiry" }} onPress={() => setSection("enquiry")} style={[styles.segment, section === "enquiry" && styles.segmentSelected]}><Text style={[styles.segmentText, section === "enquiry" && styles.segmentTextSelected]}>Enquiry{registrations.data ? ` (${newEnquiries.length})` : ""}</Text></Pressable>
        </View> : null}
        {section === "invitations" ? <View style={styles.stats}>
          <InviteStat icon="mail-outline" label="Total invitations" value={String(invitations.data?.length ?? 0)} color={colors.primary} styles={styles} active={historyFilter === "all"} onPress={() => setHistoryFilter("all")} />
          <InviteStat icon="flash-outline" label="Active invitations" value={String(activeCount)} color="#46C77A" styles={styles} active={historyFilter === "active"} onPress={() => setHistoryFilter("active")} />
          <InviteStat icon="checkmark-done-outline" label="Used invitations" value={String(usedCount)} color="#6EA8FE" styles={styles} active={historyFilter === "used"} onPress={() => setHistoryFilter("used")} />
          <InviteStat icon="close-circle-outline" label="Revoked invitations" value={String(revokedCount)} color={colors.danger} styles={styles} active={historyFilter === "revoked"} onPress={() => setHistoryFilter("revoked")} />
        </View> : null}
        {user?.role === "super_admin" && section === "enquiry" ? <View style={styles.registrationCard}>
          <View style={styles.listHeader}><View style={styles.rowCopy}><Text style={styles.cardTitle}>New enquiries</Text><Text style={styles.helper}>Requests submitted through Register your gym with PulseFit</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Refresh gym registrations" style={styles.iconButton} onPress={() => void registrations.refetch()}><Ionicons name="refresh-outline" size={22} color={colors.primary} /></Pressable></View>
          <NoticeBanner message={registrations.error ? getApiErrorMessage(registrations.error) : inviteRegistration.error ? getApiErrorMessage(inviteRegistration.error) : null} tone="error" />
          {registrations.isLoading ? <Text style={styles.empty}>Loading registration requests...</Text> : null}
          {!registrations.isLoading && !registrations.error && !newEnquiries.length ? <Text style={styles.empty}>No new enquiries. New gym registration requests will appear here.</Text> : null}
          {newEnquiries.map((request) => <View key={request.id} style={styles.row}><Pressable accessibilityRole="button" accessibilityLabel={`View full enquiry from ${request.gym_name}`} onPress={() => setSelectedEnquiry(request)} style={[styles.rowCopy, { minHeight: 44 }]}><Text style={styles.rowTitle}>{request.gym_name}</Text><Text style={styles.rowMeta}>{request.full_name} | {request.email}</Text><Text style={styles.rowMeta}>{request.phone} | {request.interested_plan_name ?? "No plan selected"}</Text><Text style={styles.rowMeta}>{new Date(request.created_at).toLocaleDateString("en-IN")}</Text><Text style={styles.reveal}>View full enquiry</Text></Pressable><View style={styles.badge}><Text style={styles.badgeText}>{request.status}</Text></View>{request.status !== "converted" && request.status !== "invited" ? <PrimaryButton title="Create owner invitation" variant="secondary" loading={inviteRegistration.isPending && inviteRegistration.variables === request.id} disabled={inviteRegistration.isPending} onPress={() => inviteRegistration.mutate(request.id)} /> : null}</View>)}
        </View> : null}
        {section === "invitations" ? <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create invitation</Text>
            <Text style={styles.helper}>Create a single-use code with a fixed role. Save or share the code now; it cannot be revealed again.</Text>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roles}>
              {roles.map((candidate) => (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: role === candidate }} key={candidate} onPress={() => setRole(candidate)} style={[styles.role, role === candidate && styles.roleActive]}>
                  <Text style={[styles.roleText, role === candidate && styles.roleTextActive]}>{labels[candidate]}</Text>
                </Pressable>
              ))}
            </View>
            <FormTextField label="Restrict to email (optional)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <FormTextField label="Expires in hours" value={hours} onChangeText={setHours} keyboardType="number-pad" leftIcon="time-outline" helper="1–720 hours" required />
            <NoticeBanner message={createInvitation.error ? getApiErrorMessage(createInvitation.error) : null} tone="error" />
            <PrimaryButton title="Create invitation" icon="add-circle-outline" loading={createInvitation.isPending} onPress={issue} />
            {createdToken ? (
              <View style={styles.tokenBox}>
                <Text style={styles.tokenLabel}>INVITE CODE</Text>
                <Text selectable style={styles.token}>{createdToken}</Text>
                <PrimaryButton title="Share token" icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: createdToken })} />
              </View>
            ) : null}
          </View>

          <View style={[styles.card, styles.historyCard]}>
            <View style={styles.listHeader}>
              <View><Text style={styles.cardTitle}>Invitation history</Text><Text style={styles.historyFilterLabel}>{historyFilter === "all" ? "All invitations" : `${historyFilter[0].toUpperCase()}${historyFilter.slice(1)} invitations`}{historySearch.trim() ? ` · Search: ${historySearch.trim()}` : ""}</Text></View>
              <Pressable accessibilityRole="button" onPress={() => invitations.refetch()} accessibilityLabel={"Refresh invitations"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="refresh-outline" size={22} color={colors.primary} /></Pressable>
            </View>
            <View style={styles.segments} accessibilityRole="tablist">{(["all", "active", "used", "revoked", "expired"] as const).map((status) => <Pressable key={status} accessibilityRole="tab" accessibilityState={{ selected: historyFilter === status }} onPress={() => setHistoryFilter(status)} style={[styles.segment, historyFilter === status && styles.segmentSelected]}><Text style={[styles.segmentText, historyFilter === status && styles.segmentTextSelected]}>{status[0].toUpperCase() + status.slice(1)}</Text></Pressable>)}</View>
            <View style={styles.historySearch}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput ref={historyInputRef} value={historySearch} onChangeText={setHistorySearch} placeholder="Search invitations" placeholderTextColor={colors.subtle} style={styles.historyInput} /></View>
            <NoticeBanner message={invitations.error ? getApiErrorMessage(invitations.error) : revokeInvitation.error ? getApiErrorMessage(revokeInvitation.error) : null} tone="error" />
            {invitations.isLoading ? <Text style={styles.empty}>Loading invitations...</Text> : null}
            {!invitations.isLoading && !invitations.error && history.length === 0 ? <Text style={styles.empty}>{historySearch ? "No invitations match your search." : historyFilter === "all" ? "No invitations yet." : `No ${historyFilter} invitations.`}</Text> : null}
            {history.map((invite) => (
              <InvitationRow key={invite.id} invite={invite} styles={styles} onRevoke={() => revokeInvitation.mutate(invite.id)} />
            ))}
          </View>
        </View> : null}
      </View>
      <Modal visible={!!selectedEnquiry} transparent animationType="fade" onRequestClose={() => setSelectedEnquiry(null)}>
        <View style={styles.detailBackdrop}>
          <View style={styles.detailSheet} accessibilityViewIsModal>
            <View style={styles.listHeader}><Text accessibilityRole="header" style={styles.cardTitle}>Enquiry details</Text><Pressable accessibilityRole="button" accessibilityLabel="Close enquiry details" style={styles.iconButton} onPress={() => setSelectedEnquiry(null)}><Ionicons name="close" size={24} color={colors.ink} /></Pressable></View>
            <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 16 }}>
              {selectedEnquiry ? ([
                ["Gym name", selectedEnquiry.gym_name], ["Owner / manager", selectedEnquiry.full_name],
                ["Email", selectedEnquiry.email], ["Phone", selectedEnquiry.phone],
                ["Active members", selectedEnquiry.active_members_range], ["Interested plan", selectedEnquiry.interested_plan_name ?? "No plan selected"],
                ["Status", selectedEnquiry.status], ["Source", selectedEnquiry.source],
                ["Submitted", new Date(selectedEnquiry.created_at).toLocaleString("en-IN")],
                ["Last updated", new Date(selectedEnquiry.updated_at).toLocaleString("en-IN")],
                ["Notes", selectedEnquiry.notes || "No notes"], ["Enquiry reference", selectedEnquiry.id],
                ["Invitation reference", selectedEnquiry.invitation_id ?? "No invitation yet"],
                ["Gym reference", selectedEnquiry.gym_id ?? "Not registered yet"],
              ]).map(([label, value]) => <View key={label} style={{ gap: 4 }}><Text style={styles.rowMeta}>{label}</Text><Text selectable style={styles.rowTitle}>{value}</Text></View>) : null}
            </ScrollView>
            <NoticeBanner message={inviteRegistration.error ? getApiErrorMessage(inviteRegistration.error) : null} tone="error" />
            {selectedEnquiry?.status === "new" ? <PrimaryButton title="Create owner invitation" loading={inviteRegistration.isPending} onPress={() => inviteRegistration.mutate(selectedEnquiry.id)} /> : null}
          </View>
        </View>
      </Modal>
    </Screen>
  ));
    }
  }
}

export function InvitationRowView({ model }: { model: ReturnType<typeof useInvitationRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { styles, labels, invite, onRevoke } = model.props;
      return ((
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{labels[invite.role]} · {invite.email ?? "Any email"}</Text>
        <Text style={styles.rowMeta}>{invite.gym_name ?? "New gym"} · expires {new Date(invite.expires_at).toLocaleString()}</Text>
        
      </View>
      <View style={[styles.badge, invite.status === "used" ? styles.badgeUsed : invite.status === "revoked" ? styles.badgeRevoked : invite.status === "expired" ? styles.badgeInactive : styles.badgeActive]}><Text style={styles.badgeText}>{invite.status}</Text></View>
      {invite.status === "active" ? <Pressable accessibilityRole="button" onPress={onRevoke} style={styles.revokeButton}><Text style={styles.revoke}>Revoke</Text></Pressable> : null}
    </View>
  ));
    }
  }
}

export function InviteStatView({ model }: { model: ReturnType<typeof useInviteStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, styles, active, color, icon, label, value } = model.props;
      return (<Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.stat, active && styles.statActive]}><View style={[styles.statIcon, { backgroundColor: `${color}22` }]}><Ionicons name={icon} size={20} color={color} /></View><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View></Pressable>);
    }
  }
}
