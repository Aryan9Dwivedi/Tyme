import { APP_NAME } from "@/lib/constants/project";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

export function OPTIONS() {
  return preflightResponse();
}

export async function GET() {
  return jsonWithCors({
    status: "ok",
    app: APP_NAME,
    generatedAt: new Date().toISOString(),
    checks: {
      routing: "ready",
      dashboards: "ready",
      recommendationEngine: "mock-ready",
    },
  });
}
