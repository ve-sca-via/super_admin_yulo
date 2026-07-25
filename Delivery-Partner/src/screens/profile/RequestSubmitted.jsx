import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Clock } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";

const STEPS = [
  { label: "Submitted", align: "left" },
  { label: "Under review", align: "center" },
  { label: "Decision", align: "right" },
];

export default function RequestSubmitted() {
  const navigation = useNavigation();

  return (
    <Screen edges={["top"]}>
      <AppBar title="Request status" />

      <View className="w-full flex-1 items-center gap-8 px-6 pt-12">
        <View className="size-20 items-center justify-center rounded-2xl bg-warning-tint">
          <Clock size={40} color="#f59e0b" />
        </View>

        <View className="items-center gap-1.5">
          <Text className="text-center font-jakarta-bold text-xl text-foreground">
            Change request submitted
          </Text>
          <Text className="text-center text-base text-muted-foreground">
            Our ops team is reviewing your request and will get back to you within 72 hours.
          </Text>
        </View>

        <View className="w-full pt-12">
          <View className="w-full flex-row items-center">
            <View className="size-3 rounded-full bg-success" />
            <View className="h-0.5 flex-1 bg-success" />
            <View className="size-3.5 rounded-full bg-warning" />
            <View className="h-0.5 flex-1 bg-border-strong" />
            <View className="size-3 rounded-full border border-border-strong bg-white" />
          </View>
          <View className="w-full flex-row justify-between pt-2">
            {STEPS.map((step) => (
              <Text
                key={step.label}
                className={
                  step.align === "left"
                    ? "font-jakarta-medium text-xs text-success"
                    : step.align === "center"
                      ? "font-jakarta-medium text-xs text-warning"
                      : "font-jakarta-medium text-xs text-muted-foreground"
                }
              >
                {step.label}
              </Text>
            ))}
          </View>
        </View>

        <View className="flex-1" />

        <View className="w-full gap-3">
          <Button className="w-full" onPress={() => navigation.navigate("Profile")}>
            Back to profile
          </Button>
          <Button variant="secondary" size="sm" className="w-full" onPress={() => {}}>
            View request details
          </Button>
        </View>
      </View>
    </Screen>
  );
}
