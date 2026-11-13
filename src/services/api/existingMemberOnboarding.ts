import { apiClient } from "./client";
import type { AuthResponse } from "../../types/saas";

export interface ExistingMemberInviteResponse {
  id: string;
  gym_id: string | null;
  gym_name?: string | null;
  role: string;
  phone: string | null;
  invited_name: string | null;
  invitation_type: string;
  status: string;
  token: string;
  invite_url: string;
  expires_at: string;
}

export interface ExistingMemberClaim {
  id: string;
  gym_id: string;
  gym_name?: string | null;
  invitation_id: string;
  user_id: string | null;
  member_id: string | null;
  claimed_name: string;
  claimed_phone: string;
  claimed_email: string | null;
  membership_plan_id: string | null;
  membership_plan_name?: string | null;
  original_join_date: string;
  claimed_expiry_date: string;
  amount_paid_cents: number;
  currency: string;
  has_receipt: boolean;
  receipt_url: string | null;
  extracted_data: Record<string, unknown>;
  member_notes: string | null;
  status: "pending_review" | "clarification_requested" | "approved" | "rejected";
  clarification_notes: string | null;
  rejection_reason: string | null;
  verified_plan_id: string | null;
  verified_plan_name?: string | null;
  verified_join_date: string | null;
  verified_expiry_date: string | null;
  verified_amount_cents: number | null;
  reviewed_by: string | null;
  reviewer_name?: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExistingMemberClaimSubmitPayload {
  invitation_token: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  membership_plan_id?: string;
  original_join_date: string;
  claimed_expiry_date: string;
  amount_paid_cents?: number;
  currency?: string;
  has_receipt?: boolean;
  receipt_url?: string | null;
  member_notes?: string | null;
  extracted_data?: Record<string, unknown>;
}

export interface ReceiptScanResult {
  extracted_join_date: string | null;
  extracted_expiry_date: string | null;
  extracted_amount_cents: number | null;
  extracted_plan_hint: string | null;
  disclaimer: string;
}

export interface ClaimReviewPayload {
  decision: "approve" | "reject" | "request_clarification";
  clarification_notes?: string;
  rejection_reason?: string;
  verified_plan_id?: string;
  verified_join_date?: string;
  verified_expiry_date?: string;
  verified_amount_cents?: number;
}

export interface ClaimUpdatePayload {
  membership_plan_id?: string;
  original_join_date?: string;
  claimed_expiry_date?: string;
  amount_paid_cents?: number;
  has_receipt?: boolean;
  receipt_url?: string;
  member_notes?: string;
}

export const existingMemberOnboardingApi = {
  createInvite: async (payload: {
    phone: string;
    invited_name?: string;
    existing_member_id?: string;
    expires_in_hours?: number;
  }): Promise<ExistingMemberInviteResponse> => {
    const response = await apiClient.post<ExistingMemberInviteResponse>(
      "/invitations/existing-member",
      payload
    );
    return response.data;
  },

  bulkCreateInvites: async (payload: {
    invites: Array<{ phone: string; invited_name?: string; existing_member_id?: string }>;
    expires_in_hours?: number;
  }): Promise<ExistingMemberInviteResponse[]> => {
    const response = await apiClient.post<ExistingMemberInviteResponse[]>(
      "/invitations/existing-members/bulk",
      payload
    );
    return response.data;
  },

  scanReceipt: async (payload: {
    receipt_url?: string;
    ocr_text?: string;
  }): Promise<ReceiptScanResult> => {
    const response = await apiClient.post<ReceiptScanResult>(
      "/invitations/claims/scan-receipt",
      payload
    );
    return response.data;
  },

  submitClaim: async (
    payload: ExistingMemberClaimSubmitPayload
  ): Promise<{ auth: AuthResponse; claim: ExistingMemberClaim }> => {
    const response = await apiClient.post<{ auth: AuthResponse; claim: ExistingMemberClaim }>(
      "/invitations/claims/submit",
      payload
    );
    return response.data;
  },

  listClaims: async (status?: string): Promise<ExistingMemberClaim[]> => {
    const params = status && status !== "all" ? { status } : undefined;
    const response = await apiClient.get<ExistingMemberClaim[]>("/invitations/claims", { params });
    return response.data;
  },

  getClaim: async (claimId: string): Promise<ExistingMemberClaim> => {
    const response = await apiClient.get<ExistingMemberClaim>(`/invitations/claims/${claimId}`);
    return response.data;
  },

  reviewClaim: async (
    claimId: string,
    payload: ClaimReviewPayload
  ): Promise<ExistingMemberClaim> => {
    const response = await apiClient.post<ExistingMemberClaim>(
      `/invitations/claims/${claimId}/review`,
      payload
    );
    return response.data;
  },

  updateClaim: async (
    claimId: string,
    payload: ClaimUpdatePayload
  ): Promise<ExistingMemberClaim> => {
    const response = await apiClient.patch<ExistingMemberClaim>(
      `/invitations/claims/${claimId}`,
      payload
    );
    return response.data;
  },
};

