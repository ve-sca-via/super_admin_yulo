import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { mockPartner } from "@/mocks/fixtures";

const IS_VEG_FLEET = mockPartner.fleetType === "veg";

const FEATURES = IS_VEG_FLEET
  ? [
      { icon: "📦", label: "Dedicated bag — never used for non-veg orders" },
      { icon: "✅", label: "Veg handling certification complete" },
      { icon: "🚫", label: "Non-veg order offers will never appear" },
      { icon: "💰", label: "Idle-time pay while you wait online" },
      { icon: "🔁", label: "Request a fleet change via your profile" },
    ]
  : [
      { icon: "📦", label: "All order types — veg, non-veg, and packaged goods" },
      { icon: "🚴", label: "Widest pool of nearby orders to pick from" },
      { icon: "💰", label: "Standard per-delivery payout rate" },
      { icon: "🔁", label: "Request a fleet change via your profile" },
    ];

// Presented as a transparentModal (see RootNavigator.jsx) so it overlays
// Home with a dark scrim instead of pushing a full new screen, matching the
// Figma "Bottom Sheet" component.
export default function FleetBadgeInfo() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-end bg-black/40">
      <Pressable className="flex-1" onPress={() => navigation.goBack()} />

      <View className="w-full gap-6 rounded-t-[20px] bg-card px-6 pb-12 pt-2.5 shadow-md shadow-black/20">
        <View className="w-full items-center">
          <View className="h-1 w-12 rounded-full bg-border-strong" />
        </View>

        <View className="gap-1">
          <Text className="font-jakarta-bold text-xl text-foreground">
            You&rsquo;re on the {IS_VEG_FLEET ? "Veg-Only" : "Standard"} Fleet
          </Text>
          <Text className="text-sm text-muted-foreground">What this means for your orders</Text>
        </View>

        <View className="gap-4">
          {FEATURES.map((f) => (
            <View key={f.label} className="w-full flex-row items-center gap-3">
              <View className="size-10 items-center justify-center rounded-xl bg-primary-tint">
                <Text className="text-lg">{f.icon}</Text>
              </View>
              <Text className="flex-1 text-sm text-foreground">{f.label}</Text>
            </View>
          ))}
        </View>

        <Button onPress={() => navigation.goBack()}>Got it</Button>
      </View>
    </View>
  );
}
