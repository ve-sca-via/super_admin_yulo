import { Image, Pressable, View } from "react-native";
import { Clock, Heart, Leaf } from "lucide-react-native";

import Card from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import RatingPill from "./RatingPill";

// Figma "Restaurant Vertical Card" (250:520 / 250:551). The favourite button is
// a real toggle here — the design shows one card in each state.
const PHOTO_HEIGHT = 180;

export default function RestaurantCardLarge({
  restaurant,
  favourite = false,
  ratingTone,
  onToggleFavourite,
  onPress,
}) {
  const { name, image, rating, cuisines, eta, distance, priceHint, pureVeg } = restaurant;

  return (
    <Card className="w-full overflow-hidden p-0">
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={name}>
        <View style={{ height: PHOTO_HEIGHT }} className="w-full">
          <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />

          <Pressable
            onPress={onToggleFavourite}
            hitSlop={8}
            className="absolute right-4 top-4 size-10 items-center justify-center rounded-full bg-black/20"
            accessibilityRole="button"
            accessibilityLabel={favourite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
            accessibilityState={{ selected: favourite }}
          >
            <Heart size={24} color={favourite ? "#E53935" : "#FFFFFF"} fill={favourite ? "#E53935" : "transparent"} />
          </Pressable>
        </View>

        <View className="w-full gap-1 p-4">
          <View className="h-7 w-full flex-row items-start justify-between">
            <Text
              numberOfLines={1}
              className="flex-1 font-jakarta-semibold text-[20px] leading-[28px] text-foreground"
            >
              {name}
            </Text>
            <RatingPill rating={rating} tone={ratingTone} />
          </View>

          <Text className="font-jakarta text-[14px] leading-[22px] text-muted-foreground">
            {cuisines.join(" • ")}
          </Text>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#666666" />
              <Text className="font-jakarta-medium text-[12px] leading-[16px] text-muted-foreground">{eta}</Text>
              <View className="mx-1 size-1 rounded-full bg-border" />
              <Text className="font-jakarta-medium text-[12px] leading-[16px] text-muted-foreground">{distance}</Text>
            </View>

            <Text className="font-jakarta-medium text-[12px] leading-[18px] text-primary">{priceHint}</Text>
          </View>

          {pureVeg ? (
            <View className="pt-3">
              <View className="flex-row items-center gap-1 self-start rounded-lg bg-[#EAF6EA] px-2 py-1">
                <Leaf size={9} color="#2E7D32" />
                <Text className="font-jakarta text-[10px] leading-[15px] text-[#2E7D32]">
                  Pure veg restaurant
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Card>
  );
}
