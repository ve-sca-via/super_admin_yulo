import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import BottomNav from "@/components/partner/BottomNav";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { CASH_IN_HAND, EARNINGS_BY_PERIOD, mockPartner } from "@/mocks/fixtures";

const TABS = [
  { key: "today", label: "Today" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const BREAKDOWN_ROWS = (data, isVeg) =>
  [
    { label: "Base pay", value: data.basePay },
    { label: "Distance pay", value: data.distancePay },
    { label: "Peak surge", value: data.peakSurge },
    { label: "Tips", value: data.tips },
    isVeg && { label: "Veg fleet idle-pay", value: data.idlePay },
    { label: "Penalties", value: -data.penalties, isPenalty: true },
  ].filter(Boolean);

export default function Earnings() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const [period, setPeriod] = useState(params?.period ?? "today");
  const data = EARNINGS_BY_PERIOD[period];
  const isVeg = mockPartner.fleetType === "veg";

  return (
    <Screen edges={["top", "bottom"]}>
      <AppBar title="Earnings" />

      <View className="w-full flex-1 gap-4 px-6 pt-3">
        <View className="w-full flex-row rounded-full bg-muted p-1">
          {TABS.map((tab) => {
            const active = tab.key === period;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setPeriod(tab.key)}
                className={cn(
                  "h-9 flex-1 items-center justify-center rounded-full",
                  active && "bg-primary",
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    active ? "font-jakarta-semibold text-white" : "font-jakarta-medium text-muted-foreground",
                  )}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="w-full gap-1.5 rounded-[20px] bg-primary p-4 shadow-md shadow-primary/40">
          <Text className="font-jakarta-medium text-xs text-white">
            Total earned {data.label}
          </Text>
          <Text className="font-jakarta-bold text-[36px] leading-[45px] text-white">
            {formatCurrency(data.totalEarned)}
          </Text>
          <Text className="text-xs text-white">
            {data.orders} orders · incentive bonus {formatCurrency(data.incentiveBonus)}
          </Text>
        </View>

        <View className="w-full gap-3 rounded-[20px] bg-card p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-bold text-base text-foreground">Breakdown</Text>
          <View className="gap-3">
            {BREAKDOWN_ROWS(data, isVeg).map((row) => (
              <View key={row.label} className="w-full flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">{row.label}</Text>
                <Text className="font-jakarta-medium text-sm text-foreground">
                  {row.isPenalty
                    ? row.value < 0
                      ? `−${formatCurrency(Math.abs(row.value))}`
                      : "—"
                    : formatCurrency(row.value)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate("EarningsCashDeposit")}
          className="w-full flex-row items-center rounded-[20px] border border-destructive bg-destructive/10 p-4 shadow-md shadow-black/10"
        >
          <Text className="flex-1 font-jakarta-semibold text-sm text-destructive">
            Cash in hand: {formatCurrency(CASH_IN_HAND)} · Deposit now →
          </Text>
        </Pressable>
      </View>

      <BottomNav />
    </Screen>
  );
}
