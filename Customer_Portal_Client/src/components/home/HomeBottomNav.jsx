import { Pressable, View } from "react-native";
import { Bike, Clock } from "lucide-react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

// Figma "bottom-nav" (300:350) — a floating pill with two tabs, not a docked
// tab bar, so it stays a plain control rather than a react-navigation tab bar.
const TABS = [
  { key: "delivery", label: "Delivery", Icon: Bike },
  // Figma draws this tab with "icon/clock", not a rewind glyph.
  { key: "history", label: "History", Icon: Clock },
];

export default function HomeBottomNav({ value = "delivery", onChange }) {
  return (
    <View className="h-[60px] w-full flex-row items-center rounded-full bg-card p-1.5 shadow-md shadow-black/10">
      {TABS.map(({ key, label, Icon }) => {
        const active = key === value;

        return (
          <Pressable
            key={key}
            onPress={() => onChange?.(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={cn(
              "h-full flex-1 flex-row items-center justify-center gap-[7px] rounded-full",
              active && "bg-primary-tint",
            )}
          >
            <Icon size={22} color={active ? "#FF5E00" : "#666666"} />
            <Text
              className={cn(
                "font-jakarta-semibold text-[14px] leading-[18px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
