import { Pressable, View } from "react-native";
import { Home, Package, User, Wallet } from "lucide-react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";

import { cn } from "@/lib/utils";
import Text from "@/components/ui/Text";
import { mockPartner } from "@/mocks/fixtures";

// A veg-fleet partner only ever sees veg orders (see FleetBadgeInfo — "Non-veg
// order offers will never appear"), so which incoming-order screen the Orders
// tab opens has to match the signed-in partner's fleetType, not be hardcoded.
const ORDERS_ROUTE = mockPartner.fleetType === "veg" ? "OrdersIncomingVeg" : "OrdersIncomingStandard";

const ITEMS = [
  { route: "HomeOffline", label: "Home", icon: Home },
  { route: ORDERS_ROUTE, label: "Orders", icon: Package },
  { route: "Earnings", label: "Earn", icon: Wallet },
  { route: "Profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const currentRoute = useNavigationState((state) => state.routes[state.index]?.name);

  return (
    <View className="h-20 w-full flex-row border-t border-border bg-card">
      {ITEMS.map(({ route, label, icon: Icon }) => {
        const isActive = currentRoute === route;
        const color = isActive ? "#ff5f00" : "#999999";
        return (
          <Pressable
            key={route}
            onPress={() => navigation.navigate(route)}
            className="flex-1 items-center justify-center gap-1"
          >
            <Icon size={18} color={color} />
            <Text
              className={cn("text-xs", isActive ? "font-jakarta-semibold" : "font-jakarta-medium")}
              style={{ color }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
