// EXPO_PUBLIC_API_BASE — Expo's convention for client-exposed env vars (must
// be prefixed EXPO_PUBLIC_ to be inlined into the bundle). Unset in dev; set
// it to the real API origin once wired to a live backend.
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:3000";
