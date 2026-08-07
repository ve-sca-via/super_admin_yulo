import { useEffect, useState } from "react";
import { View } from "react-native";
import { Check, Search, TriangleAlert } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFeed } from "@/context/FeedContext";
import AppBar from "@/components/customer/AppBar";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import { TRACKED_ORDER } from "@/data/orders";
import { accentFor } from "@/lib/accent";

// How long the choice stands before the safer answer is taken for the customer.
const AUTO_DEFAULT_SECONDS = 180;

// How long the search runs before a veg-only partner is assigned. Placeholder
// for the dispatcher's socket — the assignment arrives from their side, not from
// anything the customer does here, which is why waiting is all this screen asks
// of them.
const ASSIGNMENT_SECONDS = 8;

function clock(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

// Figma "No pure veg fleet partner available". The veg-only fleet is a request,
// not a guarantee — at some hours nobody carrying the separate bag is free, and
// this is the screen that admits it rather than quietly assigning a shared bag.
//
// Two things make it fair to the customer. The fallback is stated before it's
// offered ("a sanitised, empty bag with no other orders inside"), so "send any
// available partner" is a known quantity rather than a shrug. And the timeout
// resolves to *keep waiting*: the customer asked for the veg fleet, so silence
// has to mean the request stands, never that it was dropped because nobody
// answered a prompt.
export default function FleetSearch({ navigation, route }) {
  const { vegOnly } = useFeed();
  const accent = accentFor(vegOnly);
  const insets = useSafeAreaInsets();

  const restaurantName = route.params?.restaurantName ?? "your order";

  const [waiting, setWaiting] = useState(false);
  const [remaining, setRemaining] = useState(AUTO_DEFAULT_SECONDS);
  const [partner, setPartner] = useState(null);

  // The countdown only runs while the prompt is up — once the customer has
  // answered, or the clock has answered for them, there's nothing left to
  // default to.
  useEffect(() => {
    if (waiting) return undefined;

    const timer = setInterval(() => setRemaining((current) => Math.max(current - 1, 0)), 1000);

    return () => clearInterval(timer);
  }, [waiting]);

  useEffect(() => {
    if (remaining === 0) setWaiting(true);
  }, [remaining]);

  // The search only becomes a real wait once the customer has settled into it —
  // before that the screen is still asking them a question, and answering it
  // with an assignment mid-sentence would take the choice away.
  useEffect(() => {
    if (!waiting) return undefined;

    const timer = setTimeout(() => setPartner(TRACKED_ORDER.partner), ASSIGNMENT_SECONDS * 1000);

    return () => clearTimeout(timer);
  }, [waiting]);

  // Dropping the veg-only requirement hands the order to the ordinary tracking
  // screen — a partner from the general fleet has a live position like any
  // other, so there's nothing special left to show.
  const sendAnyPartner = () => navigation.navigate("Tracking", { restaurantName });

  // The veg-only partner, once there is one. Their position isn't streaming yet
  // — they were assigned by hand — so tracking opens on the screen that doesn't
  // need a map, with the bag named on their row.
  const trackVegFleet = () =>
    navigation.navigate("FleetTracking", { restaurantName, vegFleet: true });

  return (
    <Screen edges={["top"]}>
      <AppBar title={`Your order · ${restaurantName}`} />

      <View className="flex-1 px-5 pt-6">
        <View className="flex-row items-center gap-2.5">
          {partner ? (
            <Check size={20} color="#2E7D32" strokeWidth={2.6} />
          ) : (
            <Search size={20} color="#1A1A1A" strokeWidth={2.2} />
          )}

          <Text className="font-jakarta-medium text-[17px] leading-[24px] text-foreground">
            {partner ? "Veg-Only partner assigned" : "Searching for a Veg-Only partner…"}
          </Text>
        </View>

        {waiting || partner ? null : (
          <View className="mt-6 rounded-2xl border border-warning bg-warning-tint p-5">
            <TriangleAlert size={26} color="#B45309" strokeWidth={2.2} />

            <Text className="mt-3 font-jakarta-bold text-[19px] leading-[26px] text-foreground">
              No Pure Veg Fleet partner available right now.
            </Text>

            <Text className="mt-3 text-center font-jakarta text-[15px] leading-[22px] text-muted-foreground">
              Your order will be kept in a sanitised, empty bag with no other orders inside.
            </Text>
          </View>
        )}

        <View className="mt-5 rounded-2xl bg-[#E4F1E5] px-4 py-3">
          <Text className="font-jakarta text-[15px] leading-[22px] text-[#2E7D32]">
            {partner
              ? `${partner.name} is carrying your order in a veg-only fleet bag. Nothing else is in it.`
              : waiting
                ? "We'll keep looking for a veg-only partner. You don't need to do anything — we'll let you know as soon as one is assigned."
                : "No response yet, so we're continuing the search. You don't need to do anything."}
          </Text>
        </View>

        {/* The wait ended the way the customer asked it to, so the screen hands
            them straight to tracking rather than leaving them on a search that
            has nothing left to find. */}
        {partner ? (
          <Button
            onPress={trackVegFleet}
            size="lg"
            style={{ backgroundColor: accent.icon }}
            className="mt-5 w-full shadow-lg shadow-black/20"
          >
            <Text className="font-jakarta-bold text-[17px] leading-[24px] text-white">
              Track your order
            </Text>
          </Button>
        ) : null}

        {waiting ? null : (
          <Button
            onPress={() => setWaiting(true)}
            size="lg"
            style={{ backgroundColor: accent.icon }}
            className="mt-5 w-full shadow-lg shadow-black/20"
          >
            <Text className="font-jakarta-bold text-[17px] leading-[24px] text-white">
              Keep waiting for a Pure Veg partner
            </Text>
          </Button>
        )}

        {/* Still offered after the wait is chosen: a customer who has watched the
            search run for another ten minutes is allowed to change their mind
            without hunting for the option again. It goes once a veg-only partner
            has the order — swapping them out then would be re-dispatching food
            that is already in a bag. */}
        {partner ? null : (
          <Button
            onPress={sendAnyPartner}
            size="lg"
            variant="secondary"
            style={{ borderColor: accent.icon }}
            className="mt-3 w-full"
          >
            <Text
              style={{ color: accent.icon }}
              className="font-jakarta-bold text-[17px] leading-[24px]"
            >
              Send any available partner
            </Text>
          </Button>
        )}

        {waiting ? null : (
          <Text className="mt-4 text-center font-jakarta text-[14px] leading-[20px] text-muted-foreground">
            Auto-defaults to keep waiting in {clock(remaining)}
          </Text>
        )}
      </View>

      <View style={{ height: insets.bottom }} />
    </Screen>
  );
}
