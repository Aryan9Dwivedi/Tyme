import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { opportunityViewFromOffer } from "@/server/services/platform-view-models";
import { recommendationViewForCaptain } from "@/server/services/task-flow";

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

  const offers = await prisma.taskOffer.findMany({
    where: {
      captainId: currentUser.user.id,
      status: "PENDING",
      task: {
        status: {
          in: ["OPEN", "MATCHING", "OFFERED"],
        },
      },
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const opportunities = [];

  for (const offer of offers) {
    const recommendation = await recommendationViewForCaptain(offer.taskId, currentUser.user.id);
    opportunities.push(opportunityViewFromOffer(offer, recommendation));
  }

  opportunities.sort((left, right) => right.ranking_score - left.ranking_score);

  return jsonWithCors({
    opportunities,
  });
}
