import { ScrollView, View } from "react-native";

import { useFeed } from "@/context/FeedContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import PageHeader from "@/components/customer/PageHeader";
import OrderHistoryCard from "@/components/orders/OrderHistoryCard";
import { ORDER_HISTORY } from "@/data/orders";
import { accentFor } from "@/lib/accent";

const SCROLL_PADDING = 32;

// Figma "28 · Order history". Everything already delivered, newest first —
// deliberately not the order still on the road, which lives on the tracking
// screens and would sit in a list of finished things claiming to be one.
//
// Reordering opens the storefront rather than refilling the cart: prices and
// availability move between orders, and the menu is where the app already
// enforces one restaurant at a time.
export default function OrderHistory({ navigation }) {
  const { vegOnly } = useFeed();
  const accent = accentFor(vegOnly);

  return (
    <Screen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Order history" />

        {ORDER_HISTORY.length ? (
          <View className="mt-6 gap-4 px-5">
            {ORDER_HISTORY.map((order) => (
              <OrderHistoryCard
                key={order.id}
                order={order}
                accent={accent}
                onPress={() => navigation.navigate("OrderDetails", { orderId: order.id })}
                onReorder={() =>
                  navigation.navigate("Menu", { restaurantName: order.restaurantName })
                }
              />
            ))}
          </View>
        ) : (
          <Text className="mt-16 px-8 text-center font-jakarta text-[17px] leading-[24px] text-muted-foreground">
            Your delivered orders will show up here.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
