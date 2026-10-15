import { Pressable } from "../../components/NativePressable";
import { controlMetrics } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Share, Text, TextInput, View } from "react-native";
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
      const { styles, user, historyInputRef, navigation, InviteStat, invitations, colors, historyFilter, setHistoryFilter, activeCount, usedCount, hours, roles, setRole, role, labels, email, setEmail, setHours, createInvitation, issue, createdToken, historySearch, setHistorySearch, revokeInvitation, history, InvitationRow } = model.props;
      return ((
    <Screen scroll>
      <View style={styles.page}>
        <PulseDashboardHeader
          title="Invitations"
          subtitle={user?.role === "super_admin" ? "Invite gym owners to create their workspace." : "Invite people into your gym with a fixed role."}
          onSearch={() => historyInputRef.current?.focus()}
          onNotifications={() => navigation.navigate("Notifications")}
        />
        <View style={styles.stats}>
          <InviteStat icon="mail-outline" label="Total invitations" value={String(invitations.data?.length ?? 0)} color={colors.primary} styles={styles} active={historyFilter === "all"} onPress={() => setHistoryFilter("all")} />
          <InviteStat icon="flash-outline" label="Active invitations" value={String(activeCount)} color="#46C77A" styles={styles} active={historyFilter === "active"} onPress={() => setHistoryFilter("active")} />
          <InviteStat icon="checkmark-done-outline" label="Used invitations" value={String(usedCount)} color="#6EA8FE" styles={styles} active={historyFilter === "used"} onPress={() => setHistoryFilter("used")} />
          <InviteStat icon="time-outline" label="Default expiry" value={`${hours}h`} color="#F0B429" styles={styles} active={false} onPress={() => setHistoryFilter("all")} />
        </View>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create invitation</Text>
            <Text style={styles.helper}>The invite code expires automatically and can only be used once. You can reveal it later from invitation history.</Text>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roles}>
              {roles.map((candidate) => (
                <Pressable accessibilityRole="button" key={candidate} onPress={() => setRole(candidate)} style={[styles.role, role === candidate && styles.roleActive]}>
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

          <View style={styles.card}>
            <View style={styles.listHeader}>
              <View><Text style={styles.cardTitle}>Invitation history</Text><Text style={styles.historyFilterLabel}>{historyFilter === "all" ? "All invitations" : `${historyFilter[0].toUpperCase()}${historyFilter.slice(1)} invitations`}{historySearch.trim() ? ` · Search: ${historySearch.trim()}` : ""}</Text></View>
              <Pressable accessibilityRole="button" onPress={() => invitations.refetch()} accessibilityLabel={"Refresh invitations"} style={{ minWidth: controlMetrics.minimumTouchSize, minHeight: controlMetrics.minimumTouchSize, alignItems: "center", justifyContent: "center" }}><Ionicons name="refresh-outline" size={22} color={colors.primary} /></Pressable>
            </View>
            <View style={styles.historySearch}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput ref={historyInputRef} value={historySearch} onChangeText={setHistorySearch} placeholder="Search invitations" placeholderTextColor={colors.subtle} style={styles.historyInput} /></View>
            <NoticeBanner message={invitations.error ? getApiErrorMessage(invitations.error) : revokeInvitation.error ? getApiErrorMessage(revokeInvitation.error) : null} tone="error" />
            {history.length === 0 ? <Text style={styles.empty}>{historySearch ? "No invitations match your search." : "No invitations yet."}</Text> : null}
            {history.map((invite) => (
              <InvitationRow key={invite.id} invite={invite} styles={styles} onRevoke={() => revokeInvitation.mutate(invite.id)} />
            ))}
          </View>
        </View>
      </View>
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
        <Text style={styles.unavailable}>For security, invitation codes are shown only once when created.</Text>
      </View>
      <View style={[styles.badge, invite.status !== "active" && styles.badgeInactive]}><Text style={styles.badgeText}>{invite.status}</Text></View>
      {invite.status === "active" ? <Pressable accessibilityRole="button" onPress={onRevoke}><Text style={styles.revoke}>Revoke</Text></Pressable> : null}
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
      return (<Pressable accessibilityRole="button" onPress={onPress} style={[styles.stat, active && styles.statActive]}><View style={[styles.statIcon, { backgroundColor: `${color}22` }]}><Ionicons name={icon} size={20} color={color} /></View><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.statLive}>↑ Live data</Text></View></Pressable>);
    }
  }
}
