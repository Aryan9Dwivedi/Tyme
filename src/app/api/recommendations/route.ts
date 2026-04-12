import { captainProfiles } from "@/lib/mocks/platform";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { isDatabaseConfigured } from "@/server/db/prisma";
import { rankCaptainsForTask } from "@/server/services/recommendation-engine";
import { findDefaultRecommendationTaskId, loadCaptainsForRecommendation, loadTaskWithSkills } from "@/server/services/recommendation-queries";
import {
  mapPrismaCaptainToCaptainProfile,
  mapPrismaTaskToTaskRequest,
} from "@/server/services/recommendation-mappers";
import { parseRecommendationJsonBody } from "@/server/validation/recommendation-json";
import { taskRequests } from "@/lib/mocks/platform";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTaskId = searchParams.get("taskId");
  const limit = Number(searchParams.get("limit") ?? "3");

  if (isDatabaseConfigured()) {
    const taskId = requestedTaskId ?? (await findDefaultRecommendationTaskId());

    if (!taskId) {
      return badRequest("Task not found.", 404);
    }

    const [taskRow, captainRows] = await Promise.all([
      loadTaskWithSkills(taskId),
      loadCaptainsForRecommendation(),
    ]);

    if (!taskRow) {
      return badRequest("Task not found.", 404);
    }

    const task = mapPrismaTaskToTaskRequest(taskRow);
    const recommendations = rankCaptainsForTask(
      task,
      captainRows.map(mapPrismaCaptainToCaptainProfile),
    );

    return jsonWithCors({
      task,
      recommendations: recommendations.slice(0, Number.isFinite(limit) ? limit : 3),
      generatedAt: new Date().toISOString(),
      source: "database",
    });
  }

  const task = taskRequests.find((entry) => entry.id === requestedTaskId) ?? taskRequests[0];
  if (!task) {
    return badRequest("Task not found.", 404);
  }

  return jsonWithCors({
    task,
    recommendations: rankCaptainsForTask(task, captainProfiles).slice(0, 3),
    generatedAt: new Date().toISOString(),
    source: "mock",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const parsed = parseRecommendationJsonBody(body);
  if (!parsed.ok) {
    return badRequest(parsed.error);
  }

  let captains = parsed.value.captains;

  if (!captains) {
    if (isDatabaseConfigured()) {
      const captainRows = await loadCaptainsForRecommendation();
      captains = captainRows.map(mapPrismaCaptainToCaptainProfile);
    } else {
      captains = captainProfiles;
    }
  }

  return jsonWithCors({
    task: parsed.value.task,
    recommendations: rankCaptainsForTask(parsed.value.task, captains).slice(0, parsed.value.limit),
    generatedAt: new Date().toISOString(),
  });
}
