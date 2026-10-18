import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Pressable } from "../NativePressable";
import { useMemberReferenceColors } from "./MemberReference";

export const memberServices = [
  { title: "Membership", description: "Plan, status and renewal dates", icon: "ribbon-outline", route: "MemberMembership" },
  { title: "Payments", description: "Recorded payments and balances", icon: "card-outline", route: "MemberPayments" },
  { title: "Meal plan", description: "Meals, nutrition and water tracking", icon: "restaurant-outline", route: "MemberMealPlan" },
  { title: "My trainer", description: "Trainer details and assigned plans", icon: "person-outline", route: "MemberTrainer" },
  { title: "Classes", description: "Book or cancel gym classes", icon: "calendar-outline", route: "MemberClasses" },
  { title: "Goals", description: "Create and track your goals", icon: "flag-outline", route: "MemberGoals" },
  { title: "Rewards", description: "Your challenges and badges", icon: "trophy-outline", route: "MemberRewards" },
  { title: "Notifications", description: "Gym updates and unread messages", icon: "notifications-outline", route: "MemberNotifications" },
  { title: "Support", description: "Send a request to your gym", icon: "chatbubbles-outline", route: "MemberSupport" },
  { title: "Settings", description: "Appearance, password and sign out", icon: "settings-outline", route: "MemberSettings" },
] as const;

export type MemberServiceRoute = typeof memberServices[number]["route"];

export function MemberServicesMenu({ onNavigate, collapsible = false }: { onNavigate: (route: MemberServiceRoute) => void; collapsible?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const c = useMemberReferenceColors();
  return <View style={{ gap: 12 }}>
    {collapsible ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 }}><Ionicons name="grid-outline" size={22} color={c.blue} /><Text style={{ color: c.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Your gym & account</Text><Text style={{ color: c.blue, fontSize: 13 }}>{expanded ? "Close" : "All services"}</Text><Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={c.blue} /></Pressable> : <Text accessibilityRole="header" style={{ color: c.text, fontSize: 20, fontWeight: "600" }}>Your gym & account</Text>}
    {!collapsible || expanded ? <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 18, overflow: "hidden" }}>
      {memberServices.map((item, index) => <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.description}`} onPress={() => onNavigate(item.route)}
        style={({ pressed }) => [{ minHeight: 68, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: index ? 0.5 : 0, borderTopColor: c.border }, pressed && { opacity: 0.65 }]}>
        <Ionicons name={item.icon} size={22} color={c.blue} /><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ color: c.text, fontSize: 16, fontWeight: "500" }}>{item.title}</Text><Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>{item.description}</Text></View><Ionicons name="chevron-forward" size={18} color={c.muted} />
      </Pressable>)}
    </View> : null}
  </View>;
}
