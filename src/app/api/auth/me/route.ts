import { getCurrentAuthUser } from "@/server/auth/current-user";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return jsonWithCors({ error: "Unauthorized" }, { status: 401 });
  }

  return jsonWithCors({
    user: currentUser.safeUser,
  });
}
