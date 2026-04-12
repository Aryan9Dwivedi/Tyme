import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { signAuthToken } from "@/server/auth/session";
import { authUserInclude, serializeAuthUser } from "@/server/auth/user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

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

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return badRequest("Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: authUserInclude,
  });

  if (!user?.passwordHash) {
    return badRequest("Invalid email or password.", 401);
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return badRequest("Invalid email or password.", 401);
  }

  if (user.status === "SUSPENDED") {
    return badRequest("This account has been suspended.", 403);
  }

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return jsonWithCors({
    token,
    user: serializeAuthUser(user),
  });
}
