import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Check } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { mockOrders } from "@/mocks/fixtures";

export default function DeliverySummary() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "veg";
  const order = mockOrders[orderKey];
  const { basePay, distancePay, surge, tip, penalty } = order.payout;
  const total = basePay + distancePay + surge + tip - penalty;

  const rows = [
    { label: "Base pay", value: `₹${basePay.toFixed(2)}` },
    { label: `Distance (${order.totalKm} km)`, value: `₹${distancePay.toFixed(2)}` },
    { label: "Peak surge", value: `₹${surge.toFixed(2)}` },
    { label: "Tip", value: `₹${tip.toFixed(2)}`, accent: true },
    { label: "Penalty", value: penalty > 0 ? `-₹${penalty.toFixed(2)}` : "—" },
  ];

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-[200px] w-full items-center gap-5 bg-success px-6 pb-6 pt-[26px]">
        <View className="size-16 items-center justify-center rounded-full bg-white">
          <Check size={28} color="#22a853" strokeWidth={3} />
        </View>
        <View className="items-center gap-0.5">
          <Text className="font-jakarta-bold text-2xl text-white">Delivered!</Text>
          <Text className="text-sm text-white">{order.restaurantName}</Text>
        </View>
      </View>

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        <View className="w-full gap-3.5 rounded-[20px] bg-card p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-base text-foreground">Order payout</Text>
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
            <Text className="font-jakarta-bold text-base text-foreground">Total earned</Text>
            <Text className="font-jakarta-bold text-xl text-primary">₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <Button onPress={() => navigation.navigate("HomeOffline")}>Done — next order</Button>
      </View>

      <BottomNav />
    </Screen>
  );
}
