const corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN?.trim() || "*";

const defaultCorsHeaders = {
  "Access-Control-Allow-Origin": corsAllowOrigin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function mergeCorsHeaders(headersInit?: HeadersInit) {
  const headers = new Headers(headersInit);

  for (const [key, value] of Object.entries(defaultCorsHeaders)) {
    headers.set(key, value);
  }

  return headers;
}

export function withCors(init: ResponseInit = {}) {
  return {
    ...init,
    headers: mergeCorsHeaders(init.headers),
  } satisfies ResponseInit;
}

export function jsonWithCors(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, withCors(init));
}

export function preflightResponse() {
  return new Response(null, withCors({ status: 204 }));
}
