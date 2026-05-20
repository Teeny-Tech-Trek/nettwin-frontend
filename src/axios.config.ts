// src/axios.config.ts
//
// Axios singleton + interceptors.
//
// AUTH FLOW (read me before touching anything in here):
//
//   • Access token = short-lived JWT in localStorage, attached as
//     `Authorization: Bearer …` on every request via the request interceptor.
//   • Refresh token = long-lived JWT in an httpOnly, SameSite=Lax cookie set
//     by the backend on /auth/{login,signup,google,refresh}. It travels
//     automatically because we set `withCredentials: true`. JS cannot read it.
//
// 401 HANDLING — silent refresh, single-flight, no hard navigation.
//
// The naive version (and the one we replaced) wiped localStorage and called
// `window.location.href = '/login'` on *any* 401. That caused the
// "browser-back logs me out" bug:
//   - A background ping (profile refresh, plan-status poll, etc.) would 401
//     after the access token expired
//   - The interceptor would hard-redirect to /login, killing all in-flight
//     React state and triggering a fresh page load
//   - User clicks back → app boots again → AuthContext sees token in
//     localStorage but server says 401 → loop
//
// New behavior:
//   1. On 401 (excluding the auth endpoints themselves), call /auth/refresh
//      ONCE. Multiple concurrent 401s share the same in-flight refresh
//      promise (single-flight) so we don't hammer the endpoint.
//   2. If refresh succeeds → swap in the new access token, retry the
//      original request transparently. Caller never sees the 401.
//   3. If refresh fails → dispatch `auth:logout` window event with reason,
//      let AuthContext clear React state + localStorage in one place, and
//      let React Router (not window.location) handle the redirect so we
//      don't kill in-flight state. The original promise rejects so callers
//      can show error UI if they want.
//   4. /auth/refresh, /auth/login, /auth/signup, /auth/google are excluded
//      from refresh-on-401 — refreshing during login attempts would loop.
//
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  // Required so the httpOnly refreshToken cookie is sent on /auth/refresh,
  // /auth/logout, /auth/google. Without this, refresh always 401s.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ────────────────────────────────────────────────────────────────────────────
// Request interceptor — attach bearer token
// ────────────────────────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ────────────────────────────────────────────────────────────────────────────
// Response interceptor — silent refresh + logout event dispatch
// ────────────────────────────────────────────────────────────────────────────

// Endpoints we must NOT attempt refresh-on-401 for (would either loop or
// trample user-visible auth form errors).
const AUTH_ENDPOINTS_NO_REFRESH = [
  '/auth/login',
  '/auth/signup',
  '/auth/google',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const isAuthEndpoint = (url: string | undefined) =>
  !!url && AUTH_ENDPOINTS_NO_REFRESH.some((p) => url.includes(p));

// Custom flag we set on a request config to mark "this is the retry after a
// silent refresh — do not refresh again, just bubble the error up". Without
// this guard, a still-401 retry would re-enter the refresh path forever.
interface RetryableConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

// Single-flight refresh.
// While a refresh is in-flight, every other 401 awaits the same promise
// instead of firing N parallel /auth/refresh calls (which would rotate the
// refresh token N times and invalidate itself).
let refreshInFlight: Promise<string> | null = null;

/**
 * Perform exactly one /auth/refresh call. Subsequent callers reuse the
 * same in-flight promise. Resolves to the new access token, or rejects if
 * the refresh itself failed (which means the session is dead).
 */
function performTokenRefresh(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      // Use raw axios (not the instance) to bypass our own interceptors —
      // we don't want this call to trigger another refresh attempt if it 401s,
      // and we don't want the Bearer header added (refresh is cookie-based).
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        // Backend Joi schema still requires a non-empty body field; the real
        // token comes from the httpOnly cookie. Sending a placeholder is
        // tracked separately as a backend cleanup.
        { refreshToken: 'cookie' },
        { withCredentials: true, timeout: 15000 }
      );

      const newToken: string | undefined = data?.accessToken;
      if (!newToken) {
        throw new Error('Refresh succeeded but no accessToken returned');
      }

      // Persist immediately so any code that reads localStorage between now
      // and the React state update gets the new token.
      localStorage.setItem('token', newToken);
      return newToken;
    } finally {
      // Clear regardless of outcome so the NEXT 401 (after this batch
      // settles) can trigger a fresh refresh attempt.
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Dispatch a window-level event that AuthContext listens for. We use a DOM
 * event instead of imperative window.location.href because:
 *   - React Router can react via Navigate, preserving SPA state
 *   - AuthContext is the single owner of "clear localStorage + setUser(null)"
 *   - in-flight React state isn't trampled by a hard reload
 */
function dispatchAuthLogout(reason: 'refresh_failed' | 'unauthenticated') {
  window.dispatchEvent(
    new CustomEvent('auth:logout', { detail: { reason } })
  );
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      // Pure network error (CORS preflight fail, server down, DNS). Surface
      // it to callers — never confuse this with auth failure.
      if (import.meta.env.DEV) {
        console.error('[axios] Network error:', error.message);
      }
      return Promise.reject(error);
    }

    const status = error.response.status;
    const original = error.config as RetryableConfig | undefined;
    const url = original?.url || '';

    // Non-401s flow through untouched.
    if (status !== 401) return Promise.reject(error);

    // Login/signup/refresh 401s are caller-visible auth errors, NOT session
    // expiry. Bubble them up so the login form can show "wrong password" etc.
    if (isAuthEndpoint(url)) return Promise.reject(error);

    // Already retried after a refresh once — give up.
    if (original?._authRetry) {
      dispatchAuthLogout('refresh_failed');
      return Promise.reject(error);
    }

    // Try silent refresh.
    try {
      const newToken = await performTokenRefresh();

      if (original) {
        original._authRetry = true;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return axiosInstance.request(original);
      }
      return Promise.reject(error);
    } catch (refreshErr) {
      // Refresh itself failed → session is truly dead. Tell AuthContext to
      // clean up; do NOT touch localStorage here (single source of truth).
      dispatchAuthLogout('refresh_failed');
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

export const API_BASE_URL = BASE_URL;
export const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || BASE_URL.replace(/\/api\/?$/, '');

if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: BASE_URL,
    imageBaseURL: IMAGE_BASE_URL,
  });
}
