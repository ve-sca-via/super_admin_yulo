import { useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";
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
import { RESTAURANTS, withVegCuisines } from "@/data/restaurants";

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

// Placeholder feed content lifted straight from the Figma frame. Swap for
// `src/api/client` queries once the discovery endpoints land — the `veg` flags
// stand in for the dietary marker those endpoints will carry.
const DISH_CATEGORIES = [
  { id: "biryani", label: "Biryani", image: categoryBiryani, veg: true },
  { id: "butter-chicken", label: "Butter chicken", image: categoryButterChicken, veg: false },
  { id: "veg-thali", label: "Veg Thali", image: categoryVegThali, veg: true },
  { id: "pizzas", label: "Pizzas", image: categoryPizza, veg: true },
  { id: "pizzas-2", label: "Pizzas", image: categoryPizza, veg: true },
];

const RECOMMENDED_FOR_YOU = [
  {
    id: "rfy-1",
    name: "AL Adeeb Biryan",
    image: dishBiryani,
    rating: "4.9",
    deliveryTime: "Delivery in 25-30 min",
    offer: "Chicken Biryani @ 299",
    photoCount: 3,
    veg: true,
  },
  {
    id: "rfy-2",
    name: "AL Adeeb Biryan",
    image: dishBiryani,
    rating: "4.9",
    deliveryTime: "Delivery in 25-30 min",
    photoCount: 3,
    veg: true,
  },
  {
    id: "rfy-3",
    name: "AL Adeeb Biryan",
    image: dishBiryani,
    rating: "4.9",
    deliveryTime: "Delivery in 25-30 min",
    photoCount: 2,
    veg: true,
  },
];

const RECOMMENDED_RESTAURANTS = RECOMMENDED_FOR_YOU.map((item, index) => ({
  ...item,
  id: `rr-${index + 1}`,
}));

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

  const openMenu = (restaurantName) => navigation?.navigate("Menu", { restaurantName });

  // A cart from another storefront has to be discarded before the customer can
  // open a second one — everything else goes straight to the menu.
  const openRestaurant = (restaurant) => {
    if (cart && restaurant.name !== cart.restaurantName) {
      setPendingRestaurant(restaurant);
      return;
    }
    openMenu(restaurant.name);
  };

  // Discarding is only ever reached from the prompt, so it resumes the tap that
  // raised it rather than dropping the customer back on the feed.
  const discardCart = () => {
    const next = pendingRestaurant;
    clearCart();
    setPendingRestaurant(null);
    if (next) openMenu(next.name);
  };

  const openVegPopover = (anchor) => {
    setVegAnchor(anchor);
    setPopoverOpen(true);
  };

  const handleApplyVegScope = (scope) => {
    setPopoverOpen(false);
    applyVegScope(scope);
  };

  const dishCategories = useMemo(
    () => (vegOnly ? DISH_CATEGORIES.filter((item) => item.veg) : DISH_CATEGORIES),
    [vegOnly],
  );

  const recommendedForYou = useMemo(
    () => (vegOnly ? RECOMMENDED_FOR_YOU.filter((item) => item.veg) : RECOMMENDED_FOR_YOU),
    [vegOnly],
  );

  const recommendedRestaurants = useMemo(
    () => (vegOnly ? RECOMMENDED_RESTAURANTS.filter((item) => item.veg) : RECOMMENDED_RESTAURANTS),
    [vegOnly],
  );

  // "All restaurants" keeps every storefront and only narrows the dishes shown
  // inside it, which is why frame 08 still lists Biggy's; "Pure veg restaurants
  // only" is the scope that drops non-veg storefronts from the list.
  const nearbyRestaurants = useMemo(
    () =>
      (vegOnly && vegScope === VEG_SCOPES.PURE_VEG
        ? RESTAURANTS.filter((item) => item.pureVeg)
        : RESTAURANTS
      ).map((item) => withVegCuisines(item, vegOnly)),
    [vegOnly, vegScope],
  );

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

        <SectionHeading className="ml-5 mt-9">What’s on your mind?</SectionHeading>
        <View className="mt-1.5">
          {/* A category tile is a canned search — hand the label to the results
              screen rather than filtering the feed in place. */}
          <DishCategoryRow
            items={dishCategories}
            onSelect={(item) => navigation?.navigate("SearchResults", { query: item.label })}
          />
        </View>

        <SectionHeading className="ml-5 mt-8">Recommended for you</SectionHeading>
        <View className="mt-2">
          <RestaurantRow data={recommendedForYou} ratingTone={ratingTone} onSelect={openRestaurant} />
        </View>

        <SectionHeading className="ml-5 mt-6">Recommended restaurants</SectionHeading>
        <View className="mt-2">
          <RestaurantRow
            data={recommendedRestaurants}
            ratingTone={ratingTone}
            onSelect={openRestaurant}
          />
        </View>

        <SectionHeading className="ml-[31px] mt-6">Restaurants near you</SectionHeading>
        <View className="mt-1.5 gap-4 px-6">
          {nearbyRestaurants.map((restaurant) => (
            <RestaurantCardLarge
              key={restaurant.id}
              restaurant={restaurant}
              favourite={!!favourites[restaurant.id]}
              ratingTone={ratingTone}
              onToggleFavourite={() => toggleFavourite(restaurant.id)}
              onPress={() => openRestaurant(restaurant)}
            />
          ))}
        </View>
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
            onViewMenu={() => openMenu(cart.restaurantName)}
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
        />
      </View>
    </Screen>
  );
}
