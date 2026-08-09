import { Platform } from "react-native";

// EXPO_PUBLIC_API_BASE — Expo's convention for client-exposed env vars (must be
// prefixed EXPO_PUBLIC_ to be inlined into the bundle). Set per build profile in
// eas.json; this fallback only ever applies to a local `expo start`.
//
// The dev fallback is per-platform because "localhost" means different things on
// each: an Android emulator reaches the host machine at 10.0.2.2, while the iOS
// simulator shares the host's loopback. A single hardcoded 10.0.2.2 left every
// iOS simulator run pointing at nothing.
const DEV_FALLBACK = Platform.select({
  android: "http://10.0.2.2:3000",
  default: "http://localhost:3000",
});

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || DEV_FALLBACK;
