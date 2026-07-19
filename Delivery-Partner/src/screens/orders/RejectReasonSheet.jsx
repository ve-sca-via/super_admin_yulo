import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { SKIP_REASONS } from "@/mocks/fixtures";

// Presented as a transparentModal (see RootNavigator.jsx), matching
// FleetBadgeInfo's overlay pattern. Tapping a reason confirms immediately —
// the Figma design has no separate "Confirm" button, just the option rows.
export default function RejectReasonSheet() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(SKIP_REASONS[0]);

  function handleSelect(reason) {
    setSelected(reason);
    navigation.navigate("OrdersSkipConfirmed");
  }

  return (
    <View className="flex-1 justify-end bg-black/40">
      <Pressable className="flex-1" onPress={() => navigation.goBack()} />

      <View className="w-full gap-5 rounded-t-[20px] bg-card px-6 pb-10 pt-3 shadow-md shadow-black/20">
        <View className="w-full items-center">
          <View className="h-1 w-12 rounded-full bg-border-strong" />
        </View>

        <Text className="font-jakarta-bold text-xl text-foreground">Why are you skipping?</Text>

        <View className="w-full gap-2.5">
          {SKIP_REASONS.map((reason) => {
            const isSelected = reason === selected;
            return (
              <Pressable
                key={reason}
                onPress={() => handleSelect(reason)}
                className={cn(
                  "h-[52px] w-full items-start justify-center rounded-full border px-4",
                  isSelected ? "border-2 border-primary bg-primary-tint" : "border-border bg-white",
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    isSelected ? "font-jakarta-semibold text-primary-hover" : "text-foreground",
                  )}
                >
                  {reason}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
