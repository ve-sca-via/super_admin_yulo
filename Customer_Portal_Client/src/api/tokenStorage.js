import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Unlike the access token (memory-only, see client.js), the refresh token needs to survive an
// app restart — that's the whole point of a refresh token. SecureStore wraps the iOS
// Keychain/Android Keystore, appropriate for a long-lived credential in a way AsyncStorage
// (used elsewhere for the non-sensitive cached profile) isn't.
const REFRESH_TOKEN_KEY = "yulo_customer_refresh_token";

// expo-secure-store's web target has no real implementation (its web module is an empty stub —
// there's no browser equivalent of a Keychain/Keystore to wrap). This app's real targets are
// iOS/Android, where SecureStore is used unconditionally below and this branch never runs. The
// localStorage fallback exists only so `expo start --web` doesn't hard-crash on every
// authenticated screen during development.
const isWeb = Platform.OS === "web";

export async function getRefreshToken() {
  if (isWeb) return globalThis.localStorage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token) {
  if (isWeb) return void globalThis.localStorage?.setItem(REFRESH_TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearRefreshToken() {
  if (isWeb) return void globalThis.localStorage?.removeItem(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
