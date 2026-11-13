import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AppHeader } from "../../components/AppHeader";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { AppLogo } from "../../../../components/AppLogo";
import { getApiErrorMessage } from "../../../../services/api/client";
import type * as React from "react";
import type { useInvitationSignUpScreenPresentation } from "../../../../screens/auth/InvitationSignUpScreen";

export function InvitationSignUpScreenView({ model }: { model: ReturnType<typeof useInvitationSignUpScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const {
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
      } = model.props;

      return (
        <Screen scroll keyboard>
          <View style={styles.container}>
            <AppHeader title="Create account" subtitle="Invitation-only access" onBack={() => navigation.goBack()} />
            <View style={styles.card}>
              <View style={styles.headingRow}>
                <AppLogo size={48} />
                <View style={styles.headingCopy}>
                  <Text style={styles.title}>Use your invitation</Text>
                  <Text style={styles.subtitle}>Your invitation securely assigns your gym and role. You cannot select them manually.</Text>
                </View>
              </View>
              <FormTextField
                label="Invitation token"
                value={token}
                onChangeText={updateToken}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="key-outline"
                required
              />
              <PrimaryButton
                title={invite ? "Invitation verified" : "Verify invitation"}
                icon={invite ? "checkmark-circle-outline" : "shield-checkmark-outline"}
                variant={invite ? "secondary" : "primary"}
                loading={validation.isPending}
                disabled={token.trim().length < 20 || Boolean(invite)}
                onPress={() => validation.mutate(token)}
              />
              <NoticeBanner message={validation.error ? getApiErrorMessage(validation.error) : null} tone="error" />

              {invite ? (
                <View style={styles.form}>
                  <View style={styles.assignment}>
                    <Text style={styles.assignmentLabel}>ASSIGNED ACCESS</Text>
                    <Text style={styles.assignmentValue}>{roleLabels[invite.role]}{invite.gym_name ? ` · ${invite.gym_name}` : " · New gym"}</Text>
                    <Text style={styles.expiry}>Expires {new Date(invite.expires_at).toLocaleString()}</Text>
                  </View>

                  {invite.role === "member" && invite.plans && invite.plans.length > 0 ? (
                    <View style={{ gap: 8, marginTop: 4, marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.ink }}>
                        SELECT MEMBERSHIP PLAN <Text style={{ color: colors.danger || "#FF3B30" }}>*</Text>
                      </Text>
                      {invite.plans.map((p) => {
                        const isSelected = selectedPlanId === p.id;
                        return (
                          <Pressable
                            key={p.id}
                            accessibilityRole="button"
                            onPress={() => setSelectedPlanId(p.id)}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              borderWidth: isSelected ? 2 : 1,
                              borderColor: isSelected ? colors.primary : colors.border,
                              backgroundColor: isSelected ? colors.card : colors.surface,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer" as any
                            }}
                          >
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <Text style={{ fontSize: 15, fontWeight: "700", color: isSelected ? colors.primary : colors.ink }}>{p.name}</Text>
                              {p.description ? <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{p.description}</Text> : null}
                              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{p.duration_days} days</Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}>
                                {(p.price_cents / 100).toLocaleString(undefined, { style: "currency", currency: p.currency })}
                              </Text>
                              <Ionicons
                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                size={18}
                                color={isSelected ? colors.primary : colors.muted}
                              />
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}

                  {invite.role === "gym_owner" ? (
                    <FormTextField label="Gym name" value={gymName} onChangeText={setGymName} leftIcon="business-outline" required />
                  ) : null}
                  <FormTextField label="Full name" value={fullName} onChangeText={setFullName} leftIcon="person-outline" required />
                  <FormTextField
                    label="Mobile number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                    placeholder="e.g. 9876543210"
                    required
                  />
                  <FormTextField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    editable={!invite.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                    helper={invite.email ? "This invitation is restricted to this email." : undefined}
                    required
                  />
                  <FormTextField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    maxLength={72}
                    leftIcon="lock-closed-outline"
                    required
                    right={
                      <Pressable accessibilityRole="button" onPress={() => setPasswordVisible((value) => !value)}>
                        <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={21} color={colors.muted} />
                      </Pressable>
                    }
                  />

                  {invite.invitation_type === "existing_member" ? (
                    <View style={{ gap: 12, marginVertical: 12, padding: 16, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="sparkles" size={20} color={colors.primary} />
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>
                          Existing Membership Claim
                        </Text>
                      </View>
                      <Text style={{ fontSize: 13, color: colors.muted }}>
                        Tell us about your previous or active membership at this gym. Your gym owner will review and confirm your remaining validity.
                      </Text>

                      {receiptScanNotice ? (
                        <NoticeBanner message={receiptScanNotice} tone="info" />
                      ) : null}

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <FormTextField
                            label="Original Joining Date (YYYY-MM-DD)"
                            value={originalJoinDate}
                            onChangeText={setOriginalJoinDate}
                            placeholder="YYYY-MM-DD"
                            leftIcon="calendar-outline"
                            required
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <FormTextField
                            label="Current Expiry Date (YYYY-MM-DD)"
                            value={claimedExpiryDate}
                            onChangeText={setClaimedExpiryDate}
                            placeholder="YYYY-MM-DD"
                            leftIcon="calendar-outline"
                            required
                          />
                        </View>
                      </View>

                      <FormTextField
                        label="Amount Already Paid ($ if known)"
                        value={amountPaidDollars}
                        onChangeText={setAmountPaidDollars}
                        keyboardType="numeric"
                        placeholder="0.00"
                        leftIcon="cash-outline"
                      />

                      <View style={{ gap: 8, marginTop: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink }}>Payment Receipt or Proof</Text>
                        <View style={{ flexDirection: "row", gap: 12 }}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              setHasReceipt(true);
                              setReceiptUrl("https://example.com/receipt-placeholder.png");
                            }}
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: hasReceipt ? colors.primary : colors.border,
                              backgroundColor: hasReceipt ? colors.primarySoft : colors.surface,
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "row",
                              gap: 8,
                            }}
                          >
                            <Ionicons name="receipt-outline" size={18} color={hasReceipt ? colors.primary : colors.muted} />
                            <Text style={{ fontSize: 13, fontWeight: hasReceipt ? "700" : "500", color: hasReceipt ? colors.primary : colors.ink }}>
                              {hasReceipt ? "Receipt Attached" : "Attach Receipt"}
                            </Text>
                          </Pressable>

                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              setHasReceipt(false);
                              setReceiptUrl(null);
                            }}
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: !hasReceipt ? colors.warning : colors.border,
                              backgroundColor: !hasReceipt ? colors.card : colors.surface,
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "row",
                              gap: 8,
                            }}
                          >
                            <Ionicons name="help-circle-outline" size={18} color={!hasReceipt ? colors.warning : colors.muted} />
                            <Text style={{ fontSize: 13, fontWeight: !hasReceipt ? "700" : "500", color: !hasReceipt ? colors.ink : colors.muted }}>
                              I don't have a receipt
                            </Text>
                          </Pressable>
                        </View>
                        {!hasReceipt ? (
                          <Text style={{ fontSize: 12, color: colors.muted, fontStyle: "italic", marginTop: 2 }}>
                            No receipt needed — your gym owner will verify against the gym's offline register.
                          </Text>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              scanReceiptMutation.mutate("Receipt for Annual Plan on 2026-01-15 valid to 2027-01-15 $120.00");
                            }}
                            style={{ alignSelf: "flex-start", marginTop: 4 }}
                          >
                            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>
                              Prefill details from receipt
                            </Text>
                          </Pressable>
                        )}
                      </View>

                      <FormTextField
                        label="Additional Notes for Owner (optional)"
                        value={memberNotes}
                        onChangeText={setMemberNotes}
                        placeholder="e.g. Paid in cash to front desk on renewal"
                        leftIcon="chatbubble-outline"
                      />
                    </View>
                  ) : null}

                  <NoticeBanner message={formError} tone="error" />
                  <PrimaryButton
                    title={invite.invitation_type === "existing_member" ? "Submit Claim for Verification" : "Create account"}
                    icon={invite.invitation_type === "existing_member" ? "shield-checkmark-outline" : "person-add-outline"}
                    loading={registration.isPending}
                    onPress={() => registration.mutate()}
                  />
                </View>
              ) : null}
            </View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")}><Text style={styles.signIn}>Already registered? Sign in</Text></Pressable>
          </View>
        </Screen>
      );
    }
  }
}
