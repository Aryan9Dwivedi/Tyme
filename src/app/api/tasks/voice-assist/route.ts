import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { transcribeTaskVoice } from "@/server/services/elevenlabs-speech";
import { assistTask, suggestSkillSlugs, type AssistTaskInput } from "@/server/services/task-assistant";

export const runtime = "nodejs";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseAssistPayload(value: FormDataEntryValue | null): AssistTaskInput {
  if (typeof value !== "string") {
    return {};
  }

  const parsed = JSON.parse(value) as Record<string, unknown>;

  return {
    title: getOptionalString(parsed.title),
    description: getOptionalString(parsed.description),
    transcript: getOptionalString(parsed.transcript),
    category: getOptionalString(parsed.category),
    taskType: getOptionalString(parsed.taskType),
    urgency: getOptionalString(parsed.urgency),
    tokenBudget: getOptionalNumber(parsed.tokenBudget),
    radiusKm: getOptionalNumber(parsed.radiusKm),
    locationLabel: getOptionalString(parsed.locationLabel),
    latitude: getOptionalNumber(parsed.latitude),
    longitude: getOptionalNumber(parsed.longitude),
    notes: getOptionalString(parsed.notes),
  };
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "USER") {
    return badRequest("Only users can create voice-assisted tasks.", 403);
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return badRequest("Voice assist form data is required.");
  }

  const audioFile = formData.get("audio");

  if (!(audioFile instanceof File)) {
    return badRequest("Audio upload is required.");
  }

  let assistInput: AssistTaskInput = {};

  try {
    assistInput = parseAssistPayload(formData.get("payload"));
  } catch {
    return badRequest("Voice assist payload must be valid JSON.");
  }

  try {
    const languageCodeField = formData.get("languageCode");
    const voiceAssist = await transcribeTaskVoice(
      audioFile,
      typeof languageCodeField === "string" ? languageCodeField : undefined,
    );
    const combinedTranscript = [assistInput.transcript, voiceAssist.transcript].filter(Boolean).join("\n");
    const assist = await assistTask({
      ...assistInput,
      transcript: combinedTranscript,
    });

    return jsonWithCors({
      transcript: voiceAssist.transcript,
      combinedTranscript,
      languageCode: voiceAssist.languageCode,
      draft: assist.draft,
      suggestedSkills: suggestSkillSlugs({
        ...assistInput,
        transcript: combinedTranscript,
      }),
      providers: {
        ...assist.providers,
        ...voiceAssist.providers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice assist is unavailable right now.";
    return badRequest(message, message.includes("not configured") ? 503 : 502);
  }
}
