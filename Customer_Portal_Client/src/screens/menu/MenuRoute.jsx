import { ActivityIndicator, View } from "react-native";
import PureVegMenu from "@/screens/menu/PureVegMenu";
import RestaurantMenu from "@/screens/menu/RestaurantMenu";
import { LAYOUTS } from "@/data/menu";
import { useRestaurantMenu } from "@/hooks/useRestaurantMenu";

export default function MenuRoute({ navigation, route }) {
  const restaurantId = route?.params?.restaurantId;
  const routeRestaurantName = route?.params?.restaurantName;

  const { restaurant, menuSections, isLoading } = useRestaurantMenu(restaurantId);

  if (isLoading || !restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF5E00" />
      </View>
    );
  }

  // Construct menu object expected by screens
  const menu = {
    id: restaurant._id,
    name: restaurant.name,
    hero: {
      image: null, // placeholder
      cuisines: restaurant.cuisines || ["Various"],
      rating: restaurant.avgRating || "New",
      ratingCount: restaurant.ratingCount || "0",
      deliveryTime: "30-40 min",
      distance: "2.5 km",
      offers: [],
    },
    sections: menuSections,
    // we use layout config from backend or fallback to restaurant property
    layout: restaurant.isPureVeg ? LAYOUTS.COMPACT : LAYOUTS.EXPANDED,
  };

  if (menu.layout === LAYOUTS.COMPACT) {
    return <PureVegMenu navigation={navigation} menu={menu} restaurantName={menu.name} />;
  }

  return (
    <RestaurantMenu
      navigation={navigation}
      menu={menu}
      restaurantName={menu.name}
    />
  );
}
