import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, View } from "react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import DiscardCartDialog from "@/components/cart/DiscardCartDialog";
import CategorySwitcher from "@/components/home/CategorySwitcher";
import DishCategoryRow from "@/components/home/DishCategoryRow";
import HomeBottomNav from "@/components/home/HomeBottomNav";
import HomeHeader from "@/components/home/HomeHeader";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import RestaurantCardLarge from "@/components/home/RestaurantCardLarge";
import RestaurantCardSmall from "@/components/home/RestaurantCardSmall";
import SectionHeading from "@/components/home/SectionHeading";
import StickyCartBar from "@/components/home/StickyCartBar";
import VegModeBanner from "@/components/home/VegModeBanner";
import VegModePopover from "@/components/home/VegModePopover";
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 13, paddingHorizontal: 24 }}
    >
      {data.map((restaurant) => (
        <RestaurantCardSmall
          key={restaurant.id}
          restaurant={restaurant}
          ratingTone={ratingTone}
          onPress={() => onSelect?.(restaurant)}
        />
      ))}
    </ScrollView>
  );
}

export default function Home({ navigation }) {
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

          <View className="mt-3 px-6">
            <CategorySwitcher value={category} onChange={setCategory} />
          </View>

          <View className="mt-3 px-6">
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
          <View className="mt-4 px-6">
            <VegModeBanner />
          </View>
        ) : null}

        {isLoading ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color="#FF5E00" />
          </View>
        ) : isError ? (
          <View className="mt-20 items-center justify-center gap-2 px-10">
            <Text className="text-center font-jakarta-bold text-[17px] leading-[24px] text-foreground">
              Couldn't load restaurants
            </Text>
            <Text className="text-center font-jakarta text-[14px] leading-[20px] text-muted-foreground">
              Check your connection and pull down to try again.
            </Text>
          </View>
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
              <View className="mt-1.5 gap-4 px-6">
                {nearbyRestaurants.map((restaurant) => {
                  const favourite = isFavourite(restaurant.id, restaurant.isFavorited);

                  return (
                    <RestaurantCardLarge
                      key={restaurant.id}
                      restaurant={restaurant}
                      favourite={favourite}
                      ratingTone={ratingTone}
                      onToggleFavourite={() => toggleFavourite(restaurant.id, favourite)}
                      onPress={() => openRestaurant(restaurant)}
                    />
                  );
                })}
              </View>
            ) : (
              <Text className="mt-3 px-6 font-jakarta text-[14px] leading-[20px] text-muted-foreground">
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

      {cart && !cartBarDismissed ? (
        <View className="absolute inset-x-[7px] bottom-[78px]">
          <StickyCartBar
            restaurantName={cart.restaurantName}
            restaurantImage={cartRestaurant}
            itemCount={cart.itemCount}
            vegOnly={vegOnly}
            onViewMenu={() => openMenu({ id: cart.restaurantId, name: cart.restaurantName })}
            onViewCart={() => navigation?.navigate("Cart")}
            onDismiss={() => setCartBarDismissed(true)}
          />
        </View>
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
