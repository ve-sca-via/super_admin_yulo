import { ScrollView, View } from "react-native";

import { useFeed } from "@/context/FeedContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import PageHeader from "@/components/customer/PageHeader";
import OrderHistoryCard from "@/components/orders/OrderHistoryCard";
import { useOrders, useReorder } from "@/hooks/useOrders";
import { accentFor } from "@/lib/accent";
import { ActivityIndicator, Alert } from "react-native";

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

  const { data: response, isLoading } = useOrders();
  const reorder = useReorder();

  const handleReorder = (orderId, restaurantId, restaurantName) => {
    reorder.mutate(orderId, {
      onSuccess: (data) => {
        if (data?.removedItems?.length) {
          Alert.alert(
            "Some items removed",
            `Items removed: ${data.removedItems.map(i => i.name).join(", ")}`
          );
        }
        // Then jump to Cart or Menu
        navigation.navigate("Menu", { restaurantId, restaurantName });
      },
      onError: (err) => {
        if (err.code === "CART_RESTAURANT_CONFLICT") {
          // You could show a dialog, but for now navigate to Menu so they see the dialog there
          navigation.navigate("Menu", { restaurantId, restaurantName });
        } else {
          Alert.alert("Reorder failed", err.message);
        }
      }
    });
  };

  const orders = response || [];

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Order history" />

        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color={accent.icon} />
          </View>
        ) : orders.length ? (
          <View className="mt-6 gap-4 px-5">
            {orders.map((order) => (
              <OrderHistoryCard
                key={order._id || order.id}
                order={{
                  ...order,
                  id: order._id || order.id,
                  date: new Date(order.createdAt).toLocaleDateString(),
                  itemCount: order.items?.length || 0,
                  total: order.grandTotal || 0,
                }}
                accent={accent}
                onPress={() => navigation.navigate("OrderDetails", { orderId: order._id || order.id })}
                onReorder={() => handleReorder(order._id || order.id, order.restaurantId, order.restaurantName)}
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
