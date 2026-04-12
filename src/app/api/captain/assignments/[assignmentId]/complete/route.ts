import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { completeAssignment } from "@/server/services/task-flow";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ assignmentId: string }> },
) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "CAPTAIN") {
    return badRequest("Captain access only.", 403);
  }

  const { assignmentId } = await context.params;
  const completed = await completeAssignment(assignmentId, currentUser.user.id);

  if (!completed) {
    return badRequest("Assignment not found.", 404);
  }

  return jsonWithCors({ success: true });
}
