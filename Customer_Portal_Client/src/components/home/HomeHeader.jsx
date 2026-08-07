import { Pressable, View } from "react-native";
import { ChevronDown, MapPin, User } from "lucide-react-native";

import Text from "@/components/ui/Text";

// Figma "Header - Top App Bar" (250:597). components/customer/AppBar is a
// single-title bar with a back chevron, so home gets its own address + profile
// header instead.
export default function HomeHeader({ address, onPressAddress, onPressProfile }) {
  return (
    <View className="h-[72px] w-full flex-row items-center justify-between px-6">
      <Pressable
        onPress={onPressAddress}
        hitSlop={8}
        className="flex-row items-center gap-2 rounded-full py-1"
        accessibilityRole="button"
        accessibilityLabel="Change delivery address"
      >
        <MapPin size={20} color="#FF5E00" />

        <View>
          <Text className="font-jakarta-semibold text-[18px] leading-[25px] text-muted-foreground">
            Delivering to
          </Text>

          <View className="flex-row items-center gap-1">
            <Text
              numberOfLines={1}
              className="max-w-[170px] font-jakarta-semibold text-[14px] leading-[18px] text-foreground"
            >
              {address}
            </Text>
            <ChevronDown size={12} color="#1A1A1A" />
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onPressProfile}
        hitSlop={8}
        className="size-11 items-center justify-center rounded-full bg-primary-tint"
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <User size={16} color="#F0592A" />
      </Pressable>
    </View>
  );
}
