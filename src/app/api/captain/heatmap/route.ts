import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import {
  getCaptainDemandSnapshot,
  parseCaptainDemandCategory,
  parseCaptainDemandUrgency,
} from "@/server/services/captain-demand";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "CAPTAIN") {
    return badRequest("Captain access only.", 403);
  }

  const { searchParams } = new URL(request.url);
  const rawWindowMinutes = Number(searchParams.get("lastMinutes") ?? "60");
  const rawCategory = searchParams.get("category");
  const rawUrgency = searchParams.get("urgency");

  if (!Number.isFinite(rawWindowMinutes)) {
    return badRequest("lastMinutes must be a number.");
  }

  const category = parseCaptainDemandCategory(rawCategory);
  const urgency = parseCaptainDemandUrgency(rawUrgency);

  if (rawCategory && !category) {
    return badRequest("Invalid category filter.");
  }

  if (rawUrgency && !urgency) {
    return badRequest("Invalid urgency filter.");
  }

  const snapshot = await getCaptainDemandSnapshot({
    category,
    urgency,
    windowMinutes: rawWindowMinutes,
  });

  return jsonWithCors(snapshot);
}
