import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { mockOrders } from "@/mocks/fixtures";

// Shared by "Go to Pickup" and "Navigate to Customer" — same layout in the
// Figma design (map header + destination sheet with ETA/call/CTA), differing
// only in which leg of the trip they show. `stage` picks pickup vs drop-off
// fields off the order; `onArrive` decides where the CTA routes to, since
// that branches by fleet type / payment method (see IncomingOrder.jsx for
// the same veg/standard, prepaid/cod branching logic).
export default function NavigationScreen({ stage, mapLabel, onArrive }) {
  const navigation = useNavigation();
  const { params } = useRoute();
  const orderKey = params?.orderKey ?? "veg";
  const order = mockOrders[orderKey];

  const isPickup = stage === "pickup";
  const name = isPickup ? order.restaurantName : order.customerName;
  const address = isPickup ? order.restaurantAddress : order.customerAddress;
  const etaMin = isPickup ? order.pickupEtaMin : order.customerEtaMin;
  const km = isPickup ? order.pickupKm : order.dropKm;

  return (
    <View className="flex-1 bg-background">
      <View className="h-11 w-full bg-background" />

      <View className="h-[380px] w-full overflow-hidden bg-[#e8f2e8] px-4 pt-3">
        <Text className="font-jakarta-medium text-sm text-foreground">
          🗺 {mapLabel} · {km} km
        </Text>
        <View className="absolute h-52 w-4 items-center" style={{ left: 189, top: 60 }}>
          <View className="size-4 rounded-full bg-primary" />
          <View className="w-1 flex-1 bg-primary" />
          <View className="size-4 rounded-full bg-success" />
        </View>
      </View>

      <View className="w-full flex-1 gap-4 rounded-[20px] bg-card px-6 pb-6 pt-4 shadow-md shadow-black/10">
        <View className="w-full gap-1">
          <Text className="font-jakarta-bold text-lg text-foreground">{name}</Text>
          <Text className="text-sm text-muted-foreground">{address}</Text>
        </View>

        <View className="w-full flex-row items-center justify-between pt-1.5">
          <View className="h-7 items-center justify-center rounded-full bg-primary-tint px-3">
            <Text className="font-jakarta-semibold text-xs text-primary-hover">
              ETA · {etaMin} min
            </Text>
          </View>
          <View className="size-12 items-center justify-center rounded-full border-[1.5px] border-border">
            <Text className="text-xl">📞</Text>
          </View>
        </View>

        <Button onPress={() => onArrive(navigation, order, orderKey)}>
          {isPickup ? "Reached restaurant" : "Reached customer"}
        </Button>
      </View>
    </View>
  );
}
