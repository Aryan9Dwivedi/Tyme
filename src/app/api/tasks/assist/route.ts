import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { assistTaskDraft, suggestSkillSlugs } from "@/server/services/task-assistant";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const draft = await assistTaskDraft({
    title: typeof body.title === "string" ? body.title : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    transcript: typeof body.transcript === "string" ? body.transcript : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    taskType: typeof body.taskType === "string" ? body.taskType : undefined,
    urgency: typeof body.urgency === "string" ? body.urgency : undefined,
    tokenBudget: typeof body.tokenBudget === "number" ? body.tokenBudget : undefined,
    radiusKm: typeof body.radiusKm === "number" ? body.radiusKm : undefined,
    locationLabel: typeof body.locationLabel === "string" ? body.locationLabel : undefined,
    latitude: typeof body.latitude === "number" ? body.latitude : undefined,
    longitude: typeof body.longitude === "number" ? body.longitude : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });

  return jsonWithCors({
    draft,
    suggestedSkills: suggestSkillSlugs(body),
  });
}
