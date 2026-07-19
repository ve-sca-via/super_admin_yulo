import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Play } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import ProgressBar from "@/components/partner/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  "Inspect bag seal before every pickup",
  "No other items in bag",
  "Spill protocol & reporting",
  "Wrong item handover flow",
];

export default function TrainingModule() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { moduleId } = params;
  const { training, setTraining } = useOnboarding();
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const { watchedSeconds, durationSeconds, moduleLabel, moduleIndex, totalModules } = training;
  const pct = (watchedSeconds / durationSeconds) * 100;
  const isDone = watchedSeconds >= durationSeconds;

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Stopping the interval and flipping local `isPlaying` state belongs here,
  // not inside the setTraining updater below — updater functions must stay
  // pure since React can invoke them outside the normal render/commit cycle.
  useEffect(() => {
    if (isDone && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPlaying(false);
    }
  }, [isDone]);

  function handlePlay() {
    if (isPlaying || isDone) return;
    setIsPlaying(true);
    // Simulated playback — fast-forwarded so the flow can be walked through
    // without waiting out a real 8-minute video.
    intervalRef.current = setInterval(() => {
      setTraining((prev) => ({
        ...prev,
        watchedSeconds: Math.min(prev.watchedSeconds + 15, prev.durationSeconds),
      }));
    }, 150);
  }

  return (
    <Screen edges={["top", "bottom"]} className="bg-[#1a1a1a]" statusBarStyle="light">
      <AppBar theme="dark" title={`${moduleLabel} · Module ${moduleIndex} of ${totalModules}`} />

      <View className="h-[236px] w-full items-center justify-center bg-[#1a1a1a]">
        <Pressable
          onPress={handlePlay}
          accessibilityLabel="Play training video"
          className="size-14 items-center justify-center rounded-full bg-white"
        >
          <Play size={22} color="#ff5f00" fill="#ff5f00" style={{ marginLeft: 3 }} />
        </Pressable>
      </View>

      <View className="w-full flex-1 bg-background pb-12 pt-3.5">
        <View className="gap-2 px-6">
          <ProgressBar value={pct} size="sm" />
          <View className="w-full flex-row justify-between">
            <Text className="font-jakarta-medium text-xs text-muted-foreground">
              {formatDuration(watchedSeconds)}
            </Text>
            <Text className="font-jakarta-medium text-xs text-muted-foreground">
              {formatDuration(durationSeconds)}
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-between px-6 pt-[17px]">
          <View className="gap-[18px]">
            <Text className="font-jakarta-semibold text-lg text-foreground">
              Veg order handling &amp; bag hygiene
            </Text>
            <View className="gap-[18px]">
              {CHECKLIST.map((label, i) => {
                const done = pct >= (i + 1) * 25;
                return (
                  <View key={label} className="flex-row items-center gap-2">
                    <View className={cn("size-2 rounded-full", done ? "bg-success" : "bg-border-strong")} />
                    <Text
                      className={cn(
                        "flex-1 text-sm",
                        done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </Text>
                    {done && <Text className="font-jakarta-bold text-sm text-success">✓</Text>}
                  </View>
                );
              })}
            </View>
          </View>

          <Button
            variant={isDone ? "default" : "disabled"}
            disabled={!isDone}
            onPress={() => navigation.navigate("OnboardingTrainingComplete", { moduleId })}
          >
            {isDone ? "Continue to results" : "Continue — watch to unlock"}
          </Button>
        </View>
      </View>
    </Screen>
  );
}
