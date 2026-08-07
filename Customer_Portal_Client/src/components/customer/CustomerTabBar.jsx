import { Pressable, View } from "react-native";
import { Clock, House, Search, ShoppingBag, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "@/components/ui/Text";
import { ACCENTS } from "@/lib/accent";
import { cn } from "@/lib/utils";

// The docked five-destination bar, as distinct from home's floating
// delivery/history pill: that one switches a feed in place, this one is app
// navigation and every tab is a route. It's drawn flush to the bottom edge, so
// it carries the safe-area inset itself.
const TABS = [
  { key: "home", label: "Home", Icon: House, route: "Home" },
  { key: "search", label: "Search", Icon: Search, route: "Search" },
  { key: "cart", label: "Cart", Icon: ShoppingBag, route: "Cart" },
  { key: "orders", label: "Orders", Icon: Clock, route: "Orders" },
  { key: "profile", label: "Profile", Icon: User, route: "Profile" },
];

export default function CustomerTabBar({ navigation, active, accent = ACCENTS.default }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="w-full flex-row items-start border-t border-border bg-card pt-2.5"
    >
      {TABS.map(({ key, label, Icon, route }) => {
        const selected = key === active;

        return (
          <Pressable
            key={key}
            onPress={() => navigation?.navigate(route)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center gap-1"
          >
            <Icon size={22} color={selected ? accent.icon : "#666666"} />
            <Text
              style={selected ? { color: accent.icon } : undefined}
              className={cn(
                "text-[11px] leading-[15px]",
                selected ? "font-jakarta-semibold" : "font-jakarta-medium text-muted-foreground",
              )}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
