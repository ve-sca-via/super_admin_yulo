import { Pressable, View } from "react-native";
import { Bike, Clock, ScanLine } from "lucide-react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

// Figma "bottom-nav" (300:350) — a floating pill with two tabs, not a docked
// tab bar, so it stays a plain control rather than a react-navigation tab bar.
const TABS = [
  { key: "delivery", label: "Delivery", Icon: Bike },
  // Figma draws this tab with "icon/clock", not a rewind glyph.
  { key: "history", label: "History", Icon: Clock },
];

export default function HomeBottomNav({ value = "delivery", onChange, onScan }) {
  return (
    <View className="h-[60px] w-full flex-row items-center justify-between rounded-full bg-card p-1.5 shadow-md shadow-black/10">
      {/* Delivery Tab */}
      <Pressable
        onPress={() => onChange?.(TABS[0].key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: TABS[0].key === value }}
        className={cn(
          "h-full flex-1 flex-row items-center justify-center gap-[7px] rounded-full",
          TABS[0].key === value && "bg-primary-tint",
        )}
      >
        <TABS[0].Icon size={22} color={TABS[0].key === value ? "#FF5E00" : "#666666"} />
        <Text
          className={cn(
            "font-jakarta-semibold text-[14px] leading-[18px]",
            TABS[0].key === value ? "text-primary" : "text-muted-foreground",
          )}
        >
          {TABS[0].label}
        </Text>
      </Pressable>

      {/* QR Scanner Center Button */}
      <Pressable
        onPress={onScan}
        accessibilityRole="button"
        accessibilityLabel="Scan QR Code"
        className="mx-2 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/40 active:opacity-80"
      >
        <ScanLine size={24} color="#FFFFFF" />
      </Pressable>

      {/* History Tab */}
      <Pressable
        onPress={() => onChange?.(TABS[1].key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: TABS[1].key === value }}
        className={cn(
          "h-full flex-1 flex-row items-center justify-center gap-[7px] rounded-full",
          TABS[1].key === value && "bg-primary-tint",
        )}
      >
        <TABS[1].Icon size={22} color={TABS[1].key === value ? "#FF5E00" : "#666666"} />
        <Text
          className={cn(
            "font-jakarta-semibold text-[14px] leading-[18px]",
            TABS[1].key === value ? "text-primary" : "text-muted-foreground",
          )}
        >
          {TABS[1].label}
        </Text>
      </Pressable>
    </View>
  );
}
