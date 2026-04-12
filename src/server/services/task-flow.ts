import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { captainSummaryFromUser, recommendationViewFromRanking } from "@/server/services/platform-view-models";
import { loadCaptainsForRecommendation, loadTaskWithSkills } from "@/server/services/recommendation-queries";
import {
  mapPrismaCaptainToCaptainProfile,
  mapPrismaTaskToTaskRequest,
} from "@/server/services/recommendation-mappers";
import { rankCaptainsForTask } from "@/server/services/recommendation-engine";

function slugifySkill(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function labelFromSkillSlug(slug: string) {
  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export async function ensureSkills(skillInputs: string[]) {
  const normalized = Array.from(
    new Set(skillInputs.map(slugifySkill).filter((skill) => skill.length > 0)),
  );

  if (!normalized.length) {
    return [];
  }

  const existing = await prisma.skill.findMany({
    where: {
      slug: { in: normalized },
    },
  });
  const existingSlugs = new Set(existing.map((skill) => skill.slug));
  const missing = normalized.filter((slug) => !existingSlugs.has(slug));

  if (missing.length) {
    await prisma.skill.createMany({
      data: missing.map((slug) => ({
        slug,
        label: labelFromSkillSlug(slug),
      })),
      skipDuplicates: true,
    });
  }

  return prisma.skill.findMany({
    where: {
      slug: { in: normalized },
    },
  });
}

export async function getTaskRecommendations(taskId: string, limit?: number) {
  const [taskRow, captainRows] = await Promise.all([
    loadTaskWithSkills(taskId),
    loadCaptainsForRecommendation(),
  ]);

  if (!taskRow) {
    return null;
  }

  const task = mapPrismaTaskToTaskRequest(taskRow);
  const recommendations = rankCaptainsForTask(
    task,
    captainRows.map(mapPrismaCaptainToCaptainProfile),
  );

  if (typeof limit === "number") {
    return recommendations.slice(0, limit);
  }

  return recommendations;
}

export async function dispatchTaskOffers(taskId: string) {
  const recommendations = await getTaskRecommendations(taskId);

  if (!recommendations) {
    return null;
  }

  const existingOffers = await prisma.taskOffer.findMany({
    where: { taskId },
    select: {
      id: true,
      captainId: true,
      status: true,
    },
  });
  const offersByCaptainId = new Map(existingOffers.map((offer) => [offer.captainId, offer]));

  for (const recommendation of recommendations) {
    const existingOffer = offersByCaptainId.get(recommendation.captain.id);

    if (!existingOffer) {
      await prisma.taskOffer.create({
        data: {
          taskId,
          captainId: recommendation.captain.id,
          status: "PENDING",
          note: recommendation.reasons.join(" · "),
        },
      });
      continue;
    }

    if (existingOffer.status === "WITHDRAWN" || existingOffer.status === "EXPIRED") {
      await prisma.taskOffer.update({
        where: { id: existingOffer.id },
        data: {
          status: "PENDING",
          note: recommendation.reasons.join(" · "),
          respondedAt: null,
        },
      });
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: recommendations.length ? "MATCHING" : "OPEN",
    },
  });

  return recommendations;
}

export async function refreshCaptainTrustScore(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { targetId: userId },
    select: { score: true },
  });

  const trustScore = ratings.length
    ? Math.round((ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length) * 20)
    : 50;

  await prisma.captainProfile.updateMany({
    where: { userId },
    data: { trustScore },
  });
}

export async function createEscrowLockIfNeeded(taskId: string, creatorId: string, tokenBudget: number) {
  if (tokenBudget <= 0) {
    return;
  }

  const wallet = await prisma.wallet.findUnique({
    where: { ownerId: creatorId },
    select: { id: true },
  });

  if (!wallet) {
    return;
  }

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      assignmentId: null,
      direction: "DEBIT",
      type: "ESCROW_LOCK",
      status: "CONFIRMED",
      amountTokens: tokenBudget,
      reason: "Escrow reserved for a newly created Tyme task",
      metadata: { taskId },
      confirmedAt: new Date(),
    },
  });
}

async function ensurePendingPayoutTransaction(
  assignmentId: string,
  walletId: string,
  taskId: string,
  amountTokens: number,
) {
  const existing = await prisma.transaction.findFirst({
    where: {
      assignmentId,
      walletId,
      type: "REWARD_PAYOUT",
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.transaction.create({
    data: {
      walletId,
      assignmentId,
      direction: "CREDIT",
      type: "REWARD_PAYOUT",
      status: "PENDING",
      amountTokens,
      reason: "Reward queued until both sides close the loop with feedback",
      metadata: {
        taskId,
        settlement: "awaiting-feedback",
      },
    },
    select: {
      id: true,
      status: true,
    },
  });
}

export async function acceptOffer(offerId: string, captainId: string) {
  const offer = await prisma.taskOffer.findUnique({
    where: { id: offerId },
    include: {
      task: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!offer || offer.captainId !== captainId) {
    return null;
  }

  if (offer.status !== "PENDING") {
    throw new Error("This opportunity is no longer available.");
  }

  const existingAssignment = await prisma.assignment.findUnique({
    where: { taskId: offer.taskId },
    select: { id: true },
  });

  if (existingAssignment) {
    throw new Error("This task has already been assigned.");
  }

  await prisma.$transaction([
    prisma.taskOffer.update({
      where: { id: offerId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    }),
    prisma.taskOffer.updateMany({
      where: {
        taskId: offer.taskId,
        id: { not: offerId },
        status: "PENDING",
      },
      data: {
        status: "WITHDRAWN",
        respondedAt: new Date(),
      },
    }),
    prisma.task.update({
      where: { id: offer.taskId },
      data: { status: "ASSIGNED" },
    }),
    prisma.assignment.create({
      data: {
        taskId: offer.taskId,
        captainId,
        offerId,
        status: "PENDING_START",
        acceptedAt: new Date(),
      },
    }),
    prisma.captainProfile.updateMany({
      where: { userId: captainId },
      data: {
        availabilityStatus: "BUSY",
        isAvailableNow: false,
      },
    }),
  ]);

  return true;
}

export async function declineOffer(offerId: string, captainId: string) {
  const offer = await prisma.taskOffer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      captainId: true,
      taskId: true,
      status: true,
    },
  });

  if (!offer || offer.captainId !== captainId) {
    return null;
  }

  if (offer.status !== "PENDING") {
    return true;
  }

  await prisma.taskOffer.update({
    where: { id: offerId },
    data: {
      status: "DECLINED",
      respondedAt: new Date(),
    },
  });

  const pendingOfferCount = await prisma.taskOffer.count({
    where: {
      taskId: offer.taskId,
      status: "PENDING",
    },
  });

  if (pendingOfferCount === 0) {
    await prisma.task.update({
      where: { id: offer.taskId },
      data: {
        status: "OPEN",
      },
    });
  }

  return true;
}

export async function startAssignment(assignmentId: string, captainId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      captainId: true,
      taskId: true,
      status: true,
    },
  });

  if (!assignment || assignment.captainId !== captainId) {
    return null;
  }

  if (assignment.status !== "PENDING_START") {
    return true;
  }

  await prisma.$transaction([
    prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
      },
    }),
    prisma.task.update({
      where: { id: assignment.taskId },
      data: {
        status: "IN_PROGRESS",
      },
    }),
  ]);

  return true;
}

export async function completeAssignment(assignmentId: string, captainId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      task: {
        select: {
          id: true,
          tokenBudget: true,
        },
      },
      captain: {
        select: {
          id: true,
          wallet: {
            select: { id: true, balanceTokens: true },
          },
        },
      },
    },
  });

  if (!assignment || assignment.captainId !== captainId) {
    return null;
  }

  if (assignment.status === "COMPLETED") {
    return true;
  }

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    }),
    prisma.task.update({
      where: { id: assignment.taskId },
      data: {
        status: "COMPLETED",
      },
    }),
    prisma.captainProfile.updateMany({
      where: { userId: captainId },
      data: {
        availabilityStatus: "ONLINE",
        isAvailableNow: true,
        tasksCompleted: {
          increment: 1,
        },
      },
    }),
  ];

  if (assignment.task.tokenBudget > 0 && assignment.captain.wallet) {
    await ensurePendingPayoutTransaction(
      assignmentId,
      assignment.captain.wallet.id,
      assignment.task.id,
      assignment.task.tokenBudget,
    );

    operations.push(
      prisma.transaction.updateMany({
        where: {
          assignmentId,
          walletId: assignment.captain.wallet.id,
          type: "REWARD_PAYOUT",
        },
        data: {
          status: "PENDING",
          reason: "Reward queued until both sides close the loop with feedback",
          confirmedAt: null,
          metadata: {
            taskId: assignment.task.id,
            settlement: "awaiting-feedback",
          },
        },
      }),
    );
  }

  await prisma.$transaction(operations);

  return true;
}

export async function settleAssignmentPayoutIfReady(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      task: {
        select: {
          id: true,
          tokenBudget: true,
          creatorId: true,
          status: true,
        },
      },
      captain: {
        select: {
          id: true,
          wallet: {
            select: {
              id: true,
              balanceTokens: true,
            },
          },
        },
      },
      ratings: {
        select: {
          authorId: true,
        },
      },
      payoutTransactions: {
        where: {
          type: "REWARD_PAYOUT",
        },
        select: {
          id: true,
          status: true,
          walletId: true,
          amountTokens: true,
        },
      },
    },
  });

  if (!assignment || assignment.status !== "COMPLETED") {
    return { payoutReleased: false, payoutStatus: "NONE" as const };
  }

  if (assignment.task.tokenBudget <= 0 || !assignment.captain.wallet) {
    return { payoutReleased: false, payoutStatus: "NONE" as const };
  }

  const feedbackAuthors = new Set(assignment.ratings.map((rating) => rating.authorId));
  const bothSidesSubmitted =
    feedbackAuthors.has(assignment.task.creatorId) && feedbackAuthors.has(assignment.captainId);

  const payoutTransaction = assignment.payoutTransactions[0] ?? null;

  if (!payoutTransaction) {
    await ensurePendingPayoutTransaction(
      assignmentId,
      assignment.captain.wallet.id,
      assignment.task.id,
      assignment.task.tokenBudget,
    );

    return {
      payoutReleased: false,
      payoutStatus: bothSidesSubmitted ? ("PENDING" as const) : ("PENDING" as const),
    };
  }

  if (!bothSidesSubmitted) {
    return {
      payoutReleased: false,
      payoutStatus: payoutTransaction.status,
    };
  }

  if (payoutTransaction.status === "CONFIRMED") {
    return {
      payoutReleased: false,
      payoutStatus: "CONFIRMED" as const,
    };
  }

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: assignment.captain.wallet.id },
      data: {
        balanceTokens: assignment.captain.wallet.balanceTokens + payoutTransaction.amountTokens,
        lastSyncedAt: new Date(),
      },
    }),
    prisma.transaction.update({
      where: { id: payoutTransaction.id },
      data: {
        status: "CONFIRMED",
        reason: "Task completed payout released after both sides submitted feedback",
        metadata: {
          taskId: assignment.task.id,
          settlement: "released-after-feedback",
        },
        confirmedAt: new Date(),
      },
    }),
  ]);

  return {
    payoutReleased: true,
    payoutStatus: "CONFIRMED" as const,
  };
}

export async function nearbyCaptainCards(limit = 4) {
  const captains = await prisma.user.findMany({
    where: {
      role: "CAPTAIN",
      status: "ACTIVE",
    },
    include: {
      captainProfile: {
        include: {
          skills: {
            include: { skill: true },
          },
        },
      },
      ratingsReceived: {
        select: { score: true },
      },
    },
    take: limit,
  });

  return captains
    .map(captainSummaryFromUser)
    .sort((left, right) => right.trust_score - left.trust_score)
    .slice(0, limit);
}

export async function recommendationViewForCaptain(taskId: string, captainUserId: string) {
  const recommendations = await getTaskRecommendations(taskId);
  return recommendations?.find((recommendation) => recommendation.captain.id === captainUserId) ?? null;
}

export async function topRecommendationViews(taskId: string, limit = 7) {
  const recommendations = await getTaskRecommendations(taskId, limit);

  if (!recommendations?.length) {
    return [];
  }

  const offers = await prisma.taskOffer.findMany({
    where: { taskId },
    select: {
      captainId: true,
      status: true,
    },
  });

  const statusByCaptainId = new Map(
    offers.map((offer) => [
      offer.captainId,
      offer.status === "PENDING" ? "PINGED" : offer.status,
    ]),
  );

  return recommendations.map((recommendation) =>
    recommendationViewFromRanking(
      recommendation,
      statusByCaptainId.get(recommendation.captain.id) ?? "QUEUED",
    ),
  );
}
