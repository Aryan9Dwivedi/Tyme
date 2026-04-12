import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { acceptOffer } from "@/server/services/task-flow";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "CAPTAIN") {
    return badRequest("Captain access only.", 403);
  }

  const { offerId } = await context.params;

  try {
    const accepted = await acceptOffer(offerId, currentUser.user.id);

    if (!accepted) {
      return badRequest("Opportunity not found.", 404);
    }

    return jsonWithCors({ success: true });
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Unable to accept this opportunity.",
      409,
    );
  }
}
