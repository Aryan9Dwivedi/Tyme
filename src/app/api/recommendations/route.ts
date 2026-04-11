import { captainProfiles, taskRequests } from "@/lib/mocks/platform";
import { rankCaptainsForTask } from "@/server/services/recommendation-engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId") ?? taskRequests[0]?.id;
  const task = taskRequests.find((item) => item.id === taskId);

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json({
    task,
    recommendations: rankCaptainsForTask(task, captainProfiles).slice(0, 3),
    generatedAt: new Date().toISOString(),
  });
}
