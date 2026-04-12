import type { CaptainProfile } from "@/types/captain";
import type { TaskCategory, TaskRequest, TaskType, TaskUrgency } from "@/types/task";

const TASK_CATEGORIES: TaskCategory[] = [
  "errands",
  "mobility",
  "wellness",
  "learning",
  "household",
  "delivery",
  "other",
];

const TASK_TYPES: TaskType[] = ["volunteer", "token-funded"];
const TASK_URGENCY: TaskUrgency[] = ["low", "medium", "high"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function expectNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function expectBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function expectStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((entry): entry is string => typeof entry === "string");
  return items.length === value.length ? items : undefined;
}

function parseLocation(
  value: unknown,
  field: string,
): { ok: true; location: TaskRequest["location"] } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: `${field} must be an object` };
  }

  const label = expectString(value.label);
  const latitude = expectNumber(value.latitude);
  const longitude = expectNumber(value.longitude);

  if (!label) {
    return { ok: false, error: `${field}.label must be a non-empty string` };
  }

  if (latitude === undefined) {
    return { ok: false, error: `${field}.latitude must be a finite number` };
  }

  if (longitude === undefined) {
    return { ok: false, error: `${field}.longitude must be a finite number` };
  }

  return {
    ok: true,
    location: { label, latitude, longitude },
  };
}

function parseTaskRequest(
  value: unknown,
): { ok: true; task: TaskRequest } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: "Task must be an object" };
  }

  const id = expectString(value.id);
  const title = expectString(value.title);
  const description = expectString(value.description);
  const budgetTokens = expectNumber(value.budgetTokens);
  const radiusKm = expectNumber(value.radiusKm);
  const requiredSkills = expectStringArray(value.requiredSkills);
  const requestedAt = expectString(value.requestedAt);

  if (!id || !title || !description || budgetTokens === undefined || radiusKm === undefined || !requiredSkills || !requestedAt) {
    return { ok: false, error: "Task body is missing required fields" };
  }

  if (typeof value.category !== "string" || !TASK_CATEGORIES.includes(value.category as TaskCategory)) {
    return { ok: false, error: "Task category is invalid" };
  }

  if (typeof value.type !== "string" || !TASK_TYPES.includes(value.type as TaskType)) {
    return { ok: false, error: "Task type is invalid" };
  }

  if (typeof value.urgency !== "string" || !TASK_URGENCY.includes(value.urgency as TaskUrgency)) {
    return { ok: false, error: "Task urgency is invalid" };
  }

  const location = parseLocation(value.location, "location");

  if (!location.ok) {
    return location;
  }

  return {
    ok: true,
    task: {
      id,
      title,
      description,
      category: value.category as TaskCategory,
      type: value.type as TaskType,
      urgency: value.urgency as TaskUrgency,
      budgetTokens,
      radiusKm,
      requiredSkills,
      location: location.location,
      requestedAt,
    },
  };
}

function parseCaptain(
  value: unknown,
  index: number,
): { ok: true; captain: CaptainProfile } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: `captains[${index}] must be an object` };
  }

  const id = expectString(value.id);
  const name = expectString(value.name);
  const headline = expectString(value.headline);
  const availabilityWindow = expectString(value.availabilityWindow);
  const isAvailableNow = expectBoolean(value.isAvailableNow);
  const skills = expectStringArray(value.skills);
  const rating = expectNumber(value.rating);
  const tasksCompleted = expectNumber(value.tasksCompleted);
  const responseRate = expectNumber(value.responseRate);
  const trustScore = expectNumber(value.trustScore);

  if (!id || !name || !headline || !availabilityWindow || isAvailableNow === undefined || !skills || rating === undefined || tasksCompleted === undefined || responseRate === undefined || trustScore === undefined) {
    return { ok: false, error: `captains[${index}] is missing required fields` };
  }

  const location = parseLocation(value.location, `captains[${index}].location`);

  if (!location.ok) {
    return { ok: false, error: location.error };
  }

  return {
    ok: true,
    captain: {
      id,
      name,
      headline,
      location: location.location,
      availabilityWindow,
      isAvailableNow,
      skills,
      rating,
      tasksCompleted,
      responseRate,
      trustScore,
    },
  };
}

function stripTaskWrapper(body: Record<string, unknown>) {
  const payload = { ...body };
  delete payload.captains;
  delete payload.limit;
  return payload;
}

export type ParsedRecommendationBody = {
  task: TaskRequest;
  captains: CaptainProfile[] | null;
  limit: number;
};

export function parseRecommendationJsonBody(
  body: unknown,
): { ok: true; value: ParsedRecommendationBody } | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "JSON body must be an object" };
  }

  const rawTask = "task" in body ? body.task : stripTaskWrapper(body);
  const parsedTask = parseTaskRequest(rawTask);

  if (!parsedTask.ok) {
    return parsedTask;
  }

  let captains: CaptainProfile[] | null = null;
  if ("captains" in body && body.captains !== undefined) {
    if (!Array.isArray(body.captains)) {
      return { ok: false, error: "captains must be an array when provided" };
    }

    captains = [];

    for (let index = 0; index < body.captains.length; index += 1) {
      const parsedCaptain = parseCaptain(body.captains[index], index);

      if (!parsedCaptain.ok) {
        return parsedCaptain;
      }

      captains.push(parsedCaptain.captain);
    }
  }

  let limit = 3;
  if ("limit" in body && body.limit !== undefined) {
    const parsedLimit = expectNumber(body.limit);
    if (parsedLimit === undefined) {
      return { ok: false, error: "limit must be a finite number" };
    }
    limit = Math.min(50, Math.max(1, Math.floor(parsedLimit)));
  }

  return {
    ok: true,
    value: {
      task: parsedTask.task,
      captains,
      limit,
    },
  };
}
