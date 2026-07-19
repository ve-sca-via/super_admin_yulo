// EXPO_PUBLIC_API_BASE — Expo's convention for client-exposed env vars (must
// be prefixed EXPO_PUBLIC_ to be inlined into the bundle). Unset in dev; set
// it to the real API origin once the backend exists.
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

// Flip to false once the real /api/partner/... routes exist — every hook in
// src/hooks reads this so screens don't need touching to switch over.
export const USE_MOCKS = true;
