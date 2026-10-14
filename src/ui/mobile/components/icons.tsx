import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

type IconProps = Omit<ComponentProps<typeof Ionicons>, "name"> & {
  strokeWidth?: number;
  fill?: string;
};

function makeIcon(name: IconName) {
  return function AppIcon({ size = 24, color = "#111827", style }: IconProps) {
    return <Ionicons name={name} size={size} color={color} style={style} />;
  };
}

export const ArrowLeft = makeIcon("arrow-back");

export const Beef = makeIcon("nutrition-outline");

export const Bell = makeIcon("notifications-outline");

export const Bot = makeIcon("hardware-chip-outline");

export const CalendarDays = makeIcon("calendar-outline");

export const Check = makeIcon("checkmark");

export const ChevronRight = makeIcon("chevron-forward");

export const Clock = makeIcon("time-outline");

export const Droplets = makeIcon("water-outline");

export const Dumbbell = makeIcon("barbell-outline");

export const Eye = makeIcon("eye-outline");

export const Flame = makeIcon("flame-outline");

export const Footprints = makeIcon("footsteps-outline");

export const Leaf = makeIcon("leaf-outline");

export const Lock = makeIcon("lock-closed-outline");

export const Mail = makeIcon("mail-outline");

export const MoreVertical = makeIcon("ellipsis-vertical");

export const Pause = makeIcon("pause");

export const Phone = makeIcon("call-outline");

export const Play = makeIcon("play");

export const RotateCcw = makeIcon("refresh");

export const Sparkles = makeIcon("sparkles-outline");

export const Target = makeIcon("locate-outline");

export const User = makeIcon("person-outline");

export const Wheat = makeIcon("restaurant-outline");
