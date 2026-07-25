import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { cn } from "@/lib/utils";
import { mockPartner } from "@/mocks/fixtures";

const IS_VEG_FLEET = mockPartner.fleetType === "veg";
const FLEET_LABEL = IS_VEG_FLEET ? "Veg-Only Fleet" : "Standard Fleet";

const REASONS = [
  "Not enough orders on veg fleet",
  "Moving to a different zone",
  "Equipment issue (bag problem)",
  "Personal reason",
];

export default function FleetChangeRequest() {
  const navigation = useNavigation();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");

  return (
    <Screen edges={["top"]}>
      <AppBar title="Request Fleet Change" onBack={true} />

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        <Card className="gap-2">
          <Text className="text-xs text-muted-foreground">Current fleet</Text>
          <View className="h-7 w-[110px] items-center justify-center rounded-full bg-primary-tint px-3">
            <Text className="font-jakarta-semibold text-xs text-primary-hover">{FLEET_LABEL}</Text>
          </View>
        </Card>

        <Text className="pt-2 font-jakarta-semibold text-base text-foreground">
          Why do you want to change?
        </Text>

        <View className="w-full gap-2.5">
          {REASONS.map((reason) => {
            const isSelected = reason === selectedReason;
            return (
              <Pressable
                key={reason}
                onPress={() => setSelectedReason(reason)}
                className={cn(
                  "h-[52px] w-full justify-center rounded-full border px-4",
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

        <Input
          className="rounded-full"
          placeholder="Additional notes (optional)…"
          value={notes}
          onChangeText={setNotes}
        />

        <View className="h-11 w-full items-center justify-center rounded-[20px] bg-success-tint px-4">
          <Text className="font-jakarta-medium text-sm text-[#17803d]">
            ⏱  Ops responds within 72 hours
          </Text>
        </View>

        <Button className="w-full" onPress={() => navigation.navigate("ProfileFleetChangeSubmitted")}>
          Submit request
        </Button>
      </View>
    </Screen>
  );
}
