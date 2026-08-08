import { useMemo, useState } from "react";
import { Image, ScrollView, View, ActivityIndicator } from "react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
import { useHomeFeed } from "@/hooks/useHomeFeed";
import Screen from "@/components/ui/Screen";
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
import VegModePopover, { VEG_SCOPES } from "@/components/home/VegModePopover";

const goldBackdrop = require("@/assets/home/promo-gold-backdrop.png");
const firstOrderBanner = require("@/assets/home/first-order-offer-banner.png");
const cartRestaurant = require("@/assets/home/cart-restaurant-avatar.png");
const dishBiryani = require("@/assets/home/dish-biryani.png");

const categoryBiryani = require("@/assets/home/category-biryani.png");
const categoryButterChicken = require("@/assets/home/category-butter-chicken.png");
const categoryVegThali = require("@/assets/home/category-veg-thali.png");
const categoryPizza = require("@/assets/home/category-pizza.png");

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
  const { cart, clearCart, favourites, toggleFavourite, vegOnly, vegScope, applyVegScope } =
    useFeed();

  const [category, setCategory] = useState("food");
  const [tab, setTab] = useState("delivery");

  // The restaurant the customer is trying to switch to while a cart is open —
  // set only while the discard prompt is up.
  const [pendingRestaurant, setPendingRestaurant] = useState(null);

  const [vegAnchor, setVegAnchor] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const openMenu = (restaurant) => navigation?.navigate("Menu", { restaurantId: restaurant.id, restaurantName: restaurant.name });

  // A cart from another storefront has to be discarded before the customer can
  // open a second one — everything else goes straight to the menu.
  const openRestaurant = (restaurant) => {
    if (cart && restaurant.name !== cart.restaurantName) {
      setPendingRestaurant(restaurant);
      return;
    }
    openMenu(restaurant);
  };

  // Discarding is only ever reached from the prompt, so it resumes the tap that
  // raised it rather than dropping the customer back on the feed.
  const discardCart = () => {
    const next = pendingRestaurant;
    clearCart();
    setPendingRestaurant(null);
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

  const { data: feedData, isLoading } = useHomeFeed();

  const dishCategories = useMemo(() => {
    if (!feedData?.quickFilterChips) return [];
    return feedData.quickFilterChips.map((chip, idx) => ({
      id: `chip-${idx}`,
      label: chip.label,
      // fallback to placeholder image if backend provides no iconUrl
      image: chip.iconUrl ? { uri: chip.iconUrl } : categoryBiryani,
      veg: vegOnly // if we're in vegOnly mode, it's implicitly veg
    }));
  }, [feedData, vegOnly]);

  const recommendedForYou = useMemo(() => {
    if (!feedData?.recommendedItems) return [];
    return feedData.recommendedItems.map((item) => ({
      id: item._id,
      name: item.name,
      image: dishBiryani, // Placeholder since items don't typically have thumbnails in this API yet
      offer: `₹${item.effectivePrice}`,
      veg: item.foodType !== "non_veg",
      // Needed by small card format:
      rating: "New",
      deliveryTime: "30 min",
    }));
  }, [feedData]);

  const recommendedRestaurants = useMemo(() => {
    if (!feedData?.recommendedRestaurants) return [];
    return feedData.recommendedRestaurants.map((res) => ({
      id: res._id,
      name: res.name,
      image: cartRestaurant,
      rating: res.avgRating?.toString() || "New",
      deliveryTime: "30 min",
      veg: res.isPureVeg,
    }));
  }, [feedData]);

  const nearbyRestaurants = useMemo(() => {
    if (!feedData?.nearbyRestaurants) return [];
    return feedData.nearbyRestaurants.map((res) => ({
      ...res,
      id: res._id,
      image: cartRestaurant,
    }));
  }, [feedData]);

  const ratingTone = vegOnly ? "veg" : "default";

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
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
        ) : (
          <>
            <SectionHeading className="ml-5 mt-9">What’s on your mind?</SectionHeading>
            <View className="mt-1.5">
              <DishCategoryRow
                items={dishCategories}
                onSelect={(item) => navigation?.navigate("SearchResults", { query: item.label })}
              />
            </View>

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
            <View className="mt-1.5 gap-4 px-6">
              {nearbyRestaurants.map((restaurant) => {
                const isFave = favourites[restaurant.id] ?? restaurant.isFavorited ?? false;
                return (
                  <RestaurantCardLarge
                    key={restaurant.id}
                    restaurant={restaurant}
                    favourite={isFave}
                    ratingTone={ratingTone}
                    onToggleFavourite={() => toggleFavourite(restaurant.id, isFave)}
                    onPress={() => openRestaurant(restaurant)}
                  />
                );
              })}
            </View>
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

      {cart ? (
        <View className="absolute inset-x-[7px] bottom-[78px]">
          <StickyCartBar
            restaurantName={cart.restaurantName}
            restaurantImage={cartRestaurant}
            itemCount={cart.itemCount}
            vegOnly={vegOnly}
            onViewMenu={() => openMenu({ id: cart.restaurantId, name: cart.restaurantName })}
            onViewCart={() => navigation?.navigate("Cart")}
            onDismiss={clearCart}
          />
        </View>
      ) : null}

      <View className="absolute inset-x-4 bottom-2">
        {/* History is a screen of its own, not a second feed — it navigates
            away instead of switching the tile underneath. */}
        <HomeBottomNav
          value={tab}
          onChange={(key) => (key === "history" ? navigation?.navigate("Orders") : setTab(key))}
          onScan={() => alert("QR Scanner coming soon!")}
        />
      </View>
    </Screen>
  );
}
