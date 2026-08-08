import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import VegModeBanner from "@/components/home/VegModeBanner";
import PaymentGroup from "@/components/payment/PaymentGroup";
import { shortAddress } from "@/data/addresses";
import { DEFAULT_METHOD_ID, PAYMENT_GROUPS, formatAmount } from "@/data/payment";
import { accentFor } from "@/lib/accent";
import { useCheckoutSummary, usePlaceOrder } from "@/hooks/useCheckout";
import { ActivityIndicator } from "react-native";

// Room under the last group so the bottom card clears the gesture bar.
const SCROLL_PADDING = 40;

export default function Payment({ navigation, route }) {
  const { cart, vegOnly, clearCart } = useFeed();
  const { selectedAddress } = useCustomerAuth();
  const accent = accentFor(vegOnly);

  const tip = route.params?.tip ?? 0;
  const vegFleet = route.params?.vegFleet ?? false;
  const deliveryNote = route.params?.deliveryNote ?? "";
  const cookingNote = route.params?.cookingNote ?? "";
  const cutlery = route.params?.cutlery ?? false;

  const [method, setMethod] = useState(DEFAULT_METHOD_ID);

  const placeOrder = usePlaceOrder();
  const { data: summary, isLoading: isLoadingSummary } = useCheckoutSummary();

  // Every group opens expanded — the screen is a list of ways to pay, and a
  // customer who has to open three cards to find out theirs isn't offered is
  // worse off than one who scrolls. Collapsing is for getting past the ones
  // they've ruled out.
  const [collapsed, setCollapsed] = useState([]);

  const toggleGroup = (id) =>
    setCollapsed((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  // Reached with an emptied cart — a back-navigation after paying, or the last
  // line counted down on checkout. There's nothing to charge for, so the screen
  // says so rather than offering to charge zero.
  if (!cart) {
    return (
      <Screen edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Text className="font-jakarta-bold text-[18px] leading-[26px] text-foreground">
            Nothing left to pay for
          </Text>

          <Text className="text-center font-jakarta text-[15px] leading-[22px] text-muted-foreground">
            Your cart is empty. Add a dish and come back.
          </Text>

          <Button
            onPress={() => navigation.navigate("Home")}
            style={{ backgroundColor: accent.icon }}
            className="mt-3"
          >
            Browse restaurants
          </Button>
        </View>
      </Screen>
    );
  }

  if (isLoadingSummary) {
    return (
      <Screen edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={accent.icon} />
        </View>
      </Screen>
    );
  }

  const toPay = summary?.bill ? summary.bill.grandTotal + tip : 0;
  const restaurantName = cart.restaurantName;

  // Real backend call to create order
  const pay = () => {
    placeOrder.mutate(
      {
        restaurantId: cart.restaurantId,
        addressId: selectedAddress?._id || selectedAddress?.id,
        paymentMethod: method,
        tip,
        specialInstructions: [deliveryNote, cookingNote].filter(Boolean).join(" | "),
        vegFleetOptIn: vegFleet,
        needsCutlery: cutlery,
      },
      {
        onSuccess: () => {
          navigation.reset({
            index: 1,
            routes: [
              { name: "Home" },
              { name: "OrderPlaced", params: { restaurantName, vegFleet } },
            ],
          });
          clearCart();
        },
      }
    );
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        {vegOnly ? (
          <View className="px-3 pt-1">
            <VegModeBanner className="w-full justify-center py-2" />
          </View>
        ) : null}

        <View className="flex-row items-center gap-4 px-5 pt-3">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={26} color="#1A1A1A" />
          </Pressable>

          <Text className="font-jakarta-extrabold text-[28px] leading-[36px] text-foreground">
            Payment
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate("Address")}
          className="mx-5 mt-4 flex-row items-center gap-3 rounded-2xl bg-card p-4 shadow-md shadow-black/10"
          accessibilityRole="button"
          accessibilityLabel={`Delivering to ${selectedAddress?.label}. Change address`}
        >
          <MapPin size={20} color="#1A1A1A" strokeWidth={2.2} />

          <View className="flex-1">
            <Text className="font-jakarta-bold text-[17px] leading-[24px] text-foreground">
              Delivering to {selectedAddress?.label ?? "your address"}
            </Text>

            <Text
              numberOfLines={2}
              className="font-jakarta text-[15px] leading-[22px] text-muted-foreground"
            >
              {shortAddress(selectedAddress)}
            </Text>
          </View>

          <ChevronRight size={20} color="#1A1A1A" />
        </Pressable>

        <Text className="mx-5 mt-6 font-jakarta text-[16px] leading-[22px] text-muted-foreground">
          Total Payable amount
        </Text>

        <View className="px-5 pb-2">
          {PAYMENT_GROUPS.map((group) => (
            <PaymentGroup
              key={group.id}
              group={group}
              expanded={!collapsed.includes(group.id)}
              selected={method}
              accent={accent}
              payLabel={placeOrder.isPending ? "Processing..." : `Pay ${formatAmount(toPay)}`}
              onToggle={() => toggleGroup(group.id)}
              onSelect={setMethod}
              onPay={placeOrder.isPending ? undefined : pay}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
