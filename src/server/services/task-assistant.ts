import crypto from "node:crypto";

import { getGeminiApiKey, getGeminiModel } from "@/server/services/ai-config";

type AssistantCategory =
  | "errands"
  | "mobility"
  | "wellness"
  | "learning"
  | "household"
  | "delivery"
  | "other";

type AssistantTaskType = "volunteer" | "token-funded";
type AssistantUrgency = "low" | "medium" | "high";

export type AssistTaskInput = {
  title?: string;
  description?: string;
  transcript?: string;
  category?: string;
  taskType?: string;
  urgency?: string;
  tokenBudget?: number;
  radiusKm?: number;
  locationLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
};

export type TaskAssistDraft = {
  id: string;
  title: string;
  description: string;
  category: "ERRANDS" | "MOBILITY" | "WELLNESS" | "LEARNING" | "HOUSEHOLD" | "DELIVERY" | "OTHER";
  taskType: "VOLUNTEER" | "TOKEN_FUNDED";
  urgency: "LOW" | "MEDIUM" | "HIGH";
  tokenBudget: number;
  radiusKm: number;
  requiredSkills: string[];
  locationLabel: string;
  latitude: number;
  longitude: number;
  notes: string;
  voiceTranscript: string | null;
};

export type TaskAssistProviders = {
  drafting: "gemini" | "heuristic";
  draftingModel: string | null;
};

export type TaskAssistResult = {
  draft: TaskAssistDraft;
  providers: TaskAssistProviders;
};

const CATEGORY_KEYWORDS: Array<{ category: AssistantCategory; keywords: string[] }> = [
  { category: "errands", keywords: ["pickup", "pick up", "grocery", "pharmacy", "medicine", "errand", "shopping"] },
  { category: "mobility", keywords: ["ride", "transport", "appointment", "walker", "wheelchair", "drive", "drop off"] },
  { category: "wellness", keywords: ["wellness", "check in", "care", "visit", "support", "companion"] },
  { category: "learning", keywords: ["tutor", "tutoring", "study", "math", "homework", "language", "practice"] },
  { category: "household", keywords: ["clean", "moving", "furniture", "boxes", "unpack", "household", "laundry"] },
  { category: "delivery", keywords: ["deliver", "delivery", "package", "dropoff"] },
];

const SKILL_LIBRARY = [
  { slug: "errands", keywords: ["pickup", "pick up", "errand", "shopping", "grocery", "pharmacy", "medicine"] },
  { slug: "senior-support", keywords: ["senior", "elder", "walker", "check in", "care"] },
  { slug: "mobility", keywords: ["ride", "transport", "driver", "appointment", "drop off"] },
  { slug: "teaching", keywords: ["teach", "tutor", "practice", "lesson", "homework"] },
  { slug: "math", keywords: ["algebra", "math", "calculus"] },
  { slug: "student-support", keywords: ["student", "school", "study", "homework"] },
  { slug: "wellness", keywords: ["wellness", "care", "companion", "support"] },
  { slug: "household", keywords: ["clean", "moving", "furniture", "boxes", "unpack", "laundry"] },
  { slug: "delivery", keywords: ["delivery", "deliver", "dropoff", "package"] },
];

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCategory(value: string | undefined): AssistantCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  const match = CATEGORY_KEYWORDS.find((entry) => entry.category === normalized);
  return match?.category ?? null;
}

function inferCategory(text: string, fallback?: string): AssistantCategory {
  const normalizedFallback = normalizeCategory(fallback);
  if (normalizedFallback) {
    return normalizedFallback;
  }

  const lower = text.toLowerCase();
  const matchedCategory = CATEGORY_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword)),
  );

  return matchedCategory?.category ?? "other";
}

function inferUrgency(text: string, fallback?: string): AssistantUrgency {
  const normalizedFallback = fallback?.toUpperCase();
  if (normalizedFallback === "LOW") {
    return "low";
  }
  if (normalizedFallback === "MEDIUM") {
    return "medium";
  }
  if (normalizedFallback === "HIGH") {
    return "high";
  }

  const lower = text.toLowerCase();
  if (
    ["asap", "urgent", "today", "right now", "immediately", "before", "tonight"].some((keyword) =>
      lower.includes(keyword),
    )
  ) {
    return "high";
  }

  if (["tomorrow", "soon", "later today", "this week"].some((keyword) => lower.includes(keyword))) {
    return "medium";
  }

  return "low";
}

function inferTaskType(text: string, fallback?: string): AssistantTaskType {
  if (fallback === "VOLUNTEER" || fallback === "TOKEN_FUNDED") {
    return fallback === "VOLUNTEER" ? "volunteer" : "token-funded";
  }

  const lower = text.toLowerCase();
  return ["reward", "token", "$", "budget", "pay", "paid"].some((keyword) => lower.includes(keyword))
    ? "token-funded"
    : "volunteer";
}

function inferTokenBudget(text: string, fallback?: number) {
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return Math.max(0, Math.round(fallback));
  }

  const moneyMatch = text.match(/\$?\s?(\d{1,3})/);
  if (moneyMatch) {
    return Math.max(0, Math.round(Number(moneyMatch[1])));
  }

  return inferTaskType(text) === "token-funded" ? 20 : 0;
}

function inferRadius(text: string, fallback?: number) {
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return Math.max(1, Math.round(fallback));
  }

  const kmMatch = text.match(/(\d{1,2})\s?(km|kilometer|kilometre|mile|miles)/i);
  if (kmMatch) {
    const rawDistance = Number(kmMatch[1]);
    if (kmMatch[2].toLowerCase().startsWith("mile")) {
      return Math.max(1, Math.round(rawDistance * 1.60934));
    }
    return Math.max(1, Math.round(rawDistance));
  }

  return 5;
}

export function suggestSkillSlugs(input: AssistTaskInput) {
  const text = compactWhitespace(
    [input.title, input.description, input.transcript, input.notes].filter(Boolean).join(" "),
  ).toLowerCase();
  const category = inferCategory(text, input.category);
  const matches = new Set<string>();

  if (category !== "other") {
    matches.add(category === "delivery" ? "delivery" : category);
  }

  for (const skill of SKILL_LIBRARY) {
    if (skill.keywords.some((keyword) => text.includes(keyword))) {
      matches.add(skill.slug);
    }
  }

  if (!matches.size) {
    matches.add("errands");
  }

  return Array.from(matches).slice(0, 4);
}

function defaultTitleFromText(text: string) {
  const trimmed = compactWhitespace(text);
  if (!trimmed) {
    return "Help request";
  }

  const sentence = trimmed.split(/[.!?]/)[0] ?? trimmed;
  return sentence.length > 72 ? `${sentence.slice(0, 69)}...` : sentence;
}

function defaultDescriptionFromText(text: string, title: string) {
  const trimmed = compactWhitespace(text);
  if (!trimmed) {
    return `${title}.`;
  }

  return trimmed;
}

function normalizeGeminiJson(rawText: string) {
  return rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
}

async function requestGeminiDraft(input: AssistTaskInput): Promise<Partial<TaskAssistDraft> | null> {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();

  if (!apiKey) {
    return null;
  }

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Turn this help request into a clean JSON object for a task creation form.
Return JSON only with these keys:
title, description, category, taskType, urgency, tokenBudget, radiusKm, requiredSkills, notes.

Rules:
- category must be one of errands, mobility, wellness, learning, household, delivery, other
- taskType must be volunteer or token-funded
- urgency must be low, medium, or high
- requiredSkills must use slugs such as errands, senior-support, mobility, teaching, math, student-support, wellness, household, delivery
- Keep the copy concise and polished

Input:
${JSON.stringify(input, null, 2)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prompt),
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!rawText) {
    return null;
  }

  try {
    const parsed = JSON.parse(normalizeGeminiJson(rawText)) as Partial<TaskAssistDraft>;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeTaskType(value: string | undefined, fallbackText: string): "VOLUNTEER" | "TOKEN_FUNDED" {
  const normalized = value?.toUpperCase();
  if (normalized === "VOLUNTEER" || normalized === "TOKEN_FUNDED") {
    return normalized;
  }

  return inferTaskType(fallbackText) === "volunteer" ? "VOLUNTEER" : "TOKEN_FUNDED";
}

function normalizeUrgency(value: string | undefined, fallbackText: string): "LOW" | "MEDIUM" | "HIGH" {
  const normalized = value?.toUpperCase();
  if (normalized === "LOW" || normalized === "MEDIUM" || normalized === "HIGH") {
    return normalized;
  }

  const inferred = inferUrgency(fallbackText);
  return inferred.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
}

function normalizeCategoryEnum(value: string | undefined, fallbackText: string) {
  const normalized = value?.toLowerCase();
  const allowed = new Map<string, "ERRANDS" | "MOBILITY" | "WELLNESS" | "LEARNING" | "HOUSEHOLD" | "DELIVERY" | "OTHER">([
    ["errands", "ERRANDS"],
    ["mobility", "MOBILITY"],
    ["wellness", "WELLNESS"],
    ["learning", "LEARNING"],
    ["household", "HOUSEHOLD"],
    ["delivery", "DELIVERY"],
    ["other", "OTHER"],
  ]);

  return allowed.get(normalized ?? "") ?? allowed.get(inferCategory(fallbackText)) ?? "OTHER";
}

export async function assistTask(input: AssistTaskInput): Promise<TaskAssistResult> {
  const combinedText = compactWhitespace(
    [input.title, input.description, input.transcript, input.notes].filter(Boolean).join(" "),
  );

  const geminiDraft = await requestGeminiDraft(input);
  const draftingProvider = geminiDraft ? "gemini" : "heuristic";
  const fallbackTitle = defaultTitleFromText(combinedText);
  const title = compactWhitespace(geminiDraft?.title || input.title || fallbackTitle);
  const description = defaultDescriptionFromText(
    geminiDraft?.description || input.description || input.transcript || title,
    title,
  );
  const taskType = normalizeTaskType(geminiDraft?.taskType, combinedText);
  const urgency = normalizeUrgency(geminiDraft?.urgency, combinedText);
  const category = normalizeCategoryEnum(geminiDraft?.category, combinedText);
  const requiredSkills = Array.from(
    new Set(
      (geminiDraft?.requiredSkills?.length ? geminiDraft.requiredSkills : suggestSkillSlugs(input)).map((skill) =>
        compactWhitespace(skill.toLowerCase()),
      ),
    ),
  ).slice(0, 4);
  const tokenBudget =
    taskType === "TOKEN_FUNDED"
      ? inferTokenBudget(combinedText, geminiDraft?.tokenBudget ?? input.tokenBudget)
      : 0;

  return {
    draft: {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      taskType,
      urgency,
      tokenBudget,
      radiusKm: inferRadius(combinedText, geminiDraft?.radiusKm ?? input.radiusKm),
      requiredSkills,
      locationLabel: input.locationLabel || "Current location",
      latitude: input.latitude ?? 41.8839,
      longitude: input.longitude ?? -87.6376,
      notes: compactWhitespace(geminiDraft?.notes || input.notes || ""),
      voiceTranscript: input.transcript ? compactWhitespace(input.transcript) : null,
    },
    providers: {
      drafting: draftingProvider,
      draftingModel: draftingProvider === "gemini" ? getGeminiModel() : null,
    },
  };
}

export async function assistTaskDraft(input: AssistTaskInput): Promise<TaskAssistDraft> {
  return (await assistTask(input)).draft;
}
