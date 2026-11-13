import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { memberServices, type MemberServiceRoute } from "../../../../data/memberServices";
import { useAppTheme } from "../../../../theme/AppThemeProvider";

export function MemberServicesMenu({ onNavigate }: { onNavigate: (route: MemberServiceRoute) => void }) {
  const { colors } = useAppTheme();
  const groups = [
    { title: "Your gym", items: memberServices.slice(0, 1) },
    { title: "Training & activity", items: memberServices.slice(1, 6) },
    { title: "Account & help", items: memberServices.slice(6) },
  ];
  return <View style={{ gap: 16 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Ionicons name="grid-outline" size={22} color={colors.primary} />
      <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>Your gym & account</Text>
    </View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      {groups.map(group => <View key={group.title} style={{ flexGrow: 1, flexBasis: 220, minWidth: 0, gap: 8 }}>
        <Text accessibilityRole="header" style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>{group.title}</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden", paddingHorizontal: 14 }}>
          {group.items.map((item, index) => <Pressable
            key={item.route}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.description}`}
            onPress={() => onNavigate(item.route)}
            style={({ pressed }) => ({ minHeight: 64, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: index ? 0.5 : 0, borderTopColor: colors.border, opacity: pressed ? 0.65 : 1 })}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary} />
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <Text style={{ color: colors.ink, fontSize: 15, lineHeight: 21, fontWeight: "600" }}>{item.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>)}
        </View>
      </View>)}
    </View>
  </View>;
}
