import { getPrismaClient } from "@/server/db/prisma";

export async function findDefaultRecommendationTaskId() {
  const prisma = getPrismaClient();
  const row = await prisma.task.findFirst({
    where: {
      status: { in: ["OPEN", "MATCHING"] },
    },
    orderBy: { requestedAt: "desc" },
    select: { id: true },
  });

  return row?.id ?? null;
}

export async function loadTaskWithSkills(taskId: string) {
  const prisma = getPrismaClient();

  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      requiredSkills: {
        include: { skill: true },
      },
    },
  });
}

export async function loadCaptainsForRecommendation() {
  const prisma = getPrismaClient();

  return prisma.captainProfile.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      user: {
        role: "CAPTAIN",
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          ratingsReceived: {
            select: { score: true },
          },
        },
      },
      skills: {
        include: { skill: true },
      },
    },
  });
}
