import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { formatClock } from "@/lib/format";
import { mockPartner } from "@/mocks/fixtures";

const FLEET_LABEL = mockPartner.fleetType === "veg" ? "Veg-Only Fleet" : "Standard Fleet";

// Mock online-session numbers — matches the Figma "Online / Idle" state
// exactly. Once a real backend exists this becomes live order/earnings data
// instead of fixed values that appear the moment you go online.
const ONLINE_MOCK = {
  earningsToday: 342.5,
  ordersToday: 7,
  cashInHand: 120,
  bonusTarget: 3,
  bonusAmount: 120,
  bonusProgressPct: 40,
};

function DemandHeatmap() {
  return (
    <View className="h-[300px] w-full overflow-hidden bg-success-tint px-4 pt-2">
      <View className="h-7 w-[168px] items-center justify-center rounded-full bg-success-tint">
        <Text className="font-jakarta-semibold text-xs text-[#17803d]">Veg demand heatmap</Text>
      </View>
      <View
        className="absolute rounded-full bg-success/20"
        style={{ left: 15, top: 165, width: 110, height: 110 }}
      />
      <View
        className="absolute rounded-full bg-success/25"
        style={{ left: 135, top: 175, width: 150, height: 150 }}
      />
      <View
        className="absolute rounded-full bg-success/20"
        style={{ left: 275, top: 140, width: 90, height: 90 }}
      />
    </View>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(false);
  const [dutySeconds, setDutySeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function handleToggleOnline() {
    if (isOnline) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsOnline(false);
      setDutySeconds(0);
      return;
    }
    setIsOnline(true);
    intervalRef.current = setInterval(() => setDutySeconds((s) => s + 1), 1000);
  }

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-16 w-full flex-row items-center justify-between bg-card pl-6 pr-5">
        <Text className="font-jakarta-semibold text-[16px] text-foreground">Good morning, Raju</Text>
        <Pressable
          onPress={() => navigation.navigate("FleetBadgeInfo")}
          className="h-7 items-center justify-center rounded-full bg-primary-tint px-3"
        >
          <Text className="font-jakarta-semibold text-xs text-primary-hover">{FLEET_LABEL}</Text>
        </Pressable>
      </View>

      {isOnline ? (
        <DemandHeatmap />
      ) : (
        <View className="h-[328px] w-full items-center justify-center bg-muted px-6">
          <Text className="text-center text-sm text-muted-foreground">
            Go online to see demand heatmap
          </Text>
        </View>
      )}

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        {isOnline && (
          <View className="h-10 w-full flex-row items-center gap-2 rounded-full bg-success-tint px-4">
            <View className="size-2.5 rounded-full bg-success" />
            <Text className="flex-1 font-jakarta-medium text-sm text-[#17803d]">
              Online · duty time {formatClock(dutySeconds)}
            </Text>
          </View>
        )}

        <View className="w-full gap-1 rounded-[20px] bg-card px-4 py-3.5 shadow-md shadow-black/10">
          <Text className="font-jakarta-medium text-xs text-muted-foreground">
            Today&rsquo;s earnings
          </Text>
          <Text
            className={
              isOnline
                ? "font-jakarta-bold text-[36px] leading-[42px] text-foreground"
                : "font-jakarta-bold text-[36px] leading-[42px] text-muted-foreground"
            }
          >
            ₹{isOnline ? ONLINE_MOCK.earningsToday.toFixed(2) : "0.00"}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {isOnline
              ? `${ONLINE_MOCK.ordersToday} orders  ·  Cash in hand: ₹${ONLINE_MOCK.cashInHand}`
              : "0 orders"}
          </Text>
        </View>

        {isOnline && (
          <View className="w-full gap-6 rounded-[20px] bg-card px-4 pb-1.5 pt-2 shadow-md shadow-black/10">
            <View className="w-full flex-row items-center gap-2.5">
              <Text className="text-lg">🎯</Text>
              <Text className="flex-1 font-jakarta-medium text-sm text-foreground">
                {ONLINE_MOCK.bonusTarget} more orders before 3 PM → ₹{ONLINE_MOCK.bonusAmount} bonus
              </Text>
            </View>
            <View className="h-1 w-full overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full bg-warning"
                style={{ width: `${ONLINE_MOCK.bonusProgressPct}%` }}
              />
            </View>
          </View>
        )}

        <Button
          size={isOnline ? "sm" : "lg"}
          variant={isOnline ? "secondary" : "default"}
          onPress={handleToggleOnline}
        >
          {isOnline ? "Go offline" : "Go online"}
        </Button>
      </View>

      <BottomNav />
    </Screen>
  );
}
