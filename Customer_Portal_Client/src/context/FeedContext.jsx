import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { VEG_SCOPES } from "@/components/home/VegModePopover";
import { INITIAL_FAVOURITES } from "@/data/restaurants";
import { cartItemCount, cartLineFor } from "@/data/cart";
import { VEG_MENU, findItem } from "@/data/menu";

// Home, Search and SearchResults all render the same feed state — the open
// cart, veg mode and its scope, the favourite hearts, the recent search terms.
// That state used to live in Home and travel to the other two as route params,
// which gave each screen its own copy to edit: dismissing the cart on the
// search screen left Home's copy standing, and a heart toggled in the results
// didn't stick once you went back. One provider, one copy.
//
// Placeholder contents until the cart/discovery endpoints land — swap the seeds
// for `src/api/client` queries then; the shape the screens consume stays.
const FeedContext = createContext(null);

// One restaurant at a time is the rule, which is what makes the discard prompt
// necessary in the first place.
//
// The seeded lines are built from the storefront's real menu rather than written
// out by hand, so the cart can never quote a price the menu disagrees with.
const seedLine = (itemId, quantity) =>
  cartLineFor({ item: findItem(VEG_MENU, itemId), quantity });

const INITIAL_CART = {
  restaurantName: VEG_MENU.name,
  lines: [
    seedLine("paneer-butter-masala", 1),
    seedLine("dal-makhani", 1),
    seedLine("butter-naan", 2),
  ],
};

const INITIAL_RECENT_SEARCHES = ["Biryani near me", "Paneer tikka", "Green Leaf Kitchen"];
const MAX_RECENT_SEARCHES = 3;

// An empty cart is no cart: every surface that reacts to one — the sticky bar,
// the lit tab, the discard rule — asks whether a cart exists, and a cart holding
// nothing would keep all of them switched on with nothing to show.
function withLines(cart, lines) {
  return lines.length ? { ...cart, lines } : null;
}

export function FeedProvider({ children }) {
  const [cart, setCart] = useState(INITIAL_CART);
  const [favourites, setFavourites] = useState(INITIAL_FAVOURITES);
  const [vegOnly, setVegOnly] = useState(false);
  const [vegScope, setVegScope] = useState(VEG_SCOPES.ALL);
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);

  const clearCart = useCallback(() => setCart(null), []);

  // Adding from a second storefront replaces the cart rather than merging into
  // it — one restaurant at a time is the rule. Callers raise the discard prompt
  // before they get here, so reaching this with a foreign cart means the
  // customer already agreed to lose it.
  //
  // A dish already in the cart under the same answers counts up instead of
  // opening a second line (see `cartLineFor` on what "the same" means).
  const addToCart = useCallback(
    (restaurantName, line) =>
      setCart((current) => {
        const lines = current?.restaurantName === restaurantName ? current.lines : [];
        const existing = lines.find((entry) => entry.key === line.key);

        return {
          restaurantName,
          lines: existing
            ? lines.map((entry) =>
                entry.key === line.key
                  ? { ...entry, quantity: entry.quantity + line.quantity }
                  : entry,
              )
            : [...lines, line],
        };
      }),
    [],
  );

  // Counting a line down to zero is how a dish leaves the cart — the checkout
  // row has no separate remove control, the way the design draws it.
  const setLineQuantity = useCallback(
    (key, quantity) =>
      setCart((current) =>
        current
          ? withLines(
              current,
              quantity > 0
                ? current.lines.map((line) => (line.key === key ? { ...line, quantity } : line))
                : current.lines.filter((line) => line.key !== key),
            )
          : current,
      ),
    [],
  );

  const toggleFavourite = useCallback(
    (id) => setFavourites((current) => ({ ...current, [id]: !current[id] })),
    [],
  );

  // Applying while veg mode is already on with the same scope reads as "turn it
  // back off" — the tile is still the on/off affordance in the design.
  const applyVegScope = useCallback(
    (scope) => {
      setVegOnly(!(vegOnly && scope === vegScope));
      setVegScope(scope);
    },
    [vegOnly, vegScope],
  );

  // Newest first, no duplicates, capped at the three rows the design shows.
  const rememberSearch = useCallback(
    (term) =>
      setRecentSearches((current) =>
        [term, ...current.filter((item) => item !== term)].slice(0, MAX_RECENT_SEARCHES),
      ),
    [],
  );

  // The bar, the tab badge and the checkout button all want one number rather
  // than the line list, and deriving it here keeps it from being stored — a
  // stored count is one more thing that can disagree with the lines under it.
  const value = useMemo(
    () => ({
      cart: cart && { ...cart, itemCount: cartItemCount(cart) },
      addToCart,
      setLineQuantity,
      clearCart,
      favourites,
      toggleFavourite,
      vegOnly,
      vegScope,
      applyVegScope,
      recentSearches,
      rememberSearch,
    }),
    [
      cart,
      addToCart,
      setLineQuantity,
      clearCart,
      favourites,
      toggleFavourite,
      vegOnly,
      vegScope,
      applyVegScope,
      recentSearches,
      rememberSearch,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be inside FeedProvider");
  return ctx;
}
