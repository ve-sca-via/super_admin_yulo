import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { VEG_SCOPES } from "@/components/home/VegModePopover";
import { INITIAL_FAVOURITES } from "@/data/restaurants";
import { useCart } from "@/hooks/useCart";
import client from "@/api/client";
import { queryClient } from "@/api/queryClient";
import { useCustomerAuth } from "./CustomerAuthContext";

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

// The cart and the browsing preferences around it survive a restart. On a phone
// the OS reclaims a backgrounded app freely, and a cart that emptied itself
// every time that happened would lose a half-built order the customer never
// chose to abandon. Kept in AsyncStorage rather than SecureStore: none of it is
// a credential, and it's the same store the cached profile already uses.
const FEED_KEY = "yulo_customer_feed";

// What a signed-out session leaves behind. 
const SIGNED_OUT_STATE = {
  favourites: {},
  vegOnly: false,
  vegScope: VEG_SCOPES.ALL,
};


export function FeedProvider({ children }) {
  const { cart, bill, addItem, updateItem, discardCart } = useCart();
  const { user } = useCustomerAuth();
  
  const [favourites, setFavourites] = useState(INITIAL_FAVOURITES);
  const [vegOnly, setVegOnly] = useState(false);
  const [vegScope, setVegScope] = useState(VEG_SCOPES.ALL);

  // Nothing is written back until the stored copy has been read, or the first
  // render would overwrite a real cart with the seed before hydration lands.
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(FEED_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;

        const stored = JSON.parse(raw);

        if (stored.favourites) setFavourites(stored.favourites);
        if (stored.vegOnly !== undefined) setVegOnly(!!stored.vegOnly);
        if (stored.vegScope) setVegScope(stored.vegScope);
      })
      // An unreadable cached value must not wedge the feed — drop it and carry
      // on with the seeds.
      .catch(() => {})
      .finally(() => {
        if (!cancelled) hydrated.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;

    AsyncStorage.setItem(
      FEED_KEY,
      JSON.stringify({ favourites, vegOnly, vegScope }),
    ).catch(() => {});
  }, [favourites, vegOnly, vegScope]);

  const clearCart = discardCart.mutate;

  const addToCart = useCallback(
    (restaurantName, line) => {
      addItem.mutate({
        menuItemId: line.itemId,
        qty: line.quantity,
        selectedOptions: line.selectedOptions || [],
      });
    },
    [addItem],
  );

  const setLineQuantity = useCallback(
    (key, quantity) => {
      updateItem.mutate({ lineItemId: key, qty: quantity });
    },
    [updateItem],
  );

  const toggleFavourite = useCallback(
    (id, isFave) => {
      // Local optimistic update
      setFavourites((current) => {
        const currentFave = isFave !== undefined ? isFave : !!current[id];
        return { ...current, [id]: !currentFave };
      });
      
      if (user) {
        const nextFave = isFave !== undefined ? !isFave : !favourites[id];
        const req = nextFave 
          ? client.post(`/users/me/favorites/restaurants/${id}`) 
          : client.delete(`/users/me/favorites/restaurants/${id}`);
          
        req.then(() => {
          queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
          queryClient.invalidateQueries({ queryKey: ["restaurants"] });
          queryClient.invalidateQueries({ queryKey: ["restaurant"] });
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
        }).catch(() => {});
      }
    },
    [user, favourites],
  );

  // Applying while veg mode is already on with the same scope reads as "turn it
  // back off" — the tile is still the on/off affordance in the design.
  const applyVegScope = useCallback(
    (scope) => {
      setVegOnly((currentVegOnly) => {
        const nextVegOnly = !(currentVegOnly && scope === vegScope);
        
        if (user) {
          client.patch("/users/me/preferences", { 
            vegModeEnabled: nextVegOnly, 
            vegModeScope: scope 
          }).catch(() => {});
        }
        
        return nextVegOnly;
      });
      setVegScope(scope);
    },
    [vegScope, user],
  );

  // Erase everything that belongs to the person who just signed out, leaving only
  // the app-level state (veg mode, which carries over). The cart clears remotely
  // rather than inside it — one customer's half-built order must not be waiting
  // for whoever signs in next on the same handset.
  const resetFeed = useCallback(() => {
    discardCart.mutate();
    setFavourites(SIGNED_OUT_STATE.favourites);
    setVegOnly(SIGNED_OUT_STATE.vegOnly);
    setVegScope(SIGNED_OUT_STATE.vegScope);
  }, [discardCart]);

  const value = useMemo(
    () => ({
      cart,
      bill,
      addToCart,
      setLineQuantity,
      clearCart,
      favourites,
      toggleFavourite,
      vegOnly,
      setVegOnly,
      vegScope,
      applyVegScope,
      resetFeed,
    }),
    [
      cart,
      bill,
      addToCart,
      setLineQuantity,
      clearCart,
      favourites,
      toggleFavourite,
      vegOnly,
      vegScope,
      applyVegScope,
      resetFeed,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be inside FeedProvider");
  return ctx;
}
