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

type CategoryProfile = {
  category: AssistantCategory;
  label: string;
  description: string;
  keywords: string[];
  defaultSkills: string[];
};

type DescriptionTemplate = {
  categories: AssistantCategory[];
  text: string;
};

const CATEGORY_PROFILES: CategoryProfile[] = [
  {
    category: "errands",
    label: "Errands",
    description: "Pickup, shopping, medicine, grocery, or quick everyday help.",
    keywords: [
      "pickup",
      "pick up",
      "pharmacy",
      "medicine",
      "prescription",
      "grocery",
      "shopping",
      "errand",
      "store",
      "buy",
      "collect",
      "drop by",
    ],
    defaultSkills: ["errands", "delivery"],
  },
  {
    category: "mobility",
    label: "Mobility",
    description: "Rides, transport, appointment support, or getting someone somewhere safely.",
    keywords: [
      "ride",
      "transport",
      "appointment",
      "wheelchair",
      "walker",
      "drive",
      "drop off",
      "pickup ride",
      "take me",
      "airport",
      "clinic",
      "hospital",
    ],
    defaultSkills: ["mobility", "senior-support"],
  },
  {
    category: "wellness",
    label: "Wellness",
    description: "Check-ins, companionship, support visits, or light care coordination.",
    keywords: [
      "wellness",
      "check in",
      "care",
      "support",
      "companion",
      "visit",
      "sit with",
      "help calm",
      "keep company",
      "med check",
    ],
    defaultSkills: ["wellness", "senior-support"],
  },
  {
    category: "learning",
    label: "Learning",
    description: "Tutoring, homework help, practice, coaching, or school support.",
    keywords: [
      "tutor",
      "tutoring",
      "teach",
      "study",
      "math",
      "science",
      "homework",
      "language",
      "lesson",
      "practice",
      "school",
      "quiz",
    ],
    defaultSkills: ["teaching", "student-support"],
  },
  {
    category: "household",
    label: "Household",
    description: "Cleaning, moving, lifting, setup, furniture, chores, or around-the-home help.",
    keywords: [
      "clean",
      "laundry",
      "moving",
      "move",
      "furniture",
      "boxes",
      "unpack",
      "assemble",
      "apartment",
      "household",
      "chores",
      "room",
    ],
    defaultSkills: ["household"],
  },
  {
    category: "delivery",
    label: "Delivery",
    description: "Delivering packages, documents, or items from one place to another.",
    keywords: [
      "deliver",
      "delivery",
      "package",
      "dropoff",
      "drop off",
      "courier",
      "parcel",
      "document",
      "mail",
    ],
    defaultSkills: ["delivery", "errands"],
  },
];

const CATEGORY_ENUM_MAP = new Map<
  string,
  "ERRANDS" | "MOBILITY" | "WELLNESS" | "LEARNING" | "HOUSEHOLD" | "DELIVERY" | "OTHER"
>([
  ["errands", "ERRANDS"],
  ["mobility", "MOBILITY"],
  ["wellness", "WELLNESS"],
  ["learning", "LEARNING"],
  ["household", "HOUSEHOLD"],
  ["delivery", "DELIVERY"],
  ["other", "OTHER"],
]);

const SKILL_LIBRARY = [
  { slug: "errands", keywords: ["pickup", "pick up", "errand", "shopping", "grocery", "pharmacy", "medicine"] },
  { slug: "senior-support", keywords: ["senior", "elder", "walker", "check in", "companion", "care"] },
  { slug: "mobility", keywords: ["ride", "transport", "driver", "appointment", "drop off", "wheelchair"] },
  { slug: "teaching", keywords: ["teach", "tutor", "practice", "lesson", "homework", "study"] },
  { slug: "math", keywords: ["algebra", "geometry", "math", "calculus"] },
  { slug: "student-support", keywords: ["student", "school", "study", "homework"] },
  { slug: "wellness", keywords: ["wellness", "care", "companion", "support", "visit"] },
  { slug: "household", keywords: ["clean", "moving", "furniture", "boxes", "unpack", "laundry", "assemble"] },
  { slug: "delivery", keywords: ["delivery", "deliver", "dropoff", "drop off", "package", "courier"] },
];

const TITLE_PREFIX_PATTERNS = [
  /^i need (someone )?to\s+/i,
  /^can someone\s+/i,
  /^please\s+/i,
  /^looking for (someone )?to\s+/i,
  /^need help to\s+/i,
  /^need help with\s+/i,
  /^help me\s+/i,
];

const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
  {
    categories: ["errands"],
    text: "Help with a quick errand, confirm the pickup details early, and wrap up with a clean handoff.",
  },
  {
    categories: ["errands"],
    text: "Pick up what the requester needs, stay clear on timing, and confirm delivery once it is done.",
  },
  {
    categories: ["mobility"],
    text: "Help the requester get where they need to go safely and stay coordinated around pickup and arrival.",
  },
  {
    categories: ["mobility"],
    text: "Provide calm travel support, confirm the destination, and keep the ride smooth from pickup to drop-off.",
  },
  {
    categories: ["wellness"],
    text: "Step in with steady support, keep communication calm, and check in clearly throughout the visit.",
  },
  {
    categories: ["wellness"],
    text: "Handle a support visit with care, stay easy to coordinate with, and leave the requester feeling looked after.",
  },
  {
    categories: ["learning"],
    text: "Guide the requester through the topic step by step and leave them with a clear next step by the end.",
  },
  {
    categories: ["learning"],
    text: "Help with practice, tutoring, or homework support and keep the session easy to follow from start to finish.",
  },
  {
    categories: ["household"],
    text: "Handle the home task safely, keep the requester updated, and leave the space in good order.",
  },
  {
    categories: ["household"],
    text: "Step in for a household task, keep the work tidy, and confirm once everything is wrapped up.",
  },
  {
    categories: ["delivery"],
    text: "Complete the pickup and drop-off cleanly, keep the requester updated on timing, and confirm the final handoff.",
  },
  {
    categories: ["delivery"],
    text: "Handle the delivery from pickup through drop-off and communicate quickly if timing shifts.",
  },
  {
    categories: ["other"],
    text: "Help with the request, clarify anything important at the start, and keep the requester updated as you go.",
  },
  {
    categories: ["other"],
    text: "Step in for a short local task, stay coordinated on timing, and finish with a smooth handoff.",
  },
  {
    categories: ["errands", "delivery", "mobility"],
    text: "Move quickly on the request, confirm the key details early, and keep the requester posted until it is complete.",
  },
  {
    categories: ["wellness", "learning", "household", "other"],
    text: "Approach the task with clear communication, keep the requester informed, and wrap up with a smooth final check-in.",
  },
];

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function trimTrailingPunctuation(value: string) {
  return value.replace(/[.!?,;:\s]+$/g, "").trim();
}

function toSentence(value: string) {
  const compacted = compactWhitespace(value);
  if (!compacted) {
    return "";
  }

  const normalized = compacted.charAt(0).toUpperCase() + compacted.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCategory(value: string | undefined): AssistantCategory | null {
  if (!value) {
    return null;
  }

  const normalized = compactWhitespace(value)
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  if (normalized === "token-funded" || normalized === "token") {
    return null;
  }

  for (const profile of CATEGORY_PROFILES) {
    if (
      normalized === profile.category ||
      normalized === profile.label.toLowerCase() ||
      normalized === profile.label.toLowerCase().replace(/\s+/g, "-")
    ) {
      return profile.category;
    }
  }

  return normalized === "other" ? "other" : null;
}

function includesKeyword(text: string, keyword: string) {
  if (!keyword) {
    return false;
  }

  if (keyword.includes(" ")) {
    return text.includes(keyword);
  }

  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(text);
}

function scoreCategory(text: string, profile: CategoryProfile) {
  return profile.keywords.reduce((score, keyword) => {
    if (!includesKeyword(text, keyword)) {
      return score;
    }

    return score + (keyword.includes(" ") ? 3 : 2);
  }, 0);
}

function inferCategory(text: string, fallback?: string): AssistantCategory {
  const normalizedFallback = normalizeCategory(fallback);
  if (normalizedFallback) {
    return normalizedFallback;
  }

  const lower = text.toLowerCase();
  let bestCategory: AssistantCategory = "other";
  let bestScore = 0;

  for (const profile of CATEGORY_PROFILES) {
    const score = scoreCategory(lower, profile);
    if (score > bestScore) {
      bestCategory = profile.category;
      bestScore = score;
    }
  }

  return bestScore > 0 ? bestCategory : "other";
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
    [
      "asap",
      "urgent",
      "emergency",
      "right now",
      "immediately",
      "before ",
      "tonight",
      "within an hour",
      "before 6",
      "today by",
    ].some((keyword) => lower.includes(keyword))
  ) {
    return "high";
  }

  if (
    [
      "today",
      "this afternoon",
      "this evening",
      "tomorrow",
      "soon",
      "later today",
      "this week",
    ].some((keyword) => lower.includes(keyword))
  ) {
    return "medium";
  }

  return "low";
}

function inferTaskType(text: string, fallback?: string): AssistantTaskType {
  if (fallback === "VOLUNTEER" || fallback === "TOKEN_FUNDED") {
    return fallback === "VOLUNTEER" ? "volunteer" : "token-funded";
  }

  const lower = text.toLowerCase();

  if (["free", "volunteer", "unpaid", "no reward", "no payment"].some((keyword) => lower.includes(keyword))) {
    return "volunteer";
  }

  return ["reward", "token", "$", "budget", "pay", "paid", "compensate", "tb"].some((keyword) =>
    lower.includes(keyword),
  )
    ? "token-funded"
    : "volunteer";
}

function inferTokenBudget(text: string, fallback?: number, taskType?: AssistantTaskType) {
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return Math.max(0, Math.round(fallback));
  }

  const explicitBudgetMatch = text.match(/(?:\$|tb|tokens?)\s?(\d{1,3})|(\d{1,3})\s?(?:tb|tokens?)/i);
  if (explicitBudgetMatch) {
    const firstMatch = explicitBudgetMatch[1] ?? explicitBudgetMatch[2];
    return Math.max(0, Math.round(Number(firstMatch)));
  }

  return taskType === "token-funded" ? 20 : 0;
}

function inferRadius(text: string, fallback?: number, category?: AssistantCategory) {
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return Math.max(1, Math.round(fallback));
  }

  const distanceMatch = text.match(/(\d{1,2})\s?(km|kilometer|kilometre|mile|miles)/i);
  if (distanceMatch) {
    const rawDistance = Number(distanceMatch[1]);
    if (distanceMatch[2].toLowerCase().startsWith("mile")) {
      return Math.max(1, Math.round(rawDistance * 1.60934));
    }

    return Math.max(1, Math.round(rawDistance));
  }

  if (category === "mobility" || category === "delivery") {
    return 6;
  }

  return 5;
}

function sanitizeTitleCandidate(value: string) {
  let cleaned = compactWhitespace(value);

  for (const pattern of TITLE_PREFIX_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = trimTrailingPunctuation(cleaned);

  if (!cleaned) {
    return "Help request";
  }

  return cleaned.length > 72 ? `${cleaned.slice(0, 69).trim()}...` : cleaned;
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, character) => hash + character.charCodeAt(0), 0);
}

function defaultTitleFromText(text: string) {
  const trimmed = compactWhitespace(text);
  if (!trimmed) {
    return "Help request";
  }

  const sentence = trimmed.split(/[.!?\n]/)[0] ?? trimmed;
  return sanitizeTitleCandidate(sentence);
}

function buildFallbackDescription(
  combinedText: string,
  category: AssistantCategory,
  taskType: AssistantTaskType,
  title: string,
  urgency: AssistantUrgency,
  locationLabel: string,
  notes: string,
) {
  const cleanedText = compactWhitespace(combinedText);
  const cleanedNotes = compactWhitespace(notes);
  const templates = DESCRIPTION_TEMPLATES.filter((template) => template.categories.includes(category));
  const selectedTemplate =
    templates.length > 0
      ? templates[hashString(`${title}:${cleanedText}:${category}`) % templates.length].text
      : DESCRIPTION_TEMPLATES[hashString(`${title}:${cleanedText}`) % DESCRIPTION_TEMPLATES.length].text;
  const sentences: string[] = [];

  if (cleanedText.length >= 72) {
    sentences.push(toSentence(cleanedText));
  } else {
    sentences.push(toSentence(selectedTemplate));
    if (cleanedText) {
      sentences.push(toSentence(`Task context: ${cleanedText}`));
    } else {
      sentences.push(toSentence(title));
    }
  }

  if (locationLabel && locationLabel !== "Current device location") {
    sentences.push(toSentence(`Meet near ${locationLabel}`));
  } else if (locationLabel) {
    sentences.push("Use the requester's current device location for arrival and handoff.");
  }

  if (urgency === "high" && !/asap|urgent|immediately|today|tonight|before/i.test(cleanedText)) {
    sentences.push("This should be handled as soon as possible.");
  } else if (urgency === "medium" && !/today|tomorrow|soon|this week/i.test(cleanedText)) {
    sentences.push("Same-day help is preferred if possible.");
  }

  if (taskType === "token-funded" && !/\breward\b|\bpay\b|\btoken\b|\bbudget\b|\bcash\b/i.test(cleanedText)) {
    sentences.push("A Wild Cash reward is attached for the captain who completes it.");
  }

  if (cleanedNotes) {
    sentences.push(toSentence(`Additional notes: ${cleanedNotes}`));
  }

  return compactWhitespace(sentences.filter(Boolean).join(" "));
}

function normalizeSkillSlug(value: string) {
  return compactWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferSkillSlugs(input: AssistTaskInput, categoryOverride?: AssistantCategory) {
  const text = compactWhitespace([input.title, input.description, input.transcript, input.notes].filter(Boolean).join(" "));
  const lower = text.toLowerCase();
  const category = categoryOverride ?? inferCategory(lower, input.category);
  const matches = new Set<string>();

  const categoryProfile = CATEGORY_PROFILES.find((profile) => profile.category === category);
  categoryProfile?.defaultSkills.forEach((skill) => matches.add(skill));

  for (const skill of SKILL_LIBRARY) {
    if (skill.keywords.some((keyword) => includesKeyword(lower, keyword))) {
      matches.add(skill.slug);
    }
  }

  if (!matches.size) {
    matches.add(category === "other" ? "errands" : categoryProfile?.defaultSkills[0] ?? "errands");
  }

  return Array.from(matches).slice(0, 4);
}

export function suggestSkillSlugs(input: AssistTaskInput) {
  return inferSkillSlugs(input);
}

function normalizeGeminiJson(rawText: string) {
  return rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function categoryEnumToKey(
  value: "ERRANDS" | "MOBILITY" | "WELLNESS" | "LEARNING" | "HOUSEHOLD" | "DELIVERY" | "OTHER",
): AssistantCategory {
  for (const [key, enumValue] of CATEGORY_ENUM_MAP) {
    if (enumValue === value) {
      return key as AssistantCategory;
    }
  }

  return "other";
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
            text: `You are drafting a neighbor-help task for captains to act on quickly.

Return JSON only with exactly these keys:
title, category, taskType, urgency, tokenBudget, radiusKm, requiredSkills, notes

Allowed values:
- category: errands, mobility, wellness, learning, household, delivery, other
- taskType: volunteer, token-funded
- urgency: low, medium, high
- requiredSkills: use only these slugs when relevant: errands, senior-support, mobility, teaching, math, student-support, wellness, household, delivery

Quality rules:
- Write a short, natural title captains can scan in seconds.
- Infer the best category from the request. Do not leave it generic unless there is no stronger fit.
- Pick urgency based on time pressure in the request.
- If the request sounds unpaid or volunteer-based, use volunteer. If it mentions budget, pay, reward, dollars, tokens, or compensation, use token-funded.
- Token budget should be 0 for volunteer tasks.
- Keep notes short and useful. Leave notes empty if nothing extra is needed.

Category guide:
${CATEGORY_PROFILES.map((profile) => `- ${profile.category}: ${profile.description}`).join("\n")}

Input:
${JSON.stringify(input, null, 2)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.15,
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
    return JSON.parse(normalizeGeminiJson(rawText)) as Partial<TaskAssistDraft>;
  } catch {
    return null;
  }
}

function normalizeTaskType(value: string | undefined, fallbackText: string): "VOLUNTEER" | "TOKEN_FUNDED" {
  const normalized = compactWhitespace(value ?? "").toUpperCase().replace(/-/g, "_");
  if (normalized === "VOLUNTEER" || normalized === "TOKEN_FUNDED") {
    return normalized;
  }

  return inferTaskType(fallbackText, value) === "volunteer" ? "VOLUNTEER" : "TOKEN_FUNDED";
}

function normalizeUrgency(value: string | undefined, fallbackText: string): "LOW" | "MEDIUM" | "HIGH" {
  const normalized = compactWhitespace(value ?? "").toUpperCase();
  if (normalized === "LOW" || normalized === "MEDIUM" || normalized === "HIGH") {
    return normalized;
  }

  return inferUrgency(fallbackText, value).toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
}

function normalizeCategoryEnum(value: string | undefined, fallbackText: string) {
  const normalized = normalizeCategory(value);
  return CATEGORY_ENUM_MAP.get(normalized ?? inferCategory(fallbackText)) ?? "OTHER";
}

export async function assistTask(input: AssistTaskInput): Promise<TaskAssistResult> {
  const combinedText = compactWhitespace([input.title, input.description, input.transcript, input.notes].filter(Boolean).join(" "));
  const fallbackCategory = inferCategory(combinedText, input.category);
  const fallbackTitle = defaultTitleFromText(combinedText);
  const fallbackLocationLabel = compactWhitespace(input.locationLabel || "") || "Current device location";
  const fallbackNotes = compactWhitespace(input.notes || "");

  const geminiDraft = await requestGeminiDraft(input);
  const draftingProvider = geminiDraft ? "gemini" : "heuristic";

  const title = sanitizeTitleCandidate(geminiDraft?.title || input.title || fallbackTitle);
  const taskType = normalizeTaskType(geminiDraft?.taskType || input.taskType, combinedText || title);
  const urgency = normalizeUrgency(geminiDraft?.urgency || input.urgency, combinedText || title);
  const category = normalizeCategoryEnum(geminiDraft?.category || input.category, combinedText || title);
  const categoryKey = categoryEnumToKey(category) || fallbackCategory;
  const description = buildFallbackDescription(
    input.description || input.transcript || title,
    categoryKey,
    taskType === "TOKEN_FUNDED" ? "token-funded" : "volunteer",
    title,
    urgency.toLowerCase() as AssistantUrgency,
    fallbackLocationLabel,
    geminiDraft?.notes || fallbackNotes,
  );

  const requiredSkills = Array.from(
    new Set(
      (
        geminiDraft?.requiredSkills?.length
          ? geminiDraft.requiredSkills.map((skill) => normalizeSkillSlug(String(skill)))
          : inferSkillSlugs(input, categoryKey)
      ).filter(Boolean),
    ),
  ).slice(0, 4);

  const tokenBudget =
    taskType === "TOKEN_FUNDED"
      ? inferTokenBudget(
          combinedText,
          geminiDraft?.tokenBudget ?? input.tokenBudget,
          taskType === "TOKEN_FUNDED" ? "token-funded" : "volunteer",
        )
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
      radiusKm: inferRadius(combinedText, geminiDraft?.radiusKm ?? input.radiusKm, categoryKey),
      requiredSkills,
      locationLabel: fallbackLocationLabel,
      latitude: input.latitude ?? 41.8839,
      longitude: input.longitude ?? -87.6376,
      notes: compactWhitespace(geminiDraft?.notes || fallbackNotes),
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
