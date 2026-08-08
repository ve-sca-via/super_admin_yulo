import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { useFeed } from "@/context/FeedContext";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import DiscardCartDialog from "@/components/cart/DiscardCartDialog";
import RestaurantCardLarge from "@/components/home/RestaurantCardLarge";
import SectionHeading from "@/components/home/SectionHeading";
import StickyCartBar from "@/components/home/StickyCartBar";
import { VEG_SCOPES } from "@/components/home/VegModePopover";
import SearchFilterChips from "@/components/search/SearchFilterChips";
import SearchTopBar from "@/components/search/SearchTopBar";
import { useSearchResults } from "@/hooks/useSearch";
import { ActivityIndicator } from "react-native";

const cartRestaurant = require("@/assets/home/cart-restaurant-avatar.png");

export default function SearchResults({ navigation, route }) {
  // Only the search term is this screen's own — veg mode, its scope, the cart
  // and the favourite hearts are the feed's, shared through FeedContext so a
  // heart toggled here is still lit when the customer goes back.
  const query = route?.params?.query ?? "";
  const { cart, clearCart, favourites, toggleFavourite, vegOnly, vegScope } = useFeed();

  // Arriving with "pure veg restaurants only" already applied lights the
  // matching chip, so the rail never disagrees with the list under it.
  const [filters, setFilters] = useState(() =>
    vegOnly && vegScope === VEG_SCOPES.PURE_VEG ? { "pure-veg": true } : {},
  );

  const toggleFilter = (id) => setFilters((current) => ({ ...current, [id]: !current[id] }));

  // The single-restaurant cart rule holds wherever a storefront can be opened,
  // so the results list answers a card tap the same way the home feed does.
  const [pendingRestaurant, setPendingRestaurant] = useState(null);

  const openMenu = (restaurant) => navigation?.navigate("Menu", { restaurantId: restaurant.id, restaurantName: restaurant.name });

  const openRestaurant = (restaurant) => {
    if (cart && restaurant.name !== cart.restaurantName) {
      setPendingRestaurant(restaurant);
      return;
    }
    openMenu(restaurant);
  };

  const discardCart = () => {
    const next = pendingRestaurant;
    clearCart();
    setPendingRestaurant(null);
    if (next) openMenu(next);
  };

  const { data: searchResponse, isLoading } = useSearchResults(query, filters, vegOnly);

  const results = useMemo(() => {
    if (!searchResponse?.data) return []; // Access data array from response if paginated
    // Fallback if the response is just the array
    const list = Array.isArray(searchResponse) ? searchResponse : searchResponse.data;
    
    return list.map(res => ({
      ...res,
      id: res._id,
      image: cartRestaurant, // Map real images later
      rating: res.avgRating?.toString() || "New",
      deliveryTime: "30 min",
      pureVeg: res.isPureVeg,
    }));
  }, [searchResponse]);

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="pt-2" />

      <SearchTopBar
        value={query}
        vegOnly={vegOnly}
        // Editing the term is the search screen's job — go back to it.
        onPressField={() => navigation?.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cart ? 120 : 40 }}
      >
        {/* The field keeps the term as typed; the heading quotes it back
            lower-cased, the way the frames do. */}
        <Text className="mt-5 px-6 font-jakarta-bold text-[20px] leading-[28px] text-foreground">
          Showing results for “{query.toLowerCase()}”
        </Text>

        <View className="mt-4">
          <SearchFilterChips
            selected={filters}
            vegOnly={vegOnly}
            onToggle={toggleFilter}
            // No filter sheet exists yet, so the tile is inert for now.
            onOpenFilters={() => {}}
          />
        </View>

        <SectionHeading className="mt-5 px-6">All restaurants</SectionHeading>

        {isLoading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator size="large" color="#FF5E00" />
          </View>
        ) : results.length ? (
          <View className="mt-3 gap-4 px-6">
            {results.map((restaurant) => (
              <RestaurantCardLarge
                key={restaurant.id}
                restaurant={restaurant}
                favourite={!!favourites[restaurant.id] || restaurant.isFavorited}
                ratingTone="soft"
                onToggleFavourite={() => toggleFavourite(restaurant.id)}
                onPress={() => openRestaurant(restaurant)}
              />
            ))}
          </View>
        ) : (
          <Text className="mt-6 px-6 font-jakarta-medium text-[14px] leading-[20px] text-muted-foreground">
            No restaurants match these filters.
          </Text>
        )}
      </ScrollView>

      <DiscardCartDialog
        visible={!!pendingRestaurant}
        restaurantName={cart?.restaurantName}
        onKeep={() => setPendingRestaurant(null)}
        onDiscard={discardCart}
      />

      {cart ? (
        <View className="absolute inset-x-[7px] bottom-2">
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
    </Screen>
  );
}
