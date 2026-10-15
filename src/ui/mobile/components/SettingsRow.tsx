import { Pressable } from "./NativePressable";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useAppTheme } from "../../../theme/AppThemeProvider";
import { pulseStyles } from "./PulseReference";

type Props = { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void; detail?: string };
export function SettingsRow({ icon, title, onPress, detail }: Props) {
  const { colors } = useAppTheme();
  const s = pulseStyles(colors);
  return <Pressable accessibilityRole="button" accessibilityLabel={detail ? `${title}, ${detail}` : title} onPress={onPress} style={({ pressed }) => [s.setting, pressed && { opacity: 0.65 }]}>
    <Ionicons name={icon} size={20} color={colors.muted} />
    <Text style={[s.name, { flex: 1, fontWeight: "400" }]}>{title}</Text>
    {detail && <Text style={s.meta}>{detail}</Text>}
    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
  </Pressable>;
}
