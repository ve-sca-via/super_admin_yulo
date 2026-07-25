import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import BottomNav from "@/components/partner/BottomNav";
import { mockOrders } from "@/mocks/fixtures";

const MAP_BG = { veg: "#0d1a0d", standard: "#0d0d1f" };

function MetricCell({ label, value }) {
  return (
    <View className="flex-1 gap-0.5">
      <Text className="font-jakarta-bold text-lg text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function IncomingOrder() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "standard";
  const order = mockOrders[orderKey];
  const isVeg = order.fleetType === "veg";

  const [secondsLeft, setSecondsLeft] = useState(order.countdownSeconds);
  const skippedRef = useRef(false);

  function handleSkip() {
    if (skippedRef.current) return;
    skippedRef.current = true;
    navigation.navigate("OrdersReject", { orderKey });
  }

  useEffect(() => {
    if (skippedRef.current) return; // already accepted/skipped — stop ticking
    if (secondsLeft <= 0) {
      handleSkip(); // missed the offer — treated the same as a skip, no penalty
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function handleAccept() {
    skippedRef.current = true;
    navigation.navigate("DeliveryPickup", { orderKey });
  }

  return (
    <View className="flex-1 bg-background">
      <View className="h-11 w-full" style={{ backgroundColor: "#1a1a1a" }} />

      <View
        className="h-[320px] w-full overflow-hidden pl-4 pr-4 pt-3"
        style={{ backgroundColor: MAP_BG[order.fleetType] }}
      >
        <View className="absolute" style={{ left: 55, top: 50, right: 24 }}>
          <View className="flex-row items-center gap-1.5">
            <View className="size-4 items-center justify-center rounded-full bg-primary">
              <View className="size-1.5 rounded-full bg-white" />
            </View>
            <Text className="text-[13px] text-[#ccc]">{order.restaurantName}</Text>
          </View>
          <View className="flex-row pl-2">
            <View className="h-40 w-[3px] rounded-full bg-primary" />
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="size-4 items-center justify-center rounded-full bg-success">
              <View className="size-1.5 rounded-full bg-white" />
            </View>
            <Text className="text-[13px] text-[#ccc]">Customer drop</Text>
          </View>
        </View>
      </View>

      <View className="w-full flex-1 gap-2 rounded-[20px] bg-card px-6 pt-[18px]">
        <Text className="w-full font-jakarta-bold text-lg text-foreground">
          {order.restaurantName}
        </Text>

        {!isVeg && (
          <View className="w-full flex-row items-center gap-1.5">
            <MapPin size={14} color="#8b1a1a" />
            <Text className="font-jakarta-semibold text-xs text-[#8b1a1a]">Non-veg order</Text>
          </View>
        )}

        {isVeg && (
          <View className="h-9 w-full flex-row items-center rounded-lg bg-success-tint px-3">
            <Text className="font-jakarta-semibold text-[13px] text-[#17803d]">
              Veg-Only order — use your certified bag
            </Text>
          </View>
        )}

        <View className="w-full flex-row items-center pt-0.5">
          <MetricCell label="Pickup" value={`${order.pickupKm} km`} />
          <View className="h-8 w-px bg-border" />
          <MetricCell label="Drop" value={`${order.dropKm} km`} />
          <View className="h-8 w-px bg-border" />
          <MetricCell label="Total" value={`${order.totalKm} km`} />
        </View>

        <View className="h-[52px] w-full flex-row items-center gap-2 rounded-[20px] bg-primary-tint px-4">
          <Text className="font-jakarta-bold text-xl text-primary">₹{order.fare.toFixed(2)}</Text>
          <Text className="flex-1 font-jakarta-medium text-xs text-muted-foreground">
            {order.payment === "cod" ? `COD — collect ₹${order.codAmount}` : "Prepaid"}
          </Text>
        </View>

        <View className="w-full flex-row items-center gap-3 pt-2">
          <Button className="flex-1" onPress={handleAccept}>
            Accept
          </Button>
          <Button className="flex-1" variant="secondary" onPress={handleSkip}>
            Skip
          </Button>
        </View>
      </View>

      <BottomNav />
    </View>
  );
}
