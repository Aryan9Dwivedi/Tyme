import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-utils";

const importMeta = /** @type {{ env?: { VITE_API_BASE_URL?: string } }} */ (import.meta);
const apiBaseUrl = importMeta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function getApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const token = options.token ?? getStoredToken();

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}.`);
  }

  return payload;
}

export function getStoredToken() {
  return getAuthToken();
}

export function setStoredToken(token) {
  setAuthToken(token);
}

export function clearStoredToken() {
  clearAuthToken();
}

export function login(credentials) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    token: null,
  });
}

export function signup(details) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(details),
    token: null,
  });
}

export function fetchCurrentUser(token = getStoredToken()) {
  return apiRequest("/api/auth/me", {
    method: "GET",
    token,
  });
}
