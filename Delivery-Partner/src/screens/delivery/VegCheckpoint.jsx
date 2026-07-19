import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Check } from "lucide-react-native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import OtpInput from "@/components/partner/OtpInput";
import { cn } from "@/lib/utils";
import { mockOrders } from "@/mocks/fixtures";

const CHECKLIST_ITEMS = [
  { key: "sealed", label: "Sealed veg packaging verified" },
  { key: "noOther", label: "No other order in bag" },
];

export default function VegCheckpoint() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "veg";
  const order = mockOrders[orderKey];

  const [packedItems, setPackedItems] = useState(() =>
    Object.fromEntries(order.items.map((item, i) => [item.name, i < order.items.length - 1])),
  );
  const [checklist, setChecklist] = useState({ sealed: true, noOther: false });
  const [otp, setOtp] = useState("");

  const allPacked = Object.values(packedItems).every(Boolean);
  const allChecked = Object.values(checklist).every(Boolean);
  const canConfirm = allPacked && allChecked && otp.length === 4;

  function togglePacked(name) {
    setPackedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  }
  function toggleChecklist(key) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleConfirm() {
    if (!canConfirm) return;
    navigation.navigate("DeliveryNavigate", { orderKey });
  }

  return (
    <Screen>
      <AppBar title="At restaurant" />

      <View className="w-full gap-4 px-6 pt-5">
        <View className="w-full gap-3.5 rounded-[20px] bg-card px-4 py-3.5 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-sm text-foreground">Order items</Text>
          {order.items.map((item) => {
            const isPacked = packedItems[item.name];
            return (
              <Pressable
                key={item.name}
                onPress={() => togglePacked(item.name)}
                className="w-full flex-row items-center gap-2"
              >
                <View className="size-2.5 rounded-sm bg-success" />
                <Text className="flex-1 text-sm text-foreground">
                  {item.name} × {item.qty}
                </Text>
                {isPacked && <Check size={16} color="#22a853" strokeWidth={3} />}
              </Pressable>
            );
          })}
        </View>

        <View className="w-full gap-4 rounded-[20px] border-[1.5px] border-success bg-success-tint p-4 shadow-md shadow-black/10">
          <Text className="font-jakarta-bold text-base text-[#17803d]">Veg pickup checklist</Text>
          <View className="w-full gap-6">
            {CHECKLIST_ITEMS.map(({ key, label }) => {
              const checked = checklist[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => toggleChecklist(key)}
                  className="w-full flex-row items-center gap-3"
                >
                  <View
                    className={cn(
                      "size-7 items-center justify-center rounded-lg",
                      checked ? "bg-success" : "border-2 border-border-strong bg-white",
                    )}
                  >
                    {checked && <Check size={16} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text className="flex-1 font-jakarta-medium text-sm text-foreground">
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="w-full gap-2 rounded-[20px] bg-card px-4 py-3.5 shadow-md shadow-black/10">
          <Text className="font-jakarta-semibold text-sm text-foreground">Enter pickup OTP</Text>
          <OtpInput
            length={4}
            value={otp}
            onChange={setOtp}
            boxHeight={48}
            className="justify-start"
            accessibilityLabel="Pickup OTP"
          />
        </View>

        <Button variant={canConfirm ? "default" : "disabled"} disabled={!canConfirm} onPress={handleConfirm}>
          {canConfirm ? "Confirm pickup" : "Confirm pickup — complete checklist first"}
        </Button>
      </View>
    </Screen>
  );
}
