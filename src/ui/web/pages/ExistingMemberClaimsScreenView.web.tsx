import type * as React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { NoticeBanner } from "../../../components/NoticeBanner";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Screen } from "../../../components/Screen";
import { StatusBadge } from "../../../components/StatusBadge";
import type { ExistingMemberClaim } from "../../../services/api/existingMemberOnboarding";
import type { useExistingMemberClaimsScreenPresentation } from "../../../screens/saas/ExistingMemberClaimsScreen";

export function ExistingMemberClaimsScreenView({
  model,
}: {
  model: ReturnType<typeof useExistingMemberClaimsScreenPresentation>;
}): React.JSX.Element {
  const {
    styles,
    colors,
    filter,
    setFilter,
    claims,
    claimsQuery,
    stats,
    activeModal,
    selectedClaim,
    approveDraft,
    setApproveDraft,
    clarificationText,
    setClarificationText,
    rejectionText,
    setRejectionText,
    plans,
    openApproveModal,
    openClarifyModal,
    openRejectModal,
    closeModal,
    confirmApprove,
    confirmClarify,
    confirmReject,
    reviewMutation,
    notice,
    setNotice,
  } = model.props;

  const renderClaimItem = ({ item }: { item: ExistingMemberClaim }) => {
    const isPending = item.status === "pending_review";
    const isClarification = item.status === "clarification_requested";
    const isApproved = item.status === "approved";
    const isRejected = item.status === "rejected";

    const badgeTone = isApproved ? "success" : isRejected ? "danger" : isClarification ? "warning" : "info";
    const statusLabel =
      item.status === "pending_review"
        ? "Pending Review"
        : item.status === "clarification_requested"
        ? "Clarification Needed"
        : item.status === "approved"
        ? "Approved"
        : "Rejected";

    return (
      <View style={styles.claimCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.memberName}>{item.claimed_name}</Text>
            <Text style={styles.memberContact}>
              {item.claimed_phone} {item.claimed_email ? `• ${item.claimed_email}` : ""}
            </Text>
          </View>
          <StatusBadge label={statusLabel} tone={badgeTone} />
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Membership Plan</Text>
            <Text style={styles.detailValue}>
              {item.verified_plan_name || item.membership_plan_name || "General Membership"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValue}>
              {item.currency} {((item.verified_amount_cents ?? item.amount_paid_cents) / 100).toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Verified / Joined Date</Text>
            <Text style={styles.detailValue}>
              {item.verified_join_date || item.original_join_date}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expiry Date</Text>
            <Text style={styles.detailValue}>
              {item.verified_expiry_date || item.claimed_expiry_date}
            </Text>
          </View>
        </View>

        <View style={styles.proofCard}>
          <View style={styles.proofBadge}>
            <Ionicons
              name={item.has_receipt ? "receipt-outline" : "alert-circle-outline"}
              size={20}
              color={item.has_receipt ? colors.primary : colors.warning}
            />
            <Text style={styles.proofText}>
              {item.has_receipt
                ? "Supporting receipt document attached"
                : "No receipt attached — Manual verification against gym's offline register required"}
            </Text>
          </View>
          {item.member_notes ? (
            <Text style={[styles.detailValue, { marginTop: 8, fontWeight: "normal", fontStyle: "italic" }]}>
              "{item.member_notes}"
            </Text>
          ) : null}
        </View>

        {item.clarification_notes ? (
          <View style={styles.clarificationBox}>
            <Text style={styles.detailLabel}>Owner Clarification Request:</Text>
            <Text style={styles.clarificationText}>{item.clarification_notes}</Text>
          </View>
        ) : null}

        {item.rejection_reason ? (
          <View style={styles.rejectionBox}>
            <Text style={styles.detailLabel}>Rejection Reason:</Text>
            <Text style={styles.clarificationText}>{item.rejection_reason}</Text>
          </View>
        ) : null}

        {isPending || isClarification ? (
          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionBtn, styles.btnApprove]}
              onPress={() => openApproveModal(item)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.btnTextApprove}>Review & Approve</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.btnClarify]}
              onPress={() => openClarifyModal(item)}
            >
              <Ionicons name="help-circle-outline" size={18} color={colors.ink} />
              <Text style={styles.btnTextSecondary}>Request Clarification</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.btnReject]}
              onPress={() => openRejectModal(item)}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
              <Text style={[styles.btnTextSecondary, { color: colors.danger }]}>Reject</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Member Claims</Text>
          <Text style={styles.subtitle}>
            Review and verify onboarding claims submitted by existing gym members.
          </Text>
        </View>
      </View>

      {notice ? (
        <NoticeBanner
          tone="success"
          message={notice}
        />
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{stats.clarification}</Text>
          <Text style={styles.statLabel}>Clarification</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.danger }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      <View style={styles.filterBar}>
        {(["pending_review", "clarification_requested", "approved", "all"] as const).map((tab) => {
          const active = filter === tab;
          const label =
            tab === "pending_review"
              ? "Pending Review"
              : tab === "clarification_requested"
              ? "Clarification Requested"
              : tab === "approved"
              ? "Approved"
              : "All Claims";
          const count =
            tab === "pending_review"
              ? stats.pending
              : tab === "clarification_requested"
              ? stats.clarification
              : tab === "approved"
              ? stats.approved
              : undefined;

          return (
            <Pressable
              key={tab}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                {label}
              </Text>
              {count !== undefined && count > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>No claims found</Text>
          <Text style={styles.emptyText}>
            {filter === "pending_review"
              ? "There are no pending membership claims awaiting verification."
              : "No claims matching the selected filter."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id}
          renderItem={renderClaimItem}
          contentContainerStyle={{ gap: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={claimsQuery.isFetching}
              onRefresh={() => void claimsQuery.refetch()}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Approve Modal */}
      <Modal visible={activeModal === "approve"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify & Approve Membership</Text>
            <Text style={styles.modalSubtitle}>
              Confirm or correct the member's verified plan, dates, and amount paid.
            </Text>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={styles.detailLabel}>Select Verified Plan</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {plans.map((p: any) => {
                      const isSel = approveDraft.planId === p.id;
                      return (
                        <Pressable
                          key={p.id}
                          onPress={() => setApproveDraft((prev) => ({ ...prev, planId: p.id }))}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: isSel ? colors.primary : colors.border,
                            backgroundColor: isSel ? colors.primarySoft : colors.surface,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: isSel ? "700" : "500",
                              color: isSel ? colors.primary : colors.ink,
                            }}
                          >
                            {p.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={styles.detailLabel}>Verified Joining Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={approveDraft.joinDate}
                  onChangeText={(v) => setApproveDraft((prev) => ({ ...prev, joinDate: v }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text style={styles.detailLabel}>Verified Expiry Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={approveDraft.expiryDate}
                  onChangeText={(v) => setApproveDraft((prev) => ({ ...prev, expiryDate: v }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text style={styles.detailLabel}>Verified Amount Paid ($)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={approveDraft.amountDollars}
                  onChangeText={(v) => setApproveDraft((prev) => ({ ...prev, amountDollars: v }))}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeModal}
                style={[styles.actionBtn, styles.btnClarify, { minWidth: 100 }]}
              >
                <Text style={styles.btnTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmApprove}
                disabled={reviewMutation.isPending}
                style={[styles.actionBtn, styles.btnApprove, { minWidth: 160 }]}
              >
                <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                <Text style={styles.btnTextApprove}>
                  {reviewMutation.isPending ? "Approving..." : "Confirm & Approve"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clarification Modal */}
      <Modal visible={activeModal === "clarify"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Clarification</Text>
            <Text style={styles.modalSubtitle}>
              Ask the member to verify or update their details (e.g. upload receipt, confirm expiry).
            </Text>

            <TextInput
              style={[styles.modalInput, { minHeight: 110, textAlignVertical: "top" }]}
              value={clarificationText}
              onChangeText={setClarificationText}
              placeholder="e.g. Please check your expiry date or upload proof of previous payment..."
              placeholderTextColor={colors.muted}
              multiline
            />

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeModal}
                style={[styles.actionBtn, styles.btnClarify, { minWidth: 100 }]}
              >
                <Text style={styles.btnTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmClarify}
                disabled={reviewMutation.isPending || !clarificationText.trim()}
                style={[styles.actionBtn, styles.btnApprove, { minWidth: 140 }]}
              >
                <Text style={styles.btnTextApprove}>
                  {reviewMutation.isPending ? "Sending..." : "Send Request"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Modal */}
      <Modal visible={activeModal === "reject"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Membership Claim</Text>
            <Text style={styles.modalSubtitle}>
              Specify why this claim cannot be verified or approved.
            </Text>

            <TextInput
              style={[styles.modalInput, { minHeight: 110, textAlignVertical: "top" }]}
              value={rejectionText}
              onChangeText={setRejectionText}
              placeholder="e.g. No matching record found in gym register..."
              placeholderTextColor={colors.muted}
              multiline
            />

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeModal}
                style={[styles.actionBtn, styles.btnClarify, { minWidth: 100 }]}
              >
                <Text style={styles.btnTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmReject}
                disabled={reviewMutation.isPending}
                style={[styles.actionBtn, styles.btnReject, { backgroundColor: colors.danger, minWidth: 140 }]}
              >
                <Text style={[styles.btnTextApprove, { color: "#ffffff" }]}>
                  {reviewMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
