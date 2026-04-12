// @ts-nocheck

import { AUTH_TOKEN_KEY } from "@/lib/auth-utils";

const importMeta = /** @type {{ env?: { VITE_API_BASE_URL?: string } }} */ (import.meta);
const apiBaseUrl = importMeta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function getApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
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

export function fetchUserDashboard() {
  return apiRequest("/api/dashboard/user");
}

export function fetchCaptainDashboard() {
  return apiRequest("/api/dashboard/captain");
}

export function fetchMyTasks({ status } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") {
    params.set("status", status);
  }
  return apiRequest(`/api/tasks${params.toString() ? `?${params}` : ""}`);
}

export function fetchTask(taskId) {
  return apiRequest(`/api/tasks/${taskId}`);
}

export function createTask(payload) {
  return apiRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(taskId, payload) {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function assistTask(payload) {
  return apiRequest("/api/tasks/assist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCaptainOpportunities() {
  return apiRequest("/api/captain/opportunities");
}

export function acceptCaptainOpportunity(offerId) {
  return apiRequest(`/api/captain/offers/${offerId}/accept`, {
    method: "POST",
  });
}

export function declineCaptainOpportunity(offerId) {
  return apiRequest(`/api/captain/offers/${offerId}/decline`, {
    method: "POST",
  });
}

export function fetchCaptainAssignments() {
  return apiRequest("/api/captain/assignments");
}

export function startCaptainAssignment(assignmentId) {
  return apiRequest(`/api/captain/assignments/${assignmentId}/start`, {
    method: "POST",
  });
}

export function completeCaptainAssignment(assignmentId) {
  return apiRequest(`/api/captain/assignments/${assignmentId}/complete`, {
    method: "POST",
  });
}

export function submitTaskFeedback(taskId, payload) {
  return apiRequest(`/api/tasks/${taskId}/feedback`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
