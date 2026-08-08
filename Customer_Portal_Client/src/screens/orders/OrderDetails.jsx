import { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFeed } from "@/context/FeedContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import PageHeader from "@/components/customer/PageHeader";
import RatingCard from "@/components/orders/RatingCard";
import { formatTotal } from "@/data/orders";
import { accentFor } from "@/lib/accent";
import { useOrderDetails, useReorder, useSubmitReview } from "@/hooks/useOrders";
import { ActivityIndicator, Alert } from "react-native";

// Room under the rating card for the reorder bar.
const SCROLL_PADDING = 140;

// Figma "25 · Order details & rate". Where a finished order ends up: it confirms
// the food arrived, asks the one question worth asking about it, and offers the
// only action left — having it again.
//
// The delivery is stated in green before anything is asked, because a customer
// opening this screen wants confirmation first; a rating prompt above an
// unconfirmed delivery reads as the app asking for a favour before doing its job.
//
// The rating goes nowhere yet — there's no ratings endpoint — so it's held in
// screen state and acknowledged in place. Swap `submit` for a `client.post` when
// that lands; nothing else here changes.
export default function OrderDetails({ navigation, route }) {
  const { vegOnly } = useFeed();
  const accent = accentFor(vegOnly);
  const insets = useSafeAreaInsets();
  
  const orderId = route.params?.orderId;
  const { data: orderResponse, isLoading } = useOrderDetails(orderId);
  const reorder = useReorder();
  const submitReview = useSubmitReview();

  // If order details aren't loaded yet, default to false/null
  const order = orderResponse || {};
  const hasReviewed = !!order.rating;

  const [rating, setRating] = useState(order.rating?.value || 0);
  const [submitted, setSubmitted] = useState(hasReviewed);

  // Sync state if it arrives late
  useEffect(() => {
    if (order.rating?.value) {
      setRating(order.rating.value);
      setSubmitted(true);
    }
  }, [order.rating]);

  const handleSubmitReview = () => {
    submitReview.mutate({ orderId, rating }, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => Alert.alert("Rating failed", err.message)
    });
  };

  const handleReorder = () => {
    reorder.mutate(orderId, {
      onSuccess: (data) => {
        if (data?.removedItems?.length) {
          Alert.alert("Some items removed", `Items removed: ${data.removedItems.map(i => i.name).join(", ")}`);
        }
        navigation.navigate("Menu", { restaurantId: order.restaurantId, restaurantName: order.restaurantName });
      },
      onError: (err) => {
        if (err.code === "CART_RESTAURANT_CONFLICT") {
          navigation.navigate("Menu", { restaurantId: order.restaurantId, restaurantName: order.restaurantName });
        } else {
          Alert.alert("Reorder failed", err.message);
        }
      }
    });
  };

  return (
    <Screen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCROLL_PADDING }}
      >
        <PageHeader title="Order details" />

        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color={accent.icon} />
          </View>
        ) : (
          <View className="mt-6 gap-4 px-5">
            <View className="w-full rounded-[20px] bg-success-tint px-5 py-4">
              <Check size={26} color="#2E7D32" strokeWidth={2.6} />

              <Text className="mt-2 font-jakarta-bold text-[22px] leading-[30px] text-[#2E7D32]">
                Delivered
              </Text>
            </View>

            <RatingCard
              rating={rating}
              submitted={submitted}
              accent={accent}
              note={
                order.vegFleetOptIn
                  ? "Your delivery partner used the veg-only fleet bag for this order"
                  : null
              }
              onRate={setRating}
              onSubmit={handleSubmitReview}
              className="p-5"
            />
          </View>
        )}
      </ScrollView>

      {!isLoading && (
        <View style={{ paddingBottom: insets.bottom + 12 }} className="absolute inset-x-0 bottom-0 px-5 pt-3">
          <Card className="w-full p-5">
            <Text className="font-jakarta-semibold text-[18px] leading-[25px] text-foreground">
              {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"} · {formatTotal(order.grandTotal || 0)}
            </Text>

            <Button
              onPress={handleReorder}
              variant="secondary"
              size="lg"
              style={{ borderColor: accent.icon }}
              className="mt-3 w-full"
              accessibilityLabel={`Reorder from ${order.restaurantName}`}
              disabled={reorder.isPending}
            >
              <Text style={{ color: accent.icon }} className="font-jakarta-bold text-[17px] leading-[24px]">
                {reorder.isPending ? "Reordering..." : "Reorder"}
              </Text>
            </Button>
          </Card>
        </View>
      )}
    </Screen>
  );
}
