import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import {
  assignmentViewFromRecord,
  captainSummaryFromUser,
  opportunityViewFromOffer,
} from "@/server/services/platform-view-models";
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

  const [captain, offers, assignments, recentRatings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: currentUser.user.id },
      include: {
        wallet: true,
        ratingsReceived: {
          select: { score: true },
        },
        captainProfile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      },
    }),
    prisma.taskOffer.findMany({
      where: {
        captainId: currentUser.user.id,
        status: "PENDING",
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
      take: 4,
    }),
    prisma.assignment.findMany({
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
      take: 6,
    }),
    prisma.rating.findMany({
      where: {
        targetId: currentUser.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    }),
  ]);

  if (!captain) {
    return badRequest("Captain profile not found.", 404);
  }

  const opportunityViews = [];
  for (const offer of offers) {
    const recommendation = await recommendationViewForCaptain(offer.taskId, currentUser.user.id);
    opportunityViews.push(opportunityViewFromOffer(offer, recommendation));
  }

  opportunityViews.sort((left, right) => right.ranking_score - left.ranking_score);

  return jsonWithCors({
    profile: captainSummaryFromUser(captain),
    wallet: captain.wallet
      ? {
          balanceTokens: captain.wallet.balanceTokens,
          network: captain.wallet.network,
          solanaAddress: captain.wallet.solanaAddress,
        }
      : null,
    opportunities: opportunityViews,
    assignments: assignments.map(assignmentViewFromRecord),
    stats: {
      activeAssignments: assignments.filter((assignment) =>
        ["PENDING_START", "ACTIVE"].includes(assignment.status),
      ).length,
      completedAssignments: assignments.filter((assignment) => assignment.status === "COMPLETED").length,
      earnings: captain.wallet?.balanceTokens ?? 0,
    },
    recentRatings: recentRatings.map((rating) => ({
      id: rating.id,
      score: rating.score,
      comment: rating.note ?? "",
      rater_name: rating.author.name,
      created_date: rating.createdAt,
      tags: [],
    })),
  });
}
