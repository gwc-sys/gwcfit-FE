import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Pressable } from "../NativePressable";
import { useMemberReferenceColors } from "./MemberReference";

import { memberServices, type MemberServiceRoute } from "../../../../data/memberServices";
export { memberServices, type MemberServiceRoute } from "../../../../data/memberServices";

export function MemberServicesMenu({ onNavigate, collapsible = false }: { onNavigate: (route: MemberServiceRoute) => void; collapsible?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const c = useMemberReferenceColors();
  return <View style={{ gap: 12 }}>
    {collapsible ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 }}><Ionicons name="grid-outline" size={22} color={c.blue} /><Text style={{ color: c.text, fontSize: 18, fontWeight: "600", flex: 1 }}>Your gym & account</Text><Text style={{ color: c.blue, fontSize: 13 }}>{expanded ? "Close" : "All services"}</Text><Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={c.blue} /></Pressable> : <Text accessibilityRole="header" style={{ color: c.text, fontSize: 20, fontWeight: "600" }}>Services</Text>}
    {!collapsible || expanded ? [
      { title: "Your gym", items: memberServices.slice(0, 1) },
      { title: "Training & activity", items: memberServices.slice(1, 6) },
      { title: "Account & help", items: memberServices.slice(6) },
    ].map(group => <View key={group.title} style={{ gap: 8, marginBottom: 8 }}>
      <Text accessibilityRole="header" style={{ color: c.muted, fontSize: 12, fontWeight: "600", paddingHorizontal: 4 }}>{group.title}</Text>
      <View style={{ backgroundColor: c.card, borderRadius: 16, overflow: "hidden", paddingHorizontal: 14 }}>
        {group.items.map((item, index) => <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.description}`} onPress={() => onNavigate(item.route)}
          style={({ pressed }) => [{ minHeight: 52, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: index ? 0.5 : 0, borderTopColor: c.border }, pressed && { opacity: 0.65 }]}>
          <Ionicons name={item.icon} size={20} color={c.blue} />
          <Text style={{ flex: 1, minWidth: 0, color: c.text, fontSize: 15, lineHeight: 21 }}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </Pressable>)}
      </View>
    </View>) : null}
  </View>;
}
