import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { assignmentViewFromRecord } from "@/server/services/platform-view-models";

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

  const assignments = await prisma.assignment.findMany({
    where: {
      captainId: currentUser.user.id,
    },
    include: {
      task: {
        include: {
          requiredSkills: {
            include: { skill: true },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      ratings: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return jsonWithCors({
    assignments: assignments.map(assignmentViewFromRecord),
  });
}
