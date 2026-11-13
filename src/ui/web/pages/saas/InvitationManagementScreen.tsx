import { Ionicons } from "@expo/vector-icons";
import { Pressable, Modal, ScrollView, Share, Text, TextInput, View } from "react-native";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { PulseDashboardHeader } from "../../../../components/dashboard/PulseDashboardLayout";
import {
  BanSvg,
  CheckCircleSvg,
  ClockSvg,
  MailSvg,
  SearchSvg,
  ZapSvg,
} from "../../../../components/icons/PulseSvgIcons";
import { createStyles } from "../../styles/pages/saas/InvitationManagementScreen.styles";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { Invitation } from "../../../../types/saas";
import type * as React from "react";
import type { useInvitationManagementScreenPresentation, useInvitationRowPresentation, useInviteStatPresentation } from "../../../../screens/saas/InvitationManagementScreen";

export function InvitationManagementScreenView({ model }: { model: ReturnType<typeof useInvitationManagementScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        section,
        setSection,
        newEnquiries,
        selectedEnquiry,
        setSelectedEnquiry,
        registrations,
        inviteRegistration,
        user,
        historyInputRef,
        navigation,
        InviteStat,
        invitations,
        colors,
        historyFilter,
        setHistoryFilter,
        activeCount,
        usedCount,
        revokedCount,
        hours,
        roles,
        setRole,
        role,
        labels,
        email,
        setEmail,
        setHours,
        createInvitation,
        issue,
        createdToken,
        historySearch,
        setHistorySearch,
        revokeInvitation,
        history,
        InvitationRow,
        existingPhone,
        setExistingPhone,
        existingName,
        setExistingName,
        bulkMode,
        setBulkMode,
        bulkPhones,
        setBulkPhones,
        bulkResults,
        createExistingMember,
        bulkCreateExistingMembers,
      } = model.props;

      const styles = createStyles(colors);

      return (
        <Screen scroll keyboard>
          <View style={styles.page}>
            {/* Top Header */}
            <PulseDashboardHeader
              title="Invitations"
              subtitle={
                user?.role === "super_admin"
                  ? "Invite gym owners to create their workspace."
                  : "Invite people into your gym with a fixed role."
              }
              onSearch={() => historyInputRef.current?.focus()}
              onNotifications={() => navigation.navigate("Notifications")}
            />

            {/* Super Admin Top Tabs */}
            {user?.role === "super_admin" ? (
              <View style={styles.segments} accessibilityRole="tablist">
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: section === "invitations" }}
                  onPress={() => setSection("invitations")}
                  style={[styles.segment, section === "invitations" && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, section === "invitations" && styles.segmentTextSelected]}>
                    Invitations
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: section === "enquiry" }}
                  onPress={() => setSection("enquiry")}
                  style={[styles.segment, section === "enquiry" && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, section === "enquiry" && styles.segmentTextSelected]}>
                    Enquiry{registrations.data ? ` (${newEnquiries.length})` : ""}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Row 1: 4 Stat Cards */}
            {section === "invitations" ? (
              <View style={styles.stats}>
                <InviteStat
                  icon="mail-outline"
                  label="Total invitations"
                  value={String(invitations.data?.length ?? 0)}
                  color="#E91E63"
                  styles={styles as any}
                  active={historyFilter === "all"}
                  onPress={() => setHistoryFilter("all")}
                />
                <InviteStat
                  icon="flash-outline"
                  label="Active invitations"
                  value={String(activeCount)}
                  color="#34C759"
                  styles={styles as any}
                  active={historyFilter === "active"}
                  onPress={() => setHistoryFilter("active")}
                />
                <InviteStat
                  icon="checkmark-done-outline"
                  label="Used invitations"
                  value={String(usedCount)}
                  color="#007AFF"
                  styles={styles as any}
                  active={historyFilter === "used"}
                  onPress={() => setHistoryFilter("used")}
                />
                <InviteStat
                  icon="close-circle-outline"
                  label="Revoked invitations"
                  value={String(revokedCount)}
                  color="#E91E63"
                  styles={styles as any}
                  active={historyFilter === "revoked"}
                  onPress={() => setHistoryFilter("revoked")}
                />
              </View>
            ) : null}

            {/* Super Admin Enquiries Panel */}
            {user?.role === "super_admin" && section === "enquiry" ? (
              <View style={styles.registrationCard}>
                <View style={styles.listHeader}>
                  <View style={styles.rowCopy}>
                    <Text style={styles.cardTitle}>New enquiries</Text>
                    <Text style={styles.helper}>Requests submitted through Register your gym with PulseFit</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Refresh gym registrations"
                    style={styles.iconButton}
                    onPress={() => void registrations.refetch()}
                  >
                    <Ionicons name="refresh-outline" size={18} color="#F2F2F7" />
                  </Pressable>
                </View>
                <NoticeBanner
                  message={
                    registrations.error
                      ? getApiErrorMessage(registrations.error)
                      : inviteRegistration.error
                      ? getApiErrorMessage(inviteRegistration.error)
                      : null
                  }
                  tone="error"
                />
                {registrations.isLoading ? <Text style={styles.empty}>Loading registration requests...</Text> : null}
                {!registrations.isLoading && !registrations.error && !newEnquiries.length ? (
                  <Text style={styles.empty}>No new enquiries. New gym registration requests will appear here.</Text>
                ) : null}
                {newEnquiries.map((request) => (
                  <View key={request.id} style={styles.row}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`View full enquiry from ${request.gym_name}`}
                      onPress={() => setSelectedEnquiry(request)}
                      style={[styles.rowCopy, { minHeight: 44 }]}
                    >
                      <Text style={styles.rowTitle}>{request.gym_name}</Text>
                      <Text style={styles.rowMeta}>{request.full_name} | {request.email}</Text>
                      <Text style={styles.rowMeta}>{request.phone} | {request.interested_plan_name ?? "No plan selected"}</Text>
                      <Text style={styles.rowMeta}>{new Date(request.created_at).toLocaleDateString("en-IN")}</Text>
                      <Text style={styles.reveal}>View full enquiry</Text>
                    </Pressable>
                    <View style={styles.badge}><Text style={styles.badgeText}>{request.status}</Text></View>
                    {request.status !== "converted" && request.status !== "invited" ? (
                      <PrimaryButton
                        title="Create owner invitation"
                        variant="secondary"
                        loading={inviteRegistration.isPending && inviteRegistration.variables === request.id}
                        disabled={inviteRegistration.isPending}
                        onPress={() => inviteRegistration.mutate(request.id)}
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Main Two-Column Layout */}
            {section === "invitations" ? (
              <View style={styles.grid}>
                {/* Left Column: Create invitation */}
                <View style={styles.createCard}>
                  <Text style={styles.cardTitle}>Create invitation</Text>
                  <Text style={styles.helper}>
                    Create a single-use code with a fixed role. Save or share the code now; it cannot be revealed again.
                  </Text>

                  {/* Role Selection */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Role</Text>
                    <View style={styles.roles}>
                      {roles.map((candidate) => (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected: role === candidate }}
                          key={candidate}
                          onPress={() => setRole(candidate)}
                          style={[styles.role, role === candidate && styles.roleActive]}
                        >
                          <Text style={[styles.roleText, role === candidate && styles.roleTextActive]}>
                            {labels[candidate]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Role-Specific Form Fields */}
                  {role === "member" && user?.role === "gym_owner" ? (
                    <View style={{ gap: 14, marginTop: 6 }}>
                      <View style={{ flexDirection: "row", gap: 10, backgroundColor: colors.card, padding: 6, borderRadius: 8, alignSelf: "flex-start" }}>
                        <Pressable
                          onPress={() => setBulkMode(false)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                            alignItems: "center",
                            backgroundColor: !bulkMode ? colors.surface : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: !bulkMode ? "700" : "500", color: !bulkMode ? colors.ink : colors.muted }}>
                            Single Member (10-15s)
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setBulkMode(true)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                            alignItems: "center",
                            backgroundColor: bulkMode ? colors.surface : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: bulkMode ? "700" : "500", color: bulkMode ? colors.ink : colors.muted }}>
                            Bulk Numbers
                          </Text>
                        </Pressable>
                      </View>

                      {!bulkMode ? (
                        <View style={{ flexDirection: "row", gap: 12 }}>
                          <View style={[styles.fieldBlock, { flex: 1 }]}>
                            <View style={styles.fieldHeader}>
                              <Text style={styles.fieldLabel}>Member Mobile Number</Text>
                              <Text style={styles.fieldRequired}>Required</Text>
                            </View>
                            <TextInput
                              style={styles.inputBox}
                              value={existingPhone}
                              onChangeText={setExistingPhone}
                              placeholder="e.g. +1 555 123 4567"
                              placeholderTextColor="#F2F2F7"
                              keyboardType="phone-pad"
                            />
                          </View>

                          <View style={[styles.fieldBlock, { flex: 1 }]}>
                            <Text style={styles.fieldLabel}>Member Full Name (optional)</Text>
                            <TextInput
                              style={styles.inputBox}
                              value={existingName}
                              onChangeText={setExistingName}
                              placeholder="e.g. John Connor"
                              placeholderTextColor="#F2F2F7"
                            />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.fieldBlock}>
                          <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Mobile Numbers (one per line)</Text>
                            <Text style={styles.fieldRequired}>Bulk Mode</Text>
                          </View>
                          <TextInput
                            style={[styles.inputBox, { minHeight: 90, textAlignVertical: "top" }]}
                            value={bulkPhones}
                            onChangeText={setBulkPhones}
                            multiline
                            numberOfLines={4}
                            placeholder="+15551112222&#10;+15553334444&#10;+15555556666"
                            placeholderTextColor="#F2F2F7"
                          />
                        </View>
                      )}
                    </View>
                  ) : (
                    /* Restrict to email */
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>Restrict to email (optional)</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="e.g. ganesh.gwc@gmail.com"
                        placeholderTextColor="#F2F2F7"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  )}

                  {/* Expires in hours */}
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <Text style={styles.fieldLabel}>Expires in hours</Text>
                      <Text style={styles.fieldRequired}>Required</Text>
                    </View>
                    <View style={styles.inputWithIcon}>
                      <ClockSvg size={16} color="#F2F2F7" />
                      <TextInput
                        style={styles.inputWithIconText}
                        value={hours}
                        onChangeText={setHours}
                        keyboardType="number-pad"
                        placeholder="168"
                        placeholderTextColor="#F2F2F7"
                      />
                    </View>
                    <Text style={styles.inputHelper}>1–720 hours validity range</Text>
                  </View>

                  <NoticeBanner
                    message={
                      createExistingMember.error
                        ? getApiErrorMessage(createExistingMember.error)
                        : bulkCreateExistingMembers.error
                        ? getApiErrorMessage(bulkCreateExistingMembers.error)
                        : createInvitation.error
                        ? getApiErrorMessage(createInvitation.error)
                        : null
                    }
                    tone="error"
                  />

                  {/* Submit Button */}
                  <Pressable
                    accessibilityRole="button"
                    style={styles.submitButton}
                    onPress={issue}
                    disabled={createInvitation.isPending || createExistingMember.isPending || bulkCreateExistingMembers.isPending}
                  >
                    <Text style={styles.submitButtonText}>
                      {createInvitation.isPending || createExistingMember.isPending || bulkCreateExistingMembers.isPending
                        ? "Creating..."
                        : role === "member" && user?.role === "gym_owner"
                        ? bulkMode
                          ? "+ Send Bulk Invitations"
                          : "+ Invite Existing Member"
                        : "+ Create invitation"}
                    </Text>
                  </Pressable>

                  {/* Generated Code Display */}
                  {createdToken ? (
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>INVITE CODE & SHAREABLE LINK</Text>
                      <Text selectable style={styles.token}>{createdToken}</Text>
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                        <PrimaryButton
                          title="Share Link"
                          icon="share-outline"
                          variant="secondary"
                          style={{ flex: 1 }}
                          onPress={() =>
                            void Share.share({
                              message: `You're invited to join ${user?.gym_name || "our gym"} on PulseFit! Use code: ${createdToken} or visit https://pulsefit.app/signup?token=${createdToken}`,
                            })
                          }
                        />
                        <PrimaryButton
                          title="View Claims"
                          icon="shield-checkmark-outline"
                          variant="primary"
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("MemberClaims")}
                        />
                      </View>
                    </View>
                  ) : null}

                  {bulkResults && bulkResults.length > 0 ? (
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>BULK INVITATIONS CREATED ({bulkResults.length})</Text>
                      <Text style={{ fontSize: 13, color: colors.ink, marginTop: 4 }}>
                        Successfully generated invitations for {bulkResults.length} mobile numbers. Members will complete their onboarding claim upon opening the link.
                      </Text>
                      <View style={{ marginTop: 10 }}>
                        <PrimaryButton
                          title="Review Claims"
                          icon="shield-checkmark-outline"
                          onPress={() => navigation.navigate("MemberClaims")}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* Right Column: Invitation history */}
                <View style={styles.historyCard}>
                  <View style={styles.listHeader}>
                    <View>
                      <Text style={styles.historyTitle}>Invitation history</Text>
                      <Text style={styles.historySubtitle}>
                        All invitations issued for {user?.gym_name ?? "ZD Fitness"}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Refresh invitation history"
                      style={styles.refreshButton}
                      onPress={() => invitations.refetch()}
                    >
                      <Ionicons name="refresh-outline" size={17} color="#F2F2F7" />
                    </Pressable>
                  </View>

                  {/* History Filter Tabs */}
                  <View style={styles.historyTabs} accessibilityRole="tablist">
                    {(["all", "active", "used", "revoked", "expired"] as const).map((status) => {
                      const isSelected = historyFilter === status;
                      return (
                        <Pressable
                          key={status}
                          accessibilityRole="tab"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => setHistoryFilter(status)}
                          style={[styles.historyTab, isSelected && styles.historyTabActive]}
                        >
                          <Text style={[styles.historyTabText, isSelected && styles.historyTabTextActive]}>
                            {status[0].toUpperCase() + status.slice(1)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Search Bar */}
                  <View style={styles.historySearchBox}>
                    <SearchSvg size={15} color="#F2F2F7" />
                    <TextInput
                      ref={historyInputRef}
                      value={historySearch}
                      onChangeText={setHistorySearch}
                      placeholder="Search invitations"
                      placeholderTextColor="#F2F2F7"
                      style={styles.historySearchInput}
                    />
                  </View>

                  <NoticeBanner
                    message={
                      invitations.error
                        ? getApiErrorMessage(invitations.error)
                        : revokeInvitation.error
                        ? getApiErrorMessage(revokeInvitation.error)
                        : null
                    }
                    tone="error"
                  />
                  {invitations.isLoading ? <Text style={styles.empty}>Loading invitations...</Text> : null}
                  {!invitations.isLoading && !invitations.error && history.length === 0 ? (
                    <Text style={styles.empty}>
                      {historySearch
                        ? "No invitations match your search."
                        : historyFilter === "all"
                        ? "No invitations yet."
                        : `No ${historyFilter} invitations.`}
                    </Text>
                  ) : null}

                  {/* List of Invitations */}
                  {history.map((invite) => (
                    <InvitationRow
                      key={invite.id}
                      invite={invite}
                      styles={styles as any}
                      onRevoke={() => revokeInvitation.mutate(invite.id)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {/* Enquiry Details Modal */}
          <Modal visible={!!selectedEnquiry} transparent animationType="fade" onRequestClose={() => setSelectedEnquiry(null)}>
            <View style={styles.detailBackdrop}>
              <View style={styles.detailSheet} accessibilityViewIsModal>
                <View style={styles.listHeader}>
                  <Text accessibilityRole="header" style={styles.cardTitle}>Enquiry details</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Close enquiry details" style={styles.iconButton} onPress={() => setSelectedEnquiry(null)}>
                    <Ionicons name="close" size={22} color="#FFFFFF" />
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={{ gap: 16, paddingVertical: 16 }}>
                  {selectedEnquiry ? (
                    [
                      ["Gym name", selectedEnquiry.gym_name],
                      ["Owner / manager", selectedEnquiry.full_name],
                      ["Email", selectedEnquiry.email],
                      ["Phone", selectedEnquiry.phone],
                      ["Active members", selectedEnquiry.active_members_range],
                      ["Interested plan", selectedEnquiry.interested_plan_name ?? "No plan selected"],
                      ["Status", selectedEnquiry.status],
                      ["Source", selectedEnquiry.source],
                      ["Submitted", new Date(selectedEnquiry.created_at).toLocaleString("en-IN")],
                      ["Last updated", new Date(selectedEnquiry.updated_at).toLocaleString("en-IN")],
                      ["Notes", selectedEnquiry.notes || "No notes"],
                      ["Enquiry reference", selectedEnquiry.id],
                      ["Invitation reference", selectedEnquiry.invitation_id ?? "No invitation yet"],
                      ["Gym reference", selectedEnquiry.gym_id ?? "Not registered yet"],
                    ].map(([itemLabel, itemVal]) => (
                      <View key={itemLabel} style={{ gap: 4 }}>
                        <Text style={styles.rowMeta}>{itemLabel}</Text>
                        <Text selectable style={styles.rowTitle}>{itemVal}</Text>
                      </View>
                    ))
                  ) : null}
                </ScrollView>
                <NoticeBanner message={inviteRegistration.error ? getApiErrorMessage(inviteRegistration.error) : null} tone="error" />
                {selectedEnquiry?.status === "new" ? (
                  <PrimaryButton title="Create owner invitation" loading={inviteRegistration.isPending} onPress={() => inviteRegistration.mutate(selectedEnquiry.id)} />
                ) : null}
              </View>
            </View>
          </Modal>
        </Screen>
      );
    }
  }
}

export function InvitationRowView({ model }: { model: ReturnType<typeof useInvitationRowPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { invite, onRevoke, labels } = model.props;
      const styles = model.props.styles as unknown as ReturnType<typeof createStyles>;

      const roleLabel = labels[invite.role] ?? invite.role;
      const titleText = `${roleLabel} • ${invite.email ?? "Open invitation"}`;
      const expiresFormatted = new Date(invite.expires_at).toLocaleString();
      const metaText = `${invite.gym_name ?? "ZD Fitness"} • expires ${expiresFormatted}`;

      return (
        <View style={styles.row}>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle} numberOfLines={1}>{titleText}</Text>
            <Text style={styles.rowMeta}>{metaText}</Text>
          </View>
          <View style={styles.rowRight}>
            {invite.status === "used" ? (
              <View style={[styles.badge, styles.badgeUsed]}>
                <Text style={styles.badgeTextUsed}>Used</Text>
              </View>
            ) : invite.status === "active" ? (
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={styles.badgeTextActive}>Active</Text>
              </View>
            ) : invite.status === "revoked" ? (
              <View style={[styles.badge, styles.badgeRevoked]}>
                <Text style={styles.badgeTextRevoked}>Revoked</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeInactive]}>
                <Text style={styles.badgeTextInactive}>Expired</Text>
              </View>
            )}

            {invite.status === "active" ? (
              <Pressable accessibilityRole="button" onPress={onRevoke} style={styles.revokeButton}>
                <Text style={styles.revoke}>Revoke</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    }
  }
}

export function InviteStatView({ model }: { model: ReturnType<typeof useInviteStatPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { onPress, active, label, value } = model.props;
      const styles = model.props.styles as unknown as ReturnType<typeof createStyles>;

      const renderStatIcon = () => {
        if (label.includes("Total") || label.includes("mail")) {
          return <MailSvg size={18} color="#E91E63" />;
        }
        if (label.includes("Active") || label.includes("flash")) {
          return <ZapSvg size={18} color="#34C759" />;
        }
        if (label.includes("Used") || label.includes("checkmark")) {
          return <CheckCircleSvg size={18} color="#007AFF" />;
        }
        return <BanSvg size={18} color="#E91E63" />;
      };

      const iconBgColor =
        label.includes("Total")
          ? "rgba(233, 30, 99, 0.12)"
          : label.includes("Active")
          ? "rgba(52, 199, 89, 0.12)"
          : label.includes("Used")
          ? "rgba(0, 122, 255, 0.12)"
          : "rgba(233, 30, 99, 0.12)";

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          onPress={onPress}
          style={[styles.stat, active && styles.statActive]}
        >
          <View style={[styles.statIcon, { backgroundColor: iconBgColor }]}>
            {renderStatIcon()}
          </View>
          <View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        </Pressable>
      );
    }
  }
}
