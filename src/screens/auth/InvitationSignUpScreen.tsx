import type * as React from "react";
import { InvitationSignUpScreenView } from "./InvitationSignUpScreen.presentation";
import { createStyles } from "./InvitationSignUpScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import type { RootStackParamList } from "../../navigation/types";
import { authApi } from "../../services/api/auth";
import { existingMemberOnboardingApi } from "../../services/api/existingMemberOnboarding";
import { getApiErrorMessage } from "../../services/api/client";
import { invitationApi } from "../../services/api/invitations";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { radius, spacing, typography } from "../../theme/theme";
import type { ThemeColors } from "../../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

const roleLabels: Record<string, string> = {
  gym_owner: "Gym owner",
  sub_admin: "Sub admin",
  trainer: "Trainer",
  receptionist: "Receptionist",
  member: "Member"
};

export function useInvitationSignUpScreenPresentation({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setSession = useAuthStore((state) => state.setSession);
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Existing member onboarding fields
  const defaultJoin = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    return d.toISOString().split("T")[0];
  }, []);
  const defaultExp = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().split("T")[0];
  }, []);

  const [originalJoinDate, setOriginalJoinDate] = useState(defaultJoin);
  const [claimedExpiryDate, setClaimedExpiryDate] = useState(defaultExp);
  const [amountPaidDollars, setAmountPaidDollars] = useState("0.00");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [memberNotes, setMemberNotes] = useState("");
  const [receiptScanNotice, setReceiptScanNotice] = useState<string | null>(null);

  const scanReceiptMutation = useMutation({
    mutationFn: (text: string) => existingMemberOnboardingApi.scanReceipt({ ocr_text: text }),
    onSuccess: (data) => {
      if (data.extracted_join_date) setOriginalJoinDate(data.extracted_join_date);
      if (data.extracted_expiry_date) setClaimedExpiryDate(data.extracted_expiry_date);
      if (data.extracted_amount_cents !== null && data.extracted_amount_cents !== undefined) {
        setAmountPaidDollars((data.extracted_amount_cents / 100).toFixed(2));
      }
      setHasReceipt(true);
      setReceiptScanNotice("Prefilled details from receipt. Please review and confirm your dates and amount before submitting.");
    },
  });

  const validation = useMutation({
    mutationFn: invitationApi.validate,
    onSuccess: (invite) => {
      setFormError(null);
      if (invite.email) setEmail(invite.email);
      if (invite.phone) setPhone(invite.phone);
      if (invite.invited_name) setFullName(invite.invited_name);
      if (invite.role === "member" && invite.plans && invite.plans.length > 0) {
        setSelectedPlanId(invite.plans[0].id);
        const plan = invite.plans[0];
        setAmountPaidDollars((plan.price_cents / 100).toFixed(2));
      }
    }
  });
  const registration = useMutation({
    mutationFn: async () => {
      const invite = validation.data;
      if (!invite) throw new Error("Verify your invitation first.");
      if (invite.role === "member" && invite.plans && invite.plans.length > 0 && !selectedPlanId) {
        throw new Error("Please select a membership plan to continue.");
      }
      if (fullName.trim().length < 2) throw new Error("Enter your full name (at least 2 characters).");
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new Error("Enter a valid email address.");
      if (phone.trim().replace(/\D/g, "").length < 8) throw new Error("Enter a valid mobile number (at least 8 digits).");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (invite.invitation_type === "existing_member") {
        if (!originalJoinDate) throw new Error("Please enter your original joining date.");
        if (!claimedExpiryDate) throw new Error("Please enter your membership expiry date.");
        const amountCents = Math.round(parseFloat(amountPaidDollars || "0") * 100);
        const res = await existingMemberOnboardingApi.submitClaim({
          invitation_token: token,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          membership_plan_id: selectedPlanId || undefined,
          original_join_date: originalJoinDate,
          claimed_expiry_date: claimedExpiryDate,
          amount_paid_cents: isNaN(amountCents) ? 0 : amountCents,
          has_receipt: hasReceipt,
          receipt_url: receiptUrl || undefined,
          member_notes: memberNotes.trim() || undefined,
        });
        return res.auth;
      }
      if (invite.role === "gym_owner") {
        if (gymName.trim().length < 2) throw new Error("Enter your gym name.");
        return authApi.registerOwner({
          gym_name: gymName,
          full_name: fullName,
          email,
          phone: phone.trim(),
          password,
          invitation_token: token
        });
      }
      return authApi.registerExistingGymUser({
        full_name: fullName,
        email,
        phone: phone.trim(),
        password,
        invitation_token: token,
        membership_plan_id: invite.role === "member" ? (selectedPlanId || undefined) : undefined
      });
    },
    onSuccess: setSession,
    onError: (error) => setFormError(getApiErrorMessage(error))
  });

  const updateToken = (value: string) => {
    setToken(value);
    validation.reset();
    registration.reset();
    setFormError(null);
    setSelectedPlanId("");
  };
  const invite = validation.data;

  return {
    kind: "view1" as const,
    props: {
      styles,
      navigation,
      colors,
      token,
      updateToken,
      invite,
      validation,
      roleLabels,
      gymName,
      setGymName,
      fullName,
      setFullName,
      email,
      setEmail,
      phone,
      setPhone,
      selectedPlanId,
      setSelectedPlanId,
      password,
      setPassword,
      passwordVisible,
      setPasswordVisible,
      formError,
      registration,
      originalJoinDate,
      setOriginalJoinDate,
      claimedExpiryDate,
      setClaimedExpiryDate,
      amountPaidDollars,
      setAmountPaidDollars,
      hasReceipt,
      setHasReceipt,
      receiptUrl,
      setReceiptUrl,
      memberNotes,
      setMemberNotes,
      receiptScanNotice,
      setReceiptScanNotice,
      scanReceiptMutation,
    },
  };
}

export function InvitationSignUpScreen(...args: Parameters<typeof useInvitationSignUpScreenPresentation>): React.JSX.Element {
  return <InvitationSignUpScreenView model={useInvitationSignUpScreenPresentation(...args)} />;
}
