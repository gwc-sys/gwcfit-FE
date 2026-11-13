import { Pressable } from "../../components/NativePressable";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { ActivityIndicator, Modal, ScrollView, Share, Text, TextInput, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { getApiErrorMessage } from "../../../../services/api/client";
import type { useInvitationManagementScreenPresentation, useInvitationRowPresentation, useInviteStatPresentation } from "../../../../screens/saas/InvitationManagementScreen";

export function InvitationManagementScreenView({ model }: { model: ReturnType<typeof useInvitationManagementScreenPresentation> }): React.ReactNode {
  const reduceMotion = useReducedMotion();
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
        styles,
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

      const formattedToday = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <Screen scroll keyboard>
          <View style={styles.page}>
            {/* Custom Screen Header matching reference */}
            <View style={styles.customHeader}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerTitleGroup}>
                  <Text style={styles.headerMainTitle}>Invitations</Text>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.headerDateText}>{formattedToday}</Text>
              </View>
              <Text style={styles.headerSubtitleText}>
                {user?.role === "super_admin"
                  ? "Invite gym owners to create their workspace."
                  : "Invite people into your gym with a fixed role."}
              </Text>
            </View>

            {/* Super Admin section tabs */}
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

            {/* 2x2 Stats Grid */}
            {section === "invitations" ? (
              <View style={styles.stats}>
                <InviteStat
                  icon="mail-outline"
                  label="Total invitations"
                  value={String(invitations.data?.length ?? 0)}
                  color="#E91E63"
                  styles={styles}
                  active={historyFilter === "all"}
                  onPress={() => setHistoryFilter("all")}
                />
                <InviteStat
                  icon="flash-outline"
                  label="Active invitations"
                  value={String(activeCount)}
                  color="#34C759"
                  styles={styles}
                  active={historyFilter === "active"}
                  onPress={() => setHistoryFilter("active")}
                />
                <InviteStat
                  icon="checkmark"
                  label="Used invitations"
                  value={String(usedCount)}
                  color="#007AFF"
                  styles={styles}
                  active={historyFilter === "used"}
                  onPress={() => setHistoryFilter("used")}
                />
                <InviteStat
                  icon="ban-outline"
                  label="Revoked invitations"
                  value={String(revokedCount)}
                  color="#FF3B30"
                  styles={styles}
                  active={historyFilter === "revoked"}
                  onPress={() => setHistoryFilter("revoked")}
                />
              </View>
            ) : null}

            {/* Super admin enquiries view */}
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
                    <Ionicons name="refresh-outline" size={22} color={colors.primary} />
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
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{request.status}</Text>
                    </View>
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

            {/* Create Invitation & History Sections */}
            {section === "invitations" ? (
              <>
                {/* Create Invitation Card */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Create invitation</Text>
                  <Text style={styles.helper}>
                    Create a single-use code with a fixed role. Save or share now; it cannot be revealed again.
                  </Text>

                  {/* Role Selector Matrix */}
                  <View style={{ gap: 8 }}>
                    <Text style={styles.label}>Role</Text>
                    <View style={styles.rolesContainer}>
                      <View style={styles.roleGrid}>
                        {roles.map((candidate) => (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: role === candidate }}
                            key={candidate}
                            onPress={() => setRole(candidate)}
                            style={[styles.role, role === candidate && styles.roleActive]}
                          >
                            <Text style={[styles.roleText, role === candidate && styles.roleTextActive]}>
                              {labels[candidate] || candidate}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Role-Specific Form Fields */}
                  {role === "member" && user?.role === "gym_owner" ? (
                    <View style={{ gap: 12, marginTop: 4 }}>
                      <View style={{ flexDirection: "row", gap: 8, backgroundColor: colors.card, padding: 4, borderRadius: 8 }}>
                        <Pressable
                          onPress={() => setBulkMode(false)}
                          style={{
                            flex: 1,
                            paddingVertical: 6,
                            borderRadius: 6,
                            alignItems: "center",
                            backgroundColor: !bulkMode ? colors.surface : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: !bulkMode ? "700" : "500", color: !bulkMode ? colors.ink : colors.muted }}>
                            Single Member (10-15s)
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setBulkMode(true)}
                          style={{
                            flex: 1,
                            paddingVertical: 6,
                            borderRadius: 6,
                            alignItems: "center",
                            backgroundColor: bulkMode ? colors.surface : "transparent",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: bulkMode ? "700" : "500", color: bulkMode ? colors.ink : colors.muted }}>
                            Bulk Numbers
                          </Text>
                        </Pressable>
                      </View>

                      {!bulkMode ? (
                        <>
                          <View style={styles.inputGroup}>
                            <View style={styles.inputLabelRow}>
                              <Text style={styles.inputLabel}>Member Mobile Number</Text>
                              <Text style={styles.inputBadgeRequired}>Required</Text>
                            </View>
                            <View style={styles.inputBoxRow}>
                              <Ionicons name="call-outline" size={18} color="#F2F2F7" />
                              <TextInput
                                value={existingPhone}
                                onChangeText={setExistingPhone}
                                keyboardType="phone-pad"
                                placeholder="e.g. +1 555 123 4567"
                                placeholderTextColor="#1C1C1E"
                                style={styles.inputText}
                              />
                            </View>
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Member Full Name (optional)</Text>
                            <View style={styles.inputBoxRow}>
                              <Ionicons name="person-outline" size={18} color="#F2F2F7" />
                              <TextInput
                                value={existingName}
                                onChangeText={setExistingName}
                                placeholder="e.g. John Connor"
                                placeholderTextColor="#1C1C1E"
                                style={styles.inputText}
                              />
                            </View>
                          </View>
                        </>
                      ) : (
                        <View style={styles.inputGroup}>
                          <View style={styles.inputLabelRow}>
                            <Text style={styles.inputLabel}>Mobile Numbers (one per line)</Text>
                            <Text style={styles.inputBadgeRequired}>Bulk Import</Text>
                          </View>
                          <TextInput
                            value={bulkPhones}
                            onChangeText={setBulkPhones}
                            multiline
                            numberOfLines={4}
                            placeholder="+15551112222&#10;+15553334444&#10;+15555556666"
                            placeholderTextColor="#1C1C1E"
                            style={[styles.inputText, { minHeight: 90, textAlignVertical: "top", padding: 10, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border }]}
                          />
                        </View>
                      )}
                    </View>
                  ) : (
                    /* Restrict to email */
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Restrict to email (optional)</Text>
                      <View style={styles.inputBox}>
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          placeholder="e.g. ganesh.gwc@gmail.com"
                          placeholderTextColor="#1C1C1E"
                          style={styles.inputText}
                        />
                      </View>
                    </View>
                  )}

                  {/* Expires in hours */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                      <Text style={styles.inputLabel}>Expires in hours</Text>
                      <Text style={styles.inputBadgeRequired}>Required (1–720 hrs)</Text>
                    </View>
                    <View style={styles.inputBoxRow}>
                      <Ionicons name="time-outline" size={18} color="#F2F2F7" />
                      <TextInput
                        value={hours}
                        onChangeText={setHours}
                        keyboardType="number-pad"
                        placeholder="168"
                        placeholderTextColor="#1C1C1E"
                        style={styles.inputText}
                      />
                    </View>
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

                  {/* Primary CTA */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Create invitation"
                    onPress={issue}
                    disabled={createInvitation.isPending || createExistingMember.isPending || bulkCreateExistingMembers.isPending}
                    style={[
                      styles.primaryCta,
                      (createInvitation.isPending || createExistingMember.isPending || bulkCreateExistingMembers.isPending) && { opacity: 0.7 },
                    ]}
                  >
                    {createInvitation.isPending || createExistingMember.isPending || bulkCreateExistingMembers.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.primaryCtaText}>
                          {role === "member" && user?.role === "gym_owner"
                            ? bulkMode
                              ? "Send Bulk Invitations"
                              : "Invite Existing Member"
                            : "Create invitation"}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  {/* Created Token Box */}
                  {createdToken ? (
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>INVITE CODE & LINK</Text>
                      <Text selectable style={styles.token}>
                        {createdToken}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <PrimaryButton
                          title="Share Link"
                          icon="share-outline"
                          variant="secondary"
                          style={{ flex: 1 }}
                          onPress={() =>
                            void Share.share({
                              message: `You're invited to join ${user?.gym_name || "our gym"} on PulseFit! Use code: ${createdToken} or click here: https://pulsefit.app/signup?token=${createdToken}`,
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
                      <View style={{ marginTop: 8 }}>
                        <PrimaryButton
                          title="Review Claims"
                          icon="shield-checkmark-outline"
                          onPress={() => navigation.navigate("MemberClaims")}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* History Section */}
                <View style={styles.historySection}>
                  <View style={styles.historyHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTitle}>Invitation history</Text>
                      <Text style={styles.historySubtitle}>
                        {`All invitations issued for ${user?.gym_name?.trim() || "ZD Fitness"}`}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => invitations.refetch()}
                      accessibilityLabel="Refresh invitations"
                      style={styles.refreshCircleButton}
                    >
                      <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Filter Pills */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterStrip}
                  >
                    {(["all", "active", "used", "revoked", "expired"] as const).map((status) => {
                      const isSelected = historyFilter === status;
                      return (
                        <Pressable
                          key={status}
                          accessibilityRole="tab"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => setHistoryFilter(status)}
                          style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                        >
                          <Text style={[styles.filterPillText, isSelected && styles.filterPillTextSelected]}>
                            {status[0].toUpperCase() + status.slice(1)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Search Bar */}
                  <View style={styles.historySearchBar}>
                    <Ionicons name="search-outline" size={17} color="#F2F2F7" />
                    <TextInput
                      ref={historyInputRef}
                      value={historySearch}
                      onChangeText={setHistorySearch}
                      placeholder="Search invitations by email or role..."
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

                  {history.map((invite) => (
                    <InvitationRow
                      key={invite.id}
                      invite={invite}
                      styles={styles}
                      onRevoke={() => revokeInvitation.mutate(invite.id)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>

          {/* Enquiry Modal for Super Admin */}
          <Modal
            visible={!!selectedEnquiry}
            transparent
            animationType={reduceMotion ? "none" : "fade"}
            onRequestClose={() => setSelectedEnquiry(null)}
          >
            <View style={styles.detailBackdrop}>
              <View style={styles.detailSheet} accessibilityViewIsModal>
                <View style={styles.listHeader}>
                  <Text accessibilityRole="header" style={styles.cardTitle}>
                    Enquiry details
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close enquiry details"
                    style={styles.iconButton}
                    onPress={() => setSelectedEnquiry(null)}
                  >
                    <Ionicons name="close" size={24} color={colors.ink} />
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={{ gap: 18, paddingVertical: 16 }}>
                  {selectedEnquiry
                    ? [
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
                      ].map(([label, value]) => (
                        <View key={label} style={{ gap: 4 }}>
                          <Text style={styles.rowMeta}>{label}</Text>
                          <Text selectable style={styles.rowTitle}>
                            {value}
                          </Text>
                        </View>
                      ))
                    : null}
                </ScrollView>
                <NoticeBanner
                  message={inviteRegistration.error ? getApiErrorMessage(inviteRegistration.error) : null}
                  tone="error"
                />
                {selectedEnquiry?.status === "new" ? (
                  <PrimaryButton
                    title="Create owner invitation"
                    loading={inviteRegistration.isPending}
                    onPress={() => inviteRegistration.mutate(selectedEnquiry.id)}
                  />
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
      const { styles, labels, invite, onRevoke } = model.props;
      const [copied, setCopied] = React.useState(false);

      const roleCodeMap: Record<string, string> = {
        sub_admin: "SUB",
        receptionist: "REC",
        trainer: "TRN",
        member: "MEM",
        gym_owner: "OWN",
      };

      const codeSuffix = invite.id.replace(/-/g, "").slice(0, 4).toUpperCase();
      const rolePrefix = roleCodeMap[invite.role] || invite.role.slice(0, 3).toUpperCase();
      const displayCode = invite.token || `PLV-${rolePrefix}-${codeSuffix}`;

      const handleCopy = async () => {
        try {
          if (typeof navigator !== "undefined" && (navigator as any)?.clipboard?.writeText) {
            await (navigator as any).clipboard.writeText(displayCode);
          } else {
            await Share.share({ message: displayCode });
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // fallback
        }
      };

      const statusBadgeStyle =
        invite.status === "used"
          ? styles.badgeUsed
          : invite.status === "active"
          ? styles.badgeActive
          : invite.status === "revoked"
          ? styles.badgeRevoked
          : styles.badgeExpired;

      const statusTextStyle =
        invite.status === "used"
          ? styles.badgeTextUsed
          : invite.status === "active"
          ? styles.badgeTextActive
          : invite.status === "revoked"
          ? styles.badgeTextRevoked
          : styles.badgeTextExpired;

      const formattedExpires = new Date(invite.expires_at).toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return (
        <View style={styles.historyCard}>
          {/* Row 1: Role • Email & Status */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleRow}>
              <Text style={styles.cardRoleText}>{labels[invite.role] || invite.role}</Text>
              <Text style={styles.cardDot}>•</Text>
              <Text numberOfLines={1} style={styles.cardEmailText}>
                {invite.email ?? "Any email"}
              </Text>
            </View>
            <View style={[styles.badgePill, statusBadgeStyle]}>
              <Text style={[styles.badgeText, statusTextStyle]}>
                {invite.status === "used"
                  ? "Used"
                  : invite.status === "active"
                  ? "Active"
                  : invite.status === "revoked"
                  ? "Revoked"
                  : "Expired"}
              </Text>
            </View>
          </View>

          {/* Row 2: Gym • Expiration */}
          <Text numberOfLines={1} style={styles.cardMetaText}>
            {`${invite.gym_name ?? "ZD Fitness"} • expires ${formattedExpires}`}
          </Text>

          {/* Row 3: Code & Copy Button */}
          <View style={styles.cardFooterRow}>
            <Text style={styles.codeLabel}>
              Code: <Text selectable style={styles.codeValue}>{displayCode}</Text>
            </Text>

            <View style={styles.cardActionGroup}>
              {invite.status === "active" ? (
                <Pressable accessibilityRole="button" onPress={onRevoke} style={styles.revokeButton}>
                  <Text style={styles.revokeText}>Revoke</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy invite code"
                onPress={handleCopy}
                style={[styles.copyButton, copied && styles.copyButtonActive]}
              >
                <Text style={styles.copyButtonText}>{copied ? "Copied" : "Copy"}</Text>
              </Pressable>
            </View>
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
      const { onPress, styles, active, color, icon, label, value } = model.props;
      const lower = label.toLowerCase();
      const topLabel = lower.includes("total")
        ? "TOTAL"
        : lower.includes("active")
        ? "ACTIVE"
        : lower.includes("used")
        ? "USED"
        : lower.includes("revoked")
        ? "REVOKED"
        : label.toUpperCase();

      const valueColor =
        topLabel === "ACTIVE"
          ? "#34C759"
          : topLabel === "USED"
          ? "#007AFF"
          : topLabel === "REVOKED"
          ? "#FF3B30"
          : "#FFFFFF";

      const iconColor =
        topLabel === "TOTAL"
          ? "#E91E63"
          : topLabel === "ACTIVE"
          ? "#34C759"
          : topLabel === "USED"
          ? "#007AFF"
          : "#FF3B30";

      const iconName: keyof typeof Ionicons.glyphMap =
        topLabel === "TOTAL"
          ? "mail-outline"
          : topLabel === "ACTIVE"
          ? "flash-outline"
          : topLabel === "USED"
          ? "checkmark"
          : "ban-outline";

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          onPress={onPress}
          style={[styles.stat, active && styles.statActive]}
        >
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>{topLabel}</Text>
            <Ionicons name={iconName} size={18} color={iconColor} />
          </View>
          <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
          <Text style={styles.statSub}>{label}</Text>
        </Pressable>
      );
    }
  }
}
