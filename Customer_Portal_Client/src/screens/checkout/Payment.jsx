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
import { billFor } from "@/data/cart";
import { DEFAULT_METHOD_ID, PAYMENT_GROUPS, formatAmount } from "@/data/payment";
import { accentFor } from "@/lib/accent";

// Room under the last group so the bottom card clears the gesture bar.
const SCROLL_PADDING = 40;

// Figma "Payment". Checkout settles what the order *is*; this screen settles how
// it's paid for and nothing else — the address is on it only so the last thing
// the customer sees before paying is where the food is going, and it's a link
// back rather than an editor.
//
// The tip and the veg-fleet request are carried through as params rather than
// re-asked: they were answered on checkout, and the total on the pay button has
// to be the same number that screen quoted.
export default function Payment({ navigation, route }) {
  const { cart, vegOnly, clearCart } = useFeed();
  const { selectedAddress } = useCustomerAuth();
  const accent = accentFor(vegOnly);

  const tip = route.params?.tip ?? 0;
  const vegFleet = route.params?.vegFleet ?? false;

  const [method, setMethod] = useState(DEFAULT_METHOD_ID);

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

  const bill = billFor(cart, { tip });
  const restaurantName = cart.restaurantName;

  // Nothing is charged here — there's no payments endpoint yet, so the chosen
  // instrument is where the handoff would happen. The order is confirmed and
  // the cart emptied, which is what paying means from this screen's side.
  const pay = () => {
    // The checkout screens come off the stack with the cart: going back from a
    // confirmation has to land on the feed, not on a payment screen for an order
    // that has already been paid for.
    //
    // The reset goes first. Emptying the cart re-renders this screen, and the
    // guard above would answer that render with "nothing left to pay for" —
    // a flash of the empty state over an order that just succeeded. Navigating
    // away first means the screen being emptied is already on its way out.
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "OrderPlaced", params: { restaurantName, vegFleet } },
      ],
    });

    clearCart();
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
              payLabel={`Pay ${formatAmount(bill.toPay)}`}
              onToggle={() => toggleGroup(group.id)}
              onSelect={setMethod}
              onPay={pay}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
