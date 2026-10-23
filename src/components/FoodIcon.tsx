import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { foodVisual } from "../utils/foodVisual";

export function FoodIcon({ name, category, subcategory, size = 56 }: { name: string; category?: string; subcategory?: string; size?: number }) {
  const visual = foodVisual(name, category, subcategory);
  return <View accessible={false} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    {visual.kind === "emoji" ? <Text accessible={false} style={{ fontSize: size * 0.65, lineHeight: size }}>{visual.emoji}</Text> : <SvgXml xml={visual.svg} width={size} height={size} />}
  </View>;
}
