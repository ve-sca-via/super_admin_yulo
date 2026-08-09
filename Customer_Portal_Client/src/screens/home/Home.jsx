import { useMemo, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import useResponsive from "@/hooks/useResponsive";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import DiscardCartDialog from "@/components/cart/DiscardCartDialog";
import CategorySwitcher from "@/components/home/CategorySwitcher";
import DishCategoryRow from "@/components/home/DishCategoryRow";
import HomeBottomNav from "@/components/home/HomeBottomNav";
import HomeFeedSkeleton from "@/components/home/HomeFeedSkeleton";
import HomeHeader from "@/components/home/HomeHeader";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import RestaurantCardLarge from "@/components/home/RestaurantCardLarge";
import RestaurantCardSmall from "@/components/home/RestaurantCardSmall";
import SectionHeading from "@/components/home/SectionHeading";
import StickyCartBar from "@/components/home/StickyCartBar";
import VegModeBanner from "@/components/home/VegModeBanner";
import VegModePopover from "@/components/home/VegModePopover";
import { enter } from "@/lib/motion";
import { toRestaurantCard } from "@/lib/restaurant";

const goldBackdrop = require("@/assets/home/promo-gold-backdrop.png");
const firstOrderBanner = require("@/assets/home/first-order-offer-banner.png");
const cartRestaurant = require("@/assets/home/cart-restaurant-avatar.png");
const dishBiryani = require("@/assets/home/dish-biryani.png");

// Stand-in for a quick-filter chip the feed returned without an icon.
const categoryBiryani = require("@/assets/home/category-biryani.png");

// The gold confetti art sits behind the header, the category tiles, the search
// bar and the promo banner — 381px tall in the 390-wide Figma frame.
const BACKDROP_HEIGHT = 381;
const BANNER_HEIGHT = 167;

function RestaurantRow({ data, ratingTone, onSelect }) {
  const { size, gutter } = useResponsive();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: size(13), paddingHorizontal: gutter }}
    >
      {data.map((restaurant, index) => (
        <Animated.View key={restaurant.id} entering={enter(FadeIn, { index })}>
          <RestaurantCardSmall
            restaurant={restaurant}
            ratingTone={ratingTone}
            onPress={() => onSelect?.(restaurant)}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

export default function Home({ navigation }) {
  const { gutter } = useResponsive();
  const { deliveryLocation } = useCustomerAuth();
  // Veg mode, the cart and the favourite hearts are shared with the search
  // screens, so they live in FeedContext rather than here — see its header.
  const { cart, clearCart, isFavourite, toggleFavourite, vegOnly, vegScope, applyVegScope } =
    useFeed();

  const [category, setCategory] = useState("food");
  const [tab, setTab] = useState("delivery");

  // The restaurant the customer is trying to switch to while a cart is open —
  // set only while the discard prompt is up.
  const [pendingRestaurant, setPendingRestaurant] = useState(null);

  // Hides the summary bar without throwing the order away.
  const [cartBarDismissed, setCartBarDismissed] = useState(false);

  const [vegAnchor, setVegAnchor] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const openMenu = (restaurant) => navigation?.navigate("Menu", { restaurantId: restaurant.id, restaurantName: restaurant.name });

  // A cart from another storefront has to be discarded before the customer can
  // open a second one — everything else goes straight to the menu. Matched on id
  // rather than name: two storefronts can share a name, and the cart identifies
  // its restaurant by id.
  const openRestaurant = (restaurant) => {
    if (cart && String(restaurant.id) !== String(cart.restaurantId)) {
      setPendingRestaurant(restaurant);
      return;
    }
    openMenu(restaurant);
  };

  // Discarding is only ever reached from the prompt, so it resumes the tap that
  // raised it rather than dropping the customer back on the feed.
  const discardCart = async () => {
    const next = pendingRestaurant;
    setPendingRestaurant(null);
    try {
      await clearCart();
    } catch {
      // The menu still opens — the add itself will raise the conflict again,
      // which is where the customer can act on it.
    }
    if (next) openMenu(next);
  };

  const openVegPopover = (anchor) => {
    setVegAnchor(anchor);
    setPopoverOpen(true);
  };

  const handleApplyVegScope = (scope) => {
    setPopoverOpen(false);
    applyVegScope(scope);
  };

  const { data: feedData, isLoading, isError, refetch, isRefetching } = useHomeFeed();

  const dishCategories = useMemo(
    () =>
      (feedData?.quickFilterChips ?? []).map((chip, index) => ({
        id: `chip-${index}`,
        label: chip.label,
        image: chip.iconUrl ? { uri: chip.iconUrl } : categoryBiryani,
        // Veg mode already filtered what came back, so every chip under it is veg.
        veg: vegOnly,
        query: chip.queryParam ?? chip.label,
      })),
    [feedData, vegOnly],
  );

  // `recommendedItems` are dishes, not storefronts — tapping one has to open the
  // restaurant that serves it, which is what `restaurantId` is carried through for.
  const recommendedForYou = useMemo(
    () =>
      (feedData?.recommendedItems ?? []).map((item) => ({
        id: item.restaurantId,
        itemId: item._id,
        name: item.name,
        image: item.image ? { uri: item.image } : dishBiryani,
        offer: `₹${item.effectivePrice}`,
        veg: item.foodType === "veg",
        rating: "New",
      })),
    [feedData],
  );

  const recommendedRestaurants = useMemo(
    () =>
      (feedData?.recommendedRestaurants ?? []).map((restaurant) => ({
        ...toRestaurantCard(restaurant, { fallbackImage: cartRestaurant }),
        veg: restaurant.isPureVeg,
      })),
    [feedData],
  );

  const nearbyRestaurants = useMemo(
    () =>
      (feedData?.nearbyRestaurants ?? []).map((restaurant) =>
        toRestaurantCard(restaurant, { fallbackImage: cartRestaurant }),
      ),
    [feedData],
  );

  const ratingTone = vegOnly ? "veg" : "default";

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        // A feed of nearby restaurants goes stale as the customer moves — pulling
        // to refresh is the gesture they'll reach for, on a screen that otherwise
        // has no way to ask for fresh data.
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5E00" />
        }
      >
        <View>
          <Image
            source={goldBackdrop}
            style={{ position: "absolute", left: 0, top: 0, width: "100%", height: BACKDROP_HEIGHT }}
            resizeMode="cover"
          />

          <HomeHeader
            address={deliveryLocation?.label ?? "Set your delivery address"}
            onPressAddress={() => navigation?.navigate("Location")}
            onPressProfile={() => navigation?.navigate("Profile")}
          />

          <View style={{ paddingHorizontal: gutter }} className="mt-3">
            <CategorySwitcher value={category} onChange={setCategory} />
          </View>

          <View style={{ paddingHorizontal: gutter }} className="mt-3">
            <HomeSearchBar
              vegOnly={vegOnly}
              onPressVeg={openVegPopover}
              onPressField={() => navigation?.navigate("Search")}
            />
          </View>

          <Image
            source={firstOrderBanner}
            style={{ marginTop: 6, width: "100%", height: BANNER_HEIGHT }}
            resizeMode="contain"
          />
        </View>

        {vegOnly ? (
          <Animated.View
            entering={enter(FadeInDown)}
            style={{ paddingHorizontal: gutter }}
            className="mt-4"
          >
            <VegModeBanner />
          </Animated.View>
        ) : null}

        {isLoading ? (
          <HomeFeedSkeleton />
        ) : isError ? (
          <Animated.View
            entering={enter(FadeIn)}
            className="mt-20 items-center justify-center gap-2 px-10"
          >
            <Text className="text-center font-jakarta-bold text-[17px] leading-[24px] text-foreground">
              Couldn't load restaurants
            </Text>
            <Text className="text-center font-jakarta text-[14px] leading-[20px] text-muted-foreground">
              Check your connection and pull down to try again.
            </Text>
          </Animated.View>
        ) : (
          <>
            {dishCategories.length > 0 && (
              <>
                <SectionHeading className="ml-5 mt-9">What’s on your mind?</SectionHeading>
                <View className="mt-1.5">
                  <DishCategoryRow
                    items={dishCategories}
                    onSelect={(item) =>
                      navigation?.navigate("SearchResults", { query: item.query })
                    }
                  />
                </View>
              </>
            )}

            {recommendedForYou.length > 0 && (
              <>
                <SectionHeading className="ml-5 mt-8">Recommended for you</SectionHeading>
                <View className="mt-2">
                  <RestaurantRow data={recommendedForYou} ratingTone={ratingTone} onSelect={openRestaurant} />
                </View>
              </>
            )}

            {recommendedRestaurants.length > 0 && (
              <>
                <SectionHeading className="ml-5 mt-6">Recommended restaurants</SectionHeading>
                <View className="mt-2">
                  <RestaurantRow
                    data={recommendedRestaurants}
                    ratingTone={ratingTone}
                    onSelect={openRestaurant}
                  />
                </View>
              </>
            )}

            <SectionHeading className="ml-[31px] mt-6">Restaurants near you</SectionHeading>
            {nearbyRestaurants.length ? (
              <View style={{ paddingHorizontal: gutter }} className="mt-1.5 gap-4">
                {nearbyRestaurants.map((restaurant, index) => {
                  const favourite = isFavourite(restaurant.id, restaurant.isFavorited);

                  return (
                    // The nearby list is the one part of the feed a customer
                    // actually reads down, so its cards rise in sequence. The
                    // stagger caps a few rows in — past that they arrive
                    // together rather than making a long list feel slow.
                    <Animated.View key={restaurant.id} entering={enter(FadeInDown, { index })}>
                      <RestaurantCardLarge
                        restaurant={restaurant}
                        favourite={favourite}
                        ratingTone={ratingTone}
                        onToggleFavourite={() => toggleFavourite(restaurant.id, favourite)}
                        onPress={() => openRestaurant(restaurant)}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <Text
                style={{ paddingHorizontal: gutter }}
                className="mt-3 font-jakarta text-[14px] leading-[20px] text-muted-foreground"
              >
                No restaurants deliver to this address yet. Try another location.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <VegModePopover
        visible={popoverOpen}
        anchor={vegAnchor}
        value={vegScope}
        onApply={handleApplyVegScope}
        // No dietary-preferences screen exists yet, so this just closes for now.
        onMoreSettings={() => setPopoverOpen(false)}
        onDismiss={() => setPopoverOpen(false)}
      />

      <DiscardCartDialog
        visible={!!pendingRestaurant}
        restaurantName={cart?.restaurantName}
        onKeep={() => setPendingRestaurant(null)}
        onDiscard={discardCart}
      />

      {/* The bar positions itself rather than sitting inside a wrapper: it owns
          its slide-out, and an exiting animation is skipped if the node that
          unmounts is a plain parent above it. */}
      {cart && !cartBarDismissed ? (
        <StickyCartBar
          className="absolute inset-x-[7px] bottom-[78px]"
          restaurantName={cart.restaurantName}
          restaurantImage={cartRestaurant}
          itemCount={cart.itemCount}
          vegOnly={vegOnly}
          onViewMenu={() => openMenu({ id: cart.restaurantId, name: cart.restaurantName })}
          onViewCart={() => navigation?.navigate("Cart")}
          onDismiss={() => setCartBarDismissed(true)}
        />
      ) : null}

      <View className="absolute inset-x-4 bottom-2">
        {/* History is a screen of its own, not a second feed — it navigates
            away instead of switching the tile underneath. */}
        <HomeBottomNav
          value={tab}
          onChange={(key) => (key === "history" ? navigation?.navigate("Orders") : setTab(key))}
          // `alert()` is a web global — on a device it's undefined and throws.
          onScan={() =>
            Alert.alert("Scan to order", "QR scanning isn't available yet — it's coming soon.")
          }
        />
      </View>
    </Screen>
  );
}
