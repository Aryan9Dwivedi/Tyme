import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";
import { prisma } from "@/server/db/prisma";
import { captainSummaryFromUser } from "@/server/services/platform-view-models";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

function normalizeAvailability(value: unknown) {
  const normalized = String(value ?? "").toUpperCase();

  if (normalized === "ONLINE" || normalized === "BUSY" || normalized === "OFFLINE") {
    return normalized as "ONLINE" | "BUSY" | "OFFLINE";
  }

  return null;
}

function availabilityWindowFor(status: "ONLINE" | "BUSY" | "OFFLINE") {
  if (status === "ONLINE") {
    return "Available now";
  }

  if (status === "BUSY") {
    return "Busy right now";
  }

  return "Offline for now";
}

export function OPTIONS() {
  return preflightResponse();
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  if (currentUser.user.role !== "CAPTAIN") {
    return badRequest("Captain access only.", 403);
  }

  const body = await request.json().catch(() => null);
  const availability = normalizeAvailability(body?.availability);

  if (!availability) {
    return badRequest("A valid availability status is required.");
  }

  await prisma.captainProfile.update({
    where: { userId: currentUser.user.id },
    data: {
      availabilityStatus: availability,
      isAvailableNow: availability === "ONLINE",
      availabilityWindow: availabilityWindowFor(availability),
    },
  });

  const updatedCaptain = await prisma.user.findUnique({
    where: { id: currentUser.user.id },
    include: {
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
  });

  if (!updatedCaptain) {
    return badRequest("Captain profile not found.", 404);
  }

  return jsonWithCors({
    profile: captainSummaryFromUser(updatedCaptain),
  });
}
