import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { refreshCaptainTrustScore } from "@/server/services/task-flow";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const score = Number(body.score);
  const note = typeof body.note === "string" ? body.note.trim() : null;

  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return badRequest("Score must be between 1 and 5.");
  }

  const { id } = await context.params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          role: true,
        },
      },
      assignment: {
        include: {
          captain: {
            select: {
              id: true,
              role: true,
            },
          },
          ratings: {
            select: {
              id: true,
              authorId: true,
              targetId: true,
            },
          },
        },
      },
    },
  });

  if (!task?.assignment || task.status !== "COMPLETED") {
    return badRequest("Feedback is only available after a task is completed.", 409);
  }

  let targetUserId: string | null = null;

  if (task.creatorId === currentUser.user.id) {
    targetUserId = task.assignment.captainId;
  } else if (task.assignment.captainId === currentUser.user.id) {
    targetUserId = task.creatorId;
  } else {
    return badRequest("You do not have access to leave feedback for this task.", 403);
  }

  const existingRating = task.assignment.ratings.find(
    (rating) =>
      rating.authorId === currentUser.user.id && rating.targetId === targetUserId,
  );

  if (existingRating) {
    await prisma.rating.update({
      where: { id: existingRating.id },
      data: {
        score,
        note,
      },
    });
  } else {
    await prisma.rating.create({
      data: {
        assignmentId: task.assignment.id,
        authorId: currentUser.user.id,
        targetId: targetUserId,
        score,
        note,
      },
    });
  }

  if (targetUserId === task.assignment.captainId) {
    await refreshCaptainTrustScore(targetUserId);
  }

  return jsonWithCors({ success: true });
}
