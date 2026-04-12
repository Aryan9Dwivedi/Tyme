import { prisma } from "@/server/db/prisma";

import { authUserInclude, serializeAuthUser } from "./user";
import { getBearerToken, verifyAuthToken } from "./session";

export async function getCurrentAuthUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: authUserInclude,
    });

    if (!user || user.status === "SUSPENDED") {
      return null;
    }

    return {
      tokenPayload: payload,
      user,
      safeUser: serializeAuthUser(user),
    };
  } catch {
    return null;
  }
}
