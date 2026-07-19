import { useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import AppBar from "@/components/partner/AppBar";
import { mockOrders } from "@/mocks/fixtures";

export default function CodCollection() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "standard";
  const order = mockOrders[orderKey];
  const [cashReceived, setCashReceived] = useState(false);

  return (
    <Screen>
      <AppBar title="Collect payment" />

      <View className="w-full gap-4 px-6 pt-5">
        <View className="w-full gap-2 rounded-[20px] bg-card px-4 py-3.5 shadow-md shadow-black/10">
          <Text className="font-jakarta-medium text-xs text-muted-foreground">
            Amount to collect (COD)
          </Text>
          <Text className="font-jakarta-bold text-[36px] leading-[45px] text-foreground">
            ₹{order.dropoffAmount.toFixed(2)}
          </Text>
        </View>

        <View className="w-full items-center gap-2 rounded-[20px] bg-card px-4 pb-9 pt-2 shadow-md shadow-black/10">
          <Text className="py-1.5 text-center text-sm text-muted-foreground">
            Scan to pay via UPI
          </Text>
          <View className="size-[148px] items-center justify-center rounded-xl bg-muted">
            <Text className="text-sm text-muted-foreground">QR Code</Text>
          </View>
        </View>

        <View className="w-full flex-row items-center gap-3 py-1.5">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-sm text-muted-foreground">or</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Button
          variant={cashReceived ? "default" : "secondary"}
          size="sm"
          onPress={() => setCashReceived((v) => !v)}
        >
          {cashReceived ? "Cash received ✓" : "Mark cash received"}
        </Button>
        <Button
          variant={cashReceived ? "default" : "disabled"}
          disabled={!cashReceived}
          onPress={() => navigation.navigate("DeliveryPaymentReceived", { orderKey })}
        >
          Confirm delivery
        </Button>
      </View>
    </Screen>
  );
}
