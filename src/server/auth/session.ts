import type { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

function getAuthSecret() {
  const authSecret =
    process.env.AUTH_SECRET ??
    process.env.JWT_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (!authSecret) {
    throw new Error("AUTH_SECRET, JWT_SECRET, or NEXTAUTH_SECRET must be set.");
  }

  return authSecret;
}

function getSecretKey() {
  return new TextEncoder().encode(getAuthSecret());
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());

  return {
    id: payload.sub as string,
    email: payload.email as string,
    role: payload.role as UserRole,
    name: payload.name as string,
  };
}

export function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
}
