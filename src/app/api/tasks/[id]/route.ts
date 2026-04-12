import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { taskViewFromRecord } from "@/server/services/platform-view-models";
import {
  DEFAULT_TASK_LATITUDE,
  DEFAULT_TASK_LONGITUDE,
  normalizeNullableString,
  normalizeNumber,
  normalizeRequiredString,
  normalizeTaskCategory,
  normalizeTaskType,
  normalizeTaskUrgency,
} from "@/server/services/task-normalization";
import { createEscrowLockIfNeeded, dispatchTaskOffers, ensureSkills, topRecommendationViews } from "@/server/services/task-flow";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
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
      payoutTransactions: {
        where: {
          type: "REWARD_PAYOUT" as const,
        },
        orderBy: {
          createdAt: "desc" as const,
        },
        take: 1,
      },
    },
  },
};

async function loadTask(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });
}

type TaskAccessRecord = {
  creatorId: string;
  assignment?: { captainId: string | null } | null;
  offers?: Array<{ captainId: string | null }>;
};

function canViewTask(task: TaskAccessRecord, userId: string, role: string) {
  if (role === "ADMIN") {
    return true;
  }

  if (task.creatorId === userId) {
    return true;
  }

  if (task.assignment?.captainId === userId) {
    return true;
  }

  return task.offers?.some((offer) => offer.captainId === userId);
}

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const { id } = await context.params;
  const task = await loadTask(id);

  if (!task) {
    return badRequest("Task not found.", 404);
  }

  if (!canViewTask(task, currentUser.user.id, currentUser.user.role)) {
    return badRequest("You do not have access to this task.", 403);
  }

  const recommendations =
    task.status === "DRAFT" || task.status === "COMPLETED"
      ? []
      : await topRecommendationViews(task.id, 7);

  return jsonWithCors({
    task: taskViewFromRecord(task),
    recommendations,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const { id } = await context.params;
  const task = await loadTask(id);

  if (!task) {
    return badRequest("Task not found.", 404);
  }

  if (task.creatorId !== currentUser.user.id) {
    return badRequest("Only the task creator can edit this task.", 403);
  }

  if (!["DRAFT", "OPEN", "MATCHING"].includes(task.status)) {
    return badRequest("This task can no longer be edited.");
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const skillInputs = Array.isArray(body.requiredSkills ?? body.required_skills)
    ? (body.requiredSkills ?? body.required_skills)
    : [];
  const skills = await ensureSkills(
    skillInputs.filter((entry: unknown): entry is string => typeof entry === "string"),
  );
  const taskType = normalizeTaskType(body.taskType || body.task_type || task.taskType);
  const tokenBudget = taskType === "TOKEN_FUNDED"
    ? Math.max(0, Math.round(normalizeNumber(body.tokenBudget ?? body.token_budget, task.tokenBudget)))
    : 0;
  const publishNow = body.publish === true || String(body.status ?? "").toUpperCase() === "OPEN";

  await prisma.task.update({
    where: { id },
    data: {
      title: normalizeRequiredString(body.title, task.title) || task.title,
      description: normalizeRequiredString(body.description, task.description) || task.description,
      category: normalizeTaskCategory(body.category || task.category),
      taskType,
      status: publishNow ? "OPEN" : String(body.status ?? task.status).toUpperCase() === "DRAFT" ? "DRAFT" : task.status,
      urgency: normalizeTaskUrgency(body.urgency || task.urgency),
      tokenBudget,
      locationLabel: normalizeRequiredString(body.locationLabel || body.location_address, task.locationLabel) || task.locationLabel,
      latitude: normalizeNumber(body.latitude, task.latitude ?? DEFAULT_TASK_LATITUDE),
      longitude: normalizeNumber(body.longitude, task.longitude ?? DEFAULT_TASK_LONGITUDE),
      radiusKm: Math.max(1, Math.round(normalizeNumber(body.radiusKm ?? body.radius_km, task.radiusKm))),
      voiceTranscript: normalizeNullableString(body.voiceTranscript || body.voice_transcript) ?? task.voiceTranscript,
      notes: normalizeNullableString(body.notes) ?? task.notes,
      requiredSkills: {
        deleteMany: {},
        create: skills.map((skill) => ({
          skillId: skill.id,
        })),
      },
    },
  });

  if (publishNow && task.status === "DRAFT") {
    await createEscrowLockIfNeeded(id, currentUser.user.id, tokenBudget);
  }

  if (publishNow) {
    await dispatchTaskOffers(id);
  }

  const updatedTask = await loadTask(id);
  const recommendations =
    updatedTask && updatedTask.status !== "DRAFT" ? await topRecommendationViews(id, 7) : [];

  return jsonWithCors({
    task: updatedTask ? taskViewFromRecord(updatedTask) : null,
    recommendations,
  });
}
