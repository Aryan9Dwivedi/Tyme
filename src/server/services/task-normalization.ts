export const DEFAULT_TASK_LATITUDE = 41.8839;
export const DEFAULT_TASK_LONGITUDE = -87.6376;

export function normalizeTaskCategory(value: string | null | undefined) {
  const normalized = value?.toUpperCase();
  switch (normalized) {
    case "ERRANDS":
    case "MOBILITY":
    case "WELLNESS":
    case "LEARNING":
    case "HOUSEHOLD":
    case "DELIVERY":
    case "OTHER":
      return normalized;
    default:
      return "OTHER";
  }
}

export function normalizeTaskType(value: string | null | undefined) {
  return value?.toUpperCase() === "VOLUNTEER" ? "VOLUNTEER" : "TOKEN_FUNDED";
}

export function normalizeTaskUrgency(value: string | null | undefined) {
  const normalized = value?.toUpperCase();
  switch (normalized) {
    case "LOW":
    case "MEDIUM":
    case "HIGH":
      return normalized;
    default:
      return "MEDIUM";
  }
}

export function normalizeTaskStatus(value: string | null | undefined) {
  const normalized = value?.toUpperCase();
  switch (normalized) {
    case "DRAFT":
    case "OPEN":
    case "MATCHING":
    case "OFFERED":
    case "ASSIGNED":
    case "IN_PROGRESS":
    case "COMPLETED":
    case "CANCELLED":
    case "EXPIRED":
      return normalized;
    default:
      return null;
  }
}

export function normalizeNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizeRequiredString(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

export function normalizeNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}
