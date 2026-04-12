import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { signAuthToken } from "@/server/auth/session";
import { authUserInclude, serializeAuthUser } from "@/server/auth/user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

const signupRoles = new Set(["USER", "CAPTAIN"]);

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest("Request body is required.");
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const phone = body.phone?.trim() || null;
  const requestedRole = body.role?.toUpperCase?.() ?? "USER";

  if (!name || name.length < 2) {
    return badRequest("Name must be at least 2 characters long.");
  }

  if (!email || !email.includes("@")) {
    return badRequest("A valid email address is required.");
  }

  if (!password || password.length < 8) {
    return badRequest("Password must be at least 8 characters long.");
  }

  if (!signupRoles.has(requestedRole)) {
    return badRequest("Only USER and CAPTAIN accounts can sign up here.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return badRequest("An account with that email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role: requestedRole,
      status: requestedRole === "CAPTAIN" ? "PENDING_REVIEW" : "ACTIVE",
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          balanceTokens: 0,
        },
      },
      ...(requestedRole === "CAPTAIN"
        ? {
            captainProfile: {
              create: {
                headline: "New Captain",
                bio: "Complete your captain profile to start receiving nearby opportunities.",
                availabilityStatus: "OFFLINE",
                availabilityWindow: "Not set yet",
                isAvailableNow: false,
                trustScore: 50,
                responseRate: 0,
                tasksCompleted: 0,
                radiusKm: 10,
              },
            },
          }
        : {}),
    },
    include: authUserInclude,
  });

  const token = await signAuthToken({
    sub: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    name: createdUser.name,
  });

  return jsonWithCors({
    token,
    user: serializeAuthUser(createdUser),
  });
}
