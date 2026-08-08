import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setAccessToken } from "@/api/client";
import { clearRefreshToken } from "@/api/tokenStorage";
import { INITIAL_ADDRESSES } from "@/data/addresses";

const PROFILE_KEY = "yulo_customer_profile";
const ONBOARDING_SEEN_KEY = "yulo_customer_onboarding_seen";
const LOCATION_KEY = "yulo_customer_location";
const ADDRESS_BOOK_KEY = "yulo_customer_addresses";
const MOCK_OTP = "1234";

const CustomerAuthContext = createContext(null);

// MOCK AUTH BOUNDARY — the Figma flow is phone+OTP, but the live customer backend only has
// email+password (see API.md's Public — Auth section). There's no matching phone+OTP endpoint to
// call yet, so requestOtp/verifyOtp below simulate the round trip entirely client-side (fixed
// devOtp, no server call). Swap these two functions for real client.post(...) calls — mirroring
// Delivery-Partner/src/context/PartnerAuthContext.jsx's requestOtp/verifyOtp — once a matching
// customer OTP endpoint exists server-side. Everything else here (hydration, storage shape,
// isAuthenticated contract) is already written the way it'll need to be for that swap.
export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [deliveryLocation, setDeliveryLocationState] = useState(null);

  // The saved addresses checkout delivers to, and which of them is selected.
  // Kept beside the profile rather than in the feed store: an address book
  // belongs to the customer, not to the cart it happens to be checking out.
  const [addressBook, setAddressBook] = useState({
    addresses: INITIAL_ADDRESSES,
    selectedId: INITIAL_ADDRESSES[0].id,
  });

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(ONBOARDING_SEEN_KEY),
      AsyncStorage.getItem(LOCATION_KEY),
      AsyncStorage.getItem(ADDRESS_BOOK_KEY),
    ])
      .then(([rawProfile, seenOnboarding, rawLocation, rawAddresses]) => {
        if (rawProfile) setUser(JSON.parse(rawProfile));
        if (seenOnboarding) setHasSeenOnboarding(true);
        if (rawLocation) setDeliveryLocationState(JSON.parse(rawLocation));

        // A stored book that has lost its list — an interrupted write, a shape
        // from an older build — would leave checkout with no address to select
        // and nothing to fall back on, so it's rejected rather than adopted.
        if (rawAddresses) {
          const stored = JSON.parse(rawAddresses);
          if (Array.isArray(stored?.addresses) && stored.addresses.length) setAddressBook(stored);
        }
      })
      // An unreadable cached value must not wedge the splash screen, which
      // waits on `hydrated` — drop it and carry on signed out.
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(user));
    else AsyncStorage.removeItem(PROFILE_KEY);
  }, [user, hydrated]);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "1");
  }, []);

  // The address survives a restart the same way the profile does — a returning
  // customer lands straight on the home feed without passing through location
  // setup again, so an unpersisted address would leave the header showing a
  // placeholder they never chose.
  const setDeliveryLocation = useCallback((location) => {
    setDeliveryLocationState(location);
    if (location) AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    else AsyncStorage.removeItem(LOCATION_KEY);
  }, []);

  // A newly added address is the one the customer is checking out to — they
  // added it to use it, so it arrives selected.
  const persistAddressBook = useCallback((next) => {
    setAddressBook(next);
    AsyncStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(next));
  }, []);

  const selectAddress = useCallback(
    (id) => persistAddressBook({ ...addressBook, selectedId: id }),
    [addressBook, persistAddressBook],
  );

  const addAddress = useCallback(
    ({ label, line }) => {
      const address = { id: `address-${Date.now()}`, label, line };
      persistAddressBook({
        addresses: [...addressBook.addresses, address],
        selectedId: address.id,
      });
      return address;
    },
    [addressBook, persistAddressBook],
  );

  const requestOtp = useCallback(async (phone) => {
    setPendingPhone(phone);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log(`[mock] OTP for ${phone}: ${MOCK_OTP}`);
      setDevOtp(MOCK_OTP);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (otp) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (otp !== MOCK_OTP) {
          throw new Error("Incorrect code. Try again.");
        }
        const mockUser = { id: "mock-customer", name: "Guest", phone: pendingPhone };
        setAccessToken("mock-access-token");
        setUser(mockUser);
        return mockUser;
      } finally {
        setLoading(false);
      }
    },
    [pendingPhone],
  );

  const logout = useCallback(async () => {
    setAccessToken(null);
    await clearRefreshToken();
    setUser(null);
    setPendingPhone(null);
    setDevOtp(null);
    setDeliveryLocation(null);
  }, [setDeliveryLocation]);

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        loading,
        hydrated,
        pendingPhone,
        devOtp,
        hasSeenOnboarding,
        deliveryLocation,
        addresses: addressBook.addresses,
        selectedAddress:
          addressBook.addresses.find((address) => address.id === addressBook.selectedId) ??
          addressBook.addresses[0] ??
          null,
        selectAddress,
        addAddress,
        requestOtp,
        verifyOtp,
        logout,
        completeOnboarding,
        setDeliveryLocation,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be inside CustomerAuthProvider");
  return ctx;
}
