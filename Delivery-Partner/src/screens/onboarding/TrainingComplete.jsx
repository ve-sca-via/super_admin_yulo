import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Check } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { useOnboarding } from "@/context/OnboardingContext";
import { formatDuration } from "@/lib/format";

export default function TrainingComplete() {
  const navigation = useNavigation();
  const { training } = useOnboarding();
  const { moduleLabel, moduleIndex, totalModules, watchedSeconds } = training;
  const hasNextModule = moduleIndex < totalModules;

  // Was unconditionally navigating to HomeOffline regardless of whether more modules remained,
  // even though the label below already computed moduleIndex+1/totalModules correctly. Real
  // per-module content switching (a different moduleId/label/duration for module 3) needs the
  // backend's module registry (server/services/training.service.js) wired in — this mock only
  // ever models one module ("veg-handling"), so continuing re-enters the same screen with the
  // same moduleId for now; the navigation decision itself (loop back vs. finish) is correct.
  function handleContinue() {
    if (hasNextModule) {
      navigation.navigate("OnboardingTraining", { moduleId: training.moduleId });
    } else {
      navigation.navigate("HomeOffline");
    }
  }

  const rows = [
    { label: "Quiz score", value: "9 / 10" },
    { label: "Watch time", value: formatDuration(watchedSeconds) },
    { label: "Result", value: "Passed" },
    { label: "Certificate", value: "Pending", accent: true },
    { label: "Next up", value: `Module ${moduleIndex + 1}` },
  ];

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-[200px] w-full items-center gap-5 bg-success px-6 pb-6 pt-[26px]">
        <View className="size-16 items-center justify-center rounded-full bg-white">
          <Check size={28} color="#22a853" strokeWidth={3} />
        </View>
        <View className="items-center gap-0.5">
          <Text className="font-jakarta-bold text-2xl text-white">Module complete!</Text>
          <Text className="text-sm text-white">
            {moduleLabel} · Module {moduleIndex} of {totalModules}
          </Text>
        </View>
      </View>

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        <View className="w-full gap-3.5 rounded-[20px] bg-card p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-base text-foreground">Your progress</Text>
          <View className="gap-3.5">
            {rows.map((row) => (
              <View key={row.label} className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">{row.label}</Text>
                <Text
                  className={
                    row.accent
                      ? "font-jakarta-semibold text-sm text-success"
                      : "text-sm text-foreground"
                  }
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
          <View className="h-px w-full bg-border" />
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-bold text-base text-foreground">Overall</Text>
            <Text className="font-jakarta-bold text-xl text-primary">
              {moduleIndex} / {totalModules}
            </Text>
          </View>
        </View>

        <Button onPress={handleContinue}>
          {hasNextModule ? `Continue to Module ${moduleIndex + 1}` : "Done"}
        </Button>
      </View>

      <BottomNav />
    </Screen>
  );
}
