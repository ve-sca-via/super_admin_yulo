import axios from "axios";
import { API_BASE } from "./config";
import { getRefreshToken, clearRefreshToken } from "./tokenStorage";

// Access token lives in memory only.
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}
export function getAccessToken() {
  return _accessToken;
}

// Single Axios instance for all API calls. RN has no cookie jar the way a browser does — the
// live /api/auth/refresh endpoint currently reads its refresh token from an HttpOnly cookie
// (see API.md), which doesn't survive across app restarts here. Until a body-based refresh
// endpoint exists for customers (mirroring /api/partner/auth/refresh), this sends the
// SecureStore-persisted token in the body as a forward-compatible default — it's simply ignored
// by today's cookie-only endpoint. Auth is mocked for now (see CustomerAuthContext), so this
// interceptor isn't exercised yet, but is wired up ready for when it is.
const client = axios.create({
  baseURL: `${API_BASE}/api`,
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — envelope unwrap + auto-refresh ───────────────────
// Every real backend response is wrapped as { status, message, data } (see
// server/utils/ApiResponse.js). On success, hand callers `data` directly —
// plain objects, no envelope, so every screen consumes this the same way
// regardless of which endpoint it's calling.
let _refreshing = false;
let _queue = [];

const REFRESHABLE_CODES = new Set(["TOKEN_EXPIRED", "INVALID_TOKEN"]);

client.interceptors.response.use(
  (res) => res.data.data,
  async (err) => {
    const original = err.config;
    const code = err.response?.data?.code;

    if (err.response?.status === 401 && REFRESHABLE_CODES.has(code) && original && !original._retried) {
      original._retried = true;

      if (_refreshing) {
        return new Promise((resolve, reject) => _queue.push({ resolve, reject })).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      _refreshing = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw err; // nothing to refresh with — fall through to session-expired

        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        _queue.forEach(({ resolve }) => resolve(newToken));
        _queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshErr) {
        setAccessToken(null);
        await clearRefreshToken();
        _queue.forEach(({ reject }) => reject(refreshErr));
        _queue = [];
        return Promise.reject(refreshErr);
      } finally {
        _refreshing = false;
      }
    }

    const message = err.response?.data?.message ?? err.message ?? "Request failed";
    const apiError = new Error(message);
    apiError.code = code;
    apiError.status = err.response?.status;
    apiError.details = err.response?.data?.details;
    return Promise.reject(apiError);
  },
);

export default client;
