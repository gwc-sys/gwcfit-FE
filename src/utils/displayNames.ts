import type { Gym, ManagedUser, Member, MembershipPlan, Trainer } from "../types/saas";

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function memberDisplayName(member: Pick<Member, "member_name" | "first_name" | "last_name" | "member_code">) {
  return (
    clean(member.member_name) ??
    clean(`${member.first_name ?? ""} ${member.last_name ?? ""}`) ??
    clean(member.member_code) ??
    "Member"
  );
}

export function trainerDisplayName(trainer: Pick<Trainer, "trainer_name" | "full_name" | "email">) {
  return clean(trainer.trainer_name) ?? clean(trainer.full_name) ?? clean(trainer.email) ?? "Trainer";
}

export function planDisplayName(plan: Pick<MembershipPlan, "name">) {
  return clean(plan.name) ?? "Membership plan";
}

export function userDisplayName(user: Pick<ManagedUser, "name" | "full_name" | "email">) {
  return clean(user.name) ?? clean(user.full_name) ?? clean(user.email) ?? "User";
}

export function gymDisplayName(record: Pick<Gym, "name"> | { gym_name?: string | null }) {
  return clean("name" in record ? record.name : record.gym_name) ?? "Gym";
}

export function relatedDisplayName(value: string | null | undefined, fallback: string) {
  return clean(value) ?? fallback;
}
