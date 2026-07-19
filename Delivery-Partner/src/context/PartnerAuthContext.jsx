import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { USE_MOCKS } from "@/api/config";
import { setAccessToken } from "@/api/client";
import { mockPartner } from "@/mocks/fixtures";

const PROFILE_KEY = "yulo_partner_profile";

const PartnerAuthContext = createContext(null);

export function PartnerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(user));
    else AsyncStorage.removeItem(PROFILE_KEY);
  }, [user, hydrated]);

  // Real backend has no /api/partner/auth routes yet — this is the seam
  // where those calls replace the mock branch once they exist.
  const requestOtp = useCallback(async (phone) => {
    setPendingPhone(phone);
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 500));
      return { phone };
    }
    throw new Error("Real partner auth API not implemented yet");
  }, []);

  const verifyOtp = useCallback(
    async (otp) => {
      if (USE_MOCKS) {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setLoading(false);
        if (otp.length !== 6) throw new Error("Enter the 6-digit code");
        const profile = { ...mockPartner, phone: pendingPhone ?? mockPartner.phone };
        setAccessToken("mock-partner-token");
        setUser(profile);
        return profile;
      }
      throw new Error("Real partner auth API not implemented yet");
    },
    [pendingPhone],
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setPendingPhone(null);
  }, []);

  return (
    <PartnerAuthContext.Provider
      value={{
        user,
        loading,
        hydrated,
        pendingPhone,
        requestOtp,
        verifyOtp,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error("usePartnerAuth must be inside PartnerAuthProvider");
  return ctx;
}
