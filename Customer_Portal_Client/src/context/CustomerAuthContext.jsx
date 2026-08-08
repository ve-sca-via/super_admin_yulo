import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import client, { setAccessToken } from "@/api/client";
import { clearRefreshToken } from "@/api/tokenStorage";

const PROFILE_KEY = "yulo_customer_profile";
const ONBOARDING_SEEN_KEY = "yulo_customer_onboarding_seen";
const LOCATION_KEY = "yulo_customer_location";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [deliveryLocation, setDeliveryLocationState] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(ONBOARDING_SEEN_KEY),
      AsyncStorage.getItem(LOCATION_KEY),
    ])
      .then(([rawProfile, seenOnboarding, rawLocation]) => {
        if (rawProfile) setUser(JSON.parse(rawProfile));
        if (seenOnboarding) setHasSeenOnboarding(true);
        if (rawLocation) setDeliveryLocationState(JSON.parse(rawLocation));
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const { data: remoteProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => client.get("/users/me"),
    enabled: hydrated && !!user, // only fetch if we look logged in
  });

  useEffect(() => {
    if (remoteProfile) {
      setUser(remoteProfile);
    }
  }, [remoteProfile]);

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

  const addAddressMutation = useMutation({
    mutationFn: (data) => client.post("/users/me/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const selectAddressMutation = useMutation({
    mutationFn: (id) => client.patch(`/users/me/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const selectAddress = useCallback(
    (id) => selectAddressMutation.mutate(id),
    [selectAddressMutation]
  );

  const addAddress = useCallback(
    ({ label, line, customLabel = "" }) => {
      // Mocking coordinates since geocoding is unbuilt
      const data = {
        label: label.toLowerCase(),
        customLabel,
        street: line,
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        location: { coordinates: [77.5946, 12.9716] },
        isDefault: false
      };
      
      addAddressMutation.mutate(data);
    },
    [addAddressMutation]
  );

  const requestOtp = useCallback(async (phone) => {
    setPendingPhone(phone);
    setLoading(true);
    try {
      const response = await client.post("/auth/customer/otp/send", { phone });
      // In dev, the backend might return devOtp for testing without SMS.
      if (response && response.devOtp) {
        setDevOtp(response.devOtp);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (otp) => {
      setLoading(true);
      try {
        const { user: authedUser, accessToken } = await client.post("/auth/customer/otp/verify", {
          phone: pendingPhone,
          code: otp,
          tosAccepted: true,
        });
        
        setAccessToken(accessToken);
        setUser(authedUser);
        return authedUser;
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

  const mappedAddresses = (user?.savedAddresses || []).map(addr => ({
    ...addr,
    id: addr._id,
    label: addr.customLabel ? addr.customLabel : addr.label.charAt(0).toUpperCase() + addr.label.slice(1),
    line: addr.street,
  }));

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
        addresses: mappedAddresses,
        selectedAddress:
          mappedAddresses.find((address) => address.isDefault) ??
          mappedAddresses[0] ??
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
