import type * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ExistingMemberClaimsScreenView } from "./ExistingMemberClaimsScreen.presentation";
import { createClaimsStyles } from "./ExistingMemberClaimsScreen.styles";
import { membershipPlansApi } from "../../services/api/operations";
import {
  existingMemberOnboardingApi,
  type ExistingMemberClaim,
} from "../../services/api/existingMemberOnboarding";
import { getApiErrorMessage } from "../../services/api/client";
import { useAppTheme } from "../../theme/AppThemeProvider";

export function useExistingMemberClaimsScreenPresentation() {
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createClaimsStyles(colors), [colors]);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<
    "pending_review" | "clarification_requested" | "approved" | "rejected" | "all"
  >("pending_review");
  const [activeModal, setActiveModal] = useState<"approve" | "clarify" | "reject" | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ExistingMemberClaim | null>(null);
  const [clarificationText, setClarificationText] = useState("");
  const [rejectionText, setRejectionText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [approveDraft, setApproveDraft] = useState({
    planId: "",
    joinDate: "",
    expiryDate: "",
    amountDollars: "0.00",
  });

  const claimsQuery = useQuery({
    queryKey: ["existing-member-claims", filter],
    queryFn: () => existingMemberOnboardingApi.listClaims(filter),
  });

  const allClaimsQuery = useQuery({
    queryKey: ["existing-member-claims", "all"],
    queryFn: () => existingMemberOnboardingApi.listClaims("all"),
  });

  const plansQuery = useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => membershipPlansApi.list(),
  });

  const allClaims = allClaimsQuery.data ?? [];
  const stats = useMemo(() => {
    return {
      pending: allClaims.filter((c) => c.status === "pending_review").length,
      clarification: allClaims.filter((c) => c.status === "clarification_requested").length,
      approved: allClaims.filter((c) => c.status === "approved").length,
      rejected: allClaims.filter((c) => c.status === "rejected").length,
    };
  }, [allClaims]);

  const reviewMutation = useMutation({
    mutationFn: ({ claimId, payload }: { claimId: string; payload: any }) =>
      existingMemberOnboardingApi.reviewClaim(claimId, payload),
    onSuccess: (updated) => {
      setActiveModal(null);
      setSelectedClaim(null);
      setClarificationText("");
      setRejectionText("");
      const actionLabel =
        updated.status === "approved"
          ? "Membership claim approved and member activated!"
          : updated.status === "clarification_requested"
          ? "Clarification request sent to member."
          : "Claim was rejected.";
      setNotice(actionLabel);
      void queryClient.invalidateQueries({ queryKey: ["existing-member-claims"] });
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err) => {
      setNotice(getApiErrorMessage(err));
    },
  });

  const openApproveModal = (claim: ExistingMemberClaim) => {
    setSelectedClaim(claim);
    setApproveDraft({
      planId: claim.membership_plan_id || (plansQuery.data?.[0]?.id ?? ""),
      joinDate: claim.original_join_date,
      expiryDate: claim.claimed_expiry_date,
      amountDollars: (claim.amount_paid_cents / 100).toFixed(2),
    });
    setActiveModal("approve");
  };

  const openClarifyModal = (claim: ExistingMemberClaim) => {
    setSelectedClaim(claim);
    setClarificationText(claim.clarification_notes || "");
    setActiveModal("clarify");
  };

  const openRejectModal = (claim: ExistingMemberClaim) => {
    setSelectedClaim(claim);
    setRejectionText(claim.rejection_reason || "");
    setActiveModal("reject");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedClaim(null);
  };

  const confirmApprove = () => {
    if (!selectedClaim) return;
    const amountCents = Math.round(parseFloat(approveDraft.amountDollars || "0") * 100);
    reviewMutation.mutate({
      claimId: selectedClaim.id,
      payload: {
        decision: "approve",
        verified_plan_id: approveDraft.planId || undefined,
        verified_join_date: approveDraft.joinDate || undefined,
        verified_expiry_date: approveDraft.expiryDate || undefined,
        verified_amount_cents: isNaN(amountCents) ? undefined : amountCents,
      },
    });
  };

  const confirmClarify = () => {
    if (!selectedClaim) return;
    reviewMutation.mutate({
      claimId: selectedClaim.id,
      payload: {
        decision: "request_clarification",
        clarification_notes: clarificationText.trim(),
      },
    });
  };

  const confirmReject = () => {
    if (!selectedClaim) return;
    reviewMutation.mutate({
      claimId: selectedClaim.id,
      payload: {
        decision: "reject",
        rejection_reason: rejectionText.trim() || undefined,
      },
    });
  };

  const claims = claimsQuery.data ?? [];
  const plans = plansQuery.data ?? [];

  return {
    kind: "view1" as const,
    props: {
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
      navigation,
    },
  };
}

export function ExistingMemberClaimsScreen(
  ...args: Parameters<typeof useExistingMemberClaimsScreenPresentation>
): React.JSX.Element {
  return <ExistingMemberClaimsScreenView model={useExistingMemberClaimsScreenPresentation(...args)} />;
}
