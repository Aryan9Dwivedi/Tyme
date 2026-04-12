export const AUTH_TOKEN_KEY = "tyme.auth.token";

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
