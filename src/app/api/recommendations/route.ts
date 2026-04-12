import { captainProfiles, taskRequests } from "@/lib/mocks/platform";
import { rankCaptainsForTask } from "@/server/services/recommendation-engine";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId") ?? taskRequests[0]?.id;
  const task = taskRequests.find((item) => item.id === taskId);

  if (!task) {
    return jsonWithCors({ error: "Task not found" }, { status: 404 });
  }

  return jsonWithCors({
    task,
    recommendations: rankCaptainsForTask(task, captainProfiles).slice(0, 3),
    generatedAt: new Date().toISOString(),
  });
}
