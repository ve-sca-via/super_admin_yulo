import { Pressable, View } from "react-native";
import { MapPin } from "lucide-react-native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";

// Figma "Delivery address". The chosen address is ringed in the accent rather
// than ticked — the card itself is the radio, so there's no second control to
// disagree with which one is highlighted.
export default function AddressCard({ address, selected, accent, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={selected ? { borderColor: accent.icon } : undefined}
      className={cn(
        "w-full flex-row items-center gap-4 rounded-[20px] bg-card p-5",
        selected ? "border-2" : "shadow-md shadow-black/10",
      )}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${address.label}, ${address.line}`}
    >
      <MapPin size={24} color={accent.icon} strokeWidth={2.2} />

      <View className="flex-1">
        <Text className="font-jakarta-bold text-[19px] leading-[26px] text-foreground">
          {address.label}
        </Text>

        <Text className="mt-1 font-jakarta text-[16px] leading-[23px] text-muted-foreground">
          {address.line}
        </Text>
      </View>
    </Pressable>
  );
}
