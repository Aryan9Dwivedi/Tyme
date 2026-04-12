import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import {
  DEFAULT_TASK_LATITUDE,
  DEFAULT_TASK_LONGITUDE,
  normalizeNullableString,
  normalizeNumber,
  normalizeRequiredString,
  normalizeTaskCategory,
  normalizeTaskStatus,
  normalizeTaskType,
  normalizeTaskUrgency,
} from "@/server/services/task-normalization";
import { ensureSkills, createEscrowLockIfNeeded, dispatchTaskOffers, topRecommendationViews } from "@/server/services/task-flow";
import { taskViewFromRecord } from "@/server/services/platform-view-models";
import { prisma } from "@/server/db/prisma";

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
    },
  },
};

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const requestedStatus = normalizeTaskStatus(searchParams.get("status"));
  const mineOnly = searchParams.get("mine") !== "0";
  const where: Record<string, unknown> =
    currentUser.user.role === "ADMIN"
      ? {
          ...(requestedStatus ? { status: requestedStatus } : {}),
        }
      : currentUser.user.role === "CAPTAIN"
        ? {
            ...(requestedStatus ? { status: requestedStatus } : {}),
            OR: [
              { offers: { some: { captainId: currentUser.user.id } } },
              { assignment: { is: { captainId: currentUser.user.id } } },
            ],
          }
        : {
            creatorId: currentUser.user.id,
            ...(mineOnly ? {} : {}),
            ...(requestedStatus ? { status: requestedStatus } : {}),
          };

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return jsonWithCors({
    tasks: tasks.map((task) => taskViewFromRecord(task)),
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "USER") {
    return badRequest("Only users can create tasks.", 403);
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const title = normalizeRequiredString(body.title);
  const description = normalizeRequiredString(body.description || body.title);
  const locationLabel = normalizeRequiredString(body.locationLabel || body.location_address || "Current location");

  if (!title || title.length < 3) {
    return badRequest("Title must be at least 3 characters long.");
  }

  if (!description || description.length < 8) {
    return badRequest("Please add a little more detail so captains know what to do.");
  }

  const skillInputs = Array.isArray(body.requiredSkills ?? body.required_skills)
    ? (body.requiredSkills ?? body.required_skills)
    : [];
  const skills = await ensureSkills(
    skillInputs.filter((entry: unknown): entry is string => typeof entry === "string"),
  );
  const taskType = normalizeTaskType(body.taskType || body.task_type);
  const tokenBudget = taskType === "TOKEN_FUNDED" ? Math.max(0, Math.round(normalizeNumber(body.tokenBudget ?? body.token_budget, 20))) : 0;
  const publishNow = body.publish !== false && String(body.status ?? "").toUpperCase() !== "DRAFT";

  const createdTask = await prisma.task.create({
    data: {
      title,
      description,
      category: normalizeTaskCategory(body.category),
      taskType,
      status: publishNow ? "OPEN" : "DRAFT",
      urgency: normalizeTaskUrgency(body.urgency),
      tokenBudget,
      locationLabel,
      latitude: normalizeNumber(body.latitude, DEFAULT_TASK_LATITUDE),
      longitude: normalizeNumber(body.longitude, DEFAULT_TASK_LONGITUDE),
      radiusKm: Math.max(1, Math.round(normalizeNumber(body.radiusKm ?? body.radius_km, 5))),
      voiceTranscript: normalizeNullableString(body.voiceTranscript || body.voice_transcript),
      notes: normalizeNullableString(body.notes),
      creatorId: currentUser.user.id,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      requiredSkills: {
        create: skills.map((skill) => ({
          skillId: skill.id,
        })),
      },
    },
    include: taskInclude,
  });

  let recommendations: ReturnType<typeof topRecommendationViews> extends Promise<infer T> ? T : never = [];

  if (publishNow) {
    await createEscrowLockIfNeeded(createdTask.id, currentUser.user.id, tokenBudget);
    await dispatchTaskOffers(createdTask.id);
    recommendations = await topRecommendationViews(createdTask.id);
  }

  const task = await prisma.task.findUnique({
    where: { id: createdTask.id },
    include: taskInclude,
  });

  return jsonWithCors({
    task: task ? taskViewFromRecord(task) : taskViewFromRecord(createdTask),
    recommendations,
  });
}
