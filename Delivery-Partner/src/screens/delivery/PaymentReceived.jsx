import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Check } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { mockOrders } from "@/mocks/fixtures";

// Matches Home.jsx's ONLINE_MOCK.cashInHand — the running cash-in-hand
// total before this collection is added to it.
const CASH_IN_HAND_BEFORE = 120;

export default function PaymentReceived() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "standard";
  const order = mockOrders[orderKey];
  const cashInHandNow = CASH_IN_HAND_BEFORE + order.dropoffAmount;

  const rows = [
    { label: "Order amount", value: `₹${order.dropoffAmount.toFixed(2)}` },
    { label: "Paid via", value: "Cash" },
    { label: "Change returned", value: "—" },
    { label: "Your trip earning", value: `₹${order.fare.toFixed(2)}`, accent: true },
    { label: "Deposit due", value: `₹${order.dropoffAmount.toFixed(2)}` },
  ];

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="h-[200px] w-full items-center gap-5 bg-success px-6 pb-6 pt-[26px]">
        <View className="size-16 items-center justify-center rounded-full bg-white">
          <Check size={28} color="#22a853" strokeWidth={3} />
        </View>
        <View className="items-center gap-0.5">
          <Text className="font-jakarta-bold text-2xl text-white">Payment received</Text>
          <Text className="text-sm text-white">
            ₹{order.dropoffAmount.toFixed(2)} collected · {order.restaurantName}
          </Text>
        </View>
      </View>

      <View className="w-full flex-1 gap-4 px-6 pt-5">
        <View className="w-full gap-3.5 rounded-[20px] bg-card p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-base text-foreground">
            Collection summary
          </Text>
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
            <Text className="font-jakarta-bold text-base text-foreground">Cash in hand now</Text>
            <Text className="font-jakarta-bold text-xl text-primary">
              ₹{cashInHandNow.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="w-full items-center rounded-full border border-[#e53e3e] bg-[#fce8e8] p-4 shadow-md shadow-black/10">
          <Text className="text-center font-jakarta-semibold text-sm text-[#e53e3e]">
            Cash in hand: ₹{CASH_IN_HAND_BEFORE} · Deposit now →
          </Text>
        </View>

        <Button onPress={() => navigation.navigate("HomeOffline")}>Done — next order</Button>
      </View>

      <BottomNav />
    </Screen>
  );
}
