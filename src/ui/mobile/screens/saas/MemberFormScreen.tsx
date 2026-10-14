import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { DataState } from "../../components/DataState";
import { FormTextField } from "../../components/FormTextField";
import { GymSelectField } from "../../components/GymSelectField";
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
      
      return (<AccessDeniedScreen />);
    }
    case "view2": {
      const { styles, title, isEditing, navigation, memberQuery, gymLoadError, gymQuery, setSelectedGymName, gymOptions, selectedGymName, Field, control, errors, plansQuery, planOptions, trainersQuery, trainerOptions, createMember, updateMember, submit } = model.props;
      return ((
    <Screen scroll keyboard contentContainerStyle={styles.screen}>
      <ScreenHeader
        title={title}
        subtitle={
          isEditing
            ? "Update tenant member details"
            : "Create a tenant member record"
        }
        onBack={() => navigation.goBack()}
      />

      <DataState
        loading={memberQuery.isLoading}
        error={memberQuery.error ? getApiErrorMessage(memberQuery.error) : null}
      />

      <View style={styles.form}>
        <Text style={styles.groupTitle}>Identity</Text>
        <GymSelectField
          error={gymLoadError}
          helperText={
            gymLoadError
              ? null
              : gymQuery.data
                ? `Members will be created under ${gymQuery.data.name}.`
                : "Loading your gym..."
          }
          label="Gym"
          loading={gymQuery.isLoading || gymQuery.isFetching}
          onSelect={setSelectedGymName}
          options={gymOptions}
          value={selectedGymName}
        />
        {!isEditing ? (
          <Field
            control={control}
            error={errors.member_code?.message}
            label="Member code"
            name="member_code"
            required
          />
        ) : null}
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

        <Text style={styles.groupTitle}>Membership</Text>
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
          render={({ field: { onChange, value } }) => (
            <RelationshipSelectField
              error={
                errors.membership_plan_id?.message ??
                (plansQuery.error ? getApiErrorMessage(plansQuery.error) : null)
              }
              helperText="Shown to the member as their current package."
              icon="pricetag-outline"
              label="Membership plan"
              loading={plansQuery.isLoading || plansQuery.isFetching}
              onChange={(nextValue) => onChange(nextValue ?? "")}
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
                (trainersQuery.error
                  ? getApiErrorMessage(trainersQuery.error)
                  : null)
              }
              helperText="Assign a coach by name."
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
        <Field
          control={control}
          error={errors.membership_starts_at?.message}
          label="Start date"
          name="membership_starts_at"
          placeholder="YYYY-MM-DD"
        />
        <Field
          control={control}
          error={errors.membership_ends_at?.message}
          label="End date"
          name="membership_ends_at"
          placeholder="YYYY-MM-DD"
        />

        <NoticeBanner
          message={
            createMember.error ? getApiErrorMessage(createMember.error) : null
          }
          tone="error"
        />
        <NoticeBanner
          message={
            updateMember.error ? getApiErrorMessage(updateMember.error) : null
          }
          tone="error"
        />

        <PrimaryButton
          icon={isEditing ? "save-outline" : "person-add-outline"}
          loading={createMember.isPending || updateMember.isPending}
          onPress={submit}
          title={isEditing ? "Save Changes" : "Create Member"}
        />
      </View>
    </Screen>
  ));
    }
  }
}

export function FieldView({ model }: { model: ReturnType<typeof useFieldPresentation> }): React.ReactNode {
  if (model == null) return null;
  if (typeof model !== "object" || !("kind" in model)) return model;
  switch (model.kind) {
    case "view1": {
      const { control, name, autoCapitalize, error, keyboardType, label, leftIcon, placeholder, required } = model.props;
      return ((
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
  ));
    }
  }
}
