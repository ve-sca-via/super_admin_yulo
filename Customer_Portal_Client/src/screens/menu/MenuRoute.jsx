import PureVegMenu from "@/screens/menu/PureVegMenu";
import RestaurantMenu from "@/screens/menu/RestaurantMenu";
import { LAYOUTS, menuFor } from "@/data/menu";

// Every card on the feed navigates to "Menu" with a storefront name, and the
// storefront decides which of the two menu layouts it's served through. Doing
// that here rather than inside either screen keeps the callers ignorant of the
// split and leaves each screen a plain component that renders the menu it's
// handed.
export default function MenuRoute({ navigation, route }) {
  const restaurantName = route?.params?.restaurantName;
  const menu = menuFor(restaurantName);

  if (menu.layout === LAYOUTS.COMPACT) {
    return <PureVegMenu navigation={navigation} menu={menu} />;
  }

  return (
    <RestaurantMenu
      navigation={navigation}
      menu={menu}
      restaurantName={restaurantName ?? menu.name}
    />
  );
}
