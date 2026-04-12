import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { taskViewFromRecord } from "@/server/services/platform-view-models";
import { nearbyCaptainCards } from "@/server/services/task-flow";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

const taskInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  requiredSkills: {
    include: {
      skill: true,
    },
  },
  offers: {
    orderBy: {
      createdAt: "asc" as const,
    },
    include: {
      captain: {
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
      },
    },
  },
  assignment: {
    include: {
      captain: {
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
  },
};

export async function GET(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "USER") {
    return badRequest("User access only.", 403);
  }

  const [tasks, nearbyCaptains] = await Promise.all([
    prisma.task.findMany({
      where: {
        creatorId: currentUser.user.id,
      },
      include: taskInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    nearbyCaptainCards(4),
  ]);

  const taskViews = tasks.map((task) => taskViewFromRecord(task));

  return jsonWithCors({
    activeTasks: taskViews.filter((task) =>
      ["MATCHING", "OFFERED", "ASSIGNED", "IN_PROGRESS"].includes(task.status),
    ),
    drafts: taskViews.filter((task) => task.status === "DRAFT"),
    completedTasks: taskViews.filter((task) => task.status === "COMPLETED").slice(0, 3),
    nearbyCaptains: nearbyCaptains.map((captain) => ({
      ...captain,
      skills: captain.skills.slice(0, 4),
    })),
    stats: {
      total: taskViews.length,
      active: taskViews.filter((task) =>
        ["MATCHING", "OFFERED", "ASSIGNED", "IN_PROGRESS"].includes(task.status),
      ).length,
      completed: taskViews.filter((task) => task.status === "COMPLETED").length,
      drafts: taskViews.filter((task) => task.status === "DRAFT").length,
      walletBalance: currentUser.user.wallet?.balanceTokens ?? 0,
      pendingBalance: 0,
    },
  });
}
