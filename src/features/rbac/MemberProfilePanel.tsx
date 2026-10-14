import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useMyMemberProfile } from "../../hooks/useRbac";
import { getApiErrorMessage } from "../../services/api/client";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { Member } from "../../types/saas";

export function MemberProfilePanel({ enabled }: { enabled: boolean }) {
  const profileQuery = useMyMemberProfile(enabled);

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.kicker}>Member Profile</Text>
          <Text style={styles.sectionTitle}>Gym Details</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="id-card-outline" size={22} color={colors.primary} />
        </View>
      </View>

      {profileQuery.isLoading ? <Text style={styles.message}>Loading member profile...</Text> : null}
      {profileQuery.error ? <Text style={styles.error}>{getApiErrorMessage(profileQuery.error)}</Text> : null}
      {profileQuery.data ? <MemberProfileDetails member={profileQuery.data} /> : null}
    </View>
  );
}

function MemberProfileDetails({ member }: { member: Member }) {
  return (
    <View style={styles.details}>
      <Detail label="Member code" value={member.member_code} />
      <Detail label="Status" value={member.status} />
      <Detail label="Email" value={member.email ?? "Not set"} />
      <Detail label="Phone" value={member.phone ?? "Not set"} />
      <Detail label="Membership starts" value={member.membership_starts_at ?? "Not set"} />
      <Detail label="Membership ends" value={member.membership_ends_at ?? "Not set"} />
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.darkCard
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  kicker: {
    ...typography.small,
    color: colors.muted,
    marginBottom: spacing.xs
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.ink
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  details: {
    gap: spacing.sm
  },
  detailRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface
  },
  detailLabel: {
    ...typography.small,
    color: colors.muted
  },
  detailValue: {
    ...typography.body,
    color: colors.ink,
    flexShrink: 1,
    textAlign: "right"
  },
  message: {
    ...typography.body,
    color: colors.muted
  },
  error: {
    ...typography.small,
    color: colors.danger
  }
});
