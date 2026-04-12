// @ts-nocheck

import { getAuthToken } from "@/lib/auth-utils";

const importMeta = /** @type {{ env?: { VITE_API_BASE_URL?: string } }} */ (import.meta);
const apiBaseUrl = importMeta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function getApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function getStoredToken() {
  return getAuthToken();
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const token = options.token ?? getStoredToken();
  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormDataBody && !headers.has("Content-Type")) {
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

export function updateCaptainAvailability(availability) {
  return apiRequest("/api/captain/profile/availability", {
    method: "PATCH",
    body: JSON.stringify({ availability }),
  });
}

export function fetchCaptainDemandHeatmap({ lastMinutes = 60, category = "", urgency = "" } = {}) {
  const params = new URLSearchParams();

  if (lastMinutes) {
    params.set("lastMinutes", String(lastMinutes));
  }

  if (category) {
    params.set("category", category);
  }

  if (urgency) {
    params.set("urgency", urgency);
  }

  return apiRequest(`/api/captain/heatmap${params.toString() ? `?${params.toString()}` : ""}`);
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

export function voiceAssistTask({ file, payload, languageCode }) {
  const formData = new FormData();
  formData.set("audio", file);
  formData.set("payload", JSON.stringify(payload));

  if (languageCode) {
    formData.set("languageCode", languageCode);
  }

  return apiRequest("/api/tasks/voice-assist", {
    method: "POST",
    body: formData,
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

export function fetchWalletSummary() {
  return apiRequest("/api/wallet");
}

export function fundWallet(amount) {
  return apiRequest("/api/wallet", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
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
