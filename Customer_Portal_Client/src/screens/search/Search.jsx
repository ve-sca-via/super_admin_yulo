import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { useFeed } from "@/context/FeedContext";
import { useRecentSearches, usePopularSearches, useTypeahead, useAddRecentSearch } from "@/hooks/useSearch";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import StickyCartBar from "@/components/home/StickyCartBar";
import VegModeBanner from "@/components/home/VegModeBanner";
import PopularSearchGrid from "@/components/search/PopularSearchGrid";
import RecentSearchList from "@/components/search/RecentSearchList";
import SearchSuggestionList from "@/components/search/SearchSuggestionList";
import SearchTopBar from "@/components/search/SearchTopBar";
import { ActivityIndicator } from "react-native";

const cartRestaurant = require("@/assets/home/cart-restaurant-avatar.png");
const dishBiryani = require("@/assets/home/dish-biryani.png");
const categoryBiryani = require("@/assets/home/category-biryani.png");
const categoryButterChicken = require("@/assets/home/category-butter-chicken.png");
const categoryVegThali = require("@/assets/home/category-veg-thali.png");
const categoryPizza = require("@/assets/home/category-pizza.png");

// The design lists five suggestions before the card stops growing.
const MAX_SUGGESTIONS = 5;

// Placeholder catalogue matching the Figma frames, filtered client-side. Swap
// for a `src/api/client` autocomplete query once the search endpoint lands.
const DISH_CATALOGUE = [
  { id: "gosht", label: "Gosht", type: "Dish", image: dishBiryani },
  { id: "ghee-laddu", label: "Ghee Laddu", type: "Dish", image: categoryButterChicken },
  { id: "ghee-sweets", label: "Ghee Sweets", type: "Dish", image: categoryVegThali },
  { id: "gatte", label: "Gatte", type: "Dish", image: categoryPizza },
  { id: "ghar-ka-khana", label: "Ghar Ka Khana", type: "Dish", image: dishBiryani, offer: true },
  { id: "biryani", label: "Biryani", type: "Dish", image: categoryBiryani },
  { id: "butter-chicken", label: "Butter Chicken", type: "Dish", image: categoryButterChicken },
  { id: "paneer-tikka", label: "Paneer Tikka", type: "Dish", image: categoryButterChicken },
  { id: "pizza", label: "Pizza", type: "Dish", image: categoryPizza },
  { id: "veg-thali", label: "Veg Thali", type: "Dish", image: categoryVegThali },
];

// `vegLabel` swaps a tile's copy instead of dropping it, so the grid keeps its
// three-column shape when veg mode is on — that's how frames 09 and 10 differ.
const POPULAR_SEARCHES = [
  { id: "biryani", label: "Biryani", image: categoryBiryani },
  { id: "chicken", label: "Chicken", vegLabel: "Paneer", image: categoryButterChicken },
  { id: "north-indian", label: "North Indian", image: categoryVegThali },
  { id: "veg-meal", label: "Veg meal" },
  { id: "pizza", label: "Pizza", image: categoryPizza },
  { id: "sandwich", label: "Sandwich" },
  { id: "paneer", label: "Paneer" },
  { id: "dosa", label: "Dosa" },
  { id: "noodles", label: "Noodles" },
  { id: "rolls", label: "Rolls" },
  { id: "thali", label: "Thali", image: dishBiryani },
  { id: "cakes", label: "Cakes" },
];

function Heading({ children, className }) {
  return (
    <Text className={cn("px-6 font-jakarta-bold text-[22px] leading-[30px] text-foreground", className)}>
      {children}
    </Text>
  );
}

export default function Search({ navigation }) {
  const { cart, clearCart, vegOnly } = useFeed();

  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const searching = trimmed.length > 0;

  const { data: recentSearchesData } = useRecentSearches();
  const { data: popularSearchesData } = usePopularSearches(vegOnly);
  const { data: typeaheadData, isLoading: isLoadingTypeahead } = useTypeahead(trimmed);
  const addRecentSearch = useAddRecentSearch();

  const suggestions = useMemo(() => {
    if (!typeaheadData?.results) return [];
    return typeaheadData.results.map(res => ({
      id: res.id || res._id,
      label: res.name,
      type: res.type === "restaurant" ? "Restaurant" : "Dish",
      image: res.thumbnailUrl ? { uri: res.thumbnailUrl } : (res.type === "restaurant" ? cartRestaurant : dishBiryani),
      offer: false,
    })).slice(0, MAX_SUGGESTIONS);
  }, [typeaheadData]);

  const popular = useMemo(() => {
    if (!popularSearchesData) return [];
    return popularSearchesData.map(item => ({
      id: item._id || item.query, // Fallback if API gives strings
      label: item.query || item,
      image: categoryBiryani // Add fallback image if none provided by API
    }));
  }, [popularSearchesData]);

  const recentSearches = recentSearchesData || [];

  const submitSearch = (term) => {
    const value = term.trim();
    if (!value) return;

    addRecentSearch.mutate(value);
    navigation?.navigate("SearchResults", { query: value });
  };

  return (
    <Screen edges={["top", "bottom"]}>
      {vegOnly ? (
        <View className="px-2 pb-3 pt-1">
          <VegModeBanner className="w-full justify-center" />
        </View>
      ) : (
        <View className="pt-2" />
      )}

      <SearchTopBar
        value={query}
        onChangeText={setQuery}
        onSubmit={() => submitSearch(query)}
        vegOnly={vegOnly}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cart ? 120 : 40 }}
      >
        {searching ? (
          <View className="mt-4">
            {isLoadingTypeahead ? (
              <ActivityIndicator size="small" color="#FF5E00" className="mt-5" />
            ) : (
              <SearchSuggestionList
                items={suggestions}
                matchLength={trimmed.length}
                vegOnly={vegOnly}
                onSelect={(dish) => {
                  setQuery(dish.label);
                  submitSearch(dish.label);
                }}
              />
            )}
          </View>
        ) : (
          <>
            <Heading className="mt-8">Recent searches</Heading>
            <View className="mt-3">
              <RecentSearchList
                items={recentSearches}
                onSelect={(term) => {
                  setQuery(term);
                  submitSearch(term);
                }}
              />
            </View>

            <Heading className="mt-8">Popular right now</Heading>
            <View className="mt-4">
              <PopularSearchGrid
                items={popular}
                onSelect={(item) => {
                  setQuery(item.label);
                  submitSearch(item.label);
                }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Hidden while suggestions are up — that's where the keyboard sits. */}
      {cart && !searching ? (
        <View className="absolute inset-x-[7px] bottom-2">
          <StickyCartBar
            restaurantName={cart.restaurantName}
            restaurantImage={cartRestaurant}
            itemCount={cart.itemCount}
            vegOnly={vegOnly}
            onViewMenu={() => navigation?.navigate("Menu", { restaurantName: cart.restaurantName })}
            onViewCart={() => navigation?.navigate("Cart")}
            onDismiss={clearCart}
          />
        </View>
      ) : null}
    </Screen>
  );
}
