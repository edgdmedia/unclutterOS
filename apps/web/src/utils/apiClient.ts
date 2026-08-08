/**
 * apiClient.ts
 * Thin fetch wrapper for the UnclutterOS NestJS API.
 *
 * SECURITY (httpOnly cookie auth):
 * - The access & refresh tokens live in httpOnly cookies set by the API.
 *   JS can never read them (immune to XSS via document.cookie).
 * - State-changing requests carry an X-CSRF-Token header sourced from a
 *   readable `unclutter_csrf` cookie (double-submit pattern).
 * - On a 401 the client tries POST /v1/auth/refresh (single-flight) and
 *   replays the original request once; if refresh fails, the session is
 *   torn down via a session-expired handler.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.os.unclutter.com.ng';
export const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'dr-smith';
export const APP_BASE_URL = import.meta.env.VITE_APP_URL || 'https://os.unclutter.com.ng';
export function getBookingUrl(slug: string): string {
  return `${APP_BASE_URL}/booking/${slug}`;
}

const CSRF_COOKIE = 'unclutter_csrf';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_PATHS = new Set([
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/refresh',
  '/v1/auth/status',
]);

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

let refreshing: Promise<boolean> | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

function getCsrfToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(CSRF_COOKIE.length + 1)) : null;
}

function buildHeaders(
  extraHeaders: Record<string, string> | undefined,
  method = 'GET',
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
    ...(extraHeaders as Record<string, string>),
  };

  if (!SAFE_METHODS.has(method.toUpperCase())) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  return headers;
}

async function requestRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch(`${API_BASE}/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: buildHeaders(undefined, 'POST'),
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function clearSession(): Promise<void> {
  try {
    await fetch(`${API_BASE}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(undefined, 'POST'),
    });
  } catch {
    // Best-effort — the httpOnly cookies are invalidated server-side on expiry.
  }
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface InternalRequestOptions extends RequestOptions {
  _retried?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: InternalRequestOptions = {},
): Promise<T> {
  const { body, headers: extraHeaders, _retried, ...rest } = options;
  const method = rest.method || 'GET';

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method,
    headers: buildHeaders(extraHeaders as Record<string, string> | undefined, method),
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Session expired mid-flight — try to refresh once, then replay.
  if (response.status === 401 && !AUTH_PATHS.has(path) && !_retried) {
    const refreshed = await requestRefresh();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
    onSessionExpired?.();
    await clearSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const err = await response.json();
      message = err?.message || message;
    } catch {
      // ignore JSON parse failure on error body
    }
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ── Shorthand helpers ─────────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    apiRequest<T>(path, { method: 'POST', body, headers }),
  patch: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    apiRequest<T>(path, { method: 'PATCH', body, headers }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
