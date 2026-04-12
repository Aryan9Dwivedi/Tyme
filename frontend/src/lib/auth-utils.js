export const AUTH_TOKEN_KEY = "tyme.auth.token";

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getAuthToken() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export const ROLE_HOME = {
  USER: "/dashboard",
  CAPTAIN: "/captain/dashboard",
  ADMIN: "/admin",
};

export const ROLE_LABEL = {
  USER: "User",
  CAPTAIN: "Captain",
  ADMIN: "Admin",
};

export function normalizeRole(role) {
  const normalized = String(role || "USER").toUpperCase();
  return ROLE_HOME[normalized] ? normalized : "USER";
}

export function getRoleHome(role) {
  return ROLE_HOME[normalizeRole(role)];
}

export function getRoleLabel(role) {
  return ROLE_LABEL[normalizeRole(role)];
}

export function toRoleSlug(role) {
  return normalizeRole(role).toLowerCase();
}

export function canAccessRole(role, allowedRoles) {
  return allowedRoles.includes(normalizeRole(role));
}
