import { Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { DatePickerField } from "../../../../components/DatePickerField";
import { FormTextField } from "../../components/FormTextField";
import { NoticeBanner } from "../../components/NoticeBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { RelationshipSelectField } from "../../components/RelationshipSelectField";
import { Screen } from "../../components/Screen";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getApiErrorMessage } from "../../../../services/api/client";
import { AccessDeniedScreen } from "../../../../screens/saas/AccessDeniedScreen";
import type * as React from "react";
import type { useMemberFormScreenPresentation, useFieldPresentation } from "../../../../screens/saas/MemberFormScreen";

export function MemberFormScreenView({ model }: { model: ReturnType<typeof useMemberFormScreenPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      return <AccessDeniedScreen />;
    }
    case "viewNoMember": {
      const { styles, navigation, onGoToMembers } = model.props;
      return (
        <Screen scroll keyboard contentContainerStyle={styles.screen}>
          <ScreenHeader title="Edit Member" subtitle="Member not specified" onBack={() => navigation.goBack()} />
          <View style={[styles.form, { alignItems: "center", paddingVertical: 32, gap: 16 }]}>
            <Ionicons name="alert-circle-outline" size={40} color="#E91E63" />
            <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center" }}>
              Please select a member from the directory to edit.
            </Text>
            <PrimaryButton title="Go to Members" onPress={onGoToMembers} />
          </View>
        </Screen>
      );
    }
    case "view2": {
      const {
        styles,
        navigation,
        memberQuery,
        Field,
        control,
        errors,
        plansQuery,
        planOptions,
        trainersQuery,
        trainerOptions,
        handlePlanChange,
        handleStartDateChange,
        handleEndDateChange,
        updateMember,
        submit
      } = model.props;

      const member = memberQuery.data;

      return (
        <Screen scroll keyboard contentContainerStyle={styles.screen}>
          <ScreenHeader
            title="Edit Member"
            subtitle={member ? `Editing ${member.first_name} ${member.last_name} (${member.member_code})` : "Update this member’s details"}
            onBack={() => navigation.goBack()}
          />

          <DataState
            loading={memberQuery.isLoading}
            error={memberQuery.error ? getApiErrorMessage(memberQuery.error) : null}
          />

          <View style={styles.form}>
            <Text style={styles.groupTitle}>Personal Details</Text>
            <Field
              control={control}
              error={errors.first_name?.message}
              label="First name"
              name="first_name"
              required
            />
            <Field
              control={control}
              error={errors.last_name?.message}
              label="Last name"
              name="last_name"
              required
            />
            <Field
              autoCapitalize="none"
              control={control}
              error={errors.email?.message}
              keyboardType="email-address"
              label="Email"
              leftIcon="mail-outline"
              name="email"
            />
            <Field
              control={control}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              label="Phone"
              leftIcon="call-outline"
              name="phone"
            />

            <Text style={styles.groupTitle}>Membership & Assignment</Text>
            <Field
              control={control}
              error={errors.status?.message}
              label="Status"
              leftIcon="pulse-outline"
              name="status"
            />

            <Controller
              control={control}
              name="membership_plan_id"
              render={({ field: { value } }) => (
                <RelationshipSelectField
                  error={
                    errors.membership_plan_id?.message ??
                    (plansQuery.error ? getApiErrorMessage(plansQuery.error) : null)
                  }
                  helperText="Select plan to automatically calculate expiration date."
                  icon="pricetag-outline"
                  label="Membership plan"
                  loading={plansQuery.isLoading || plansQuery.isFetching}
                  onChange={(nextValue) => handlePlanChange(nextValue ?? "")}
                  options={planOptions}
                  placeholder="Choose a membership plan"
                  value={String(value ?? "") || null}
                />
              )}
            />

            <Controller
              control={control}
              name="trainer_id"
              render={({ field: { onChange, value } }) => (
                <RelationshipSelectField
                  error={
                    errors.trainer_id?.message ??
                    (trainersQuery.error ? getApiErrorMessage(trainersQuery.error) : null)
                  }
                  helperText="Assign a coach to this member."
                  icon="barbell-outline"
                  label="Trainer"
                  loading={trainersQuery.isLoading || trainersQuery.isFetching}
                  onChange={(nextValue) => onChange(nextValue ?? "")}
                  options={trainerOptions}
                  placeholder="Choose a trainer"
                  value={String(value ?? "") || null}
                />
              )}
            />

            <Controller
              control={control}
              name="membership_starts_at"
              render={({ field: { value } }) => (
                <DatePickerField
                  label="Start date"
                  value={String(value ?? "")}
                  onChange={handleStartDateChange}
                  error={errors.membership_starts_at?.message}
                  helper="Membership start date (tap to open calendar)"
                />
              )}
            />

            <Controller
              control={control}
              name="membership_ends_at"
              render={({ field: { value } }) => (
                <DatePickerField
                  label="End date"
                  value={String(value ?? "")}
                  onChange={handleEndDateChange}
                  error={errors.membership_ends_at?.message}
                  helper="Membership expiry date (auto-calculated from plan, tap to modify)"
                />
              )}
            />

            <NoticeBanner
              message={updateMember.error ? getApiErrorMessage(updateMember.error) : null}
              tone="error"
            />

            <PrimaryButton
              icon="save-outline"
              loading={updateMember.isPending}
              onPress={submit}
              title="Save Changes"
            />
          </View>
        </Screen>
      );
    }
  }
}

export function FieldView({ model }: { model: ReturnType<typeof useFieldPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { control, name, autoCapitalize, error, keyboardType, label, leftIcon, placeholder, required } = model.props;
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: { onBlur, onChange, value } }) => (
            <FormTextField
              autoCapitalize={autoCapitalize}
              error={error}
              keyboardType={keyboardType}
              label={label}
              leftIcon={leftIcon}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={placeholder ?? label}
              required={required}
              value={String(value ?? "")}
            />
          )}
        />
      );
    }
  }
}
