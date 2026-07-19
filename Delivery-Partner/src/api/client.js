import axios from "axios";
import { API_BASE } from "./config";

// Access token lives in memory only.
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}
export function getAccessToken() {
  return _accessToken;
}

// Single Axios instance for all API calls. Unlike the browser admin client,
// RN has no cookie jar — once the real backend exists, the refresh token
// will need to come from SecureStore and be sent explicitly, not via
// `withCredentials`.
const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message ?? err.message ?? "Request failed";
    const apiError = new Error(message);
    apiError.code = err.response?.data?.code;
    apiError.status = err.response?.status;
    apiError.details = err.response?.data?.details;
    return Promise.reject(apiError);
  },
);

export default client;
