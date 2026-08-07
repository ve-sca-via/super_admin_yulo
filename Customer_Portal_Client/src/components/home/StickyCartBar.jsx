import { Image, Pressable, View } from "react-native";
import { ChevronRight, X } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { accentFor } from "@/lib/accent";
import { cn } from "@/lib/utils";

// Figma "Floating Sticky Cart Preview Card" (250:577). Veg mode repaints the
// button and the "View menu" link green along with the rest of the feed.
export default function StickyCartBar({
  restaurantName,
  restaurantImage,
  itemCount,
  vegOnly = false,
  onViewMenu,
  onViewCart,
  onDismiss,
}) {
  const accent = accentFor(vegOnly);

  return (
    <View className="w-full flex-row items-center rounded-full border border-border bg-card px-[13.5px] py-[10.5px] shadow-md shadow-black/10">
      <Pressable
        onPress={onViewMenu}
        className="flex-1 flex-row items-center gap-3"
        accessibilityRole="button"
        accessibilityLabel={`View menu for ${restaurantName}`}
      >
        <Image
          source={restaurantImage}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          resizeMode="cover"
        />

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-jakarta-bold text-[14px] leading-[21px] text-foreground"
          >
            {restaurantName}
          </Text>

          <View className="flex-row items-center gap-0.5">
            <Text
              style={{ color: accent.strong }}
              className="font-jakarta-medium text-[12px] leading-[18px]"
            >
              View menu
            </Text>
            <ChevronRight size={10} color={accent.strong} />
          </View>
        </View>
      </Pressable>

      <Button
        onPress={onViewCart}
        className={cn("ml-2 h-12 flex-col gap-0 px-6", vegOnly && "bg-[#43A047] shadow-[#43A047]/40")}
        accessibilityLabel={`View cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      >
        <View className="items-center">
          <Text className="text-center font-jakarta-bold text-[12px] leading-[20px] text-primary-foreground">
            View cart
          </Text>
          <Text className="text-center font-jakarta-medium text-[8px] leading-[15px] text-primary-foreground opacity-90">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
      </Button>

      <Pressable
        onPress={onDismiss}
        hitSlop={8}
        className="size-10 items-center justify-center rounded-full"
        accessibilityRole="button"
        accessibilityLabel="Dismiss cart preview"
      >
        <X size={15} color="#1A1A1A" />
      </Pressable>
    </View>
  );
}
